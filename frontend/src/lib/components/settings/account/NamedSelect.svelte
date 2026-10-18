<script lang="ts">
  import * as Select from '$lib/components/ui/select'

  interface Option { value: string, label: string }
  interface Props {
    label: string
    value: string
    options: Option[]
    placeholder?: string
    disabled?: boolean
    class?: string
    onValueChange?: (value: string) => void
  }

  let { label, value = $bindable(), options, placeholder = '', disabled = false, class: className = '', onValueChange }: Props = $props()
  const selected = $derived(options.find((o) => o.value === value)?.label ?? placeholder)
</script>

<div class="space-y-1 text-sm {className}">
  <span class="block" aria-hidden="true">{label}</span>
  <Select.Root bind:value {onValueChange} {disabled}>
    <Select.Trigger aria-label={label}>
      <Select.Value placeholder={placeholder}>{selected}</Select.Value>
    </Select.Trigger>
    <Select.Content>
      {#each options as opt (opt.value)}
        <Select.Item value={opt.value} label={opt.label} />
      {/each}
    </Select.Content>
  </Select.Root>
</div>
