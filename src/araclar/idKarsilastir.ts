export function idString(id: unknown): string {
  if (id == null) return '';
  return String(id);
}
