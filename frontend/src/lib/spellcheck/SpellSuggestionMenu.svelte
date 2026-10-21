<script lang="ts">
  // Renders the spellcheck suggestion menu at the right-click / F7 position.
  // Mounted once at app root; driven by the shared spellMenu store, which the
  // ProseMirror plugin populates. In keyboard mode (F7) arrow keys move the
  // highlight and Enter activates; Escape / outside-click always closes.
  import { spellMenu } from '$lib/spellcheck/menu.svelte'
  import { _ } from '$lib/i18n'

  let menuEl = $state<HTMLElement | null>(null)
  let selected = $state(0)
  const s = $derived(spellMenu.state)
  const itemCount = $derived(s.suggestions.length + 2) // suggestions + add + ignore

  const pos = $derived({
    left: Math.max(0, Math.min(s.x, window.innerWidth - 288)),
    top: Math.max(0, Math.min(s.y, window.innerHeight - 220)),
  })

  function close() {
    spellMenu.close()
  }

  function runAt(i: number) {
    if (i < s.suggestions.length) s.onReplace(s.suggestions[i])
    else if (i === s.suggestions.length) s.onAdd()
    else s.onIgnore()
    close()
  }

  function itemClass(i: number): string {
    return s.keyboard && selected === i ? 'bg-surface-hover' : 'hover:bg-surface-hover'
  }

  $effect(() => {
    if (!s.open) return
    selected = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close()
        return
      }
      if (!s.keyboard) return
      // Capture-phase + stopPropagation so arrows/Enter drive the menu instead
      // of moving the editor caret underneath it.
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        selected = (selected + 1) % itemCount
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        selected = (selected - 1 + itemCount) % itemCount
      } else if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        runAt(selected)
      }
    }
    const onDown = (e: MouseEvent) => {
      if (menuEl && !menuEl.contains(e.target as Node)) close()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('mousedown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('mousedown', onDown, true)
    }
  })
</script>

{#if s.open}
  <div
    bind:this={menuEl}
    class="fixed z-200 min-w-[180px] max-w-[280px] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1 text-sm"
    style="left: {pos.left}px; top: {pos.top}px;"
  >
    {#each s.suggestions as sug, i (sug)}
      <button class="block w-full truncate px-3 py-1.5 text-left {itemClass(i)}" onclick={() => runAt(i)}>
        {sug}
      </button>
    {/each}
    {#if s.suggestions.length === 0}
      <div class="px-3 py-1.5 text-muted-foreground italic">{$_('spellcheck.noSuggestions')}</div>
    {/if}
    <div class="my-1 border-t border-border"></div>
    <button class="block w-full px-3 py-1.5 text-left {itemClass(s.suggestions.length)}" onclick={() => runAt(s.suggestions.length)}>
      {$_('spellcheck.addToDictionary')}
    </button>
    <button class="block w-full px-3 py-1.5 text-left {itemClass(s.suggestions.length + 1)}" onclick={() => runAt(s.suggestions.length + 1)}>
      {$_('spellcheck.ignore')}
    </button>
  </div>
{/if}
