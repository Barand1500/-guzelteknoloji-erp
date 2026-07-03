export function idString(id: unknown): string {
  if (id == null) return '';
  return String(id);
}

export function idKarsilastir(a: unknown, b: unknown): number {
  return idString(a).localeCompare(idString(b), 'tr');
}
