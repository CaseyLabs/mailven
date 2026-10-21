package folder

import (
	"testing"
)

func TestIsSpecial(t *testing.T) {
	tests := []struct {
		name     string
		ftype    Type
		expected bool
	}{
		{"Inbox", TypeInbox, true},
		{"Sent", TypeSent, true},
		{"Drafts", TypeDrafts, true},
		{"Trash", TypeTrash, true},
		{"Spam", TypeSpam, true},
		{"Archive", TypeArchive, true},
		{"All", TypeAll, true},
		{"Starred", TypeStarred, true},
		{"Folder", TypeFolder, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := &Folder{Type: tt.ftype}
			if got := f.IsSpecial(); got != tt.expected {
				t.Fatalf("IsSpecial() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestCanDelete(t *testing.T) {
	tests := []struct {
		name     string
		ftype    Type
		expected bool
	}{
		{"Inbox", TypeInbox, false},
		{"Sent", TypeSent, false},
		{"Drafts", TypeDrafts, false},
		{"Trash", TypeTrash, false},
		{"Spam", TypeSpam, false},
		{"Archive", TypeArchive, false},
		{"All", TypeAll, false},
		{"Starred", TypeStarred, false},
		{"Folder", TypeFolder, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := &Folder{Type: tt.ftype}
			if got := f.CanDelete(); got != tt.expected {
				t.Fatalf("CanDelete() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestIcon(t *testing.T) {
	tests := []struct {
		name     string
		ftype    Type
		expected string
	}{
		{"Inbox", TypeInbox, "lucide:inbox"},
		{"Sent", TypeSent, "lucide:send"},
		{"Drafts", TypeDrafts, "lucide:file-pen"},
		{"Trash", TypeTrash, "lucide:trash-2"},
		{"Spam", TypeSpam, "lucide:octagon-alert"},
		{"Archive", TypeArchive, "lucide:archive"},
		{"All", TypeAll, "lucide:mails"},
		{"Starred", TypeStarred, "lucide:star"},
		{"Folder", TypeFolder, "lucide:folder"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := &Folder{Type: tt.ftype}
			if got := f.Icon(); got != tt.expected {
				t.Fatalf("Icon() = %q, want %q", got, tt.expected)
			}
		})
	}
}

func TestBuildTree(t *testing.T) {
	t.Run("FlatList", func(t *testing.T) {
		folders := []*Folder{
			{ID: "1", Name: "A"},
			{ID: "2", Name: "B"},
			{ID: "3", Name: "C"},
		}
		roots := BuildTree(folders)
		if len(roots) != 3 {
			t.Fatalf("expected 3 roots, got %d", len(roots))
		}
		for _, r := range roots {
			if len(r.Children) != 0 {
				t.Fatalf("expected no children for flat tree, got %d", len(r.Children))
			}
		}
	})

	t.Run("Nested", func(t *testing.T) {
		folders := []*Folder{
			{ID: "1", Name: "Parent"},
			{ID: "2", Name: "Child", ParentID: "1"},
		}
		roots := BuildTree(folders)
		if len(roots) != 1 {
			t.Fatalf("expected 1 root, got %d", len(roots))
		}
		if len(roots[0].Children) != 1 {
			t.Fatalf("expected 1 child, got %d", len(roots[0].Children))
		}
		if roots[0].Children[0].Folder.Name != "Child" {
			t.Fatalf("expected child name %q, got %q", "Child", roots[0].Children[0].Folder.Name)
		}
	})

	t.Run("MissingParentTreatedAsRoot", func(t *testing.T) {
		folders := []*Folder{
			{ID: "1", Name: "Orphan", ParentID: "nonexistent"},
		}
		roots := BuildTree(folders)
		if len(roots) != 1 {
			t.Fatalf("expected 1 root, got %d", len(roots))
		}
	})

	t.Run("EmptySlice", func(t *testing.T) {
		roots := BuildTree(nil)
		if len(roots) != 0 {
			t.Fatalf("expected 0 roots, got %d", len(roots))
		}
	})
}

func TestSortFolders(t *testing.T) {
	folders := []*Folder{
		{Name: "Zebra", Type: TypeFolder},
		{Name: "Trash", Type: TypeTrash},
		{Name: "Alpha", Type: TypeFolder},
		{Name: "Inbox", Type: TypeInbox},
		{Name: "Sent", Type: TypeSent},
		{Name: "Archive", Type: TypeArchive},
		{Name: "Drafts", Type: TypeDrafts},
		{Name: "Spam", Type: TypeSpam},
		{Name: "All", Type: TypeAll},
		{Name: "Starred", Type: TypeStarred},
	}

	SortFolders(folders)

	expected := []struct {
		name  string
		ftype Type
	}{
		{"Inbox", TypeInbox},
		{"Drafts", TypeDrafts},
		{"Sent", TypeSent},
		{"Archive", TypeArchive},
		{"Spam", TypeSpam},
		{"Trash", TypeTrash},
		{"All", TypeAll},
		{"Starred", TypeStarred},
		{"Alpha", TypeFolder},
		{"Zebra", TypeFolder},
	}

	if len(folders) != len(expected) {
		t.Fatalf("expected %d folders, got %d", len(expected), len(folders))
	}

	for i, exp := range expected {
		if folders[i].Name != exp.name || folders[i].Type != exp.ftype {
			t.Fatalf("position %d: expected {%q, %q}, got {%q, %q}",
				i, exp.name, exp.ftype, folders[i].Name, folders[i].Type)
		}
	}
}
