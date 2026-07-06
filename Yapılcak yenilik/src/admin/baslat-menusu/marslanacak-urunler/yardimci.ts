import { varsayilanMarslanacakKaydi } from '@/admin/baslat-menusu/marslanacak-urunler/varsayilanVeri';
import type { MarslanacakUrun, MarslanacakUrunKayit } from '@/admin/baslat-menusu/marslanacak-urunler/tipler';

const STORAGE_KEY = 'restorant-marslanacak-urunler';

export function marslanacakKaydiOku(): MarslanacakUrunKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return JSON.parse(JSON.stringify(varsayilanMarslanacakKaydi)) as MarslanacakUrunKayit;
    return JSON.parse(ham) as MarslanacakUrunKayit;
  } catch {
    return JSON.parse(JSON.stringify(varsayilanMarslanacakKaydi)) as MarslanacakUrunKayit;
  }
}

export function marslanacakKaydiKaydet(kayit: MarslanacakUrunKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function marslanacakKayitEsit(a: MarslanacakUrunKayit, b: MarslanacakUrunKayit): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function marslanacakDegisimOzeti(onceki: MarslanacakUrunKayit, yeni: MarslanacakUrunKayit): string {
  const oncekiMap = new Map(onceki.urunler.map((u) => [u.id, u]));
  const eklenen: string[] = [];
  const cikarilan: string[] = [];

  for (const u of yeni.urunler) {
    const eski = oncekiMap.get(u.id);
    if (!eski) continue;
    if (!eski.marslanmayacak && u.marslanmayacak) eklenen.push(u.ad);
    if (eski.marslanmayacak && !u.marslanmayacak) cikarilan.push(u.ad);
  }

  const parcalar: string[] = [];
  if (eklenen.length) parcalar.push(`Marşlanmayacak: ${eklenen.slice(0, 3).join(', ')}${eklenen.length > 3 ? ` (+${eklenen.length - 3})` : ''}`);
  if (cikarilan.length) parcalar.push(`Marşlanacak: ${cikarilan.slice(0, 3).join(', ')}${cikarilan.length > 3 ? ` (+${cikarilan.length - 3})` : ''}`);
  if (!parcalar.length) return 'Ürün marş ayarları güncellendi.';
  return parcalar.join(' · ');
}

export function tumuSeciliMi(urunler: MarslanacakUrun[]): boolean {
  return urunler.length > 0 && urunler.every((u) => u.marslanmayacak);
}

export function baziSeciliMi(urunler: MarslanacakUrun[]): boolean {
  const secili = urunler.filter((u) => u.marslanmayacak).length;
  return secili > 0 && secili < urunler.length;
}
