import type { InvoiceState } from "../types/invoice.types";

const PARAM = "data";

/** UTF-8 safe base64 encode/decode (btoa/atob only handle latin1). */
function encode(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string): string {
  const restored = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(restored);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Builds a full shareable URL that reproduces the current invoice when opened. */
export function buildShareUrl(state: InvoiceState): string {
  const encoded = encode(JSON.stringify(state));
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, encoded);
  return url.toString();
}

/** Reads invoice state from the current URL, if present. Returns null if absent/invalid. */
export function readStateFromUrl(): Partial<InvoiceState> | null {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get(PARAM);
  if (!raw) return null;
  try {
    return JSON.parse(decode(raw)) as Partial<InvoiceState>;
  } catch {
    return null;
  }
}
