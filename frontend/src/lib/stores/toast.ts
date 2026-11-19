import { writable } from 'svelte/store'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  actions?: ToastAction[]
  /** Technical detail (raw error text); shown only after "Show details" (UX-COPY-8). */
  details?: string
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([])

  function add(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID()
    const newToast: Toast = { ...toast, id }

    update(toasts => [...toasts, newToast])

    // Auto-remove after duration (default 5 seconds, longer with actions, longest with details to read)
    const duration = toast.duration ?? (toast.details ? 12000 : toast.actions ? 8000 : 5000)
    setTimeout(() => {
      remove(id)
    }, duration)

    return id
  }

  function remove(id: string) {
    update(toasts => toasts.filter(t => t.id !== id))
  }

  function success(message: string, actions?: ToastAction[]) {
    return add({ message, type: 'success', actions })
  }

  function error(message: string, actions?: ToastAction[], details?: string) {
    return add({ message, type: 'error', actions, details })
  }

  function info(message: string, actions?: ToastAction[]) {
    return add({ message, type: 'info', actions })
  }

  function warning(message: string, actions?: ToastAction[]) {
    return add({ message, type: 'warning', actions })
  }

  return {
    subscribe,
    add,
    remove,
    success,
    error,
    info,
    warning
  }
}

export const toasts = createToastStore()

// Helper function for easy toast creation
export function addToast(toast: Omit<Toast, 'id'>) {
  return toasts.add(toast)
}

/** Raw error text for a toast's detail layer; empty when the error has none worth showing. */
export function errorDetails(err: unknown): string | undefined {
  const text = err instanceof Error ? err.message : String(err ?? '')
  return text.trim() || undefined
}
