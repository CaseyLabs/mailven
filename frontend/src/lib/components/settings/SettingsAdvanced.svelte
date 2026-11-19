<script lang="ts">
  import type { Snippet } from 'svelte'
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { settingsNav } from './settingsNav.svelte'

  // Expert options stay one click away (UX-CTRL-5). The content is rendered
  // only while open, so closed options are not in the Tab order; choosing a
  // search result inside it opens the section.
  interface Props {
    /** `data-setting` ids of the rows inside. */
    ids: string[]
    children: Snippet
  }

  let { ids, children }: Props = $props()

  let open = $state(false)
  const regionId = `settings-advanced-${Math.random().toString(36).slice(2, 8)}`

  $effect(() => {
    if (settingsNav.target && ids.includes(settingsNav.target)) open = true
  })
</script>

<div class="space-y-4">
  <button
    type="button"
    class="text-sm font-medium inline-flex min-h-6 items-center gap-1 hover:underline"
    aria-expanded={open}
    aria-controls={regionId}
    onclick={() => { open = !open }}
  >
    <Icon icon={open ? 'lucide:chevron-down' : 'lucide:chevron-right'} class="w-4 h-4" />
    {$_('settingsSearch.advanced')}
  </button>
  {#if open}
    <div id={regionId} class="space-y-6">
      {@render children()}
    </div>
  {/if}
</div>
