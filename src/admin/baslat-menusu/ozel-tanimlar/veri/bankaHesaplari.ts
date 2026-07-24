/** Özel Tanımlar — Banka hesapları (bankaya bağlı) */

export const BANKA_HESAPLARI_GUNCELLENDI = 'ap-ozel-banka-hesaplari-guncellendi';

const ANAHTAR = 'erp-ozel-banka-hesaplari-v1';

export interface BankaHesap {
  id: string;
  bankaKodu: string;
  paraBirimi: string;
  hesapAdi: string;
  iban: string;
  subeAdi: string;
  subeKodu: string;
  hesapNo: string;
  sanalPos: boolean;
  havaleEft: boolean;
  aktif: boolean;
}

export type BankaHesapGirdi = Omit<BankaHesap, 'id'> & { id?: string };

function duyur() {
  window.dispatchEvent(new CustomEvent(BANKA_HESAPLARI_GUNCELLENDI));
}

function oku(): BankaHesap[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as BankaHesap[];
      if (Array.isArray(liste)) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [];
}

function yaz(liste: BankaHesap[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function bankaHesaplariGetir(bankaKodu?: string): BankaHesap[] {
  const liste = oku();
  if (!bankaKodu) return liste;
  const kod = bankaKodu.toLocaleUpperCase('tr');
  return liste.filter((h) => h.bankaKodu.toLocaleUpperCase('tr') === kod);
}

export function bankaHesapSayilari(): Record<string, number> {
  const sayac: Record<string, number> = {};
  for (const h of oku()) {
    const kod = h.bankaKodu.toLocaleUpperCase('tr');
    sayac[kod] = (sayac[kod] ?? 0) + 1;
  }
  return sayac;
}

export function bankaHesapEkle(girdi: BankaHesapGirdi): BankaHesap | null {
  const bankaKodu = girdi.bankaKodu.trim().toLocaleUpperCase('tr');
  const paraBirimi = girdi.paraBirimi.trim();
  const hesapAdi = girdi.hesapAdi.trim();
  const iban = girdi.iban.trim().replace(/\s+/g, '').toLocaleUpperCase('tr');
  if (!bankaKodu || !paraBirimi || !hesapAdi || !iban) return null;

  const yeni: BankaHesap = {
    id: girdi.id ?? `bh-${Date.now()}`,
    bankaKodu,
    paraBirimi,
    hesapAdi,
    iban,
    subeAdi: (girdi.subeAdi ?? '').trim(),
    subeKodu: (girdi.subeKodu ?? '').trim(),
    hesapNo: (girdi.hesapNo ?? '').trim(),
    sanalPos: Boolean(girdi.sanalPos),
    havaleEft: Boolean(girdi.havaleEft),
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function bankaHesapGuncelle(id: string, girdi: BankaHesapGirdi): boolean {
  const bankaKodu = girdi.bankaKodu.trim().toLocaleUpperCase('tr');
  const paraBirimi = girdi.paraBirimi.trim();
  const hesapAdi = girdi.hesapAdi.trim();
  const iban = girdi.iban.trim().replace(/\s+/g, '').toLocaleUpperCase('tr');
  if (!bankaKodu || !paraBirimi || !hesapAdi || !iban) return false;
  const mevcut = oku();
  if (!mevcut.some((h) => h.id === id)) return false;
  yaz(
    mevcut.map((h) =>
      h.id === id
        ? {
            ...h,
            bankaKodu,
            paraBirimi,
            hesapAdi,
            iban,
            subeAdi: (girdi.subeAdi ?? '').trim(),
            subeKodu: (girdi.subeKodu ?? '').trim(),
            hesapNo: (girdi.hesapNo ?? '').trim(),
            sanalPos: Boolean(girdi.sanalPos),
            havaleEft: Boolean(girdi.havaleEft),
            aktif: girdi.aktif !== false,
          }
        : h
    )
  );
  return true;
}

export function bankaHesapSil(id: string): void {
  yaz(oku().filter((h) => h.id !== id));
}
