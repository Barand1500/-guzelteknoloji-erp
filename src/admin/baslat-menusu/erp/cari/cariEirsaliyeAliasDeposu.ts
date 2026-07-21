const DEPOLAMA_ANAHTARI = 'cari_eirsaliye_alias_v1';

function oku(): Record<string, string> {
  try {
    const ham = localStorage.getItem(DEPOLAMA_ANAHTARI);
    if (!ham) return {};
    const veri = JSON.parse(ham) as Record<string, string>;
    return veri && typeof veri === 'object' ? veri : {};
  } catch {
    return {};
  }
}

function yaz(veri: Record<string, string>) {
  localStorage.setItem(DEPOLAMA_ANAHTARI, JSON.stringify(veri));
}

export function cariEirsaliyeAliasGetir(cariId: string): string {
  if (!cariId) return '';
  return oku()[cariId] ?? '';
}

export function cariEirsaliyeAliasKaydet(cariId: string, alias: string) {
  if (!cariId) return;
  const veri = oku();
  const temiz = alias.trim();
  if (!temiz) {
    delete veri[cariId];
  } else {
    veri[cariId] = temiz.slice(0, 200);
  }
  yaz(veri);
}
