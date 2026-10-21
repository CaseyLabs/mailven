<script lang="ts">
  // "New message" call to action, shared by the chat list header and the
  // conversation header. Tonal (accent-soft), so the composer's Send stays the
  // only filled accent button.
  import { _ } from '$lib/i18n'
  import ToolbarButton from './ToolbarButton.svelte'

  interface Props {
    onclick: () => void
    compact?: boolean
  }

  let { onclick, compact = false }: Props = $props()
</script>

<ToolbarButton icon="lucide:pencil" label={$_('sidebar.compose')} tonal {compact} {onclick} />
