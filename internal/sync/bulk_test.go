package sync

import (
	"strings"
	"testing"

	"github.com/caseylabs/mailven/internal/message"
)

func TestClassifyBulk(t *testing.T) {
	tests := []struct {
		name   string
		header string
		from   string
		want   bool
	}{
		{"person", "Subject: hi\r\n", "alice@example.com", false},
		{"list-unsubscribe", "List-Unsubscribe: <mailto:u@x>\r\n", "news@shop.example", true},
		{"list-id", "List-Id: Dev list <dev.lists.example>\r\n", "bob@example.com", true},
		{"precedence bulk", "Precedence: bulk\r\n", "a@x", true},
		{"precedence list", "Precedence: List\r\n", "a@x", true},
		{"precedence junk", "Precedence: junk\r\n", "a@x", true},
		{"precedence first-class", "Precedence: first-class\r\n", "a@x", false},
		{"auto-submitted generated", "Auto-Submitted: auto-generated\r\n", "a@x", true},
		{"auto-submitted with params", "Auto-Submitted: auto-replied; owner-email=\"a@x\"\r\n", "a@x", true},
		{"auto-submitted no", "Auto-Submitted: no\r\n", "a@x", false},
		{"empty list-unsubscribe", "List-Unsubscribe: \r\n", "a@x", false},
		{"noreply", "", "noreply@service.example", true},
		{"no-reply", "", "No-Reply@service.example", true},
		{"no_reply suffix", "", "no_reply-billing@service.example", true},
		{"donotreply", "", "do.not.reply@service.example", true},
		{"notifications", "", "notifications@github.example", true},
		{"notification", "", "notification@service.example", true},
		{"notifications prefix only", "", "notifications-team@service.example", false},
		{"reply in name", "", "replies@service.example", false},
		{"no at sign", "", "noreply", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			raw := []byte(tt.header + "\r\n")
			got := bulkFlag(raw, tt.from)
			if got == nil {
				t.Fatal("bulkFlag returned nil for a header block")
			}
			if *got != tt.want {
				t.Errorf("classifyBulk = %v, want %v", *got, tt.want)
			}
		})
	}

	if got := bulkFlag(nil, "noreply@x"); got != nil {
		t.Errorf("bulkFlag(nil) = %v, want nil", *got)
	}
}

func TestApplyHeaderFlagsReadsListUnsubscribe(t *testing.T) {
	raw := []byte("From: news@shop.example\r\nList-Unsubscribe: <mailto:u@shop.example>,\r\n <https://shop.example/u>\r\nList-Unsubscribe-Post: List-Unsubscribe=One-Click\r\n\r\n")
	m := &message.Message{FromEmail: "news@shop.example"}
	applyHeaderFlags(m, raw)
	if m.ListUnsubscribe == nil || m.ListUnsubscribePost == nil {
		t.Fatal("headers not read")
	}
	if got := *m.ListUnsubscribePost; got != "List-Unsubscribe=One-Click" {
		t.Errorf("post = %q", got)
	}
	if got := *m.ListUnsubscribe; !strings.Contains(got, "mailto:u@shop.example") || !strings.Contains(got, "https://shop.example/u") {
		t.Errorf("header = %q", got)
	}

	// No header block: left nil so the stored value is kept.
	applyHeaderFlags(m, nil)
	if m.ListUnsubscribe != nil || m.ListUnsubscribePost != nil {
		t.Error("expected nil without headers")
	}

	// Headers without List-Unsubscribe: known absent.
	applyHeaderFlags(m, []byte("From: bob@example.com\r\n\r\n"))
	if m.ListUnsubscribe == nil || *m.ListUnsubscribe != "" {
		t.Errorf("expected known-absent, got %v", m.ListUnsubscribe)
	}
}
