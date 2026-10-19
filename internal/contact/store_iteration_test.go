package contact

import (
	"errors"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/caseylabs/mailven/internal/testutil/rowfault"
)

func TestUpsertRecordIterationErrorPreservesMetadata(t *testing.T) {
	for _, after := range []int{0, 1} {
		t.Run("after-"+strconv.Itoa(after)+"-rows", func(t *testing.T) {
			db := openTestDB(t)
			store := NewStore(db.DB)
			rec := &Record{ID: "iteration-record", Source: "local", Kind: "manual", Fn: "Original", Emails: []RecordEmail{
				{Email: "one@example.test", SendCount: 7, LastUsed: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), NameOverridden: true},
				{Email: "two@example.test", SendCount: 13, LastUsed: time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC), NameOverridden: true},
			}}
			if err := store.UpsertRecord(rec); err != nil {
				t.Fatal(err)
			}
			before, err := store.GetRecord(rec.ID)
			if err != nil {
				t.Fatal(err)
			}
			fault := errors.New("injected contact iteration failure")
			faulty := rowfault.Open(db.Path(), func(query string) bool {
				return strings.Contains(query, "SELECT email, send_count, last_used, name_overridden FROM contact_emails")
			}, after, fault)
			defer faulty.Close()
			rec.Fn = "Changed"
			rec.Emails = []RecordEmail{{Email: "one@example.test"}, {Email: "two@example.test"}}
			if err := NewStore(faulty).UpsertRecord(rec); !errors.Is(err, fault) {
				t.Fatalf("error = %v; want injected iteration failure", err)
			}
			got, err := store.GetRecord(rec.ID)
			if err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(got, before) {
				t.Fatalf("failed upsert changed record or metadata:\nbefore: %+v\nafter: %+v", before, got)
			}
		})
	}
}
