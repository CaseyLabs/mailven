package app

import (
	"context"
	gosync "sync"
	"testing"

	"github.com/caseylabs/mailven/internal/folder"
	"github.com/caseylabs/mailven/internal/imap"
	"github.com/caseylabs/mailven/internal/message"
	"github.com/caseylabs/mailven/internal/sync"
)

// SyncFolders ends the engine's folder-list progress (empty folder ID) even
// when the refresh fails, so a sync whose last step is the refresh does not
// leave the sidebar showing "Syncing folders".
func TestSyncFoldersEndsFolderListProgress(t *testing.T) {
	fx := newMailAPIFixture(t, "google", "https://issuer.example.test/token")
	pool := imap.NewPool(imap.PoolConfig{MaxConnections: 1}, nil)
	pool.Close() // GetConnection fails at once with ErrPoolClosed
	a := &App{ctx: context.Background(), accountStore: fx.ops.accountStore, folderStore: folder.NewStore(fx.db), messageStore: message.NewStore(fx.db)}
	a.syncEngine = sync.NewEngine(pool, a.accountStore, a.folderStore, a.messageStore, message.NewAttachmentStore(fx.db))

	var mu gosync.Mutex
	var ended []map[string]interface{}
	orig := eventsEmit
	eventsEmit = func(_ context.Context, name string, vals ...interface{}) {
		if name != "folder:synced" || len(vals) != 1 {
			return
		}
		mu.Lock()
		defer mu.Unlock()
		ended = append(ended, vals[0].(map[string]interface{}))
	}
	t.Cleanup(func() { eventsEmit = orig })

	if err := a.SyncFolders(fx.acc.ID); err == nil {
		t.Fatal("SyncFolders on a closed pool succeeded")
	}
	mu.Lock()
	defer mu.Unlock()
	if len(ended) != 1 || ended[0]["accountId"] != fx.acc.ID || ended[0]["folderId"] != "" || ended[0]["ok"] != false {
		t.Fatalf("folder:synced events = %v, want one for the folder list with ok=false", ended)
	}
}
