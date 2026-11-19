// Where a search result wants the Settings dialog to go. The dialog opens the
// tab and scrolls to the row; an Advanced section holding the row opens itself.

export const settingsNav = $state({ target: '', seq: 0 })

export function goToSetting(id: string) {
  settingsNav.target = id
  settingsNav.seq++
}

export function clearSettingTarget() {
  settingsNav.target = ''
}
