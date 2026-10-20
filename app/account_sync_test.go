package app

import (
	"errors"
	"slices"
	"strings"
	"testing"

	"github.com/caseylabs/mailven/internal/folder"
)

// fakeAccountSync records the order of runAccountSync's steps.
type fakeAccountSync struct {
	stored     []*folder.Folder // sync targets before the refresh
	refreshed  []*folder.Folder // sync targets after the refresh
	refreshErr error
	failing    map[string]bool // folder IDs whose message sync fails
	calls      []string
	didRefresh bool
}

func (f *fakeAccountSync) steps() accountSyncSteps {
	return accountSyncSteps{
		refreshFolders: func() error {
			f.calls = append(f.calls, "refresh")
			f.didRefresh = true
			return f.refreshErr
		},
		syncTargets: func() ([]*folder.Folder, error) {
			if f.didRefresh {
				return f.refreshed, nil
			}
			return f.stored, nil
		},
		syncMessages: func(folders []*folder.Folder) []folderSyncFailure {
			var failures []folderSyncFailure
			for _, fo := range folders {
				f.calls = append(f.calls, "messages:"+fo.ID)
				if f.failing[fo.ID] {
					failures = append(failures, folderSyncFailure{folder: fo, err: errors.New("NONEXISTENT")})
				}
			}
			return failures
		},
		folderExists: func(id string) (bool, error) {
			return slices.ContainsFunc(f.refreshed, func(fo *folder.Folder) bool { return fo.ID == id }), nil
		},
	}
}

func testFolder(id string) *folder.Folder { return &folder.Folder{ID: id, Path: id} }

func TestRunAccountSyncOrder(t *testing.T) {
	inbox, sent, added := testFolder("inbox"), testFolder("sent"), testFolder("added")
	tests := []struct {
		name    string
		sync    fakeAccountSync
		want    []string
		wantErr string
	}{
		{
			name: "first sync refreshes folders first",
			sync: fakeAccountSync{refreshed: []*folder.Folder{inbox, sent}},
			want: []string{"refresh", "messages:inbox", "messages:sent"},
		},
		{
			name: "stored folders sync messages before the refresh",
			sync: fakeAccountSync{stored: []*folder.Folder{inbox, sent}, refreshed: []*folder.Folder{inbox, sent}},
			want: []string{"messages:inbox", "messages:sent", "refresh"},
		},
		{
			name: "folders the refresh adds sync afterwards",
			sync: fakeAccountSync{stored: []*folder.Folder{inbox}, refreshed: []*folder.Folder{inbox, added}},
			want: []string{"messages:inbox", "refresh", "messages:added"},
		},
		{
			name: "failure of a folder the refresh removed is dropped",
			sync: fakeAccountSync{
				stored:    []*folder.Folder{inbox, sent},
				refreshed: []*folder.Folder{inbox},
				failing:   map[string]bool{"sent": true},
			},
			want: []string{"messages:inbox", "messages:sent", "refresh"},
		},
		{
			name: "failure of a folder that still exists is reported",
			sync: fakeAccountSync{
				stored:    []*folder.Folder{inbox},
				refreshed: []*folder.Folder{inbox},
				failing:   map[string]bool{"inbox": true},
			},
			want:    []string{"messages:inbox", "refresh"},
			wantErr: "some folders failed to sync: inbox",
		},
		{
			name: "refresh failure after message sync is reported",
			sync: fakeAccountSync{
				stored:     []*folder.Folder{inbox},
				refreshErr: errors.New("timeout"),
			},
			want:    []string{"messages:inbox", "refresh"},
			wantErr: "folder sync failed: timeout",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := runAccountSync(tt.sync.steps())
			if !slices.Equal(tt.sync.calls, tt.want) {
				t.Errorf("calls = %v, want %v", tt.sync.calls, tt.want)
			}
			switch {
			case tt.wantErr == "" && err != nil:
				t.Errorf("err = %v, want nil", err)
			case tt.wantErr != "" && (err == nil || !strings.Contains(err.Error(), tt.wantErr)):
				t.Errorf("err = %v, want containing %q", err, tt.wantErr)
			}
		})
	}
}
