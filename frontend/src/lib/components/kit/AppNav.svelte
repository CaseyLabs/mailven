<script lang="ts">
  // AppNav — labeled app navigation at the top of every view's sidebar
  // (mail's Accounts column and kit SidebarFrame). It replaces a separate
  // navigation rail so the list column can sit at the window's left edge:
  // one row per view (Mail, then the enabled extensions' registered rail
  // tabs in their Order) and a Settings row. In the narrow overlay a choice
  // closes the sidebar first.

  import Icon from '@iconify/svelte'
  import { _ } from 'svelte-i18n'
  import { hideSidebar } from '$lib/stores/layout.svelte'
  import { getRailTabs } from '$lib/stores/extensionRegistry.svelte'
  import { getActiveExtension, setActiveExtension } from '$lib/stores/uiState.svelte'
  import { setAppSettingsOpen } from '$lib/stores/appSettings.svelte'
  import { contactSourcesStore } from '$lib/stores/contactSources.svelte'

  const active = $derived(getActiveExtension())
  const views = $derived([
    { id: 'mail', icon: 'mdi:email-outline', label: $_('appNav.mail') },
    ...getRailTabs().map((tab) => ({ id: tab.extensionId, icon: tab.icon || 'mdi:puzzle', label: tab.label })),
  ])

  function run(action: () => void) {
    hideSidebar()
    action()
  }

  const rowClass = 'flex items-center gap-2 px-3 py-2 text-left text-body rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden'
  const idleClass = 'text-fg-secondary hover:bg-muted/50 hover:text-foreground'
</script>

<div class="flex flex-col gap-0.5 px-3 pb-2" role="group" aria-label={$_('appNav.label')}>
  {#each views as view (view.id)}
    <button
      class="{rowClass} {active === view.id ? 'bg-muted text-foreground font-medium' : idleClass}"
      aria-current={active === view.id ? 'page' : undefined}
      onclick={() => run(() => setActiveExtension(view.id))}
    >
      <Icon icon={view.icon} class="w-4 h-4 shrink-0" />
      <span class="truncate">{view.label}</span>
    </button>
  {/each}
  <button class="{rowClass} {idleClass}" onclick={() => run(() => setAppSettingsOpen(true))}>
    <Icon icon="mdi:cog-outline" class="w-4 h-4 shrink-0" />
    <span class="flex-1 truncate">{$_('sidebar.settings')}</span>
    {#if contactSourcesStore.hasErrors}
      <span class="w-2 h-2 bg-destructive rounded-full" aria-label={$_('appNav.settingsNeedAttention')}></span>
    {/if}
  </button>
</div>
<div class="border-b border-border mx-3 mb-2"></div>
