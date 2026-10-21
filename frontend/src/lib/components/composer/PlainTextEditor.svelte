<script lang="ts">
  // Plain-text compose surface backed by a ProseMirror editor (minimal schema:
  // paragraphs only, no formatting) so the shared Spellcheck extension can
  // underline misspellings — which a native <textarea> can't do. It re-exposes
  // a two-way `value` prop ($bindable) so it drops in where the textarea's
  // `bind:value` was: the composer's send/draft/dirty logic is untouched.
  //
  // Fidelity: value <-> doc maps 1:1 on newlines. Each line becomes a paragraph
  // (empty line -> empty paragraph), and getText({blockSeparator:'\n'}) rejoins
  // them, so blank lines and internal spaces round-trip exactly.
  import { onMount } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import Placeholder from '@tiptap/extension-placeholder'
  import { Spellcheck } from '$lib/spellcheck/plugin'
  import { syncSpellcheckLanguages } from '$lib/spellcheck/settings'

  interface Props {
    value?: string
    placeholder?: string
    onInput?: () => void
  }
  let { value = $bindable(''), placeholder = '', onInput }: Props = $props()

  let element = $state<HTMLDivElement | null>(null)
  let editor: Editor | null = null
  let applying = false // guards programmatic setContent from echoing back as input

  function toText(): string {
    return editor?.getText({ blockSeparator: '\n' }) ?? ''
  }

  function valueToDoc(v: string) {
    return {
      type: 'doc',
      content: v.split('\n').map((line) =>
        line
          ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
          : { type: 'paragraph' }
      ),
    }
  }

  function setFromValue(v: string) {
    if (!editor || toText() === v) return
    applying = true
    editor.commands.setContent(valueToDoc(v), { emitUpdate: false })
    applying = false
  }

  onMount(() => {
    syncSpellcheckLanguages()
    editor = new Editor({
      element: element!,
      extensions: [
        // Plain text: keep paragraphs + history, drop every formatting node/mark
        // and hard breaks (Enter splits paragraphs → clean \n serialization).
        StarterKit.configure({
          bold: false,
          italic: false,
          strike: false,
          code: false,
          heading: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          hardBreak: false,
          underline: false,
          link: false,
          trailingNode: false,
        }),
        Placeholder.configure({ placeholder }),
        Spellcheck,
      ],
      editorProps: {
        attributes: {
          class: 'plaintext-editor focus-visible:outline-hidden font-mono text-sm p-3 min-h-full whitespace-pre-wrap',
          spellcheck: 'false',
        },
      },
      content: '',
      onUpdate: () => {
        if (applying) return
        value = toText()
        onInput?.()
      },
    })
    setFromValue(value)
    return () => {
      editor?.destroy()
      editor = null
    }
  })

  // External writes to `value` (reply/forward seed, mode switch, draft restore)
  // flow into the editor. The guard skips the echo from our own onUpdate.
  $effect(() => {
    const v = value
    if (editor && !applying && toText() !== v) setFromValue(v)
  })

  export function focus(): void {
    editor?.commands.focus('start')
  }
</script>

<div bind:this={element} class="h-full"></div>
