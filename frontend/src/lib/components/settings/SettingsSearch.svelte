<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Input } from '$lib/components/ui/input'
  import { _ } from '$lib/i18n'
  import { searchSettings, type SettingsMatch } from './settingsSearch'

  interface Props {
    query: string
    onSelect: (match: SettingsMatch) => void
  }

  let { query = $bindable(''), onSelect }: Props = $props()

  const matches = $derived(searchSettings(query, (key) => $_(key)))
  let resultsEl = $state<HTMLElement | null>(null)

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && query) {
      // Clear the search first; a second Escape closes the dialog.
      e.stopPropagation()
      query = ''
    } else if (e.key === 'Enter' && matches.length) {
      e.preventDefault()
      onSelect(matches[0])
    } else if (e.key === 'ArrowDown' && matches.length) {
      e.preventDefault()
      resultsEl?.querySelector<HTMLElement>('button')?.focus()
    }
  }

  function onResultKeydown(e: KeyboardEvent) {
    const buttons = [...(resultsEl?.querySelectorAll<HTMLElement>('button') ?? [])]
    const i = buttons.indexOf(e.currentTarget as HTMLElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); buttons[Math.min(i + 1, buttons.length - 1)]?.focus() }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (i === 0) (resultsEl?.parentElement?.querySelector('input') as HTMLElement | null)?.focus()
      else buttons[i - 1]?.focus()
    }
  }
</script>

<div class="relative">
  <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
  <Input
    type="search"
    class="pl-9"
    placeholder={$_('settingsSearch.placeholder')}
    aria-label={$_('settingsSearch.label')}
    bind:value={query}
    onkeydown={onKeydown}
  />
</div>

{#if query.trim()}
  <div class="mt-4 h-[clamp(14rem,calc(100vh-22rem),40rem)] overflow-y-auto pl-1 pr-3" data-testid="settings-results">
    <p class="text-xs text-muted-foreground mb-2" role="status">
      {matches.length
        ? $_('settingsSearch.count', { values: { count: matches.length } })
        : $_('settingsSearch.none', { values: { query: query.trim() } })}
    </p>
    <ul class="space-y-1" bind:this={resultsEl} aria-label={$_('settingsSearch.results')}>
      {#each matches as m (m.entry.id)}
        <li>
          <button
            type="button"
            class="w-full text-left rounded-md border border-border px-3 py-2 hover:bg-accent focus-visible:bg-accent"
            onclick={() => onSelect(m)}
            onkeydown={onResultKeydown}
          >
            <span class="block text-sm font-medium">{m.label}</span>
            <span class="block text-xs text-muted-foreground">
              {$_('settingsSearch.inTab', { values: { tab: m.tabLabel } })}{m.help ? ` · ${m.help}` : ''}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
