/** Telefon alanı — ülke seçimi ve ulusal numara formatı */

export type TelefonUlke = {
  id: string;
  ad: string;
  dial: string;
  /** Ulusal numara max hane (ülke kodu hariç) */
  maxHane: number;
  /** true ise TR tarzı gruplama */
  trFormat?: boolean;
};

export const TELEFON_ULKELER: readonly TelefonUlke[] = [
  { id: 'TR', ad: 'Türkiye', dial: '90', maxHane: 11, trFormat: true },
  { id: 'DE', ad: 'Almanya', dial: '49', maxHane: 12 },
  { id: 'US', ad: 'ABD', dial: '1', maxHane: 10 },
  { id: 'GB', ad: 'Birleşik Krallık', dial: '44', maxHane: 11 },
  { id: 'FR', ad: 'Fransa', dial: '33', maxHane: 10 },
  { id: 'NL', ad: 'Hollanda', dial: '31', maxHane: 10 },
  { id: 'IT', ad: 'İtalya', dial: '39', maxHane: 11 },
  { id: 'ES', ad: 'İspanya', dial: '34', maxHane: 9 },
  { id: 'AZ', ad: 'Azerbaycan', dial: '994', maxHane: 10 },
  { id: 'RU', ad: 'Rusya', dial: '7', maxHane: 10 },
  { id: 'SA', ad: 'Suudi Arabistan', dial: '966', maxHane: 9 },
  { id: 'AE', ad: 'BAE', dial: '971', maxHane: 9 },
  { id: 'IQ', ad: 'Irak', dial: '964', maxHane: 10 },
  { id: 'IR', ad: 'İran', dial: '98', maxHane: 10 },
  { id: 'SY', ad: 'Suriye', dial: '963', maxHane: 9 },
  { id: 'BG', ad: 'Bulgaristan', dial: '359', maxHane: 9 },
  { id: 'GR', ad: 'Yunanistan', dial: '30', maxHane: 10 },
  { id: 'RO', ad: 'Romanya', dial: '40', maxHane: 10 },
  { id: 'CN', ad: 'Çin', dial: '86', maxHane: 11 },
  { id: 'JP', ad: 'Japonya', dial: '81', maxHane: 11 },
  { id: 'KR', ad: 'Güney Kore', dial: '82', maxHane: 11 },
  { id: 'IN', ad: 'Hindistan', dial: '91', maxHane: 10 },
  { id: 'PK', ad: 'Pakistan', dial: '92', maxHane: 10 },
  { id: 'CA', ad: 'Kanada', dial: '1', maxHane: 10 },
  { id: 'AU', ad: 'Avustralya', dial: '61', maxHane: 10 },
  { id: 'CH', ad: 'İsviçre', dial: '41', maxHane: 10 },
  { id: 'AT', ad: 'Avusturya', dial: '43', maxHane: 11 },
  { id: 'BE', ad: 'Belçika', dial: '32', maxHane: 10 },
  { id: 'SE', ad: 'İsveç', dial: '46', maxHane: 10 },
  { id: 'NO', ad: 'Norveç', dial: '47', maxHane: 8 },
  { id: 'PL', ad: 'Polonya', dial: '48', maxHane: 9 },
  { id: 'UA', ad: 'Ukrayna', dial: '380', maxHane: 9 },
  { id: 'EG', ad: 'Mısır', dial: '20', maxHane: 10 },
  { id: 'GE', ad: 'Gürcistan', dial: '995', maxHane: 9 },
] as const;

export const VARSAYILAN_TELEFON_ULKE = TELEFON_ULKELER[0];

export function telefonUlkeBul(id: string): TelefonUlke {
  return TELEFON_ULKELER.find((u) => u.id === id) ?? VARSAYILAN_TELEFON_ULKE;
}

/** Windows emoji bayrak göstermediği için PNG (flagcdn) */
export function telefonBayrakUrl(ulkeId: string, genislik: 20 | 40 | 80 = 40): string {
  return `https://flagcdn.com/w${genislik}/${ulkeId.toLowerCase()}.png`;
}

export function telefonUlkeAra(arama: string): TelefonUlke[] {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return [...TELEFON_ULKELER];
  return TELEFON_ULKELER.filter(
    (u) =>
      u.ad.toLocaleLowerCase('tr').includes(q) ||
      u.dial.includes(q.replace(/^\+/, '')) ||
      u.id.toLowerCase().includes(q)
  );
}

function yalnizcaRakam(deger: string, max?: number): string {
  const rakamlar = deger.replace(/\D/g, '');
  return max ? rakamlar.slice(0, max) : rakamlar;
}

/** Ulusal numarayı ülkeye göre boşluklarla biçimlendirir */
export function ulusalTelefonFormatla(ham: string, ulke: TelefonUlke): string {
  const rakamlar = yalnizcaRakam(ham, ulke.maxHane);
  if (!rakamlar) return '';

  if (ulke.trFormat) {
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

  if (ulke.id === 'US' || ulke.id === 'CA') {
    const a = rakamlar.slice(0, 3);
    const b = rakamlar.slice(3, 6);
    const c = rakamlar.slice(6, 10);
    if (rakamlar.length <= 3) return a;
    if (rakamlar.length <= 6) return `(${a}) ${b}`.trim();
    return `(${a}) ${b}-${c}`.trim();
  }

  // Genel: 3-3-2-2… gruplama
  const parcalar: string[] = [];
  let kalan = rakamlar;
  while (kalan.length > 0) {
    const al = kalan.length > 4 ? 3 : kalan.length > 2 ? 2 : kalan.length;
    parcalar.push(kalan.slice(0, al));
    kalan = kalan.slice(al);
  }
  return parcalar.join(' ').trim();
}

export function telefonKayitDegeri(ulke: TelefonUlke, ulusalHam: string): string {
  let rakamlar = yalnizcaRakam(ulusalHam, ulke.maxHane);
  if (ulke.trFormat) rakamlar = trUlusalSifirsiz(rakamlar).slice(0, 10);
  if (!rakamlar) return '';
  const bicimli = ulusalTelefonFormatla(rakamlar, ulke);
  return `+${ulke.dial} ${bicimli}`.trim();
}

/** Kayıtlı değeri ülke + ulusal numaraya ayırır */
export function telefonDegeriniParcala(deger: string): { ulke: TelefonUlke; ulusal: string } {
  const ham = deger.trim();
  if (!ham) return { ulke: VARSAYILAN_TELEFON_ULKE, ulusal: '' };

  const rakamlarHepsi = yalnizcaRakam(ham);
  // +XX veya XX ile başlayan uluslararası
  const arti = ham.match(/^\+(\d{1,3})\s*(.*)$/);
  if (arti) {
    const dial = arti[1];
    // En uzun dial eşleşmesi
    const eslesen = [...TELEFON_ULKELER]
      .filter((u) => dial === u.dial || dial.startsWith(u.dial))
      .sort((a, b) => b.dial.length - a.dial.length)[0];
    if (eslesen && dial === eslesen.dial) {
      let ulusalRakam = yalnizcaRakam(arti[2] || rakamlarHepsi.slice(eslesen.dial.length), eslesen.maxHane);
      if (eslesen.trFormat) ulusalRakam = trUlusalSifirsiz(ulusalRakam).slice(0, 10);
      return { ulke: eslesen, ulusal: ulusalTelefonFormatla(ulusalRakam, eslesen) };
    }
  }

  // Dial ile başlayan (artısız)
  const dialEslesen = [...TELEFON_ULKELER]
    .filter((u) => rakamlarHepsi.startsWith(u.dial) && rakamlarHepsi.length > u.dial.length + 4)
    .sort((a, b) => b.dial.length - a.dial.length)[0];
  if (dialEslesen) {
    let ulusalRakam = rakamlarHepsi.slice(dialEslesen.dial.length).slice(0, dialEslesen.maxHane);
    if (dialEslesen.trFormat) ulusalRakam = trUlusalSifirsiz(ulusalRakam).slice(0, 10);
    return { ulke: dialEslesen, ulusal: ulusalTelefonFormatla(ulusalRakam, dialEslesen) };
  }

  // Varsayılan TR ulusal (ülke kodu yoksa 0 ile başlayabilir)
  return {
    ulke: VARSAYILAN_TELEFON_ULKE,
    ulusal: ulusalTelefonFormatla(rakamlarHepsi, VARSAYILAN_TELEFON_ULKE),
  };
}

/** Ülke kodu varken TR ulusal numaradan baştaki 0'ı atar */
export function trUlusalSifirsiz(rakamlar: string): string {
  return rakamlar.startsWith('0') ? rakamlar.slice(1) : rakamlar;
}

/**
 * Ulusal hane sınırlar ve kurallar:
 * - TR + ülke kodu: baştaki 0 yok (max 10)
 * - GSM (TR): 5 ile başlamalı, max 10
 */
export function ulusalRakamlariDuzenle(
  ham: string,
  ulke: TelefonUlke,
  secenek?: { ulkeKoduVar?: boolean; gsm?: boolean }
): string | null {
  let rakamlar = yalnizcaRakam(ham, ulke.maxHane + 1);
  if (ulke.trFormat && secenek?.ulkeKoduVar) {
    rakamlar = trUlusalSifirsiz(rakamlar).slice(0, 10);
  } else {
    rakamlar = rakamlar.slice(0, ulke.maxHane);
  }

  if (secenek?.gsm && ulke.trFormat) {
    if (!rakamlar) return '';
    if (!rakamlar.startsWith('5')) return null;
    return rakamlar.slice(0, 10);
  }

  return rakamlar;
}

export function telefonPlaceholder(
  ulke: TelefonUlke,
  secenek?: { gsm?: boolean }
): string {
  if (ulke.trFormat) {
    if (secenek?.gsm) return '5xx xxx xx xx';
    return 'xxx xxx xx xx';
  }
  if (ulke.id === 'US' || ulke.id === 'CA') return '(xxx) xxx-xxxx';
  return 'xxx xxx xx xx';
}
