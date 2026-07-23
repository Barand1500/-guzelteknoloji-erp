const ANAHTAR = 'erp-stok-kdv-departmanlari-v2';

export interface StokKdvDepartmaniSecenek {
  value: string;
  label: string;
  yuzde: string;
}

const VARSAYILAN: StokKdvDepartmaniSecenek[] = [
  { value: 'ICECEKLER', label: 'İÇECEKLER', yuzde: '' },
  { value: 'YIYECEKLER', label: 'YİYECEKLER', yuzde: '' },
  { value: 'MERCH', label: 'MERCH', yuzde: '' },
  { value: 'CEKIRDEK_KAHVE', label: 'ÇEKİRDEK KAHVE', yuzde: '' },
];

function normalizeYuzde(yuzde: unknown): string {
  if (typeof yuzde === 'number' && Number.isFinite(yuzde)) return String(yuzde);
  if (typeof yuzde === 'string') return kdvYuzdeFiltrele(yuzde);
  return '';
}

function oku(): StokKdvDepartmaniSecenek[] {
  try {
    const ham =
      localStorage.getItem(ANAHTAR) ??
      localStorage.getItem('erp-stok-kdv-departmanlari-v1');
    if (ham) {
      const liste = JSON.parse(ham) as Array<Partial<StokKdvDepartmaniSecenek>>;
      if (Array.isArray(liste) && liste.length > 0) {
        return liste.map((d) => ({
          value: String(d.value ?? ''),
          label: String(d.label ?? ''),
          yuzde: normalizeYuzde(d.yuzde),
        }));
      }
    }
  } catch {
    /* bozuk */
  }
  return [...VARSAYILAN];
}

function yaz(liste: StokKdvDepartmaniSecenek[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

export function kdvYuzdeFiltrele(ham: string): string {
  let s = ham.replace(/[^\d.,]/g, '').replace(',', '.');
  const parcalar = s.split('.');
  if (parcalar.length > 2) s = `${parcalar[0]}.${parcalar.slice(1).join('')}`;
  if (s.includes('.')) {
    const [tam, ondalik = ''] = s.split('.');
    s = `${tam}.${ondalik.slice(0, 2)}`;
  }
  if (s.endsWith('.')) return s;
  const n = Number(s);
  if (s !== '' && !Number.isNaN(n) && n > 100) return '100';
  return s;
}

/** Oran dolu ve sayısal mı (boş / yarım giriş kabul edilmez). */
export function kdvYuzdeDoluMu(yuzde: string): boolean {
  const temiz = kdvYuzdeFiltrele(yuzde.trim());
  if (!temiz || temiz.endsWith('.')) return false;
  return Number.isFinite(Number(temiz));
}

export function stokKdvDepartmanlariGetir(): StokKdvDepartmaniSecenek[] {
  return oku();
}

export function stokKdvDepartmaniGosterimEtiketi(departman: StokKdvDepartmaniSecenek): string {
  const yuzde = departman.yuzde.trim();
  if (!yuzde) return departman.label;
  return `${departman.label} — %${yuzde.replace('.', ',')}`;
}

export function stokKdvDepartmaniEkle(
  label: string,
  yuzde: string
): StokKdvDepartmaniSecenek | null {
  const ad = label.trim();
  const temizYuzde = kdvYuzdeFiltrele(yuzde.trim());
  if (!ad || !kdvYuzdeDoluMu(temizYuzde)) return null;
  const value = ad
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
  const mevcut = oku();
  if (
    mevcut.some(
      (d) =>
        d.value === value ||
        d.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return null;
  }
  const yeni: StokKdvDepartmaniSecenek = {
    value: value || `KDV_${Date.now()}`,
    label: ad.toLocaleUpperCase('tr'),
    yuzde: temizYuzde,
  };
  yaz([...mevcut, yeni]);
  return yeni;
}

export function stokKdvDepartmaniGuncelle(
  value: string,
  yeniLabel: string,
  yuzde: string
): boolean {
  const ad = yeniLabel.trim();
  const temizYuzde = kdvYuzdeFiltrele(yuzde.trim());
  if (!ad || !kdvYuzdeDoluMu(temizYuzde)) return false;
  const mevcut = oku();
  const hedef = mevcut.find((d) => d.value === value);
  if (!hedef) return false;
  if (
    mevcut.some(
      (d) =>
        d.value !== value && d.label.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((d) =>
      d.value === value
        ? { ...d, label: ad.toLocaleUpperCase('tr'), yuzde: temizYuzde }
        : d
    )
  );
  return true;
}

export function stokKdvDepartmaniSil(value: string): void {
  yaz(oku().filter((d) => d.value !== value));
}

export function stokKdvDepartmaniEtiketi(value: string): string {
  const hedef = oku().find((d) => d.value === value);
  if (!hedef) return value;
  return stokKdvDepartmaniGosterimEtiketi(hedef);
}
