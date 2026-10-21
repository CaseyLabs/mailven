<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'
  import { _ } from '$lib/i18n'
  import { Button } from '$lib/components/ui/button'
  import NamedSelect from './NamedSelect.svelte'
  import { GetSentPolicy, SetSentPolicy, GetSubmissionCopies, GetAccounts, GetFolders } from '../../../../../wailsjs/go/app/App'
  import { account, folder, submission } from '../../../../../wailsjs/go/models'
  let { accountId }: { accountId: string } = $props()
  let policy = $state<submission.SentPolicy | null>(null)
  let copies = $state<submission.Copy[]>([])
  let accounts = $state<account.Account[]>([])
  let folders = $state<folder.Folder[]>([])
  let mailbox = $state('')
  let path = $state('')
  let mode = $state('unresolved')
  let error = $state('')
  let busy = $state(false)
  // Only the latest folder request may update the list; a slower reply for an earlier mailbox is dropped.
  let folderRequest = 0
  async function loadFolders() {
    const request = ++folderRequest
    path = ''
    const loaded = (await GetFolders(mailbox)) || []
    if (request === folderRequest) folders = loaded
  }
  async function refresh() {
    if (!mailbox) mailbox = accountId
    error = ''
    try {
      const [p, c, a] = await Promise.all([GetSentPolicy(accountId), GetSubmissionCopies(accountId), GetAccounts()])
      policy = p
      copies = c || []
      accounts = a || []
      await loadFolders()
    } catch (e) { error = String(e) }
  }
  const routeSummary = $derived.by(() => {
    if (!policy) return ''
    try {
      const r = JSON.parse(policy.route)
      return `${r[1]}:${r[2]} (${r[3]}) · ${r[7]} · ${accounts.find(a => a.id === r[8])?.email || r[8]}`
    } catch { return policy.route }
  })
  const mailboxOptions = $derived(accounts.map(a => ({ value: a.id, label: a.email })))
  const folderOptions = $derived(folders.map(f => ({ value: f.path, label: f.path })))
  const modeOptions = $derived(['unresolved', 'provider', 'append'].map(value => ({ value, label: $_(`sentPolicy.${value}`) })))
  onMount(refresh)
  function add() {
    if (!policy || !path) return
    if (policy.destinations.some(d => d.accountId === mailbox && d.folderPath === path)) return
    policy.destinations = [...policy.destinations, new submission.Destination({ accountId: mailbox, folderPath: path, mode })]
  }
  async function save() {
    if (!policy) return
    busy = true; error = ''
    try { await SetSentPolicy(accountId, policy); await refresh() }
    catch (e) { error = String(e) }
    finally { busy = false }
  }
</script>
<section class="space-y-3 border-t border-border pt-4" aria-label={$_('sentPolicy.title')}>
  <h3 class="text-sm font-medium flex items-center gap-2"><Icon icon="lucide:send" class="w-4 h-4" />{$_('sentPolicy.title')}</h3>
  <p class="text-xs text-muted-foreground">{$_('sentPolicy.guidance')}</p>
  {#if error}<p role="alert" class="text-sm text-destructive">{error}</p>{/if}
  {#if policy}
    <p class="wrap-anywhere text-xs text-muted-foreground">{$_('sentPolicy.route')}: {routeSummary}</p>
    {#if !policy.destinations.length}<p class="text-sm">{$_('sentPolicy.unreviewed')}</p>{/if}
    {#each policy.destinations as d, i (`${d.accountId}/${d.folderPath}`)}
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 wrap-anywhere">{accounts.find(a => a.id === d.accountId)?.email || d.accountId} / {d.folderPath} — {$_(`sentPolicy.${d.mode}`)}</span>
        <Button variant="ghost" size="sm" onclick={() => { if (policy) policy.destinations = policy.destinations.filter((_, index) => index !== i) }}>{$_('sentPolicy.remove')}</Button>
      </div>
    {/each}
    <div class="flex flex-wrap items-end gap-2">
      <NamedSelect class="min-w-44" label={$_('sentPolicy.mailbox')} bind:value={mailbox} options={mailboxOptions} onValueChange={(v) => { mailbox = v; loadFolders().catch(e => { error = String(e) }) }} />
      <NamedSelect class="min-w-44" label={$_('sentPolicy.folder')} bind:value={path} options={folderOptions} placeholder={$_('sentPolicy.choose')} />
      <NamedSelect class="min-w-44" label={$_('sentPolicy.mode')} bind:value={mode} options={modeOptions} />
      <Button variant="outline" disabled={!path} onclick={add}>{$_('sentPolicy.add')}</Button>
    </div>
    <Button disabled={busy} onclick={save}>{$_('sentPolicy.save')}</Button>
    <Button variant="outline" disabled={busy} onclick={refresh}>{$_('sentPolicy.refresh')}</Button>
  {/if}
  <p class="text-xs text-muted-foreground">{$_('sentPolicy.evidenceGuidance')}</p>
  {#each copies as copy (`${copy.attemptId}/${copy.accountId}/${copy.folderPath}`)}
    <p class="wrap-anywhere text-xs">{copy.messageId} · {accounts.find(a => a.id === copy.accountId)?.email || copy.accountId} / {copy.folderPath || $_('sentPolicy.choose')} · {$_(`sentPolicy.${copy.mode}`)} · {$_(`sentPolicy.state.${copy.state}`)}</p>
  {/each}
</section>
