import type { useInvoiceStore } from "../stores/invoice.store";

const STORAGE_KEY = "invoice-draft-v1";
const SAVE_DEBOUNCE_MS = 500;

/**
 * Reads a previously autosaved draft from localStorage, if any.
 * Returns null if nothing is saved or the saved value is corrupt.
 */
export function readDraftFromStorage<T>(): T | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDraftStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private browsing, quota, etc.) — silently ignore.
  }
}

/**
 * Subscribes to every store mutation and writes the full state to
 * localStorage after a short debounce, so a refresh or accidental tab close
 * never loses in-progress work. Returns an unsubscribe function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAutosave(store: ReturnType<typeof useInvoiceStore>): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = store.$subscribe(
    (_mutation, state) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
          // Storage may be unavailable — the in-memory state is still fine either way.
        }
      }, SAVE_DEBOUNCE_MS);
    },
    { detached: true }
  );

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
