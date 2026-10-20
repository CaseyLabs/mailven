---
sidebar_position: 1
---

# Contacts

The Contacts extension is a frontend for Mailven's [contact sync](/docs/features/contacts) data. It surfaces the contacts Mailven already syncs (CardDAV, Google, and Microsoft) in a dedicated view, and adds the ability to create and edit them.

Like all [extensions](/docs/features/extensions), it's disabled by default — enable it under **Settings → Extensions**.

:::warning ALPHA
The Contacts extension is currently in ALPHA. Expect rough edges.
:::

## Enabling

1. Go to **Settings → Extensions**
2. Toggle **Contacts** on

Contacts is added to the [views at the top of the sidebar](/docs/features/extensions#switching-views). The extension has its own settings dialog.

## Manual Sync

To sync contacts on demand, click the footer at the bottom of the Contacts sidebar.

## Known Issues

- Microsoft 365 organization contacts sync has known [issues](https://github.com/hkdb/aerion/issues/278) (reported upstream in Aerion).
