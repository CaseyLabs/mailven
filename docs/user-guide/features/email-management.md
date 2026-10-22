---
sidebar_position: 2
---

# Email Management

Mailven provides essential tools to manage your email efficiently.

## Chat Mail

The mail section shows email as chats. Each chat is one email thread, listed by the people in it in two-line rows with each chat's picture or initials (turn off **Show avatars in the chat list** in Settings → Chat to hide them; a group shows two overlapping initials). The second line is the latest message's first line, starting with "You:" when it is yours or the writer's first name in a group chat; turn on **Hide message preview** in Settings to show the subject there instead. Subjects in the chat list and chat view leave out reply and forward prefixes such as "Re:" and "Fwd:". An unread chat has a bold name, its time in the accent colour and a badge with its unread count.

- **List header** - The scope menu (all inboxes, one account's inbox, or the folder sidebar) sits on the left, with **Refresh** and **Compose** on the right; in a narrow list Compose shows its icon only. Below them are **Search chats** and the filters. Hover **Refresh** to see when the accounts last synced.
- **List filters** - A single row of text tabs: All, Unread, Low priority, and Snoozed. The active tab is bold with an underline. Low priority and Snoozed are unavailable while searching. Under All, pinned chats come first, then Chats, then a **Low priority** group for newsletters and bulk mail. Each group lists all its rows; **Show fewer** below a group trims it to its first three (plus the open chat if it is further down), and **N more** (or **Show more**) brings the rest back. Click a group's header to collapse or expand it. Mailven remembers each group's state across restarts; Low priority starts collapsed. The Low priority header also offers **Archive all** (undoable) and **Mark all read**.
- **Thread view** - Messages read top to bottom as chat bubbles under day labels: other people's on the left, yours on the right in a warm tint. Messages sent in a row by the same person form a group, with the time once under the group's last bubble; in a chat with several people, each group starts with the sender's first name. The sender's picture or initials sit beside their last bubble (turn off Settings → Chat → **Show avatars in messages** to hide them). Settings → Chat → **Message style** → **Blocks** shows every message as a left-aligned block headed by the sender's name, time and "to N people ▾" instead (select it, or press Enter or Space on it, to list the recipients' names), with your own messages labelled **You**. Paragraphs of plain text are 8 px apart in bubbles and 10 px in blocks. In bubbles, a short centred line notes when someone adds or removes people ("Priya added Lena Fischer") or moves the conversation to a new subject, and a long message shows its first six lines or so with **Read full message · N min** below it; select it (or press Enter or Space) to read the whole message in the Serif reading face, and **Show less** to fold it again. Blocks show every message in full. Message text uses Sans by default (Serif with Settings → Chat → **Message font**; both apply at once) and keeps a comfortable line length; plain text laid out with spaces, such as a table, keeps a monospaced face so it stays aligned. Messages from before today show their date next to the time, and a **New** line marks where the messages that were unread when you opened the chat begin. Quoted history and signatures fold behind a **Show quoted text** button, and the **Show details** button among a message's actions (shown when you point at or move focus into the message) lists the sender, recipients and date. Both buttons open and close with Enter or Space and leave the page where it was. In a very long chat (more than 60 messages), three or more older messages you have already read fold into one "N earlier messages" line; the latest five and any unread message always stay visible. Select the line (or press Enter or Space on it) to show or hide them; Tab and Shift+Tab stop on these lines as they move between messages. Newsletters, receipts and other rich or very long mail show as readable text: headings, paragraphs, lists, links and pictures, without the page layout, hidden preview text or tracking pixels. A long one shows its first part with **Show more** below it. Its pictures follow the remote image rules below. Signed mail, and encrypted mail once it is decrypted, shows as chat text the same way, with the pictures embedded in the message (up to the same size limits as other inline pictures, and never fetched from the web). Settings → Chat → **Email layout** → **Original layout** shows rich mail as a short card that expands into the original layout, and signed or encrypted mail in full, instead. Mail that cannot be decrypted, and any message after **Show original**, renders in full. In a dark theme, mail shown in its own light colours (with **Dark mail content** off, or switched to light in a message's ⋯ menu) sits on a light paper card. A valid signature or encryption shows as a small badge in the message's meta line; problems such as an unknown signer or a bad signature show as a colored banner above the message.
- **Reply box** - A message field stays anchored at the bottom of the open chat, reading "Message" and the first names of the people your reply reaches. Click into it or press **R** to type; it grows with your text up to eight lines, then scrolls, and your text is saved as a draft. **Attach** sits inside the field on the left and **⋯** on the right; the round **Send** button beside the field is the one filled button and turns on once there is something to send. With the usual choices no mail fields show. In a group chat, **⋯** lets you reply to everyone (the default) or only to the person you are answering; when you pick something other than the default, a tinted chip above the field says so, and its **✕** goes back to the default. **⋯** also holds **Open in full composer** for Cc, Bcc, a new subject and formatting, and names the alias or account the reply goes out from when it is not your usual address. A sent reply waits 10 seconds in the chat, marked "Sending in Ns" with **Undo**, which puts the text back in the reply box. A "⋯" marker at the end of a message shows or hides its quoted text.
- **Top bar** - One row: **Back** (when the open chat covers the list), the chat's picture (two overlapping initials for a group), the people in the chat with the subject and message count below, and a "Snoozed until" note when the chat is snoozed. At the right are **Compose** (when the open chat covers the list in a medium-width window), **Archive** and the ⋯ menu. **Archive** carries its label in windows 1100 px wide or more and shows its icon only (with a tooltip) below that. The ⋯ menu holds Snooze, Pin, Forward (in a chat with more than one message), Reply and Reply All (in a single-message chat), Mark read/unread, Move to, Delete, Spam, the sender actions, and **Previous chat** and **Next chat**; their keyboard shortcuts are unchanged. The sender of each message is not in the header. A sender chat, which mixes subjects, shows the sender's name and no subject. Click the names to list everyone with their address: choose a person to start a new message to them, or **Copy addresses**. **Open in full composer** is an icon button in the reply box and moves the reply box's draft to the full composer. **Delete** always acts on the whole chat.
- **Subject heading** - A chat's subject is in the top bar, under the people. In a sender chat, each subject gets its own heading above its messages; it stays pinned to the top of the chat while you scroll, and the next replaces it as you scroll into it.
- **Triage** - **Archive** archives the chat and opens the next one. **Pin** keeps a chat at the top, **Snooze** hides it until a chosen time (or until new mail arrives), and **Mark unread** brings it back later. Each chat's ⋯ menu and row context menu can move its sender to Low priority or back to Priority.
- **Sender chats** - By default (see [Settings](settings.md#combine-messages-from-each-sender)), all the threads a sender starts show as a single chat; threads started from your own addresses stay separate. The row shows the sender and their latest line. Inside the chat, a subject heading above a message marks where the subject changes, and replies go to the latest message you received. Choose **Show as separate threads** in a chat's ⋯ menu or row context menu to split one sender's threads, and **Combine messages from this sender** to combine them again. Splitting moves a saved reply draft to the thread containing the message it replies to, including after changing the combine default or restarting; pins and snoozes move to the sender's newest inbox thread. Both actions can be undone. A thread you started stays separate even when its sender's messages are combined. Search across all accounts still lists the sender's threads separately.
- **Low priority** - Mail with mailing-list or bulk headers is low priority. A thread counts as low only while every message in it is, so a person's reply lifts it into Chats. By default, low-priority mail does not raise notifications.

Pin, snooze, and sender priority are stored locally on this computer and are not synced to the server or other devices. Pin is separate from the server star.

See [Keyboard Shortcuts](keyboard-shortcuts.md) for chat triage keys and [Settings](settings.md#chat-tab) for chat options.

## Unified Inbox

The Unified Inbox shows all incoming mail from all your accounts in one view.

- Each account is assigned a color for easy identification
- Messages are sorted by date across all accounts
- Click on an individual account's inbox to view only that account

### Account Colors

Set account colors in **Settings > Accounts > Edit Account**. The color appears as a subtle indicator on each message in the unified inbox.

## Folder Navigation

The sidebar shows all folders for each account:

- **Unified Inbox** - All inboxes combined
- **Individual Account Inboxes** - Nested under Unified Inbox
- **Account Folders** - Each account's folder tree

### Navigating Folders

- Click a folder to view its contents
- Click an account header to expand/collapse its folders
- Use `Alt+Up/Down` or `Alt+J/K` to navigate folders with keyboard

## Conversation View

Related messages are grouped into conversations (threads):

- Open a conversation to see all messages in the thread
- Messages are displayed chronologically
- Reply context is preserved for easier reading

Delete single message in a conversation:

- Right click on the header of a message and select delete from the context menu
- Focus (Alt+L or ALt+Right) on the conversation viewer, press tab to navigate to the message and press delete.

Focus mode:

Any thread or specific message can be toggled into focus mode which stretches the thread or message across the full size of the window. This is particularly useful if you would like to share your screen in an online meeting without exposing your folders and message list. It's of course also good for those who just want to focus on an e-mail and not be distracted by other elements of the app. While in focus mode, reply, reply all, and forward actions will launch a detached composer instead of the default composer. To reply, reply all, or forward with the default in window composer, exit focus mode before you toggle the action.

To toggle a thread into focus mode, click the focus mode icon in the top right corner of the conversation viewer next to the print icon.

To toggle a message into focus mode, click the focus mode icon in the top right corner of the message's header.

You can also toggle a thread into focus mode by just pressing **f** and toggle a message you are focused on into focus mode by pressing **Shift+f**.


## Message Actions

### Single Message Actions

When viewing a message or with a message selected:

| Action | Method |
|--------|--------|
| Reply | Click Reply button or `Ctrl+R` |
| Reply All | Click Reply All button or `Ctrl+Shift+R` |
| Forward | Click Forward button or `Ctrl+F` |
| Star/Unstar | Click star icon or `S` |
| Mark Read | Right-click menu or `Ctrl+U` |
| Mark Unread | Right-click menu or `Ctrl+Shift+U` |
| Archive | Click Archive button or `Ctrl+K` |
| Move to Trash | Click Trash button or `Delete` |
| Mark as Spam | Click Spam button or `Ctrl+J` |
| Copy to Folder | Right-click > Copy to or Right Alt > Copy to or `Alt+C` |
| Move to Folder | Right-click > Move to or Right Alt > Move to or `Alt+M` |
| Thread Focus Mode | `F` |
| Message Focus Mode | `Shift+F` |

### Copy to Folder and Move to Folder

Toggling either copy or move to folder will bring up a dialog with a scrollable list of folders to choose as destination. There's also a search bar on top of the folder list so that users can use it to find the target folder in the case that the account has a substantial amount of folders.

### Bulk Actions

The chat list has no checkboxes; use the Low priority group's bulk actions or triage chats one by one. In list views that offer checkboxes, select multiple messages to apply actions in bulk:

1. Check the checkbox on each message, or
2. Use `Space` to toggle the checkbox on the focused message, or
3. Use `Shift+Up/Down` or `Shift+J/K` to select while navigating

Then apply any action - it will apply to all selected messages.

**Tip:** Press `Escape` once to clear all checkboxes.

## Swipe Gestures

Mailven has some basic swipe gestures:

- Right: select message
- Left: delete message

For laptop trackpads, swipe with 2 fingers.
For mobile layout, swipe with 1 finger.

## Search

Find emails quickly with the search bar:

1. Click the search bar or press `Ctrl+S`
2. Type your search query
3. Press `Enter` to switch focus to results

Search looks through:
- Subject lines
- Sender and recipient addresses
- Message body content

Search results are highlighted to show matching terms.

### Search Scope

- Search in the currently selected folder, or
- Search across all folders (depending on your email server's capabilities)

### Server Side Search

If the search results don't yield what you are looking for, you can perform a more comprehensive server side IMAP search by clicking the **Search Server** link located on the bar above the first search result or at the center of the message list pane when basic search yields no results. This searches all messages on the server, including older messages that haven't been downloaded locally. It is slower but much more comprehensive. By default, server searches return a maximum of 200 results. If this still does not return what you are looking for, scroll down to the bar below the last search result and click the **Load More** link to return all results.

Alternatively, if you prefer to always use server side search or know a server side search is needed, simply press **Shift+Enter** after typing your search phrase in the search bar.

## Sorting

There are only 2 types of sort. **Newest on top** or **Oldest on top**. You can change between the two by clicking the farthest right button on top of the message list.

## Filtering

If you need to see only messages that are either unread, starred, or with attachments in any given folder, there's a **filter** icon on top of the message list between the **search** and **sort** icons. 

## Sync Options

### Automatic Sync

Mailven periodically checks for new mail. The sync interval can be adjusted in settings.

Mailven also holds IDLE connections for push e-mail: one on the Inbox and one on the Sent folder per account. New e-mail in the Inbox triggers a sync of that account's core folders, and mail sent from another client shows up in Sent (and its chat) within seconds.

### Manual Sync

Right-click the folder in the sidebar and select **Sync Folder**, or select the folder and press `Ctrl + Shift + S`. Pressing `Ctrl + Shift + S` again will stop the sync.

### Sync All Accounts

Click the sync icon at the top of the message list, use the sync button in the bottom left corner of the app, or press `Ctrl + Shift + A` to sync all accounts at once. While a sync is in progress, clicking either sync button or pressing `Ctrl + Shift + A` again opens a sync status dialog with each account's progress, any sync errors and a **Cancel sync** button.

### Force Re-sync

If messages appear to be missing or out of date:

1. Right-click the folder that seems to be out of sync in the sidebar
2. Click **Force Re-sync**

This will re-download messages from the server.

## Message Density

Adjust how much space each message takes in the list:

1. Go to **Settings > General**
2. Choose from:
   - **Micro** - Minimal spacing, more messages visible
   - **Compact** - Reduced spacing
   - **Standard** - Default spacing
   - **Large** - More spacing, easier to read

## Remote Images

For privacy, Mailven blocks remote images in emails by default. These images can be used to track when you open an email.

To load images in a specific message:
- Click the small **Load Images** button above the message body or press `Ctrl+L`

To always load images from a sender:
- Click the dropdown arrow next to Load Images or press `Ctrl+Shift+L`
- Select:
    - **For this domain** - Trusting all e-mails from this domain from now on
    - **For this e-mail address** - Trusting all e-mails from this e-mail address from now on

## Tracking Element Removal

Mailven automatically removes common tracking elements from emails:
- Tracking pixels (1x1 invisible images)
- Known tracking parameters in links

This helps protect your privacy without requiring any configuration.
