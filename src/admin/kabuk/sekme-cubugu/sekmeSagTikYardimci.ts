import type { AdminSekme } from '@/admin/ortak/tipler/admin';

export type SekmeSagTikIslem =
  | 'kapat'
  | 'digerleriniKapat'
  | 'solundakileriKapat'
  | 'saginiKapat'
  | 'tumunuKapat'
  | 'sonKapananlariGeriGetir'
  | 'gruptanAyir'
  | 'grupYanYana'
  | 'grupAltAlta';

export function kapatilacakSekmeIdleri(
  sekmeler: AdminSekme[],
  hedefId: string,
  islem: SekmeSagTikIslem
): string[] {
  if (islem === 'sonKapananlariGeriGetir' || islem === 'grupYanYana' || islem === 'grupAltAlta' || islem === 'gruptanAyir') return [];
  if (sekmeler.length <= 1 && islem !== 'kapat') return [];

  const idx = sekmeler.findIndex((s) => s.id === hedefId);
  if (idx < 0) return [];

  switch (islem) {
    case 'kapat':
      return sekmeler.length <= 1 ? [] : [hedefId];
    case 'digerleriniKapat':
      return sekmeler.filter((s) => s.id !== hedefId).map((s) => s.id);
    case 'solundakileriKapat':
      return sekmeler.slice(0, idx).map((s) => s.id);
    case 'saginiKapat':
      return sekmeler.slice(idx + 1).map((s) => s.id);
    case 'tumunuKapat':
      return sekmeler.filter((s) => s.id !== hedefId).map((s) => s.id);
    default:
      return [];
  }
}

export function sekmeKapatSonrasiAktifId(
  sekmeler: AdminSekme[],
  hedefId: string,
  islem: SekmeSagTikIslem,
  mevcutAktifId: string
): string {
  const kapatilacak = new Set(kapatilacakSekmeIdleri(sekmeler, hedefId, islem));
  const kalan = sekmeler.filter((s) => !kapatilacak.has(s.id));

  if (islem === 'sonKapananlariGeriGetir' || islem === 'grupYanYana' || islem === 'grupAltAlta' || islem === 'gruptanAyir') {
    return mevcutAktifId;
  }

  if (islem === 'kapat') {
    if (mevcutAktifId !== hedefId) return mevcutAktifId;
    const idx = sekmeler.findIndex((s) => s.id === hedefId);
    const komşu = sekmeler[idx + 1] ?? sekmeler[idx - 1];
    return komşu?.id ?? kalan[0]?.id ?? mevcutAktifId;
  }

  if (kalan.some((s) => s.id === hedefId)) return hedefId;
  if (kalan.some((s) => s.id === mevcutAktifId)) return mevcutAktifId;
  return kalan[0]?.id ?? hedefId;
}

export function kirliKapatilacakSekmeler(
  sekmeler: AdminSekme[],
  kapatilacakIds: string[]
): AdminSekme[] {
  const kapatSet = new Set(kapatilacakIds);
  return sekmeler.filter((s) => kapatSet.has(s.id) && s.kaydedilmedi);
}
