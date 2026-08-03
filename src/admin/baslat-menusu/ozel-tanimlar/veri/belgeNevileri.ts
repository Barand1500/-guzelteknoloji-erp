/** Belge nevileri — Vega tarzı sabitler + kullanıcı tanımlı (Özel Tanımlar) */

import type { BelgeTur, BelgeYon } from '@/admin/baslat-menusu/erp/belgeler/tipler';

export const BELGE_NEVILERI_GUNCELLENDI = 'ap-ozel-belge-nevileri-guncellendi';

/** v2: Alış/Satış → Alış Faturası / Satış Faturası + stok fişleri */
const ANAHTAR = 'erp-ozel-belge-nevileri-v2';
const ESKI_ANAHTAR = 'erp-ozel-belge-nevileri-v1';

export interface BelgeNevi {
  id: string;
  kod: string;
  adi: string;
  yon: BelgeYon;
  varsayilanTur: BelgeTur;
  aktif: boolean;
  /** Sabit nevi — silinemez, yön değiştirilemez */
  sabit: boolean;
}

export type BelgeNeviGirdi = {
  id?: string;
  kod?: string;
  adi: string;
  yon: BelgeYon;
  varsayilanTur?: BelgeTur;
  aktif?: boolean;
};

export interface BelgeNeviSecenek {
  value: string;
  label: string;
  yon: BelgeYon;
  varsayilanTur: BelgeTur;
}

export const SABIT_BELGE_NEVI_ALIS = 'bn-alis';
export const SABIT_BELGE_NEVI_SATIS = 'bn-satis';
export const SABIT_BELGE_NEVI_STOK_GIRIS = 'bn-stok-giris';
export const SABIT_BELGE_NEVI_STOK_CIKIS = 'bn-stok-cikis';

const SABIT_IDLER = new Set([
  SABIT_BELGE_NEVI_ALIS,
  SABIT_BELGE_NEVI_SATIS,
  SABIT_BELGE_NEVI_STOK_GIRIS,
  SABIT_BELGE_NEVI_STOK_CIKIS,
]);

const VARSAYILAN: BelgeNevi[] = [
  {
    id: SABIT_BELGE_NEVI_ALIS,
    kod: 'ALIS_FATURA',
    adi: 'Alış Faturası',
    yon: 'ALIS',
    varsayilanTur: 'FATURA',
    aktif: true,
    sabit: true,
  },
  {
    id: SABIT_BELGE_NEVI_SATIS,
    kod: 'SATIS_FATURA',
    adi: 'Satış Faturası',
    yon: 'SATIS',
    varsayilanTur: 'FATURA',
    aktif: true,
    sabit: true,
  },
  {
    id: SABIT_BELGE_NEVI_STOK_GIRIS,
    kod: 'STOK_GIRIS',
    adi: 'Stok Giriş Fişi',
    yon: 'ALIS',
    varsayilanTur: 'IRSALIYE',
    aktif: true,
    sabit: true,
  },
  {
    id: SABIT_BELGE_NEVI_STOK_CIKIS,
    kod: 'STOK_CIKIS',
    adi: 'Stok Çıkış Fişi',
    yon: 'SATIS',
    varsayilanTur: 'IRSALIYE',
    aktif: true,
    sabit: true,
  },
];

/** Belge türü ekran etiketi — Giriş / Çıkış */
export function belgeYonEtiketi(yon: BelgeYon): string {
  return yon === 'ALIS' ? 'Giriş' : 'Çıkış';
}

export const BELGE_YON_SECENEKLERI: { value: BelgeYon; label: string }[] = [
  { value: 'ALIS', label: 'Giriş' },
  { value: 'SATIS', label: 'Çıkış' },
];

function duyur() {
  window.dispatchEvent(new CustomEvent(BELGE_NEVILERI_GUNCELLENDI));
}

export function belgeNeviKodUret(adi: string): string {
  return adi
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ_]/gi, '');
}

function sabitTanimi(id: string): BelgeNevi | undefined {
  return VARSAYILAN.find((t) => t.id === id);
}

function normalize(t: Partial<BelgeNevi> & { adi: string; id: string }): BelgeNevi {
  const sabitSablon = sabitTanimi(t.id);
  const sabit = t.sabit === true || Boolean(sabitSablon);
  if (sabit && sabitSablon) {
    return {
      ...sabitSablon,
      aktif: t.aktif !== false,
      varsayilanTur: (t.varsayilanTur as BelgeTur) || sabitSablon.varsayilanTur,
    };
  }
  const yon: BelgeYon = t.yon === 'SATIS' ? 'SATIS' : 'ALIS';
  return {
    id: t.id,
    kod: (t.kod?.trim() || belgeNeviKodUret(t.adi) || t.id).toLocaleUpperCase('tr'),
    adi: t.adi.trim(),
    yon,
    varsayilanTur: (t.varsayilanTur as BelgeTur) || 'FATURA',
    aktif: t.aktif !== false,
    sabit: false,
  };
}

function sabitleriGaranti(liste: BelgeNevi[]): BelgeNevi[] {
  const map = new Map(liste.map((n) => [n.id, n]));
  for (const sabit of VARSAYILAN) {
    const mevcut = map.get(sabit.id);
    map.set(sabit.id, mevcut ? normalize({ ...mevcut, ...sabit, sabit: true }) : { ...sabit });
  }
  return [...map.values()].sort((a, b) => {
    const ai = VARSAYILAN.findIndex((v) => v.id === a.id);
    const bi = VARSAYILAN.findIndex((v) => v.id === b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (a.sabit && !b.sabit) return -1;
    if (!a.sabit && b.sabit) return 1;
    return a.adi.localeCompare(b.adi, 'tr');
  });
}

function okuHam(): Partial<BelgeNevi>[] | null {
  try {
    const ham = localStorage.getItem(ANAHTAR) ?? localStorage.getItem(ESKI_ANAHTAR);
    if (!ham) return null;
    const liste = JSON.parse(ham) as Partial<BelgeNevi>[];
    return Array.isArray(liste) && liste.length > 0 ? liste : null;
  } catch {
    return null;
  }
}

function oku(): BelgeNevi[] {
  const ham = okuHam();
  if (ham) {
    const normalizeListe = ham
      .filter((t): t is Partial<BelgeNevi> & { adi: string; id: string } => Boolean(t?.id && t?.adi))
      .map(normalize);
    return sabitleriGaranti(normalizeListe);
  }
  return VARSAYILAN.map((t) => ({ ...t }));
}

function yaz(liste: BelgeNevi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(sabitleriGaranti(liste)));
  try {
    localStorage.removeItem(ESKI_ANAHTAR);
  } catch {
    /* ignore */
  }
  duyur();
}

export function belgeNevileriGetir(): BelgeNevi[] {
  return oku();
}

export function belgeNevileriAktifGetir(): BelgeNevi[] {
  return oku().filter((t) => t.aktif);
}

export function belgeNeviBul(kodVeyaId: string): BelgeNevi | undefined {
  const k = kodVeyaId.trim();
  const ku = k.toLocaleUpperCase('tr');
  return oku().find(
    (t) =>
      t.id === k ||
      t.kod === ku ||
      t.adi.toLocaleLowerCase('tr') === k.toLocaleLowerCase('tr')
  );
}

export function belgeNeviEtiketi(kodVeyaId: string): string {
  return belgeNeviBul(kodVeyaId)?.adi ?? kodVeyaId;
}

export function belgeNeviFormSecenekleri(sadeceAktif = true): BelgeNeviSecenek[] {
  const liste = sadeceAktif ? belgeNevileriAktifGetir() : belgeNevileriGetir();
  return liste.map((t) => ({
    value: t.id,
    label: t.adi,
    yon: t.yon,
    varsayilanTur: t.varsayilanTur,
  }));
}

export function yonIcinVarsayilanBelgeNevi(yon: BelgeYon): BelgeNevi {
  return (
    belgeNeviBul(yon === 'ALIS' ? SABIT_BELGE_NEVI_ALIS : SABIT_BELGE_NEVI_SATIS) ??
    VARSAYILAN[yon === 'ALIS' ? 0 : 1]!
  );
}

function kodBenzersiz(kod: string, haricId?: string): boolean {
  const ku = kod.toLocaleUpperCase('tr');
  return !oku().some((t) => t.id !== haricId && t.kod === ku);
}

export function belgeNeviEkle(girdi: BelgeNeviGirdi): BelgeNevi | null {
  const adi = girdi.adi.trim();
  if (!adi) return null;
  const kod = (girdi.kod?.trim() || belgeNeviKodUret(adi) || `NEVI_${Date.now()}`).toLocaleUpperCase(
    'tr'
  );
  if (!kodBenzersiz(kod)) return null;
  if (oku().some((t) => t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr'))) return null;
  const yeni: BelgeNevi = {
    id: girdi.id ?? `bn-${Date.now()}`,
    kod,
    adi,
    yon: girdi.yon === 'SATIS' ? 'SATIS' : 'ALIS',
    varsayilanTur: girdi.varsayilanTur ?? 'FATURA',
    aktif: girdi.aktif !== false,
    sabit: false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function belgeNeviGuncelle(idVeyaKod: string, girdi: BelgeNeviGirdi): boolean {
  const adi = girdi.adi.trim();
  if (!adi) return false;
  const mevcut = oku();
  const hedef = mevcut.find((t) => t.id === idVeyaKod || t.kod === idVeyaKod.toLocaleUpperCase('tr'));
  if (!hedef) return false;
  if (hedef.sabit || SABIT_IDLER.has(hedef.id)) {
    yaz(
      mevcut.map((t) =>
        t.id === hedef.id
          ? {
              ...t,
              varsayilanTur: girdi.varsayilanTur ?? t.varsayilanTur,
              aktif: girdi.aktif !== false,
            }
          : t
      )
    );
    return true;
  }
  const kod = (girdi.kod?.trim() || hedef.kod).toLocaleUpperCase('tr');
  if (!kodBenzersiz(kod, hedef.id)) return false;
  if (
    mevcut.some(
      (t) => t.id !== hedef.id && t.adi.toLocaleLowerCase('tr') === adi.toLocaleLowerCase('tr')
    )
  ) {
    return false;
  }
  yaz(
    mevcut.map((t) =>
      t.id === hedef.id
        ? {
            ...t,
            adi,
            kod,
            yon: girdi.yon === 'SATIS' ? 'SATIS' : 'ALIS',
            varsayilanTur: girdi.varsayilanTur ?? t.varsayilanTur,
            aktif: girdi.aktif !== false,
          }
        : t
    )
  );
  return true;
}

export function belgeNeviSil(idVeyaKod: string): boolean {
  const hedef = belgeNeviBul(idVeyaKod);
  if (!hedef || hedef.sabit || SABIT_IDLER.has(hedef.id)) return false;
  yaz(oku().filter((t) => t.id !== hedef.id));
  return true;
}
