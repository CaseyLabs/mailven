package apimigrate

import (
	"errors"
	"strings"
	"testing"

	"github.com/caseylabs/mailven/internal/database"
	"github.com/caseylabs/mailven/internal/testutil/rowfault"
)

func TestCorrelateIterationErrorPreservesState(t *testing.T) {
	for _, phase := range []string{"imap", "api"} {
		t.Run(phase, func(t *testing.T) {
			db := openDB(t)
			seed(t, db)
			store := NewStore(db)
			if err := store.Put(Record{AccountID: "a", State: StateActivated, Route: "gmail"}); err != nil {
				t.Fatal(err)
			}
			record, err := store.Get("a")
			if err != nil {
				t.Fatal(err)
			}
			snapshot := func() string {
				t.Helper()
				var state string
				err := db.QueryRow(`SELECT json_group_array(json_object('id',id,'body',body_text,'fetched',body_fetched,
     'read',is_read,'star',is_starred,'answered',is_answered,'pgp',pgp_status)) FROM (SELECT * FROM messages ORDER BY id)`).Scan(&state)
				if err != nil {
					t.Fatal(err)
				}
				return state
			}
			before := snapshot()
			fault := errors.New("injected correlation iteration failure")
			faulty := rowfault.Open(db.Path(), func(query string) bool {
				if phase == "imap" {
					return strings.Contains(query, "AND f.folder_type LIKE 'hidden:imap:%'")
				}
				return strings.Contains(query, "WHERE m.account_id=? AND f.folder_type NOT LIKE 'hidden:%'")
			}, 1, fault)
			defer faulty.Close()
			result, err := NewStore(&database.DB{DB: faulty}).Correlate("a")
			if !errors.Is(err, fault) {
				t.Fatalf("error = %v; want injected iteration failure", err)
			}
			if result != (CorrelateResult{}) {
				t.Fatalf("failed correlation returned partial success: %+v", result)
			}
			if got := snapshot(); got != before {
				t.Fatalf("failed correlation changed messages:\nbefore %s\nafter %s", before, got)
			}
			gotRecord, err := store.Get("a")
			if err != nil {
				t.Fatal(err)
			}
			if *gotRecord != *record {
				t.Fatalf("migration record changed: %+v -> %+v", record, gotRecord)
			}
			var attachments int
			if err := db.QueryRow(`SELECT COUNT(*) FROM attachments`).Scan(&attachments); err != nil {
				t.Fatal(err)
			}
			if attachments != 1 {
				t.Fatalf("attachments changed: got %d, want 1", attachments)
			}
		})
	}
}
