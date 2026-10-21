// Package folder provides folder management functionality
package folder

import (
	"time"
)

// Type represents the type of folder
type Type string

const (
	TypeInbox   Type = "inbox"
	TypeSent    Type = "sent"
	TypeDrafts  Type = "drafts"
	TypeTrash   Type = "trash"
	TypeSpam    Type = "spam"
	TypeArchive Type = "archive"
	TypeAll     Type = "all"
	TypeStarred Type = "starred"
	TypeFolder  Type = "folder"
)

// Folder represents an email folder
type Folder struct {
	ID        string `json:"id"`
	AccountID string `json:"accountId"`
	Name      string `json:"name"`
	Path      string `json:"path"`
	Type      Type   `json:"type"`
	ParentID  string `json:"parentId,omitempty"`

	// IMAP state
	UIDValidity   uint32 `json:"uidValidity"`
	UIDNext       uint32 `json:"uidNext"`
	HighestModSeq uint64 `json:"highestModSeq"`

	// Counts
	TotalCount  int `json:"totalCount"`
	UnreadCount int `json:"unreadCount"`

	// Sync state
	LastSync   *time.Time `json:"lastSync,omitempty"`
	Subscribed bool       `json:"subscribed"` // IMAP subscription state
}

// IsSpecial returns true if this is a special folder (inbox, sent, etc.)
func (f *Folder) IsSpecial() bool {
	return f.Type != TypeFolder
}

// CanDelete returns true if this folder can be deleted
func (f *Folder) CanDelete() bool {
	// Can't delete special folders
	return !f.IsSpecial()
}

// Icon returns the icon name for this folder type
func (f *Folder) Icon() string {
	switch f.Type {
	case TypeInbox:
		return "lucide:inbox"
	case TypeSent:
		return "lucide:send"
	case TypeDrafts:
		return "lucide:file-pen"
	case TypeTrash:
		return "lucide:trash-2"
	case TypeSpam:
		return "lucide:octagon-alert"
	case TypeArchive:
		return "lucide:archive"
	case TypeAll:
		return "lucide:mails"
	case TypeStarred:
		return "lucide:star"
	default:
		return "lucide:folder"
	}
}

// FolderTree represents a hierarchical folder structure
type FolderTree struct {
	Folder   *Folder       `json:"folder"`
	Children []*FolderTree `json:"children,omitempty"`
}

// BuildTree builds a tree structure from a flat list of folders
func BuildTree(folders []*Folder) []*FolderTree {
	// Create a map for quick lookup
	folderMap := make(map[string]*Folder)
	treeMap := make(map[string]*FolderTree)

	for _, f := range folders {
		folderMap[f.ID] = f
		treeMap[f.ID] = &FolderTree{Folder: f}
	}

	// Build the tree
	var roots []*FolderTree
	for _, f := range folders {
		tree := treeMap[f.ID]
		if f.ParentID == "" {
			roots = append(roots, tree)
		} else if parent, ok := treeMap[f.ParentID]; ok {
			parent.Children = append(parent.Children, tree)
		} else {
			// Parent not found, treat as root
			roots = append(roots, tree)
		}
	}

	return roots
}

// SortFolders sorts folders with special folders first, then alphabetically
func SortFolders(folders []*Folder) {
	// Custom sort: special folders first (in order), then custom folders alphabetically
	specialOrder := map[Type]int{
		TypeInbox:   0,
		TypeDrafts:  1,
		TypeSent:    2,
		TypeArchive: 3,
		TypeSpam:    4,
		TypeTrash:   5,
		TypeAll:     6,
		TypeStarred: 7,
		TypeFolder:  8,
	}

	for i := 0; i < len(folders)-1; i++ {
		for j := i + 1; j < len(folders); j++ {
			orderI := specialOrder[folders[i].Type]
			orderJ := specialOrder[folders[j].Type]

			swap := false
			if orderI > orderJ {
				swap = true
			} else if orderI == orderJ && folders[i].Name > folders[j].Name {
				swap = true
			}

			if swap {
				folders[i], folders[j] = folders[j], folders[i]
			}
		}
	}
}
