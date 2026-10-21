<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Label } from '$lib/components/ui/label'

  interface Props {
    title: string
    words: string[]
    emptyText: string
    removeLabel: string
    onRemove: (word: string) => void
  }

  let { title, words, emptyText, removeLabel, onRemove }: Props = $props()
</script>

<div class="space-y-2">
  <Label>{title}</Label>
  <div class="max-h-40 overflow-y-auto rounded-md border border-border p-2">
    {#if words.length === 0}
      <p class="text-xs text-muted-foreground px-1 py-1">{emptyText}</p>
    {:else}
      {#each words as word (word)}
        <div class="flex items-center justify-between gap-2 px-1 py-1">
          <span class="text-sm truncate">{word}</span>
          <button
            type="button"
            class="shrink-0 text-muted-foreground hover:text-destructive"
            title={removeLabel}
            aria-label={`${removeLabel}: ${word}`}
            onclick={() => onRemove(word)}
          >
            <Icon icon="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>
