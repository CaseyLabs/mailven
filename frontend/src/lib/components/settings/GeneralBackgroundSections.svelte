<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Label } from '$lib/components/ui/label'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import { _ } from '$lib/i18n'
  import type { GeneralChange } from './settingsApply'

  interface Props {
    runBackground: boolean
    startHidden: boolean
    autostart: boolean
    onChange: (change: GeneralChange) => void
  }

  let { runBackground, startHidden, autostart, onChange }: Props = $props()

  function handleRunBackgroundChange(value: boolean) {
    onChange({ key: 'runBackground', value })
    // "Start hidden" needs the background option, so turning that off turns this off too.
    if (!value && startHidden) onChange({ key: 'startHidden', value: false })
  }
</script>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Background Section -->
  <div class="space-y-4">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="lucide:app-window" class="w-4 h-4" />
      {$_('settingsGeneral.background')}
    </h3>

    <div class="space-y-2" data-setting="run-background">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="run-background">{$_('settingsGeneral.runInBackground')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.runInBackgroundHelp')}
          </p>
        </div>
        <Switch
          id="run-background"
          checked={runBackground}
          onCheckedChange={handleRunBackgroundChange}
        />
      </div>
    </div>

    <div class="space-y-2" data-setting="start-hidden">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="start-hidden" class={!runBackground ? 'text-muted-foreground' : ''}>{$_('settingsGeneral.startHidden')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.startHiddenHelp')}
            {#if !runBackground}{$_('settingsGeneral.startHiddenNeedsBackground')}{/if}
          </p>
        </div>
        <Switch
          id="start-hidden"
          checked={startHidden}
          onCheckedChange={(v) => onChange({ key: 'startHidden', value: v })}
          disabled={!runBackground}
        />
      </div>
    </div>
  </div>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Startup Section -->
  <div class="space-y-4">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="lucide:power" class="w-4 h-4" />
      {$_('settingsGeneral.startup')}
    </h3>

    <div class="space-y-2" data-setting="autostart">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label for="autostart">{$_('settingsGeneral.autostartOnLogin')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.autostartHelp')}
          </p>
        </div>
        <Switch
          id="autostart"
          checked={autostart}
          onCheckedChange={(v) => onChange({ key: 'autostart', value: v })}
        />
      </div>
    </div>
  </div>
