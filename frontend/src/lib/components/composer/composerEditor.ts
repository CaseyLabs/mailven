/**
 * TipTap editor configuration for the email composer
 */
import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { FontSize } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { TableRow } from '@tiptap/extension-table'
import { parseFileUris } from './composerUtils'
import {
  ExtendedTextStyle,
  ExtendedColor,
  ExtendedTable,
  ExtendedTableCell,
  ExtendedTableHeader,
} from './tiptapExtensions'
import { get } from 'svelte/store'
import { _ } from 'svelte-i18n'
import { Spellcheck } from '$lib/spellcheck/plugin'
import { syncSpellcheckLanguages } from '$lib/spellcheck/settings'


/**
 * Extended Image that preserves the data-original-src attribute.
 * Used for blocked remote images: the placeholder SVG is in src,
 * the original URL is in data-original-src for restoration on send.
 */
/**
 * Map a position in `doc.textContent` (plain text, 0-indexed) to a ProseMirror
 * doc position (which includes block-boundary tokens between text nodes).
 *
 * Used by the WebKitGTK drop fallback below to convert "inserted text starts
 * here in the doc's plain text" into "delete here in ProseMirror's positional
 * coordinate system." Walks text nodes in document order, accumulating their
 * lengths until the cumulative length covers the target text position.
 *
 * Returns -1 if textPos is out of range (caller should bail in that case).
 */
function textPosToDocPos(doc: any, textPos: number): number {
  if (textPos < 0) return -1
  let cumulativeText = 0
  let docPos = -1
  doc.descendants((node: any, pos: number) => {
    if (docPos !== -1) return false
    if (node.isText && typeof node.text === 'string') {
      const nodeLen = node.text.length
      if (cumulativeText + nodeLen >= textPos) {
        docPos = pos + (textPos - cumulativeText)
        return false
      }
      cumulativeText += nodeLen
    }
    return true
  })
  // textPos exactly at the very end of all text → end of last text node
  if (docPos === -1 && cumulativeText === textPos) {
    docPos = doc.content.size
  }
  return docPos
}

const ComposerImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-original-src': {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-original-src'),
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes['data-original-src']) return {}
          return { 'data-original-src': attributes['data-original-src'] }
        },
      },
    }
  },
})


export interface ComposerEditorHandlers {
  onUpdate?: () => void
  onPasteImage?: (file: File) => void
  onDropImage?: (file: File) => void
  onDropFile?: (file: File) => void
  onDropFilePaths?: (paths: string[]) => void
  onShiftTab?: () => void
}

/**
 * Create a configured TipTap editor for the composer
 */
export function createComposerEditor(
  element: HTMLElement,
  handlers: ComposerEditorHandlers = {}
): Editor {
  // Apply the user's spellcheck settings (on/off + enabled dictionaries).
  syncSpellcheckLanguages()

  return new Editor({
    element,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        trailingNode: false,
      }),
      Spellcheck,
      ExtendedTextStyle,
      ExtendedColor,
      FontSize,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      ExtendedTable.configure({
        resizable: false,
      }),
      TableRow,
      ExtendedTableCell,
      ExtendedTableHeader,
      ComposerImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: get(_)('composer.writePlaceholder'),
      }),
      Extension.create({
        name: 'shiftTabHandler',
        addKeyboardShortcuts() {
          return {
            'Shift-Tab': () => {
              handlers.onShiftTab?.()
              return true
            },
            'Mod-Enter': () => true,
          }
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'composer-editor focus-visible:outline-hidden min-h-[200px] p-3',
        // Disable native webview spellcheck; the Spellcheck extension renders
        // its own (consistent, multi-language) squiggles in this surface.
        spellcheck: 'false',
      },
      // Handle paste events for images
      handlePaste: (view, event) => {
        // Try clipboardData.items first
        const items = event.clipboardData?.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file && handlers.onPasteImage) {
                handlers.onPasteImage(file)
              }
              return true
            }
          }
        }

        // Fallback: try clipboardData.files (WebKitGTK may populate this instead of items)
        const files = event.clipboardData?.files
        if (files && files.length > 0) {
          for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
              event.preventDefault()
              if (handlers.onPasteImage) {
                handlers.onPasteImage(file)
              }
              return true
            }
          }
        }

        return false
      },
      // Handle drop events for files (images inline, others as attachments)
      //
      // Three-tier approach for cross-platform compatibility:
      //  1. File objects via dataTransfer.files (macOS/Windows webviews)
      //  2. File URIs via getData('text/uri-list') (standard browsers)
      //  3. ProseMirror state cleanup (WebKitGTK fallback — neither #1 nor #2
      //     work because WebKitGTK provides empty files/getData and instead
      //     inserts file:/// URIs as plain text at the native GTK layer)
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false

        // Snapshot the doc's plain text BEFORE the drop. The WebKitGTK
        // fallback below uses this to compute the inserted region via a
        // prefix/suffix diff, which sidesteps the impossible boundary
        // problem the old regex-only approach had: when WebKitGTK inserts
        // a file:// URI directly adjacent to user text (e.g. dropping into
        // the middle of "Helloworld" with no space at the cursor), the
        // URI characters are syntactically indistinguishable from the
        // user's surrounding word. The diff knows where the URI starts
        // and ends because it knows what changed. See #224 follow-up.
        const beforeText = view.state.doc.textContent

        // WebKitGTK fallback: after ProseMirror syncs the native text
        // insertion into state, identify the inserted region (= the URI)
        // by diffing against the snapshot, then delete it and dispatch
        // the file paths to the Wails Go backend.
        setTimeout(() => {
          const { doc } = view.state
          const afterText = doc.textContent
          if (afterText === beforeText) return // no insertion; nothing to do

          // Prefix/suffix diff isolates the inserted span. The inserted
          // text is afterText.slice(prefixLen, afterText.length - suffixLen).
          let prefixLen = 0
          const maxPrefix = Math.min(beforeText.length, afterText.length)
          while (
            prefixLen < maxPrefix &&
            beforeText[prefixLen] === afterText[prefixLen]
          ) {
            prefixLen++
          }
          let suffixLen = 0
          const maxSuffix = Math.min(
            beforeText.length - prefixLen,
            afterText.length - prefixLen,
          )
          while (
            suffixLen < maxSuffix &&
            beforeText[beforeText.length - 1 - suffixLen] ===
              afterText[afterText.length - 1 - suffixLen]
          ) {
            suffixLen++
          }
          const insertedText = afterText.slice(
            prefixLen,
            afterText.length - suffixLen,
          )

          // Extract file URIs from the inserted region only. \S+ is safe
          // here because the region is delimited by the diff, not by
          // whatever happens to surround the URI in user content.
          const uris = Array.from(
            insertedText.matchAll(/file:\/\/\/\S+/g),
            m => m[0].trim(),
          )
          if (uris.length === 0) return // not a file drop

          // Map text positions to doc positions for the deletion.
          const startDocPos = textPosToDocPos(doc, prefixLen)
          const endDocPos = textPosToDocPos(
            doc,
            prefixLen + insertedText.length,
          )
          if (
            startDocPos < 0 ||
            endDocPos < 0 ||
            startDocPos >= endDocPos
          ) {
            return
          }

          view.dispatch(view.state.tr.delete(startDocPos, endDocPos))

          const paths = uris.map(uri => decodeURIComponent(uri.slice(7)))
          if (paths.length > 0) {
            handlers.onDropFilePaths?.(paths)
          }
        }, 200)

        // Case 1: File objects (macOS/Windows webviews)
        const files = event.dataTransfer?.files
        if (files?.length) {
          event.preventDefault()
          for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
              handlers.onDropImage?.(file)
              continue
            }
            handlers.onDropFile?.(file)
          }
          return true
        }

        // Case 2: File URIs via getData (standard browsers)
        const uriList = event.dataTransfer?.getData('text/uri-list')
        const textData = event.dataTransfer?.getData('text/plain')
        const pathData = uriList || textData
        if (pathData) {
          const paths = parseFileUris(pathData)
          if (paths.length > 0) {
            event.preventDefault()
            handlers.onDropFilePaths?.(paths)
            return true
          }
        }

        return false
      },
    },
    onUpdate: handlers.onUpdate,
  })
}
