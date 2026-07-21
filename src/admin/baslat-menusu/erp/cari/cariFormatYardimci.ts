export const EPOSTA_DOMAINLERI = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yandex.com',
  'icloud.com',
  'yahoo.com',
  'guzelteknoloji.com',
] as const;

export function yalnizcaRakam(deger: string, max?: number): string {
  const rakamlar = deger.replace(/\D/g, '');
  return max ? rakamlar.slice(0, max) : rakamlar;
}

export function telefonFormatla(ham: string): string {
  const rakamlar = yalnizcaRakam(ham, 11);
  if (!rakamlar) return '';

  const sifirli = rakamlar.startsWith('0');
  const parcalar: string[] = [];

  if (sifirli) {
    parcalar.push(rakamlar.slice(0, 1));
    let kalan = rakamlar.slice(1);
    if (kalan.length > 0) parcalar.push(kalan.slice(0, 3));
    kalan = kalan.slice(3);
    if (kalan.length > 0) parcalar.push(kalan.slice(0, 3));
    kalan = kalan.slice(3);
    if (kalan.length > 0) parcalar.push(kalan.slice(0, 2));
    kalan = kalan.slice(2);
    if (kalan.length > 0) parcalar.push(kalan.slice(0, 2));
    return parcalar.join(' ').trim();
  }

  let kalan = rakamlar;
  if (kalan.length > 0) parcalar.push(kalan.slice(0, 3));
  kalan = kalan.slice(3);
  if (kalan.length > 0) parcalar.push(kalan.slice(0, 3));
  kalan = kalan.slice(3);
  if (kalan.length > 0) parcalar.push(kalan.slice(0, 2));
  kalan = kalan.slice(2);
  if (kalan.length > 0) parcalar.push(kalan.slice(0, 2));
  return parcalar.join(' ').trim();
}

export function epostaOnerileri(deger: string): string[] {
  const v = deger.trim();
  if (!v || v.includes(' ')) return [];

  if (!v.includes('@')) {
    return EPOSTA_DOMAINLERI.map((d) => `${v}@${d}`).slice(0, 6);
  }

  const [kullanici, domainParca] = v.split('@');
  if (!kullanici) return [];
  const q = (domainParca ?? '').toLowerCase();
  return EPOSTA_DOMAINLERI.filter((d) => d.startsWith(q) && d !== q)
    .map((d) => `${kullanici}@${d}`)
    .slice(0, 6);
}

export function pasaportGecerliMi(deger: string): boolean {
  const v = deger.trim();
  if (!v) return true;
  return /^[A-Za-z0-9]{5,20}$/.test(v);
}
