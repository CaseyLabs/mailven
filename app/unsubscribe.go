package app

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/caseylabs/mailven/internal/logging"
	"github.com/caseylabs/mailven/internal/message"
	"github.com/caseylabs/mailven/internal/smtp"
	"github.com/caseylabs/mailven/internal/sync"
	"github.com/caseylabs/mailven/internal/unsubscribe"
)

// Mailing-list unsubscribe, exposed to the frontend through Wails bindings.
// Not to be confused with UnsubscribeFolder (IMAP folder subscriptions).
//
// Ported from Aerion PR hkdb/aerion#497: the List-Unsubscribe header
// (RFC 2369, with RFC 8058 one-click) is preferred, and an "unsubscribe" link
// in the HTML body is the fallback. See internal/unsubscribe.

// unsubscribeHeaderTimeout bounds the on-demand header fetch for messages
// synced before the list_unsubscribe columns existed.
const unsubscribeHeaderTimeout = 15 * time.Second

// errNoUnsubscribe is returned when a message offers no way to unsubscribe.
var errNoUnsubscribe = errors.New("this message has no unsubscribe option")

// UnsubscribeResult reports what UnsubscribeFromList did.
type UnsubscribeResult struct {
	// Method is the mechanism that succeeded: "one-click", "mailto" or "browser".
	Method unsubscribe.Method `json:"method"`
	// Target is the host or address the request went to.
	Target string `json:"target"`
}

// GetListUnsubscribeInfo reports whether a message can be unsubscribed from
// and which mechanism UnsubscribeFromList will try first.
func (a *App) GetListUnsubscribeInfo(messageID string) (*unsubscribe.Info, error) {
	msg, err := a.unsubscribeMessage(messageID)
	if err != nil {
		return nil, err
	}
	return a.detectUnsubscribe(msg)
}

// UnsubscribeFromList performs the unsubscribe for a message, moving to the
// next mechanism when one fails: one-click POST, then an unsubscribe email
// from the identity that received the message, then the page in the browser.
func (a *App) UnsubscribeFromList(messageID string) (*UnsubscribeResult, error) {
	log := logging.WithComponent("unsubscribe")

	msg, err := a.unsubscribeMessage(messageID)
	if err != nil {
		return nil, err
	}
	info, err := a.detectUnsubscribe(msg)
	if err != nil {
		return nil, err
	}
	if !info.Available {
		return nil, errNoUnsubscribe
	}

	if info.OneClick {
		target := unsubscribe.FirstHTTPS(info.HTTPURLs)
		err := unsubscribe.PostOneClick(a.ctx, target, "Mailven/"+Version)
		if err == nil {
			log.Info().Str("message_id", messageID).Str("method", "one-click").Msg("Unsubscribed")
			return &UnsubscribeResult{Method: unsubscribe.MethodOneClick, Target: unsubscribe.HostOf(target)}, nil
		}
		log.Warn().Err(err).Str("message_id", messageID).Msg("One-click unsubscribe failed, trying the next method")
	}

	if info.MailtoURL != "" {
		to, err := a.sendUnsubscribeMail(msg, info.MailtoURL)
		if err == nil {
			log.Info().Str("message_id", messageID).Str("method", "mailto").Msg("Unsubscribed")
			return &UnsubscribeResult{Method: unsubscribe.MethodMailto, Target: to}, nil
		}
		log.Warn().Err(err).Str("message_id", messageID).Msg("Unsubscribe email failed, trying the next method")
		if len(info.HTTPURLs) == 0 && info.BodyURL == "" {
			return nil, fmt.Errorf("failed to send unsubscribe email: %w", err)
		}
	}

	pageURL := unsubscribe.FirstHTTPS(info.HTTPURLs)
	switch {
	case pageURL != "":
	case len(info.HTTPURLs) > 0:
		pageURL = info.HTTPURLs[0]
	default:
		pageURL = info.BodyURL
	}
	if pageURL == "" {
		return nil, errors.New("unsubscribe failed")
	}
	if err := a.OpenURL(pageURL); err != nil {
		return nil, fmt.Errorf("failed to open unsubscribe page: %w", err)
	}
	log.Info().Str("message_id", messageID).Str("method", "browser").Msg("Opened unsubscribe page")
	return &UnsubscribeResult{Method: unsubscribe.MethodBrowser, Target: unsubscribe.HostOf(pageURL)}, nil
}

func (a *App) unsubscribeMessage(messageID string) (*message.Message, error) {
	msg, err := a.messageStore.Get(messageID)
	if err != nil {
		return nil, fmt.Errorf("failed to get message: %w", err)
	}
	if msg == nil {
		return nil, fmt.Errorf("message not found: %s", messageID)
	}
	return msg, nil
}

// detectUnsubscribe loads the stored List-Unsubscribe headers of a message,
// reading them from the server once when they were never stored.
func (a *App) detectUnsubscribe(msg *message.Message) (*unsubscribe.Info, error) {
	header, post, known, err := a.messageStore.GetListUnsubscribe(msg.ID)
	if err != nil {
		return nil, err
	}
	if !known {
		header, post = a.backfillListUnsubscribe(msg)
	}
	return unsubscribe.Detect(header, post, msg.BodyHTML), nil
}

// backfillListUnsubscribe reads the headers of a message synced before they
// were stored and saves them. On failure (offline, message gone) it returns
// empty values so detection falls back to the body, and retries next time.
func (a *App) backfillListUnsubscribe(msg *message.Message) (header, post string) {
	log := logging.WithComponent("unsubscribe")
	if a.syncEngine == nil || msg.UID == 0 {
		return "", ""
	}
	ctx, cancel := context.WithTimeout(a.ctx, unsubscribeHeaderTimeout)
	defer cancel()

	var raw []byte
	var err error
	if a.apiRouted(msg.AccountID) != nil {
		// API routes have surrogate UIDs and no header-only read.
		raw, err = a.fetchRawMessage(ctx, msg)
	} else {
		raw, err = a.syncEngine.FetchMessageHeaders(ctx, msg.AccountID, msg.FolderID, msg.UID)
	}
	if err != nil {
		log.Debug().Err(err).Str("message_id", msg.ID).Msg("List-Unsubscribe header read failed")
		return "", ""
	}
	header, post, ok := sync.ExtractListUnsubscribe(raw)
	if !ok {
		return "", ""
	}
	if err := a.messageStore.SetListUnsubscribe(msg.ID, header, post); err != nil {
		log.Debug().Err(err).Str("message_id", msg.ID).Msg("Failed to store List-Unsubscribe headers")
	}
	return header, post
}

// sendUnsubscribeMail sends the email described by a List-Unsubscribe
// mailto: URI from the identity that received the message, and returns the
// recipient addresses.
func (a *App) sendUnsubscribeMail(msg *message.Message, mailtoURL string) (string, error) {
	data := ParseMailtoURL(mailtoURL)
	if data == nil || len(data.To) == 0 {
		return "", errors.New("invalid mailto unsubscribe address")
	}

	identities, err := a.accountStore.GetIdentities(msg.AccountID)
	if err != nil {
		return "", fmt.Errorf("failed to get identities: %w", err)
	}
	var from smtp.Address
	if id := selectReplyFromIdentity(identities, msg, nil); id != nil {
		from = smtp.Address{Name: id.Name, Address: id.Email}
	} else {
		acc, err := a.accountStore.Get(msg.AccountID)
		if err != nil || acc == nil {
			return "", fmt.Errorf("failed to get account: %v", err)
		}
		from = smtp.Address{Name: acc.Name, Address: acc.Email}
	}

	compose := smtp.ComposeMessage{
		From:     from,
		Subject:  orDefault(data.Subject, "Unsubscribe"),
		TextBody: orDefault(data.Body, "Unsubscribe"),
		// List robots are not people: keep them out of contacts.
		SkipContacts: true,
	}
	for _, addr := range data.To {
		compose.To = append(compose.To, smtp.Address{Address: addr})
	}
	for _, addr := range data.Cc {
		compose.Cc = append(compose.Cc, smtp.Address{Address: addr})
	}

	if _, err := a.composeOps.sendMessage(a.ctx, msg.AccountID, compose, nil); err != nil {
		return "", err
	}
	return strings.Join(data.To, ", "), nil
}

func orDefault(s, def string) string {
	if s == "" {
		return def
	}
	return s
}
