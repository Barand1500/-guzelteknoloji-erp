const onbellek = new Map<string, string>();
const MAKS_KAYIT = 24;

export function sekmeOnizlemeAl(sekmeId: string): string | null {
  return onbellek.get(sekmeId) ?? null;
}

export function sekmeOnizlemeKaydet(sekmeId: string, dataUrl: string) {
  if (!dataUrl) return;
  if (onbellek.has(sekmeId)) onbellek.delete(sekmeId);
  onbellek.set(sekmeId, dataUrl);
  while (onbellek.size > MAKS_KAYIT) {
    const ilk = onbellek.keys().next().value;
    if (!ilk) break;
    onbellek.delete(ilk);
  }
}

export function sekmeOnizlemeSil(sekmeId: string) {
  onbellek.delete(sekmeId);
}
