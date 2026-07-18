import {
  takvimNotlariOku,
  takvimNotuKaydet,
  takvimNotuSil,
} from '@/admin/kabuk/alt-panel/takvimNotlari';

export interface YapilacakGorev {
  id: string;
  baslik: string;
  tamamlandi: boolean;
  onemli: boolean;
  /** Başlangıç YYYY-MM-DD veya null (tarihsiz) */
  tarih: string | null;
  /** Bitiş YYYY-MM-DD; yoksa tek günlük (tarih ile aynı) */
  bitisTarih: string | null;
  olusturma: string;
  guncelleme: string;
}

export type YapilacakFiltre = 'tumu' | 'aktif' | 'onemli' | 'tamamlandi' | 'tarihsiz';

export type GorevKayitGirdi = {
  baslik: string;
  tarih: string | null;
  bitisTarih: string | null;
  onemli: boolean;
};

const STORAGE_KEY = 'erp-yapilacaklar';

export function takvimGorevId(tarih: string): string {
  return `takvim:${tarih}`;
}

export function takvimGorevMi(id: string): boolean {
  return id.startsWith('takvim:');
}

function tarihleriNormalizeEt(
  baslangic: string | null | undefined,
  bitis: string | null | undefined
): { tarih: string | null; bitisTarih: string | null } {
  let b = baslangic?.trim() || null;
  let e = bitis?.trim() || null;
  if (!b && !e) return { tarih: null, bitisTarih: null };
  if (!b && e) b = e;
  if (b && !e) e = b;
  if (b && e && e < b) {
    const t = b;
    b = e;
    e = t;
  }
  return { tarih: b, bitisTarih: e && e !== b ? e : b };
}

function gorevNormalize(g: Partial<YapilacakGorev> & { id: string; baslik: string }): YapilacakGorev {
  const { tarih, bitisTarih } = tarihleriNormalizeEt(g.tarih, g.bitisTarih ?? g.tarih);
  return {
    id: g.id,
    baslik: g.baslik,
    tamamlandi: Boolean(g.tamamlandi),
    onemli: Boolean(g.onemli),
    tarih,
    bitisTarih,
    olusturma: g.olusturma ?? new Date().toISOString(),
    guncelleme: g.guncelleme ?? g.olusturma ?? new Date().toISOString(),
  };
}

function okuHam(): YapilacakGorev[] {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return [];
    const parsed = JSON.parse(ham) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (g): g is Partial<YapilacakGorev> & { id: string; baslik: string } =>
          Boolean(g) &&
          typeof g === 'object' &&
          typeof (g as YapilacakGorev).id === 'string' &&
          typeof (g as YapilacakGorev).baslik === 'string'
      )
      .map(gorevNormalize);
  } catch {
    return [];
  }
}

function yaz(liste: YapilacakGorev[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste.map(gorevNormalize)));
}

/** Takvim notlarını görev listesine senkron eder */
export function takvimNotlariniGorevlereSenkronizeEt(): void {
  const notlar = takvimNotlariOku();
  const liste = okuHam();
  const byId = new Map(liste.map((g) => [g.id, g]));
  let degisti = false;

  for (const [tarih, not] of Object.entries(notlar)) {
    const id = takvimGorevId(tarih);
    const mevcut = byId.get(id);
    if (!mevcut) {
      byId.set(
        id,
        gorevNormalize({
          id,
          baslik: not.metin,
          tamamlandi: false,
          onemli: false,
          tarih,
          bitisTarih: tarih,
          olusturma: not.olusturma,
          guncelleme: not.guncelleme,
        })
      );
      degisti = true;
    } else if (mevcut.baslik !== not.metin || mevcut.tarih !== tarih) {
      byId.set(
        id,
        gorevNormalize({
          ...mevcut,
          baslik: not.metin,
          tarih,
          bitisTarih: mevcut.bitisTarih && mevcut.bitisTarih >= tarih ? mevcut.bitisTarih : tarih,
          guncelleme: not.guncelleme,
        })
      );
      degisti = true;
    }
  }

  for (const id of [...byId.keys()]) {
    if (!takvimGorevMi(id)) continue;
    const tarih = id.slice('takvim:'.length);
    if (!notlar[tarih]) {
      byId.delete(id);
      degisti = true;
    }
  }

  if (degisti) yaz([...byId.values()]);
}

export function gorevleriGetir(): YapilacakGorev[] {
  takvimNotlariniGorevlereSenkronizeEt();
  return okuHam().sort((a, b) => {
    if (a.tamamlandi !== b.tamamlandi) return a.tamamlandi ? 1 : -1;
    if (a.onemli !== b.onemli) return a.onemli ? -1 : 1;
    const ta = a.tarih ?? '9999-99-99';
    const tb = b.tarih ?? '9999-99-99';
    if (ta !== tb) return ta.localeCompare(tb);
    return b.guncelleme.localeCompare(a.guncelleme);
  });
}

export function gorevFiltrele(liste: YapilacakGorev[], filtre: YapilacakFiltre): YapilacakGorev[] {
  switch (filtre) {
    case 'aktif':
      return liste.filter((g) => !g.tamamlandi);
    case 'onemli':
      return liste.filter((g) => g.onemli && !g.tamamlandi);
    case 'tamamlandi':
      return liste.filter((g) => g.tamamlandi);
    case 'tarihsiz':
      return liste.filter((g) => !g.tarih && !g.tamamlandi);
    default:
      return liste;
  }
}

export function gorevEkle(girdi: GorevKayitGirdi): YapilacakGorev {
  const baslik = girdi.baslik.trim();
  if (!baslik) throw new Error('Görev başlığı gerekli');
  const simdi = new Date().toISOString();
  const tarihler = tarihleriNormalizeEt(girdi.tarih, girdi.bitisTarih);
  const kayit = gorevNormalize({
    id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    baslik,
    tamamlandi: false,
    onemli: Boolean(girdi.onemli),
    ...tarihler,
    olusturma: simdi,
    guncelleme: simdi,
  });
  const liste = okuHam();
  liste.push(kayit);
  yaz(liste);
  return kayit;
}

export function gorevGuncelle(
  id: string,
  degisim: Partial<Pick<YapilacakGorev, 'baslik' | 'tamamlandi' | 'onemli' | 'tarih' | 'bitisTarih'>>
): YapilacakGorev | null {
  const liste = okuHam();
  const idx = liste.findIndex((g) => g.id === id);
  if (idx < 0) return null;
  const onceki = liste[idx];
  const baslik = degisim.baslik !== undefined ? degisim.baslik.trim() : onceki.baslik;
  if (!baslik) throw new Error('Görev başlığı gerekli');

  const tarihler = tarihleriNormalizeEt(
    degisim.tarih !== undefined ? degisim.tarih : onceki.tarih,
    degisim.bitisTarih !== undefined ? degisim.bitisTarih : onceki.bitisTarih
  );

  let guncel = gorevNormalize({
    ...onceki,
    baslik,
    tamamlandi: degisim.tamamlandi ?? onceki.tamamlandi,
    onemli: degisim.onemli ?? onceki.onemli,
    ...tarihler,
    guncelleme: new Date().toISOString(),
  });

  if (takvimGorevMi(id)) {
    const tarih = guncel.tarih ?? id.slice('takvim:'.length);
    guncel = gorevNormalize({ ...guncel, tarih, bitisTarih: guncel.bitisTarih ?? tarih });
    takvimNotuKaydet(tarih, guncel.baslik);
  }

  liste[idx] = guncel;
  yaz(liste);
  return guncel;
}

export function gorevSil(id: string): void {
  const liste = okuHam();
  const hedef = liste.find((g) => g.id === id);
  yaz(liste.filter((g) => g.id !== id));
  if (hedef && takvimGorevMi(id)) {
    const tarih = id.slice('takvim:'.length);
    takvimNotuSil(tarih);
  }
}

/** Takvim widget’tan not kaydedildiğinde çağrılır */
export function takvimNotundanGorevSenkron(tarih: string, metin: string): void {
  const temiz = metin.trim();
  if (!temiz) {
    takvimGoreviniKaldir(tarih);
    return;
  }
  const id = takvimGorevId(tarih);
  const liste = okuHam();
  const idx = liste.findIndex((g) => g.id === id);
  const simdi = new Date().toISOString();
  if (idx >= 0) {
    liste[idx] = gorevNormalize({
      ...liste[idx],
      baslik: temiz,
      tarih,
      bitisTarih: liste[idx].bitisTarih && liste[idx].bitisTarih! >= tarih ? liste[idx].bitisTarih : tarih,
      guncelleme: simdi,
    });
  } else {
    liste.push(
      gorevNormalize({
        id,
        baslik: temiz,
        tamamlandi: false,
        onemli: false,
        tarih,
        bitisTarih: tarih,
        olusturma: simdi,
        guncelleme: simdi,
      })
    );
  }
  yaz(liste);
}

export function takvimGoreviniKaldir(tarih: string): void {
  const id = takvimGorevId(tarih);
  yaz(okuHam().filter((g) => g.id !== id));
}

export function gorevBitis(g: YapilacakGorev): string | null {
  if (!g.tarih) return null;
  return g.bitisTarih && g.bitisTarih >= g.tarih ? g.bitisTarih : g.tarih;
}

export function gorevGuneDuserMi(g: YapilacakGorev, gun: string): boolean {
  if (!g.tarih) return false;
  const bitis = gorevBitis(g)!;
  return gun >= g.tarih && gun <= bitis;
}

export type GorevGunRol = 'tek' | 'bas' | 'orta' | 'son';

export function gorevGunRolu(g: YapilacakGorev, gun: string): GorevGunRol | null {
  if (!gorevGuneDuserMi(g, gun) || !g.tarih) return null;
  const bitis = gorevBitis(g)!;
  if (g.tarih === bitis) return 'tek';
  if (gun === g.tarih) return 'bas';
  if (gun === bitis) return 'son';
  return 'orta';
}

function kisaGunAy(tarih: string): string {
  const [y, m, g] = tarih.split('-').map(Number);
  if (!y || !m || !g) return tarih;
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(
    new Date(y, m - 1, g)
  );
}

export function kisaTarihEtiketi(g: YapilacakGorev | string | null): string {
  if (!g) return 'Tarihsiz';
  if (typeof g === 'string') return kisaGunAy(g);
  if (!g.tarih) return 'Tarihsiz';
  const bitis = gorevBitis(g)!;
  if (bitis === g.tarih) return kisaGunAy(g.tarih);
  return `${kisaGunAy(g.tarih)} – ${kisaGunAy(bitis)}`;
}

export function basHarfler(ad: string): string {
  const parcalar = ad.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length === 0) return '?';
  if (parcalar.length === 1) return parcalar[0].slice(0, 2).toUpperCase();
  return `${parcalar[0][0] ?? ''}${parcalar[1][0] ?? ''}`.toUpperCase();
}
