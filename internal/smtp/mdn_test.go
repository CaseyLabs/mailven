package smtp

import (
	"regexp"
	"testing"

	"github.com/caseylabs/mailven/internal/message"
)

func TestBuildMDNMessageIDDomain(t *testing.T) {
	tests := []struct{ from, wantDomain string }{
		{"me@example.com", "example.com"},
		{"nodomain", "mailven"},
	}
	for _, tt := range tests {
		orig := &message.Message{ReadReceiptTo: "sender@example.org", MessageID: "<orig@example.org>"}
		raw, err := BuildMDN(orig, "", tt.from, MDNDisplayed)
		if err != nil {
			t.Fatalf("BuildMDN(%q): %v", tt.from, err)
		}
		re := regexp.MustCompile(`(?m)^Message-ID: <\d+\.mdn@` + regexp.QuoteMeta(tt.wantDomain) + `>\r$`)
		if !re.Match(raw) {
			t.Errorf("from %q: Message-ID not under %q:\n%s", tt.from, tt.wantDomain, raw)
		}
	}
}

func TestValidMessageID(t *testing.T) {
	for id, want := range map[string]bool{
		"<a@example.com>":                 true,
		"<a@example.com> <b@example.com>": false,
		"a@example.com":                   false,
		"<12345>":                         false,
	} {
		if got := ValidMessageID(id); got != want {
			t.Errorf("ValidMessageID(%q) = %v, want %v", id, got, want)
		}
	}
}
