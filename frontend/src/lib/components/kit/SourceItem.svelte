<script lang="ts">
  // SourceItem — clickable row inside SourceSidebar. Rendered as a
  // non-focusable <div role="option"> for the same reason as ListRow:
  // DOM focus stays on SourceSidebar's listbox so keyboard nav
  // (J/K/Up/Down) continues working after a click. Pass the item
  // snippet's optionId as id so aria-activedescendant can name it.
  //
  // Hover, selected and focus states come from the shared .nav-item class
  // (themes/_utilities.css), the same fills as mail's sidebar and list rows.

  import Icon from '@iconify/svelte'

  interface Props {
    id?: string
    icon?: string
    label: string
    active?: boolean
    onclick?: (e: MouseEvent) => void
  }

  const { id, icon, label, active = false, onclick }: Props = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
  {id}
  role="option"
  aria-selected={active}
  class="nav-item text-body cursor-pointer select-none"
  data-selected={active}
  onclick={(e) => onclick?.(e)}
>
  {#if icon}
    <Icon {icon} class="w-4 h-4" />
  {/if}
  <span class="truncate">{label}</span>
</div>
