package message

import "testing"

func TestListUnsubscribeStoredOnlyWhenRead(t *testing.T) {
	s, accountID, inboxID := newBodyFailedTestStore(t)
	header, post := "<https://example.com/u>", "List-Unsubscribe=One-Click"

	// Never read: NULL, so the app knows to read the headers on demand.
	if err := s.Create(&Message{ID: "m1", AccountID: accountID, FolderID: inboxID, UID: 1}); err != nil {
		t.Fatal(err)
	}
	if _, _, known, err := s.GetListUnsubscribe("m1"); err != nil || known {
		t.Fatalf("unread headers: known=%v err=%v", known, err)
	}

	// Read: stored, and an upsert without headers keeps them.
	if err := s.Upsert(&Message{ID: "m1", AccountID: accountID, FolderID: inboxID, UID: 1,
		ListUnsubscribe: &header, ListUnsubscribePost: &post}); err != nil {
		t.Fatal(err)
	}
	if err := s.Upsert(&Message{ID: "m1", AccountID: accountID, FolderID: inboxID, UID: 1}); err != nil {
		t.Fatal(err)
	}
	h, p, known, err := s.GetListUnsubscribe("m1")
	if err != nil || !known || h != header || p != post {
		t.Fatalf("after upserts: %q %q known=%v err=%v", h, p, known, err)
	}

	// Read and absent: "" is known.
	if err := s.SetListUnsubscribe("m1", "", ""); err != nil {
		t.Fatal(err)
	}
	if h, _, known, _ := s.GetListUnsubscribe("m1"); !known || h != "" {
		t.Fatalf("absent headers: %q known=%v", h, known)
	}

	if _, _, _, err := s.GetListUnsubscribe("missing"); err == nil {
		t.Fatal("expected an error for a missing message")
	}
}
