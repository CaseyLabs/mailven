// Open state of the app Settings dialog. App.svelte mounts the one dialog;
// the Settings row of the sidebar navigation (AppNav) opens it.

let open = $state(false)

export function isAppSettingsOpen(): boolean {
  return open
}

export function setAppSettingsOpen(value: boolean): void {
  open = value
}
