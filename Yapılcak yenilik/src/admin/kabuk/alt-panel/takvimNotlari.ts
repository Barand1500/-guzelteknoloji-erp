export interface TakvimNotu {
  metin: string;
  olusturma: string;
  guncelleme: string;
}

const STORAGE_KEY = 'restorant-takvim-notlari';

export function tarihAnahtari(yil: number, ay: number, gun: number): string {
  const m = String(ay + 1).padStart(2, '0');
  const g = String(gun).padStart(2, '0');
  return `${yil}-${m}-${g}`;
}

export function takvimNotlariOku(): Record<string, TakvimNotu> {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return {};
    const parsed = JSON.parse(ham) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, TakvimNotu>;
  } catch {
    return {};
  }
}

export function takvimNotlariKaydet(notlar: Record<string, TakvimNotu>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notlar));
}

export function takvimNotuKaydet(tarih: string, metin: string): TakvimNotu {
  const notlar = takvimNotlariOku();
  const simdi = new Date().toISOString();
  const onceki = notlar[tarih];
  const kayit: TakvimNotu = {
    metin: metin.trim(),
    olusturma: onceki?.olusturma ?? simdi,
    guncelleme: simdi,
  };
  notlar[tarih] = kayit;
  takvimNotlariKaydet(notlar);
  return kayit;
}

export function takvimNotuSil(tarih: string) {
  const notlar = takvimNotlariOku();
  delete notlar[tarih];
  takvimNotlariKaydet(notlar);
}

export function tarihEtiketi(anahtar: string): string {
  const [y, m, g] = anahtar.split('-').map(Number);
  if (!y || !m || !g) return anahtar;
  const tarih = new Date(y, m - 1, g);
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(tarih);
}

export function zamanEtiketi(iso: string): string {
  const tarih = new Date(iso);
  if (Number.isNaN(tarih.getTime())) return iso;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(tarih);
}
