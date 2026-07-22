/** Small, dependency-free unique id generator — good enough for client-only row keys. */
export function nanoid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
