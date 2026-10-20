<script lang="ts">
  // SidebarActions — the labeled Search action at the top of the Accounts
  // sidebar. The chat list header keeps Compose, and its search field stays
  // reachable when this sidebar is collapsed. In the narrow overlay the action
  // closes the sidebar first.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { getLayoutMode, hideSidebar } from '$lib/stores/layout.svelte'

  interface Props {
    onSearch: () => void
  }

  let { onSearch }: Props = $props()

  function run() {
    if (getLayoutMode() === 'narrow') hideSidebar()
    onSearch()
  }
</script>

<div class="flex flex-col gap-0.5 px-3 pb-2">
  <button
    class="flex items-center gap-2 px-3 py-2 text-left text-body text-fg-secondary hover:bg-muted/50 hover:text-foreground rounded-md transition-colors"
    onclick={run}
  >
    <Icon icon="mdi:magnify" class="w-4 h-4 shrink-0" />
    <span class="truncate">{$_('sidebar.searchChats')}</span>
  </button>
</div>
