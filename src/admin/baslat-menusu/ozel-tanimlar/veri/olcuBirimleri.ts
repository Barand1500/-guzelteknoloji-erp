/** Ölçü ve birimler — Özel Tanımlar merkezi kaynak */

export const OLCU_BIRIMLERI_GUNCELLENDI = 'ap-ozel-olcu-birimleri-guncellendi';

const ANAHTAR = 'erp-ozel-olcu-birimleri-v1';
const ESKI_ANAHTAR = 'erp-stok-birim-adlari-v1';

export interface OlcuBirim {
  id: string;
  adi: string;
  kisaAdi: string;
  carpan: number;
  aktif: boolean;
}

export type OlcuBirimGirdi = Omit<OlcuBirim, 'id'> & { id?: string };

export interface OlcuBirimSecenek {
  value: string;
  label: string;
}

const VARSAYILAN: OlcuBirim[] = [
  { id: 'ob-adet', adi: 'ADET', kisaAdi: 'ADET', carpan: 1, aktif: true },
  { id: 'ob-koli', adi: 'KOLİ', kisaAdi: 'KOLİ', carpan: 1, aktif: true },
  { id: 'ob-paket', adi: 'PAKET', kisaAdi: 'PAKET', carpan: 1, aktif: true },
  { id: 'ob-kutu', adi: 'KUTU', kisaAdi: 'KUTU', carpan: 1, aktif: true },
  { id: 'ob-set', adi: 'SET', kisaAdi: 'SET', carpan: 1, aktif: true },
  { id: 'ob-kg', adi: 'KG', kisaAdi: 'KG', carpan: 1, aktif: true },
  { id: 'ob-lt', adi: 'LT', kisaAdi: 'LT', carpan: 1, aktif: true },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(OLCU_BIRIMLERI_GUNCELLENDI));
}

function normalize(b: Partial<OlcuBirim> & { adi: string; id: string }): OlcuBirim {
  const adi = b.adi.trim();
  const kisaAdi = (b.kisaAdi?.trim() || adi).trim();
  const carpan = Number(b.carpan);
  return {
    id: b.id,
    adi,
    kisaAdi,
    carpan: Number.isFinite(carpan) && carpan > 0 ? carpan : 1,
    aktif: b.aktif !== false,
  };
}

function eskiyiTasi(): OlcuBirim[] | null {
  try {
    const ham = localStorage.getItem(ESKI_ANAHTAR);
    if (!ham) return null;
    const eski = JSON.parse(ham) as { value?: string; label?: string }[];
    if (!Array.isArray(eski) || eski.length === 0) return null;
    return eski
      .filter((e) => e.label || e.value)
      .map((e, i) => {
        const adi = String(e.label || e.value).trim();
        return normalize({
          id: `ob-mig-${e.value ?? i}`,
          adi,
          kisaAdi: adi,
          carpan: 1,
          aktif: true,
        });
      });
  } catch {
    return null;
  }
}

function varsayilanlariTamamla(liste: OlcuBirim[]): OlcuBirim[] {
  const mevcut = new Set(liste.map((b) => b.adi.toLocaleUpperCase('tr')));
  const ekler = VARSAYILAN.filter((v) => !mevcut.has(v.adi.toLocaleUpperCase('tr')));
  return ekler.length === 0 ? liste : [...liste, ...ekler.map((b) => ({ ...b }))];
}

function oku(): OlcuBirim[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<OlcuBirim>[];
      if (Array.isArray(liste) && liste.length > 0) {
        const normalizeListe = liste
          .filter((b): b is Partial<OlcuBirim> & { adi: string; id: string } =>
            Boolean(b?.id && b?.adi)
          )
          .map(normalize);
        const tamam = varsayilanlariTamamla(normalizeListe);
        if (tamam.length !== normalizeListe.length) yaz(tamam);
        return tamam;
      }
    }
  } catch {
    /* bozuk */
  }
  const tasinan = eskiyiTasi();
  if (tasinan && tasinan.length > 0) {
    const tamam = varsayilanlariTamamla(tasinan);
    yaz(tamam);
    return tamam;
  }
  return VARSAYILAN.map((b) => ({ ...b }));
}

function yaz(liste: OlcuBirim[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function olcuBirimleriGetir(): OlcuBirim[] {
  return oku();
}

export function olcuBirimleriAktifGetir(): OlcuBirim[] {
  return oku().filter((b) => b.aktif);
}

export function olcuBirimBul(kod: string): OlcuBirim | undefined {
  const k = kod.trim().toLocaleUpperCase('tr');
  return oku().find(
    (b) =>
      b.id === kod ||
      b.adi.toLocaleUpperCase('tr') === k ||
      b.kisaAdi.toLocaleUpperCase('tr') === k
  );
}

export function olcuBirimEtiketi(kod: string): string {
  return olcuBirimBul(kod)?.adi ?? kod;
}

/** FormAcilirSecim / CariSecenekModal */
export function olcuBirimFormSecenekleri(sadeceAktif = true): OlcuBirimSecenek[] {
  const liste = sadeceAktif ? olcuBirimleriAktifGetir() : olcuBirimleriGetir();
  return liste.map((b) => ({ value: b.adi, label: b.adi }));
}

/** DataGrid: { deger, etiket } */
export function olcuBirimSecenekleri(sadeceAktif = true): { deger: string; etiket: string }[] {
  return olcuBirimFormSecenekleri(sadeceAktif).map((b) => ({
    deger: b.value,
    etiket: b.label,
  }));
}

export function gecerliOlcuBirim(kod: string | undefined, varsayilan = 'ADET'): string {
  const ad = (kod?.trim() || varsayilan).toLocaleUpperCase('tr') || 'ADET';
  const bulunan = olcuBirimBul(ad);
  if (bulunan) return bulunan.adi;
  const v = olcuBirimBul(varsayilan);
  return v?.adi ?? oku()[0]?.adi ?? 'ADET';
}

export function olcuBirimEkle(girdi: OlcuBirimGirdi | string): OlcuBirim | null {
  if (typeof girdi === 'string') {
    const adi = girdi.trim().toLocaleUpperCase('tr');
    if (!adi) return null;
    return olcuBirimEkle({ adi, kisaAdi: adi, carpan: 1, aktif: true });
  }
  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim() || adi;
  const carpan = Number(girdi.carpan);
  if (!adi || !kisaAdi || !Number.isFinite(carpan) || carpan <= 0) return null;
  if (
    oku().some(
      (b) =>
        b.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr') ||
        b.kisaAdi.toLocaleLowerCase('tr') === kisaAdi.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni: OlcuBirim = {
    id: girdi.id ?? `ob-${Date.now()}`,
    adi,
    kisaAdi,
    carpan,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function olcuBirimGuncelle(idVeyaAd: string, girdi: OlcuBirimGirdi | string): boolean {
  const mevcut = oku();
  const hedef = mevcut.find(
    (b) =>
      b.id === idVeyaAd ||
      b.adi.toLocaleUpperCase('tr') === idVeyaAd.toLocaleUpperCase('tr') ||
      b.kisaAdi.toLocaleUpperCase('tr') === idVeyaAd.toLocaleUpperCase('tr')
  );
  if (!hedef) return false;

  if (typeof girdi === 'string') {
    const adi = girdi.trim().toLocaleUpperCase('tr');
    if (!adi) return false;
    if (hedef.adi === 'ADET') return true; // ADET adı korunur
    if (
      mevcut.some(
        (b) =>
          b.id !== hedef.id &&
          (b.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr') ||
            b.kisaAdi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))
      )
    ) {
      return false;
    }
    yaz(mevcut.map((b) => (b.id === hedef.id ? { ...b, adi, kisaAdi: adi } : b)));
    return true;
  }

  const adi = girdi.adi.trim();
  const kisaAdi = girdi.kisaAdi.trim();
  const carpan = Number(girdi.carpan);
  if (!adi || !kisaAdi || !Number.isFinite(carpan) || carpan <= 0) return false;
  if (
    mevcut.some(
      (b) =>
        b.id !== hedef.id &&
        (b.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr') ||
          b.kisaAdi.toLocaleLowerCase('tr') === kisaAdi.toLocaleLowerCase('tr'))
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((b) =>
      b.id === hedef.id
        ? { ...b, adi, kisaAdi, carpan, aktif: girdi.aktif !== false }
        : b
    )
  );
  return true;
}

export function olcuBirimSil(idVeyaAd: string): void {
  const ku = idVeyaAd.toLocaleUpperCase('tr');
  yaz(
    oku().filter((b) => {
      if (b.adi === 'ADET') return true; // ADET silinmez
      return b.id !== idVeyaAd && b.adi.toLocaleUpperCase('tr') !== ku && b.kisaAdi.toLocaleUpperCase('tr') !== ku;
    })
  );
}
