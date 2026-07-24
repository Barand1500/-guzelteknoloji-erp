/** BIN kayıtları — banka + tip + marka + tür */

export const BIN_KAYITLARI_GUNCELLENDI = 'ap-ozel-bin-kayitlari-guncellendi';

const ANAHTAR = 'erp-ozel-bin-kayitlari-v1';

export const KART_TURLERI = [
  { value: 'bireysel', label: 'Bireysel Kart' },
  { value: 'ticari', label: 'Ticari Kart' },
] as const;

export type KartTuru = (typeof KART_TURLERI)[number]['value'];

export interface BinKayit {
  id: string;
  bankaKodu: string;
  bin: string;
  kartTipiId: string;
  kartMarkaId: string;
  kartTuru: KartTuru;
  aktif: boolean;
}

export type BinKayitGirdi = Omit<BinKayit, 'id'> & { id?: string };

function duyur() {
  window.dispatchEvent(new CustomEvent(BIN_KAYITLARI_GUNCELLENDI));
}

function oku(): BinKayit[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as BinKayit[];
      if (Array.isArray(liste)) return liste;
    }
  } catch {
    /* bozuk */
  }
  return [];
}

function yaz(liste: BinKayit[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function binKayitlariGetir(): BinKayit[] {
  return oku();
}

export function binKayitlariAktifGetir(): BinKayit[] {
  return oku().filter((b) => b.aktif);
}

export function kartTuruEtiketi(tur: string): string {
  return KART_TURLERI.find((t) => t.value === tur)?.label ?? tur;
}

export function binKayitEkle(girdi: BinKayitGirdi): BinKayit | null {
  const bankaKodu = girdi.bankaKodu.trim();
  const bin = girdi.bin.trim().replace(/\D/g, '');
  if (!bankaKodu || !bin || bin.length < 4 || bin.length > 8) return null;
  if (!girdi.kartTipiId || !girdi.kartMarkaId || !girdi.kartTuru) return null;
  if (oku().some((b) => b.bin === bin)) return null;

  const yeni: BinKayit = {
    id: girdi.id ?? `bin-${Date.now()}`,
    bankaKodu,
    bin,
    kartTipiId: girdi.kartTipiId,
    kartMarkaId: girdi.kartMarkaId,
    kartTuru: girdi.kartTuru,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function binKayitGuncelle(id: string, girdi: BinKayitGirdi): boolean {
  const bankaKodu = girdi.bankaKodu.trim();
  const bin = girdi.bin.trim().replace(/\D/g, '');
  if (!bankaKodu || !bin || bin.length < 4 || bin.length > 8) return false;
  if (!girdi.kartTipiId || !girdi.kartMarkaId || !girdi.kartTuru) return false;
  const mevcut = oku();
  if (!mevcut.some((b) => b.id === id)) return false;
  if (mevcut.some((b) => b.id !== id && b.bin === bin)) return false;

  yaz(
    mevcut.map((b) =>
      b.id === id
        ? {
            ...b,
            bankaKodu,
            bin,
            kartTipiId: girdi.kartTipiId,
            kartMarkaId: girdi.kartMarkaId,
            kartTuru: girdi.kartTuru,
            aktif: girdi.aktif !== false,
          }
        : b
    )
  );
  return true;
}

export function binKayitSil(id: string): void {
  yaz(oku().filter((b) => b.id !== id));
}
