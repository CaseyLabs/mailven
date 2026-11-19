<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { _ } from '$lib/i18n'
  import type { SettingChange, SettingKey, SettingValues } from './settingsApply'
  import { resetChanges } from './settingsDefaults'

  // "Reset to default" for one group of settings (UX-CTRL-4). Disabled while
  // every setting in the group already has its default.
  interface Props {
    keys: SettingKey[]
    values: Partial<SettingValues>
    onChange: (change: SettingChange) => void
    /** Names the group for screen readers, e.g. "Display". */
    group: string
  }

  let { keys, values, onChange, group }: Props = $props()

  const changes = $derived(resetChanges(keys, values))
</script>

<Button
  type="button"
  variant="ghost"
  size="sm"
  class="h-7 px-2 text-xs"
  disabled={changes.length === 0}
  aria-label={$_('settingsSearch.resetGroup', { values: { group } })}
  onclick={() => changes.forEach(onChange)}
>
  {$_('settingsSearch.reset')}
</Button>
