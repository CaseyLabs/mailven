package message

import (
	"strings"
	"testing"
)

func TestExtractChatText(t *testing.T) {
	tests := []struct {
		name       string
		text       string
		html       string
		wantText   string
		wantQuoted []string // substrings expected in Quoted; nil means no quoted part
		wantSig    string   // exact Signature; empty means none
		wantRich   bool
	}{
		{
			name:     "plain message without quote",
			text:     "Hi Bob,\n\nLunch tomorrow?\n\nAlice",
			wantText: "Hi Bob,\n\nLunch tomorrow?\n\nAlice",
		},
		{
			name:       "plain top-posted reply with > quoting",
			text:       "Sounds good.\r\n\r\nOn Tue, Oct 7, 2025 at 10:00 AM Alice Chen <alice@example.com> wrote:\r\n> Lunch tomorrow?\r\n>\r\n> Alice\r\n",
			wantText:   "Sounds good.",
			wantQuoted: []string{"wrote:", "> Lunch tomorrow?"},
		},
		{
			name:       "attribution wrapped over two lines",
			text:       "Yes.\n\nOn Tue, Oct 7, 2025 at 10:00 AM Alice Chen <\nalice@example.com> wrote:\n\n> Lunch?\n",
			wantText:   "Yes.",
			wantQuoted: []string{"alice@example.com> wrote:", "> Lunch?"},
		},
		{
			name:       "non-english attribution wrapped over two lines",
			text:       "Oui.\n\nLe mar. 7 oct. 2025 à 10:00, Alice Chen <\nalice@example.com> a écrit :\n> Déjeuner ?\n",
			wantText:   "Oui.",
			wantQuoted: []string{"a écrit :", "> Déjeuner ?"},
		},
		{
			name:       "colon line in own paragraph stays with the reply",
			text:       "Thanks for these points.\nMy answers are below:\n\n> Lunch?\n",
			wantText:   "Thanks for these points.",
			wantQuoted: []string{"My answers are below:", "> Lunch?"},
		},
		{
			name:       "nested quoting",
			text:       "Agreed.\n\n> Fine by me.\n> > Lunch?\n",
			wantText:   "Agreed.",
			wantQuoted: []string{"> > Lunch?"},
		},
		{
			name:     "inline reply keeps full text",
			text:     "On Tue, Alice wrote:\n> Lunch tomorrow?\nYes, noon.\n> Where?\nThe usual place.\n",
			wantText: "On Tue, Alice wrote:\n> Lunch tomorrow?\nYes, noon.\n> Where?\nThe usual place.",
		},
		{
			name:     "reply between two quotes keeps full text",
			text:     "> Lunch tomorrow?\nYes.\n> See you.\n",
			wantText: "> Lunch tomorrow?\nYes.\n> See you.",
		},
		{
			name:       "bottom-posted reply strips leading quote",
			text:       "On Tue, Alice wrote:\n> Lunch tomorrow?\n> Alice\n\nYes, noon works.\n",
			wantText:   "Yes, noon works.",
			wantQuoted: []string{"> Lunch tomorrow?"},
		},
		{
			name:     "signature after delimiter",
			text:     "See you then.\n\n-- \nBob Smith\nACME Corp\n",
			wantText: "See you then.",
			wantSig:  "Bob Smith\nACME Corp",
		},
		{
			name:     "signature keeps the mobile footer under it",
			text:     "See you then.\n\n-- \nBob Smith\n\nSent from my iPhone\n",
			wantText: "See you then.",
			wantSig:  "Bob Smith\n\nSent from my iPhone",
		},
		{
			name:       "signature above quoted history folds apart from it",
			text:       "Sounds good.\n\n-- \nBob Smith\n\nOn Tue, Alice wrote:\n> Lunch tomorrow?\n",
			wantText:   "Sounds good.",
			wantQuoted: []string{"On Tue, Alice wrote:", "> Lunch tomorrow?"},
			wantSig:    "Bob Smith",
		},
		{
			name:     "mobile footer dropped",
			text:     "On my way.\n\nSent from my iPhone\n",
			wantText: "On my way.",
		},
		{
			name:     "outlook mobile footer dropped",
			text:     "Thanks!\n\nGet Outlook for Android\n",
			wantText: "Thanks!",
		},
		{
			name:       "outlook plain text original message",
			text:       "Approved.\n\n-----Original Message-----\nFrom: Alice\nSent: Tuesday\nSubject: Budget\n\nPlease approve.\n",
			wantText:   "Approved.",
			wantQuoted: []string{"Original Message", "Please approve."},
		},
		{
			name:       "outlook web header block with separator",
			text:       "Done.\n\n________________________________\nFrom: Alice Chen <alice@example.com>\nSent: Tuesday, October 7, 2025 10:00 AM\nTo: Bob <bob@example.com>\nSubject: Task\n\nCan you do it?\n",
			wantText:   "Done.",
			wantQuoted: []string{"________", "Can you do it?"},
		},
		{
			name:     "forwarded message header is kept",
			text:     "FYI\n\n---------- Forwarded message ---------\nFrom: Alice <alice@example.com>\nDate: Tue, Oct 7, 2025\nSubject: Plans\nTo: Bob <bob@example.com>\n\nThe plan.\n",
			wantText: "FYI\n\n---------- Forwarded message ---------\nFrom: Alice <alice@example.com>\nDate: Tue, Oct 7, 2025\nSubject: Plans\nTo: Bob <bob@example.com>\n\nThe plan.",
		},
		{
			name:     "quote only falls back to full text",
			text:     "On Tue, Alice wrote:\n> Lunch?\n",
			wantText: "On Tue, Alice wrote:\n> Lunch?",
		},
		{
			name:     "signature only falls back to full text",
			text:     "-- \nBob Smith\n",
			wantText: "--\nBob Smith",
		},
		{
			name:     "prose mentioning wrote is not a quote",
			text:     "On Monday the team wrote:\nthe new spec.\n",
			wantText: "On Monday the team wrote:\nthe new spec.",
		},
		{
			name: "gmail html reply",
			html: `<div dir="ltr">Sounds good, see you at noon.<div><br></div><div>Bob</div></div><br>` +
				`<div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Tue, Oct 7, 2025 at 10:00 AM Alice Chen &lt;<a href="mailto:alice@example.com">alice@example.com</a>&gt; wrote:<br></div>` +
				`<blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex"><div dir="ltr">Lunch tomorrow?</div></blockquote></div>`,
			text:       "Sounds good, see you at noon.\n\nBob\n\nOn Tue ... wrote:\n> Lunch tomorrow?",
			wantText:   "Sounds good, see you at noon.\n\nBob",
			wantQuoted: []string{"alice@example.com> wrote:", "> Lunch tomorrow?"},
		},
		{
			name: "gmail html signature",
			html: `<div dir="ltr">Thanks!<br clear="all"><div><br></div><span class="gmail_signature_prefix">-- </span><br>` +
				`<div dir="ltr" class="gmail_signature">Bob Smith<br>ACME</div></div>`,
			wantText: "Thanks!",
			wantSig:  "Bob Smith\nACME",
		},
		{
			name: "outlook desktop html reply",
			html: `<html><head><style>p.MsoNormal{margin:0}</style></head><body><div class="WordSection1">` +
				`<p class="MsoNormal">Approved, go ahead.<o:p></o:p></p><p class="MsoNormal"><o:p>&nbsp;</o:p></p>` +
				`<div style="border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0in 0in 0in">` +
				`<p class="MsoNormal"><b>From:</b> Alice Chen &lt;alice@example.com&gt;<br><b>Sent:</b> Tuesday, October 7, 2025 10:00 AM<br>` +
				`<b>To:</b> Bob &lt;bob@example.com&gt;<br><b>Subject:</b> Budget<o:p></o:p></p></div>` +
				`<p class="MsoNormal">Please approve the budget.<o:p></o:p></p></div></body></html>`,
			wantText:   "Approved, go ahead.",
			wantQuoted: []string{"From: Alice Chen", "Please approve the budget."},
		},
		{
			name: "outlook web html reply",
			html: `<div dir="ltr"><div>Will do.</div></div><div id="appendonsend"></div><hr style="display:inline-block;width:98%">` +
				`<div id="divRplyFwdMsg" dir="ltr"><b>From:</b> Alice<br><b>Sent:</b> Tuesday<br><b>Subject:</b> Task</div>` +
				`<div><table width="100%"><tr><td><img src="a"><img src="b"><img src="c">Can you do it?</td></tr></table></div>`,
			wantText:   "Will do.",
			wantQuoted: []string{"From: Alice", "Can you do it?"},
		},
		{
			name: "apple mail html reply",
			html: `<html><body dir="auto">Perfect, thanks.<br><br><div dir="ltr">Sent from my iPhone</div><div dir="ltr"><br>` +
				`<blockquote type="cite">On Oct 7, 2025, at 10:00, Alice Chen &lt;alice@example.com&gt; wrote:<br><br></blockquote></div>` +
				`<blockquote type="cite"><div dir="ltr">Here is the file.</div></blockquote></body></html>`,
			wantText:   "Perfect, thanks.",
			wantQuoted: []string{"> Here is the file."},
		},
		{
			name: "thunderbird html reply",
			html: `<html><body><p>Count me in.</p><pre class="moz-signature" cols="72">--
Bob</pre><div class="moz-cite-prefix">On 10/7/25 10:00 AM, Alice Chen wrote:<br></div>` +
				`<blockquote type="cite" cite="mid:abc@example.com"><p>Party on Friday?</p></blockquote></body></html>`,
			wantText:   "Count me in.",
			wantQuoted: []string{"On 10/7/25 10:00 AM, Alice Chen wrote:", "> Party on Friday?"},
			wantSig:    "Bob",
		},
		{
			name: "html inline reply keeps quotes",
			html: `<div>On Tue, Alice wrote:</div><blockquote type="cite">Lunch?</blockquote><div>Yes.</div>` +
				`<blockquote type="cite">Where?</blockquote><div>Usual place.</div>`,
			wantText: "On Tue, Alice wrote:\n> Lunch?\nYes.\n> Where?\nUsual place.",
		},
		{
			name: "newsletter layout table is rich",
			html: `<table role="presentation" width="600"><tr><td><h1>Weekly news</h1><p>Story one.</p></td></tr></table>` +
				`<img src="t" width="1" height="1">`,
			wantText: "Weekly news\nStory one.",
			wantRich: true,
		},
		{
			name:     "many images are rich",
			html:     `<p>Our sale</p><img src="a"><img src="b"><img src="c">`,
			wantText: "Our sale",
			wantRich: true,
		},
		{
			name:     "tracking pixels and data tables are not rich",
			html:     `<p>Numbers:</p><table><tr><td>A</td><td>1</td></tr></table><img width="1" height="1" src="t">`,
			wantText: "Numbers:\nA 1",
		},
		{
			name:       "rich content only in quote is not rich",
			html:       `<div>Unsubscribe me.</div><blockquote type="cite"><table role="presentation"><tr><td>News</td></tr></table></blockquote>`,
			wantText:   "Unsubscribe me.",
			wantQuoted: []string{"> News"},
		},
		{
			name:     "very long text is rich",
			text:     strings.Repeat("word ", richTextRunes/4),
			html:     "<p>" + strings.Repeat("word ", richTextRunes/4) + "</p>",
			wantText: strings.TrimSpace(strings.Repeat("word ", richTextRunes/4)),
			wantRich: true,
		},
		{
			name:     "very long plain text is rich",
			text:     strings.Repeat("word ", richTextRunes/4),
			wantText: strings.TrimSpace(strings.Repeat("word ", richTextRunes/4)),
			wantRich: true,
		},
		{
			name:     "html without text falls back to plain text",
			html:     `<img src="a">`,
			text:     "See image.",
			wantText: "See image.",
		},
		{
			name:     "script and style are ignored",
			html:     `<style>.x{}</style><script>alert(1)</script><p>Hello&nbsp;there</p>`,
			wantText: "Hello there",
		},
		{
			name:     "hidden preheader and zero-width filler are skipped",
			html:     `<div style="display: none; max-height:0">Preview text &zwnj;&nbsp;&zwnj;&nbsp;</div><p>Hello&zwnj;&#8203; there</p>`,
			wantText: "Hello there",
		},
		{
			name:     "double dash separator mid-message is not a signature",
			text:     "Part one.\n--\n" + strings.Repeat("Line.\n", signatureMaxLines+1),
			wantText: "Part one.\n--\n" + strings.TrimSpace(strings.Repeat("Line.\n", signatureMaxLines+1)),
		},
		{
			name:     "signature images do not make a reply rich",
			html:     `<div>Thanks!</div><table role="presentation" width="100%"><tr><td>-- <br>Bob <img src="a"><img src="b"><img src="c"></td></tr></table>`,
			wantText: "Thanks!",
			wantSig:  "Bob",
		},
		{
			name:     "gmail signature logo table does not make a reply rich",
			html:     `<div dir="ltr">Sounds good.<br clear="all"><div class="gmail_signature"><table width="100%"><tr><td><img src="logo"></td><td>Bob</td></tr></table></div></div>`,
			wantText: "Sounds good.\nBob",
		},
		{
			name:     "outlook signature table does not make a reply rich",
			html:     `<div>Sounds good.</div><div id="Signature"><table role="presentation"><tr><td>Bob</td></tr></table></div>`,
			wantText: "Sounds good.\nBob",
		},
		{
			name:     "layout table outside the signature is still rich",
			html:     `<table width="100%"><tr><td>Sale!</td></tr></table><div class="gmail_signature">Shop</div>`,
			wantText: "Sale!\nShop",
			wantRich: true,
		},
		{
			name:     "list items keep their bullets",
			html:     `<p>Agenda:</p><ul><li>Budget</li><li><b>Hiring</b> plan</li></ul>`,
			wantText: "Agenda:\n• Budget\n• Hiring plan",
		},
		{
			name: "empty body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ExtractChatText(tt.text, tt.html)
			if got.Text != tt.wantText {
				t.Errorf("Text = %q, want %q", got.Text, tt.wantText)
			}
			if got.HasQuoted != (got.Quoted != "") {
				t.Errorf("HasQuoted = %v but Quoted = %q", got.HasQuoted, got.Quoted)
			}
			if tt.wantQuoted == nil && got.HasQuoted {
				t.Errorf("Quoted = %q, want none", got.Quoted)
			}
			for _, q := range tt.wantQuoted {
				if !strings.Contains(got.Quoted, q) {
					t.Errorf("Quoted = %q, want it to contain %q", got.Quoted, q)
				}
			}
			if got.Signature != tt.wantSig {
				t.Errorf("Signature = %q, want %q", got.Signature, tt.wantSig)
			}
			if strings.Contains(got.Quoted, tt.wantSig) && tt.wantSig != "" {
				t.Errorf("Quoted = %q also holds the signature", got.Quoted)
			}
			if got.IsRich != tt.wantRich {
				t.Errorf("IsRich = %v, want %v", got.IsRich, tt.wantRich)
			}
		})
	}
}

func BenchmarkExtractChatTextNewsletter(b *testing.B) {
	row := `<tr><td style="padding:8px;font-family:Arial" width="600"><table role="presentation" width="100%"><tr>` +
		`<td><img src="https://example.com/a.png" width="120" height="80"></td><td><h2>Story headline</h2>` +
		`<p style="color:#333">Some newsletter copy that goes on for a while &amp; has entities&nbsp;in it.</p></td></tr></table></td></tr>`
	body := `<html><head><style>td{}</style></head><body><table width="100%">` + strings.Repeat(row, 500) + `</table></body></html>`
	b.SetBytes(int64(len(body)))
	for b.Loop() {
		ExtractChatText("", body)
	}
}
