package unsubscribe

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"strings"
	"syscall"
	"time"
)

// oneClickTimeout bounds the whole one-click request, redirects included.
const oneClickTimeout = 20 * time.Second

// maxRedirects bounds redirect chains on the one-click POST.
const maxRedirects = 3

// errBlockedAddress is returned when the unsubscribe URL resolves to a
// non-public address. The URL comes from an untrusted mail header, so it must
// not reach the user's own machine or local network.
var errBlockedAddress = errors.New("unsubscribe URL points to a non-public address")

// nonPublicPrefixes are special-purpose ranges that net.IP's helpers don't
// cover: "this network", shared address space (CGNAT), IETF protocol
// assignments, benchmarking, and the reserved class E range.
var nonPublicPrefixes = []netip.Prefix{
	netip.MustParsePrefix("0.0.0.0/8"),
	netip.MustParsePrefix("100.64.0.0/10"),
	netip.MustParsePrefix("192.0.0.0/24"),
	netip.MustParsePrefix("198.18.0.0/15"),
	netip.MustParsePrefix("240.0.0.0/4"),
}

// isPublicIP reports whether ip is a public unicast address.
func isPublicIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified() ||
		ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() {
		return false
	}
	addr, ok := netip.AddrFromSlice(ip)
	if !ok {
		return false
	}
	addr = addr.Unmap()
	for _, p := range nonPublicPrefixes {
		if p.Contains(addr) {
			return false
		}
	}
	return true
}

// blockNonPublic is a net.Dialer Control hook that refuses non-public
// addresses. It runs after DNS resolution, so it also covers DNS rebinding.
func blockNonPublic(_, address string, _ syscall.RawConn) error {
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return err
	}
	ip := net.ParseIP(host)
	if ip == nil || !isPublicIP(ip) {
		return errBlockedAddress
	}
	return nil
}

// clientOptions lets tests reach a local TLS server; production uses the
// zero value (public addresses only, system roots).
type clientOptions struct {
	dialControl func(network, address string, c syscall.RawConn) error
	tlsConfig   *tls.Config
}

// newOneClickClient returns an HTTP client suited to RFC 8058 requests:
// no cookie jar, no proxy, bounded https-only redirects, public addresses only.
func newOneClickClient(opts clientOptions) *http.Client {
	control := opts.dialControl
	if control == nil {
		control = blockNonPublic
	}
	dialer := &net.Dialer{Timeout: 10 * time.Second, Control: control}
	transport := &http.Transport{
		// No proxy: the dial guard must see the real destination address.
		Proxy:               nil,
		DialContext:         dialer.DialContext,
		TLSClientConfig:     opts.tlsConfig,
		TLSHandshakeTimeout: 10 * time.Second,
		MaxIdleConns:        1,
		IdleConnTimeout:     5 * time.Second,
	}
	return &http.Client{
		Timeout:   oneClickTimeout,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= maxRedirects {
				return fmt.Errorf("too many redirects")
			}
			if req.URL.Scheme != "https" {
				return fmt.Errorf("refusing non-https redirect")
			}
			return nil
		},
	}
}

// PostOneClick performs an RFC 8058 one-click unsubscribe: a POST of
// "List-Unsubscribe=One-Click" to the https URI from List-Unsubscribe.
// As the RFC requires, no cookies or credentials are sent.
func PostOneClick(ctx context.Context, rawURL, userAgent string) error {
	return postOneClick(ctx, newOneClickClient(clientOptions{}), rawURL, userAgent)
}

func postOneClick(ctx context.Context, client *http.Client, rawURL, userAgent string) error {
	u, err := url.Parse(rawURL)
	if err != nil {
		return fmt.Errorf("invalid unsubscribe URL: %w", err)
	}
	if u.Scheme != "https" || u.Host == "" {
		return fmt.Errorf("one-click unsubscribe requires an https URL")
	}

	ctx, cancel := context.WithTimeout(ctx, oneClickTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(),
		strings.NewReader("List-Unsubscribe=One-Click"))
	if err != nil {
		return fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if userAgent != "" {
		req.Header.Set("User-Agent", userAgent)
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("one-click unsubscribe request failed: %w", err)
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 64*1024))

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("one-click unsubscribe returned HTTP %d", resp.StatusCode)
	}
	return nil
}
