<script lang="ts">
  // GoogleClientNote — says which Google client Sign in with Google uses:
  // Mailven's own or the one imported in OAuth Credentials, with the client
  // ID's last four characters so an import can be confirmed before signing in.
  // Mail sign-in resolves through the google-mail slot.

  import { _ } from '$lib/i18n'
  // @ts-ignore - wailsjs bindings
  import { GetOAuthCredsChoices } from '$wailsjs/go/app/App'

  // Legacy identifier from Aerion; persisted, do not rename.
  const SHIPPED = 'aerion-shipped'

  // Changing refresh reloads the note, for example after an import.
  let { refresh = 0 }: { refresh?: number } = $props()

  let current = $state('')
  let fingerprint = $state('')

  $effect(() => {
    void refresh
    GetOAuthCredsChoices('google-mail', '')
      .then((c: { current: string; clientIdFingerprint: string }) => {
        current = c.current
        fingerprint = c.clientIdFingerprint
      })
      .catch(() => { current = '' })
  })
</script>

{#if current === 'custom' && fingerprint}
  <p class="text-xs text-muted-foreground">{$_('account.googleClientCustom', { values: { id: fingerprint } })}</p>
{:else if current === SHIPPED}
  <p class="text-xs text-muted-foreground">{$_('account.googleClientShipped')}</p>
{/if}
