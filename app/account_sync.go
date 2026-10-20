package app

import (
	"errors"
	"fmt"
	"strings"

	"github.com/caseylabs/mailven/internal/folder"
)

// folderSyncFailure is one folder whose message sync failed.
type folderSyncFailure struct {
	folder *folder.Folder
	err    error
}

// accountSyncSteps are the operations runAccountSync orders.
type accountSyncSteps struct {
	refreshFolders func() error                               // sync the folder list and counts
	syncTargets    func() ([]*folder.Folder, error)           // folders whose messages sync
	syncMessages   func([]*folder.Folder) []folderSyncFailure // sync those folders' messages
	folderExists   func(id string) (bool, error)              // whether a folder is still stored
}

// runAccountSync syncs an account's folder list and its sync folders' messages.
//
// Once the sync folders are stored, their messages sync before the folder list
// refresh: the refresh issues STATUS for every folder on the server, which on a
// slow server delays new mail by tens of seconds. A first sync has no stored
// folders to target, so it refreshes first.
func runAccountSync(s accountSyncSteps) error {
	targets, err := s.syncTargets()
	if err != nil {
		return fmt.Errorf("failed to determine sync folders: %w", err)
	}
	if len(targets) == 0 {
		if err := s.refreshFolders(); err != nil {
			return fmt.Errorf("folder sync failed: %w", err)
		}
		if targets, err = s.syncTargets(); err != nil {
			return fmt.Errorf("failed to determine sync folders: %w", err)
		}
		return folderSyncError(s.syncMessages(targets))
	}

	failures := s.syncMessages(targets)
	if err := s.refreshFolders(); err != nil {
		return errors.Join(fmt.Errorf("folder sync failed: %w", err), folderSyncError(failures))
	}

	// A folder deleted on the server fails its message sync, and the refresh
	// then removes it, so its failure no longer applies.
	var current []folderSyncFailure
	for _, f := range failures {
		exists, err := s.folderExists(f.folder.ID)
		if err != nil || exists {
			current = append(current, f)
		}
	}

	// Sync folders the refresh added, such as a newly subscribed one.
	after, err := s.syncTargets()
	if err != nil {
		return errors.Join(fmt.Errorf("failed to determine sync folders: %w", err), folderSyncError(current))
	}
	synced := make(map[string]bool, len(targets))
	for _, f := range targets {
		synced[f.ID] = true
	}
	var added []*folder.Folder
	for _, f := range after {
		if !synced[f.ID] {
			added = append(added, f)
		}
	}
	if len(added) > 0 {
		current = append(current, s.syncMessages(added)...)
	}
	return folderSyncError(current)
}

// folderSyncError combines message sync failures into one error, or nil.
func folderSyncError(failures []folderSyncFailure) error {
	if len(failures) == 0 {
		return nil
	}
	msgs := make([]string, len(failures))
	for i, f := range failures {
		msgs[i] = fmt.Sprintf("%s: %v", f.folder.Path, f.err)
	}
	return fmt.Errorf("some folders failed to sync: %s", strings.Join(msgs, "; "))
}
