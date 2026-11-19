package app

import (
	"encoding/json"

	"github.com/caseylabs/mailven/internal/logging"

	"github.com/caseylabs/mailven/internal/message"
	"github.com/caseylabs/mailven/internal/smtp"
)

// replyThreadHeaders builds In-Reply-To and References for a reply or forward
// of msg (RFC 5322 §3.6.4). References is the parent's References plus its
// Message-ID; without parent References, a single parent In-Reply-To stands in.
// Forwards are not replies, so they carry References but no In-Reply-To.
// Stored IDs lack angle brackets, and IDs that are not valid msg-id syntax
// (obsolete or broken mailers) are dropped rather than failing the send.
func replyThreadHeaders(msg *message.Message, mode string) (string, []string) {
	var stored []string
	if msg.References != "" {
		_ = json.Unmarshal([]byte(msg.References), &stored)
	}
	if len(stored) == 0 && msg.InReplyTo != "" {
		stored = []string{msg.InReplyTo}
	}
	parent := ensureAngleBrackets(msg.MessageID)

	var refs []string
	seen := map[string]bool{}
	for _, id := range append(stored, parent) {
		id = ensureAngleBrackets(id)
		if id == "" || seen[id] {
			continue
		}
		if !smtp.ValidMessageID(id) {
			log := logging.WithComponent("composeOps")
			log.Debug().Str("id", id).Msg("Dropping invalid Message-ID from reply threading headers")
			continue
		}
		seen[id] = true
		refs = append(refs, id)
	}

	if mode == "forward" || !seen[parent] {
		return "", refs
	}
	return parent, refs
}
