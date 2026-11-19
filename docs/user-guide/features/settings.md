---
sidebar_position: 6
---

# Settings

Configure Mailven to work the way you prefer.

Open settings with **Settings** at the top of the sidebar (the Accounts column in Mail, and the Contacts and Calendar sidebars), below Mail and any enabled extensions. If the sidebar is collapsed, open it with the sidebar button at the left of the list header.

## Find a setting

Type in **Search settings** at the top of the dialog. Mailven looks through setting names, their descriptions and other words people use for them, so "IMAP" finds **Receiving mail** and "tray" finds **Keep running in the background**. Press **Down Arrow** to move into the results and **Enter** to open one. Mailven opens the right tab, opens its **Advanced** section if needed, and marks the setting. Press **Escape** to clear the search.

Each tab keeps the common choices in view. Less common ones are under **Advanced**: window and startup options on General, email links and read receipts on Composer, and hover buttons, combining senders and the Low priority group on Chat. Where a group has choices you can undo, **Reset to default** puts that group back to how a new install starts. It is dimmed when nothing in the group has changed.

## General Tab
---

Every change on this tab applies as soon as you make it. There is no Save button; use **Close** when you are done. If a change cannot be saved, Mailven puts the control back and shows a message.

A choice marked "(default)" is what a new install starts with.

### Display

**Title bar** (under **Advanced**) - Choose which title bar Mailven shows:

- **Mailven title bar** - Mailven's own title bar, matching its themes.
- **System title bar** (default) - Your computer's standard title bar and window frame. Mailven asks you to quit and reopen it to finish this change; choose **Quit Mailven** or **Not now**.
- **None** - Hide the title bar to get more space for your mail. This suits tiling window managers.

**Language** - The Mailven interface is English only, so there is no language picker. Email content can be in any language, charset or script. For spellchecking in the composer, choose **English (US)**, **English (UK)** or **English (Canada)**.

**Theme** - Choose light or dark, or match your computer's setting:

- **Match system** - Follows your operating system's light/dark preference.
- **Light** - Always light (warm neutral surfaces with a terracotta accent).
- **Dark** (default) - Always dark (warm dark surfaces with the same accent).

**Dark email content** - When Mailven is dark, show email with a dark filter so it is easier on the eyes. Each message then has a sun icon in its header; click it to show that one email in light colours if the filter breaks how it looks. It is dimmed, with a note, while the dark theme is not showing.

**Dark writing area** - When Mailven is dark, use a dark background where you write a message. Turn it off to keep the writing area white. It is dimmed, with a note, while the dark theme is not showing.

### Chat list

**Chat list spacing** - Change how much space each row in the chat list uses: **Micro**, **Compact**, **Standard** (default) or **Large**.

**Hide message previews** - Hide the first lines of the latest message under each chat's subject. Off by default. Search results still show the matching text so you can see why a message matched.

### Mark as read

**When I open a chat, mark it as read** - Choose **Never (only when I mark it myself)**, **Immediately**, or **After 0.5, 1 (default), 2, 3 or 5 seconds**. A short delay lets you glance at a chat without marking it as read.

### Background and startup (under Advanced)

**Keep running in the background** - Keep Mailven running after you close its window. Turning this off also turns off **Start with the window hidden**.

**Start with the window hidden** - Mailven starts with no window open. It is dimmed, with a note, until **Keep running in the background** is on.

**Start Mailven when I log in** - Open Mailven each time you log in to your computer.

A tray icon is on the roadmap but not built yet.

## Composer Tab
---

Every change on this tab applies as soon as you make it. There is no Save button; use **Close** when you are done. If a change cannot be saved, Mailven puts the control back and shows a message. A choice marked "(default)" is what a new install starts with.

### Where new messages open

Choose whether a new message opens in the main window or a separate window when you press the **Compose** button or **Ctrl+N**.

Options:

- **In the main window** (default)
- **In a separate window**. This also sets **Email links from other apps** to a separate window; you can change that afterwards.

### Email links from other apps (under Advanced)

Choose where a message opens when you click an email (`mailto`) link in another app. The options are the same as above.

### Format for new messages

New messages start in this format. You can change it for any message.

Options:

- **Formatted text** (default)
- **Plain text**

### Read receipts (under Advanced)

A read receipt tells the sender you opened their message. Choose what Mailven does when a sender asks for one:

- **Never send read receipts** (default) - Ignore all requests
- **Ask me each time** - Prompt when a sender requests a read receipt
- **Always send read receipts** - Send them automatically

### Spelling

Mailven underlines misspelled words while you write. **Check spelling** is on by default. Spell checking supports languages that use the Latin alphabet. Turn on the dictionaries you need; Mailven accepts a word if any turned-on dictionary knows it. With **Check spelling** off, the dictionaries are dimmed and say "Turn on "Check spelling" first." Dictionaries:

- English (US)
- English (UK)
- Čeština
- Deutsch
- Français
- Italiano
- Norsk Bokmål
- Nederlands

#### Words you added

The words you added to your dictionary. Remove one to have it checked again.

### Send replies to

For each account you turn on, replies to your messages go to the address you enter instead of your own.

### Always add to CC

For each account you turn on, Mailven adds these addresses to CC on new messages, replies and forwards.

### Always add to BCC

For each account you turn on, Mailven adds these addresses to BCC (hidden copies) on new messages, replies and forwards.

## Chat Tab
---

Options for the chat-style mail list, thread view, and reply box. Every change applies as soon as you make it; there is no Save button. A choice marked "(default)" is what a new install starts with.

### Key that sends a reply

**Ctrl+Enter (or Cmd+Enter) sends, Enter adds a line** (default). **Enter sends, Shift+Enter adds a line** sends with Enter instead.

### Show pictures in the chat list

On by default. Each row shows the sender's picture or initials (two overlapped pictures for a group chat); turn it off for shorter rows with no picture.

### Show quick actions on hover (under Advanced)

Off by default. When on, pointing at a row shows Archive, Mark as read/unread and Snooze buttons. With it off, the same actions stay in the row's right-click menu and on the keyboard shortcuts.

### Show pictures next to messages

On by default. Each run of messages from someone else has their picture or initials beside its last message (Bubbles), or beside every run's first message (Blocks).

### Message font

The typeface for message text in an open chat: **Sans (Inter)** (default) or **Serif (Literata)**. Email in its original design keeps the sender's fonts.

### Message style

**Bubbles** (default) shows other people's messages as bubbles on the left and yours on the right, in a different colour. Consecutive messages from one person join into one run, with the time once under it and, in a group chat, their first name once above it. **Blocks** shows every message left-aligned with the sender's name and time (and the picture when **Show pictures next to messages** is on), with your own messages labelled **You**.

### How email looks in a chat

**Simple text** (default) shows all mail as chat content: plain mail as text; newsletters, receipts and long mail as headings, paragraphs, lists, links and pictures without the page design; and signed mail, and encrypted mail once decrypted, the same way, with its security badge or banner. **Original design** shows newsletters and long mail as a short card that expands into the original design, and signed or encrypted mail in full. Either way, **Show original** in a message's ⋯ menu shows that message in full.

### Reading width

How wide the message column can grow in an open chat: **Narrow**, **Standard** (default) or **Wide**. Message text keeps a comfortable line length at every setting; **Wide** widens email cards and full email bodies, which stay wide enough for a 600 px HTML email at every setting. **Narrow** and **Standard** share the same column, which the chat header and reply box follow.

### Include the message you reply to

On by default. Chat replies add the message you reply to below your text, so people on other email apps keep the context. It stays hidden in the chat view.

### After you archive, snooze, delete or move a chat

Which chat opens when the current one leaves the list (dragging a chat onto a sidebar folder does not open another): the next (older) chat, which is the default, or the previous (newer) chat.

### Combine messages from each sender (under Advanced)

On by default. All the threads a sender starts show as one chat; threads started from your own addresses stay separate. When off, threads show separately unless you combined that sender. Choices made from a chat's menu (**Combine messages from this sender** or **Show as separate threads**) apply whichever way this is set. When a thread joins a sender's chat (after an upgrade or turning this on), its pin, snooze and unsent chat reply move to that chat; when a sender's chat goes back to separate threads (turning this off or splitting one sender), the chat's pin, snooze and reply link move to the newest inbox thread that sender started (or are dropped if there is none), and the draft stays in Drafts. A pin, snooze or reply link already on that thread is kept.

### Show a Low priority group (under Advanced)

On by default. The All filter lists newsletters and bulk mail in a Low priority group, collapsed until you expand it. When off, they appear only under the Low priority filter, and a pinned low-priority chat appears only under Low priority too.

### Only notify for priority mail

On by default. New-mail notifications skip newsletters and bulk mail, and senders you moved to Low priority. Snoozed chats always notify when they return.

## Images Tab
---

Every change on this tab applies as soon as you make it. There is no Save button; use **Close** when you are done.

### Always load pictures from the internet

Off by default. Mailven blocks these pictures, so senders can't tell when you open an email. Turn it on to load them in every email. Mailven asks first: "Load pictures automatically?" It explains that senders can see when you open their email and roughly where you are, and that pictures can be used to track you. Choose **Load automatically** to turn it on or **Keep blocking** to leave it off. Turning it off needs no question.

### Senders

Senders whose pictures you chose to **Always Load** in an email. **Stop always loading** removes one; their pictures are blocked again unless **Always load pictures from the internet** is on.

### Domains

Domains whose pictures you chose to **Always Load** in an email. **Stop always loading** removes one.

## Accounts Tab
---

Manage your email accounts.

### Add account

Click **Add account** to add a new email account. See [First Account Setup](/docs/getting-started/first-account) for details.

### Edit account

Click **Edit** on any account to modify:

#### General Tab

- **Account Color** - Color used in unified inbox
- **Account name** - What this account is called in Mailven
- **Your name on sent mail** - The name people see when you send mail
- **Email Address** - Your email address (read-only for OAuth accounts)
- **Username** - Username of your account
- **Sign-in details**:
    - **Password** - Password of your account
    - **Sign in again** - Sign in again to your provider (for accounts that sign in through your provider's website)
- **How far back to download** - How far back Mailven downloads mail (1 week to 1 year, or all; default 1 month)

#### Identity Tab

Manage sending identities for this account:

- **Name** - Display name for outgoing mail
- **Email** - Sending address
- **Signature** - Rich text signature appended to messages

You can have multiple identities per account (e.g., for aliases).

Each identity can also have a **Reply-To** address. Replies to your messages go there instead of the account default. Leave it empty to use the default.

For Gmail accounts, an **Other addresses you can send from in Gmail** section lists the addresses from Gmail's *Send mail as* list. Gmail only sends as an address it has verified; for any other it rewrites the sender to the account address. To set one up:

1. In Gmail, go to **Settings → Accounts → Send mail as → Add another email address** and verify it.
2. In Mailven, press **Check Gmail** in that section, then **Add** next to the address (optionally importing its Gmail signature).

Identities show a **Verified**, **Pending**, or **Not in Gmail** badge. Mailven refreshes the list once a day in the background.

If you are using an Microsoft 365 account, there will be an additional section in this tab for you to add **shared mailboxes** here. After completely the flow, you will see the shared mailbox as a separate account on the side bar.

#### Server Tab

For accounts that sign in with a password:

- **Receiving mail (IMAP)** - Server, port and secure connection
- **Sending mail (SMTP)** - Server, port and secure connection. Turn on **Don't send mail from this account** to use the account only for receiving.
- **Check for new mail** - How often Mailven checks, besides getting new mail right away when your provider supports it
- **Ask for read receipts** - Whether Mailven asks recipients' mail apps to tell you when they open your messages
- **Special folders** - Choose the folder to use for each role if Mailven doesn't find it:
    - Sent folder
    - Drafts folder
    - Trash folder
    - Archive folder (if none is mapped or detected, as on Gmail, Archive moves messages out of the Inbox to All Mail)
    - Spam folder
- **Folders to keep up to date** - Choose more folders for Mailven to update automatically. These choices are checkboxes and apply when you select **Save changes**; **Cancel** drops them.
    - **Choose which folders Mailven keeps up to date** - Off by default. Turn it on to pick folders. When it is off, Mailven updates only Inbox, Drafts and Sent.
        - **Keep all folders up to date** - Off by default.
        - Or tick only the folders you want
- **Trusted certificates** - Certificates (TLS) you chose to trust for all mail, contacts, and calendar servers, including hosts reached during discovery. Each entry shows the host; removing an entry revokes trust for that host only.
- **Mail API route** - Gmail and Microsoft 365 (work/school) accounts can optionally switch from IMAP/SMTP to the provider's mail API. *Authorize API access* grants a separate permission, then *Review migration* shows what will happen and any blockers. Before anything changes a snapshot of the local database is saved; existing messages are matched and kept, and drafts and queued mail are preserved. If an active API grant is rejected, sync and queued actions pause; use *Reauthorize API access* in the same settings section to restore access without switching routes. *Return to IMAP / SMTP* switches the account back to its protocol route; nothing is replayed to the provider and unfinished API actions are listed. The result says whether an IMAP sync request was made; that request does not confirm that sync started or finished. If no request was made, use Sync manually. There is no automatic fallback between routes, and no route promises delivery or inbox placement. Hidden (Bcc) recipient privacy and provider message-size limits on the API routes are not yet verified against live providers. A linked shared mailbox can authorize API access under its parent account's sign-in, but it cannot be activated or migrated until its live Graph checks are recorded. Returning to IMAP/SMTP does not undo provider changes or restore the snapshot. To go back to the saved snapshot, use *Restore database to snapshot…* in the same section: it is an offline, whole-database restore (all accounts, not just this one) that discards local changes made since the snapshot and leaves provider-side changes in place. You must acknowledge a consent dialog, Mailven saves a backup of the current database and closes, and the restore happens the next time you open it, after which a banner offers *Undo restore* from that backup. See [Snapshot restoration](../../MAIL_APIS.md#snapshot-restoration). See [provider requirements and route limits](../../PROVIDERS.md#switching-routes-and-current-limits).

#### Security Tab

- **Keys (PGP)** - Signing and encryption with PGP (also called GPG) keys for your account
    - **Import your key** - Import your own PGP key
    - **Key servers** - Servers Mailven asks for other people's keys, in the order shown. There are 3 defaults already. You can add your own
    - **Keys for recipients**
        - **Import** - Import the public keys of your contacts
        - **Find a key by email address** - Mailven checks the address's own domain first, then the key servers
        - **List** - The list below shows the public keys Mailven has saved
- **Certificates (S/MIME)** - Signing and encryption with certificates (S/MIME) for your account
    - **Check online whether certificates were cancelled** - Off by default and applies to all accounts. When on, Mailven asks the certificate's issuer whether a signer's certificate was cancelled (revoked), using OCSP responses or complete CRLs for the signer and intermediate certificates. The issuer can see when you view or download signed mail. Good and revoked results are cached for at most one hour and never beyond their next update. When off, or when the answer is unavailable, stale or unsupported, signed mail shows "Couldn't verify"; a cancelled certificate shows "Warning". The setting applies the next time you view or download a message; background sync reads message content without online checks. Certificates already reported cancelled stay blocked for automatic encryption until a later online check clears them. Checks use direct HTTP(S) connections to public endpoints, so a network that only allows a proxy can report the answer as unavailable
    - **Import .p12** - Import your own certificate. It appears in the list below
    - **Import** - Import certificates for recipients. Imported and saved certificates appear below. Mailven uses a saved certificate for encryption only when its issuer is trusted; import a self-issued or otherwise untrusted certificate to accept it for encryption

#### Message security banners

A signed or encrypted message shows a short line about what Mailven found. Each line has an icon, a word and a colour, so you don't need to tell colours apart. The second line says whether the check used S/MIME or PGP.

| You see | It means |
|---|---|
| **Verified: signed by someone** (S/MIME) | The signature is valid, the certificate comes from an issuer Mailven trusts, online checks found it wasn't cancelled, and it names the sender |
| **Signed by someone with a key Mailven knows** (PGP) | The signature matches a key Mailven has saved for that address. Mailven can't tell whether the key really belongs to that person |
| **Couldn't verify** | The signature may be fine, but Mailven couldn't confirm everything: it didn't check whether the certificate was cancelled, the issuer isn't trusted, the certificate is self-issued, or Mailven doesn't have the signing key |
| **Warning** | Something is wrong: the signature doesn't match the message, the certificate was cancelled or expired, the key has expired, or the signer isn't the sender shown in From |
| **Encrypted message** | Mailven decrypted the message with your certificate or key. If it couldn't, a Warning says so |

### Remove Account

Click **Trash Icon** to delete an account. This removes:

- The account configuration
- Locally cached emails from this account

Your emails on the server are not affected.

## Contacts Tab
---

Manage contact sources for autocomplete.

### Add Contact Source

Add a new source for contact sync:

- **CardDAV** - Connect to a CardDAV server
- **Google Contacts** - Sync from Google
- **Microsoft Contacts** - Sync from Microsoft

See [Contacts](/docs/features/contacts) for detailed setup.

### Edit Contact Source

Click on a contact source to:

- Change sync interval
- Update credentials
- View sync status

### Sync

Click **Sync** to immediately fetch contacts from a source.

### Force Re-Sync

Click **Force re-sync** to immediately re-fetch all contacts from a source.

### Remove Contact Source

Click **Delete** to stop syncing from a contact source. Previously synced contacts remain available until the next restart.

### oAuth Credentials

Right below all the accounts, you will see a section labled **oAuth Credentials**. This is where you can change the Client ID and Secret of what Microsoft and Google uses for Mailven in runtime.

## Extensions
---

This is a 1st party extension system. It doesn't allow for community or 3rd party development of extensions yet. Whether or not the extension system will be opened up to the community or 3rd parties will depend on future demands. Currently, the extension system is meant to make it possible for Mailven to stay a lightweight e-mail only client but at the same time be able to provide features that only specific power users want such as contacts management, calendar management and more in the future.

In this tab, you can enable **Contacts** and/or **Calendar** extensions. Each extension has its own settings dialog. To learn more, see the [Extensions](/docs/features/extensions) section.

## About Tab
---

View information about Mailven:

- **Version** - Current Mailven version
- **GitHub** - Link to source code and issues
- **Privacy Policy** - How Mailven handles your data
- **Terms of Use** - Usage terms

## Applying Changes
---

Most settings take effect immediately. Some changes (like adding accounts or contact sources) may require a sync before you see results.

## Configuration Location
---

Mailven stores configuration in your system's standard application data location:

| Platform | Location |
|----------|----------|
| Linux | `~/.config/mailven/` or `$XDG_CONFIG_HOME/mailven/` |
| macOS | `~/Library/Application Support/Mailven/` |
| Windows | `%APPDATA%\Mailven\` |

:::warning
Modifying configuration files directly is not recommended. Use the Settings UI instead.
:::

## Notifications
---

By default on Linux, Mailven uses `org.freedesktop.portal.Desktop` but if you launch Mailven from the terminal, notifications will not work. In those cases, you will want to use the `--dbus-notify` flag to launch Mailven.
