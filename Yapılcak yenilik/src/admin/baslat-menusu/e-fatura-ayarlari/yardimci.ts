import { varsayilanEFaturaKaydi } from '@/admin/baslat-menusu/e-fatura-ayarlari/varsayilanVeri';
import type { EFaturaKayit } from '@/admin/baslat-menusu/e-fatura-ayarlari/tipler';

const STORAGE_KEY = 'restorant-e-fatura-ayarlari';

export function eFaturaKaydiOku(): EFaturaKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return JSON.parse(JSON.stringify(varsayilanEFaturaKaydi)) as EFaturaKayit;
    return JSON.parse(ham) as EFaturaKayit;
  } catch {
    return JSON.parse(JSON.stringify(varsayilanEFaturaKaydi)) as EFaturaKayit;
  }
}

export function eFaturaKaydiKaydet(kayit: EFaturaKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function eFaturaKayitEsit(a: EFaturaKayit, b: EFaturaKayit): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const ALAN_ETIKETLERI: Record<string, string> = {
  ust: 'Üst ayarlar ve seriler',
  firma: 'Firma bilgileri',
  servis: 'Servis ayarları',
};

export function eFaturaDegisenBolumler(onceki: EFaturaKayit, yeni: EFaturaKayit): string[] {
  const bolumler: string[] = [];
  if (JSON.stringify(onceki.ust) !== JSON.stringify(yeni.ust)) bolumler.push(ALAN_ETIKETLERI.ust);
  if (JSON.stringify(onceki.firma) !== JSON.stringify(yeni.firma)) bolumler.push(ALAN_ETIKETLERI.firma);
  if (JSON.stringify(onceki.servis) !== JSON.stringify(yeni.servis)) bolumler.push(ALAN_ETIKETLERI.servis);
  return bolumler;
}
