// Folder subscription changes made in the account dialog's Servers tab wait
// for Save (UX-CTRL-1). The tab records them here; the dialog applies them
// after the account itself is saved.
// @ts-ignore - wailsjs path
import { SubscribeFolder, UnsubscribeFolder, SubscribeAllFolders } from '../../../../../wailsjs/go/app/App'

export interface FolderSubscriptionChanges {
  /** "Keep all folders up to date" was turned on and not yet saved. */
  subscribeAll: boolean
  /** Folder ID → subscribed, for folders ticked or unticked and not yet saved. */
  folders: Record<string, boolean>
}

export function emptyFolderSubscriptionChanges(): FolderSubscriptionChanges {
  return { subscribeAll: false, folders: {} }
}

export function hasFolderSubscriptionChanges(c: FolderSubscriptionChanges): boolean {
  return c.subscribeAll || Object.keys(c.folders).length > 0
}

/**
 * Applies the recorded changes to the server. Keeps going after a failure so
 * one bad folder doesn't block the rest. Returns the first error, if any.
 */
export async function applyFolderSubscriptionChanges(
  accountID: string,
  c: FolderSubscriptionChanges,
): Promise<unknown | null> {
  let firstError: unknown = null
  const remember = (err: unknown) => {
    console.error('Failed to update folder subscription:', err)
    firstError ??= err
  }
  if (c.subscribeAll) {
    try {
      await SubscribeAllFolders(accountID)
    } catch (err) {
      remember(err)
    }
    return firstError
  }
  for (const [folderID, subscribed] of Object.entries(c.folders)) {
    try {
      await (subscribed ? SubscribeFolder : UnsubscribeFolder)(accountID, folderID)
    } catch (err) {
      remember(err)
    }
  }
  return firstError
}
