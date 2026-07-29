/** Belge nevileri — sabit Alış/Satış + kullanıcı tanımlı (Özel Tanımlar) */

import type { BelgeTur, BelgeYon } from '@/admin/baslat-menusu/erp/belgeler/tipler';

export const BELGE_NEVILERI_GUNCELLENDI = 'ap-ozel-belge-nevileri-guncellendi';

const ANAHTAR = 'erp-ozel-belge-nevileri-v1';

export interface BelgeNevi {
  id: string;
  kod: string;
  adi: string;
  yon: BelgeYon;
  varsayilanTur: BelgeTur;
  aktif: boolean;
  /** Sabit Alış / Satış — silinemez, yön değiştirilemez */
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

const VARSAYILAN: BelgeNevi[] = [
  {
    id: SABIT_BELGE_NEVI_ALIS,
    kod: 'ALIS',
    adi: 'Alış',
    yon: 'ALIS',
    varsayilanTur: 'FATURA',
    aktif: true,
    sabit: true,
  },
  {
    id: SABIT_BELGE_NEVI_SATIS,
    kod: 'SATIS',
    adi: 'Satış',
    yon: 'SATIS',
    varsayilanTur: 'FATURA',
    aktif: true,
    sabit: true,
  },
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

function normalize(t: Partial<BelgeNevi> & { adi: string; id: string }): BelgeNevi {
  const sabit =
    t.sabit === true || t.id === SABIT_BELGE_NEVI_ALIS || t.id === SABIT_BELGE_NEVI_SATIS;
  const yon: BelgeYon =
    sabit && t.id === SABIT_BELGE_NEVI_ALIS
      ? 'ALIS'
      : sabit && t.id === SABIT_BELGE_NEVI_SATIS
        ? 'SATIS'
        : t.yon === 'SATIS'
          ? 'SATIS'
          : 'ALIS';
  const adi = sabit
    ? t.id === SABIT_BELGE_NEVI_ALIS
      ? 'Alış'
      : 'Satış'
    : t.adi.trim();
  const kod = sabit
    ? yon
    : (t.kod?.trim() || belgeNeviKodUret(adi) || t.id).toLocaleUpperCase('tr');
  return {
    id: t.id,
    kod,
    adi,
    yon,
    varsayilanTur: (t.varsayilanTur as BelgeTur) || 'FATURA',
    aktif: t.aktif !== false,
    sabit,
  };
}

function sabitleriGaranti(liste: BelgeNevi[]): BelgeNevi[] {
  const map = new Map(liste.map((n) => [n.id, n]));
  for (const sabit of VARSAYILAN) {
    const mevcut = map.get(sabit.id);
    map.set(sabit.id, mevcut ? normalize({ ...mevcut, ...sabit, sabit: true }) : { ...sabit });
  }
  return [...map.values()].sort((a, b) => {
    if (a.sabit && !b.sabit) return -1;
    if (!a.sabit && b.sabit) return 1;
    return a.adi.localeCompare(b.adi, 'tr');
  });
}

function oku(): BelgeNevi[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<BelgeNevi>[];
      if (Array.isArray(liste) && liste.length > 0) {
        const normalizeListe = liste
          .filter((t): t is Partial<BelgeNevi> & { adi: string; id: string } =>
            Boolean(t?.id && t?.adi)
          )
          .map(normalize);
        return sabitleriGaranti(normalizeListe);
      }
    }
  } catch {
    /* bozuk */
  }
  return VARSAYILAN.map((t) => ({ ...t }));
}

function yaz(liste: BelgeNevi[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(sabitleriGaranti(liste)));
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
  if (hedef.sabit) {
    /* Sabit nevilerde yalnızca varsayılan tür / aktif güncellenebilir */
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
  if (!hedef || hedef.sabit) return false;
  yaz(oku().filter((t) => t.id !== hedef.id));
  return true;
}
