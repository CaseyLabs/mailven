package app

import (
	"strings"
	"testing"

	"github.com/caseylabs/mailven/internal/message"
)

func TestReplyThreadHeaders(t *testing.T) {
	tests := []struct {
		name, mode, wantInReplyTo, wantRefs string
		msg                                 message.Message
	}{
		{"parent references plus parent id", "reply", "<p@x.com>", "<a@x.com> <b@x.com> <p@x.com>",
			message.Message{MessageID: "p@x.com", References: `["<a@x.com>","<b@x.com>"]`}},
		{"in-reply-to stands in for missing references", "reply", "<p@x.com>", "<a@x.com> <p@x.com>",
			message.Message{MessageID: "p@x.com", InReplyTo: "a@x.com"}},
		{"invalid ids are dropped", "reply", "<p@x.com>", "<b@x.com> <p@x.com>",
			message.Message{MessageID: "p@x.com", References: `["<12345>","<b@x.com>","<b@x.com>"]`}},
		{"invalid parent id is omitted", "reply-all", "", "<a@x.com>",
			message.Message{MessageID: "12345", References: `["<a@x.com>"]`}},
		{"forward keeps references only", "forward", "", "<p@x.com>",
			message.Message{MessageID: "<p@x.com>"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			inReplyTo, refs := replyThreadHeaders(&tt.msg, tt.mode)
			if inReplyTo != tt.wantInReplyTo || strings.Join(refs, " ") != tt.wantRefs {
				t.Errorf("got %q, %q; want %q, %q", inReplyTo, strings.Join(refs, " "), tt.wantInReplyTo, tt.wantRefs)
			}
		})
	}
}
