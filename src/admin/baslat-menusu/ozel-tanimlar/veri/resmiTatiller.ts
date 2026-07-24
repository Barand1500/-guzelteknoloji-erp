/** Resmi tatil günleri — Özel Tanımlar merkezi kaynak */

export const RESMI_TATILLER_GUNCELLENDI = 'ap-ozel-resmi-tatiller-guncellendi';

const ANAHTAR = 'erp-ozel-resmi-tatiller-v1';

export interface ResmiTatil {
  id: string;
  adi: string;
  baslangic: string; // YYYY-MM-DD
  bitis: string; // YYYY-MM-DD (dahil)
  renk: string;
  aktif: boolean;
}

export type ResmiTatilGirdi = Omit<ResmiTatil, 'id'> & { id?: string };

export type TatilGunRol = 'tek' | 'bas' | 'orta' | 'son';

export const RESMI_TATIL_RENKLER = [
  '#e11d48',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#db2777',
] as const;

function buYil(): number {
  return new Date().getFullYear();
}

function varsayilanListe(): ResmiTatil[] {
  const y = buYil();
  return [
    {
      id: 'rt-yilbasi',
      adi: 'Yılbaşı',
      baslangic: `${y}-01-01`,
      bitis: `${y}-01-01`,
      renk: '#e11d48',
      aktif: true,
    },
    {
      id: 'rt-23nisan',
      adi: '23 Nisan',
      baslangic: `${y}-04-23`,
      bitis: `${y}-04-23`,
      renk: '#2563eb',
      aktif: true,
    },
    {
      id: 'rt-1mayis',
      adi: '1 Mayıs',
      baslangic: `${y}-05-01`,
      bitis: `${y}-05-01`,
      renk: '#ea580c',
      aktif: true,
    },
    {
      id: 'rt-19mayis',
      adi: '19 Mayıs',
      baslangic: `${y}-05-19`,
      bitis: `${y}-05-19`,
      renk: '#16a34a',
      aktif: true,
    },
    {
      id: 'rt-30agustos',
      adi: '30 Ağustos',
      baslangic: `${y}-08-30`,
      bitis: `${y}-08-30`,
      renk: '#7c3aed',
      aktif: true,
    },
    {
      id: 'rt-29ekim',
      adi: '29 Ekim Cumhuriyet Bayramı',
      baslangic: `${y}-10-29`,
      bitis: `${y}-10-29`,
      renk: '#e11d48',
      aktif: true,
    },
  ];
}

function duyur() {
  window.dispatchEvent(new CustomEvent(RESMI_TATILLER_GUNCELLENDI));
}

function tarihNormalize(baslangic: string, bitis: string): { baslangic: string; bitis: string } | null {
  const b = baslangic.trim();
  const e = (bitis.trim() || b).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b) || !/^\d{4}-\d{2}-\d{2}$/.test(e)) return null;
  if (e < b) return { baslangic: e, bitis: b };
  return { baslangic: b, bitis: e };
}

function normalize(t: Partial<ResmiTatil> & { id: string; adi: string }): ResmiTatil | null {
  const tarihler = tarihNormalize(t.baslangic ?? '', t.bitis ?? t.baslangic ?? '');
  if (!tarihler) return null;
  const renk =
    typeof t.renk === 'string' && /^#[0-9a-fA-F]{6}$/.test(t.renk)
      ? t.renk
      : RESMI_TATIL_RENKLER[0];
  return {
    id: t.id,
    adi: t.adi.trim(),
    baslangic: tarihler.baslangic,
    bitis: tarihler.bitis,
    renk,
    aktif: t.aktif !== false,
  };
}

function oku(): ResmiTatil[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const liste = JSON.parse(ham) as Partial<ResmiTatil>[];
      if (Array.isArray(liste) && liste.length > 0) {
        return liste
          .filter((t): t is Partial<ResmiTatil> & { id: string; adi: string } =>
            Boolean(t?.id && t?.adi)
          )
          .map(normalize)
          .filter((t): t is ResmiTatil => Boolean(t));
      }
    }
  } catch {
    /* bozuk */
  }
  return varsayilanListe();
}

function yaz(liste: ResmiTatil[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  duyur();
}

export function resmiTatilleriGetir(): ResmiTatil[] {
  return oku();
}

export function resmiTatilleriAktifGetir(): ResmiTatil[] {
  return oku().filter((t) => t.aktif);
}

export function resmiTatilBul(id: string): ResmiTatil | undefined {
  return oku().find((t) => t.id === id);
}

export function resmiTatilGuneDuserMi(t: ResmiTatil, gun: string): boolean {
  return gun >= t.baslangic && gun <= t.bitis;
}

export function resmiTatilGunRolu(t: ResmiTatil, gun: string): TatilGunRol | null {
  if (!resmiTatilGuneDuserMi(t, gun)) return null;
  if (t.baslangic === t.bitis) return 'tek';
  if (gun === t.baslangic) return 'bas';
  if (gun === t.bitis) return 'son';
  return 'orta';
}

/** Güne düşen aktif tatiller */
export function resmiTatillerGuneGore(gun: string): ResmiTatil[] {
  return resmiTatilleriAktifGetir().filter((t) => resmiTatilGuneDuserMi(t, gun));
}

export function resmiTatilGunSeti(): Set<string> {
  const set = new Set<string>();
  for (const t of resmiTatilleriAktifGetir()) {
    const [y1, m1, d1] = t.baslangic.split('-').map(Number);
    const [y2, m2, d2] = t.bitis.split('-').map(Number);
    const bas = new Date(y1, m1 - 1, d1);
    const bit = new Date(y2, m2 - 1, d2);
    for (let d = new Date(bas); d <= bit; d.setDate(d.getDate() + 1)) {
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const gg = String(d.getDate()).padStart(2, '0');
      set.add(`${yy}-${mm}-${gg}`);
    }
  }
  return set;
}

export function resmiTatilEtiketi(gun: string): string {
  return resmiTatillerGuneGore(gun)
    .map((t) => t.adi)
    .join(', ');
}

export function resmiTatilEkle(girdi: ResmiTatilGirdi): ResmiTatil | null {
  const adi = girdi.adi.trim();
  if (!adi) return null;
  const tarihler = tarihNormalize(girdi.baslangic, girdi.bitis);
  if (!tarihler) return null;
  const renk =
    typeof girdi.renk === 'string' && /^#[0-9a-fA-F]{6}$/.test(girdi.renk)
      ? girdi.renk
      : RESMI_TATIL_RENKLER[0];
  const yeni: ResmiTatil = {
    id: girdi.id ?? `rt-${Date.now()}`,
    adi,
    baslangic: tarihler.baslangic,
    bitis: tarihler.bitis,
    renk,
    aktif: girdi.aktif !== false,
  };
  yaz([...oku(), yeni]);
  return yeni;
}

export function resmiTatilGuncelle(id: string, girdi: ResmiTatilGirdi): boolean {
  const adi = girdi.adi.trim();
  if (!adi) return false;
  const tarihler = tarihNormalize(girdi.baslangic, girdi.bitis);
  if (!tarihler) return false;
  const mevcut = oku();
  if (!mevcut.some((t) => t.id === id)) return false;
  const renk =
    typeof girdi.renk === 'string' && /^#[0-9a-fA-F]{6}$/.test(girdi.renk)
      ? girdi.renk
      : RESMI_TATIL_RENKLER[0];
  yaz(
    mevcut.map((t) =>
      t.id === id
        ? {
            ...t,
            adi,
            baslangic: tarihler.baslangic,
            bitis: tarihler.bitis,
            renk,
            aktif: girdi.aktif !== false,
          }
        : t
    )
  );
  return true;
}

export function resmiTatilSil(id: string): void {
  yaz(oku().filter((t) => t.id !== id));
}

export function resmiTatilKisaEtiket(t: ResmiTatil): string {
  if (t.baslangic === t.bitis) return t.baslangic;
  return `${t.baslangic} – ${t.bitis}`;
}
