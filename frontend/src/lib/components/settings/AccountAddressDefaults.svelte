<script lang="ts">
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import RecipientInput from '$lib/components/composer/RecipientInput.svelte'
  import { accountStore } from '$lib/stores/accounts.svelte'
  // @ts-ignore - Wails generated imports
  import { smtp } from '../../../../wailsjs/go/models'
  // @ts-ignore - wailsjs path
  import { GetDefaultAddress, GetDefaultAddressEnabled, SetDefaultAddress, SetDefaultAddressEnabled } from '../../../../wailsjs/go/app/App.js'

  interface Props {
    /** Backend default-address kind: 'bcc' | 'replyto' */
    kind: string
    title: string
    icon: string
    help: string
    placeholder?: string
    /** Keep only the first chip (Reply-To is a single address) */
    single?: boolean
  }

  let { kind, title, icon, help, placeholder = '', single = false }: Props = $props()

  // Per-account default address (#341): each account row is a label +
  // toggle; the chip input appears only when that account is enabled. A
  // disabled account keeps its saved value for re-enable. Values save
  // directly via the generic Wails bindings — no dialog-level Save plumbing.
  const accounts = $derived(accountStore.accounts.filter(acc => !acc.account.sharedMailboxParentId))
  let enabled = $state<Record<string, boolean>>({})
  let addresses = $state<Record<string, smtp.Address[]>>({})
  const lastSaved: Record<string, string> = {}

  function parseList(raw: string): smtp.Address[] {
    return raw
      .split(/[,;]/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(addr => new smtp.Address({ name: '', address: addr }))
  }

  onMount(async () => {
    for (const acc of accountStore.accounts) {
      const id = acc.account.id
      try {
        enabled[id] = await GetDefaultAddressEnabled(kind, id)
        const raw = await GetDefaultAddress(kind, id)
        lastSaved[id] = raw
        addresses[id] = parseList(raw)
      } catch (err) {
        console.error(`Failed to load default ${kind} settings:`, err)
      }
    }
  })

  async function handleToggle(accountId: string, on: boolean) {
    enabled[accountId] = on
    try {
      await SetDefaultAddressEnabled(kind, accountId, on)
      if (on) {
        const raw = await GetDefaultAddress(kind, accountId)
        lastSaved[accountId] = raw
        addresses[accountId] = parseList(raw)
      }
    } catch (err) {
      console.error(`Failed to save default ${kind} toggle:`, err)
    }
  }

  // Persist chip changes as they happen (RecipientInput mutates the bound
  // array on add/remove; no blur event to hook)
  $effect(() => {
    for (const [id, addrs] of Object.entries(addresses)) {
      const kept = single ? addrs.slice(0, 1) : addrs
      if (kept.length !== addrs.length) {
        addresses[id] = kept
      }
      const serialized = kept.map(a => a.address).filter(Boolean).join(', ')
      if (serialized === lastSaved[id]) continue
      lastSaved[id] = serialized
      SetDefaultAddress(kind, id, serialized).catch((err: unknown) => {
        console.error(`Failed to save default ${kind}:`, err)
      })
    }
  })
</script>

<div class="space-y-4">
  <h3 class="text-sm font-medium flex items-center gap-2">
    <Icon {icon} class="w-4 h-4" />
    {title}
  </h3>

  <div class="space-y-1 max-h-60 overflow-y-auto rounded-md border border-border p-2">
    {#each accounts as acc (acc.account.id)}
      <div class="px-1 py-1 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm truncate">{acc.account.name} — {acc.account.email}</span>
          <Switch
            id={`default-${kind}-${acc.account.id}`}
            ariaLabel={`${title}: ${acc.account.name} — ${acc.account.email}`}
            checked={enabled[acc.account.id] ?? false}
            onCheckedChange={(v) => handleToggle(acc.account.id, v)}
          />
        </div>
        {#if enabled[acc.account.id]}
          <RecipientInput
            bind:recipients={
              () => addresses[acc.account.id] ?? [],
              (v) => { addresses[acc.account.id] = v }
            }
            {placeholder}
          />
        {/if}
      </div>
    {/each}
  </div>
  <p class="text-xs text-muted-foreground">{help}</p>
</div>
