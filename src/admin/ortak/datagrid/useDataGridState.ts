import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DataGridAyar, DataGridCizgiModu, KolonTanimi, SiralamaYonu } from './types';

const GECERLI_CIZGI_MODLARI: DataGridCizgiModu[] = ['yok', 'yatay', 'dikey', 'tam'];

export interface KolonGorunumKaydi {
  id: string;
  ad: string;
  kolonSirasi: string[];
  gizliKolonlar: string[];
  sabitlenmisKolonlar: string[];
  kolonGenislikleri: Record<string, number>;
}

interface KolonGorunumDepo {
  aktifId: string | null;
  liste: KolonGorunumKaydi[];
}

function gorunumAnahtari(depolamaAnahtari: string) {
  return `${depolamaAnahtari}__gorunumler`;
}

function gorunumDepoOku(depolamaAnahtari: string): KolonGorunumDepo {
  try {
    const ham = localStorage.getItem(gorunumAnahtari(depolamaAnahtari));
    if (!ham) return { aktifId: null, liste: [] };
    const j = JSON.parse(ham) as Partial<KolonGorunumDepo>;
    const liste = Array.isArray(j.liste)
      ? j.liste.filter(
          (g): g is KolonGorunumKaydi =>
            !!g &&
            typeof g.id === 'string' &&
            typeof g.ad === 'string' &&
            Array.isArray(g.kolonSirasi) &&
            Array.isArray(g.gizliKolonlar)
        )
      : [];
    const aktifId =
      typeof j.aktifId === 'string' && liste.some((g) => g.id === j.aktifId) ? j.aktifId : null;
    return { aktifId, liste };
  } catch {
    return { aktifId: null, liste: [] };
  }
}

function gorunumDepoYaz(depolamaAnahtari: string, depo: KolonGorunumDepo) {
  try {
    localStorage.setItem(gorunumAnahtari(depolamaAnahtari), JSON.stringify(depo));
  } catch {
    /* yoksay */
  }
}

function ayardanGorunum(ayar: DataGridAyar, id: string, ad: string): KolonGorunumKaydi {
  return {
    id,
    ad,
    kolonSirasi: [...ayar.kolonSirasi],
    gizliKolonlar: [...ayar.gizliKolonlar],
    sabitlenmisKolonlar: [...(ayar.sabitlenmisKolonlar ?? [])],
    kolonGenislikleri: { ...ayar.kolonGenislikleri },
  };
}

function cizgiModuOku(
  kayit: Partial<DataGridAyar & { cizgilerAcik?: boolean }>,
  varsayilan: DataGridCizgiModu
): DataGridCizgiModu {
  if (kayit.cizgiModu && GECERLI_CIZGI_MODLARI.includes(kayit.cizgiModu)) return kayit.cizgiModu;
  if (typeof kayit.cizgilerAcik === 'boolean') return kayit.cizgilerAcik ? 'tam' : 'yatay';
  return varsayilan;
}

function kolonImzasiOlustur(kolonlar: KolonTanimi<unknown>[]): string {
  return kolonlar.map((k) => k.id).join('|');
}

import { siteVarsayilanAyarlarOku } from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';

function varsayilanAyar<TRow>(
  kolonlar: KolonTanimi<TRow>[],
  gizliKolonlar: string[] = [],
  kolonGenislikSurumu?: number
): DataGridAyar {
  const site = siteVarsayilanAyarlarOku();
  const kolonRef = kolonlar as KolonTanimi<unknown>[];
  return {
    kolonSirasi: kolonlar.map((k) => k.id),
    gizliKolonlar: gizliKolonlar.filter((id) => kolonlar.some((k) => k.id === id)),
    sabitlenmisKolonlar: [],
    kolonGenislikleri: Object.fromEntries(kolonlar.map((k) => [k.id, k.genislik ?? 120])),
    sayfaBoyutu: site.dataGridSayfaBoyutu,
    cizgiModu: site.dataGridCizgiModu,
    kolonGenislikSurumu,
    kolonImzasi: kolonImzasiOlustur(kolonRef),
  };
}

function ayarGecerliMi(
  ayar: DataGridAyar,
  kolonlar: KolonTanimi<unknown>[],
  zorunluIdler: Set<string>
): boolean {
  const gecerliIdler = new Set(kolonlar.map((k) => k.id));
  const beklenenImza = kolonImzasiOlustur(kolonlar);
  if (ayar.kolonImzasi && ayar.kolonImzasi !== beklenenImza) return false;
  if (!ayar.kolonSirasi.every((id) => gecerliIdler.has(id))) return false;
  for (const id of zorunluIdler) {
    if (!ayar.kolonSirasi.includes(id) || ayar.gizliKolonlar.includes(id)) return false;
  }
  return true;
}

function legacyKolonSirasiDuzenle(sirali: string[]): string[] {
  if (!sirali.some((id) => id === 'stokKodu' || id === 'urun')) return sirali;
  if (sirali.includes('urunKoduAdi')) {
    return sirali.filter((id) => id !== 'stokKodu' && id !== 'urun');
  }
  const sonuc: string[] = [];
  for (const id of sirali) {
    if (id === 'stokKodu') {
      if (!sonuc.includes('urunKoduAdi')) sonuc.push('urunKoduAdi');
      continue;
    }
    if (id === 'urun') continue;
    sonuc.push(id);
  }
  return sonuc;
}

function kolonSirasiniBirlestir(
  kayitli: string[],
  varsayilan: string[],
  gecerliIdler: Set<string>
): string[] {
  const sonuc = kayitli.filter((id) => gecerliIdler.has(id));

  for (let i = 0; i < varsayilan.length; i++) {
    const id = varsayilan[i];
    if (!gecerliIdler.has(id) || sonuc.includes(id)) continue;

    let insertAt = sonuc.length;
    for (let j = i - 1; j >= 0; j--) {
      const oncekiIdx = sonuc.indexOf(varsayilan[j]);
      if (oncekiIdx >= 0) {
        insertAt = oncekiIdx + 1;
        break;
      }
    }
    sonuc.splice(insertAt, 0, id);
  }

  return sonuc;
}

function ayarOku(
  anahtar: string,
  kolonlar: KolonTanimi<unknown>[],
  gizliVarsayilan: string[],
  kolonGenislikSurumu?: number
): DataGridAyar {
  const varsayilan = varsayilanAyar(kolonlar, gizliVarsayilan, kolonGenislikSurumu);
  const zorunluIdler = new Set(kolonlar.filter((k) => k.zorunlu).map((k) => k.id));
  const legacyKolonIdleri = new Set(['unvan', 'konum', 'bagli']);

  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return varsayilan;
    const kayit = JSON.parse(ham) as Partial<DataGridAyar>;
    const gecerliIdler = new Set(kolonlar.map((k) => k.id));
    const hamSira = legacyKolonSirasiDuzenle(kayit.kolonSirasi ?? varsayilan.kolonSirasi);

    if (hamSira.some((id) => legacyKolonIdleri.has(id))) {
      return {
        ...varsayilan,
        sayfaBoyutu: kayit.sayfaBoyutu ?? varsayilan.sayfaBoyutu,
        cizgiModu: cizgiModuOku(kayit, varsayilan.cizgiModu),
      };
    }

    const kolonSirasi = kolonSirasiniBirlestir(hamSira, varsayilan.kolonSirasi, gecerliIdler);
    const kayitliSurum = kayit.kolonGenislikSurumu ?? 0;
    const genislikGuncelle =
      kolonGenislikSurumu !== undefined && kayitliSurum < kolonGenislikSurumu;
    const kolonGenislikleri = genislikGuncelle
      ? { ...varsayilan.kolonGenislikleri }
      : { ...varsayilan.kolonGenislikleri, ...kayit.kolonGenislikleri };
    const birlesik: DataGridAyar = {
      kolonSirasi,
      kolonGenislikleri,
      kolonGenislikSurumu: genislikGuncelle
        ? kolonGenislikSurumu
        : (kolonGenislikSurumu ?? kayit.kolonGenislikSurumu),
      cizgiModu: cizgiModuOku(kayit, varsayilan.cizgiModu),
      sayfaBoyutu: kayit.sayfaBoyutu ?? varsayilan.sayfaBoyutu,
      gizliKolonlar: (kayit.gizliKolonlar ?? []).filter(
        (id) => gecerliIdler.has(id) && !zorunluIdler.has(id)
      ),
      sabitlenmisKolonlar: (kayit.sabitlenmisKolonlar ?? varsayilan.sabitlenmisKolonlar).filter((id) =>
        gecerliIdler.has(id)
      ),
      kolonImzasi: varsayilan.kolonImzasi,
    };
    if (!ayarGecerliMi(birlesik, kolonlar, zorunluIdler)) {
      return {
        ...varsayilan,
        sayfaBoyutu: birlesik.sayfaBoyutu,
        cizgiModu: birlesik.cizgiModu,
      };
    }
    return birlesik;
  } catch {
    return varsayilan;
  }
}

function ayarKaydet(anahtar: string, ayar: DataGridAyar) {
  localStorage.setItem(anahtar, JSON.stringify(ayar));
}

export function useDataGridState<TRow>(
  kolonlar: KolonTanimi<TRow>[],
  depolamaAnahtari: string,
  varsayilanGizliKolonlar: string[] = [],
  kolonGenislikSurumu?: number
) {
  const kolonRef = kolonlar as KolonTanimi<unknown>[];
  const kolonImzasi = useMemo(() => kolonImzasiOlustur(kolonRef), [kolonlar]);
  const [ayar, setAyar] = useState<DataGridAyar>(() =>
    ayarOku(depolamaAnahtari, kolonRef, varsayilanGizliKolonlar, kolonGenislikSurumu)
  );
  const [sayfa, setSayfa] = useState(0);
  const [siralama, setSiralama] = useState<{ kolonId: string; yon: SiralamaYonu } | null>(null);
  const [seciliIdler, setSeciliIdler] = useState<Set<string>>(new Set());
  const [sutunMenuAcik, setSutunMenuAcik] = useState(false);
  const [suruklenenKolon, setSuruklenenKolon] = useState<string | null>(null);
  const [gorunumler, setGorunumler] = useState<KolonGorunumKaydi[]>(() =>
    gorunumDepoOku(depolamaAnahtari).liste
  );
  const [aktifGorunumId, setAktifGorunumId] = useState<string | null>(() =>
    gorunumDepoOku(depolamaAnahtari).aktifId
  );

  useEffect(() => {
    setAyar(ayarOku(depolamaAnahtari, kolonRef, varsayilanGizliKolonlar, kolonGenislikSurumu));
    setSayfa(0);
    setSiralama(null);
    setSeciliIdler(new Set());
    const depo = gorunumDepoOku(depolamaAnahtari);
    setGorunumler(depo.liste);
    setAktifGorunumId(depo.aktifId);
  }, [depolamaAnahtari, kolonImzasi, varsayilanGizliKolonlar.join('|'), kolonGenislikSurumu]);

  useEffect(() => {
    ayarKaydet(depolamaAnahtari, ayar);
  }, [ayar, depolamaAnahtari]);

  useEffect(() => {
    gorunumDepoYaz(depolamaAnahtari, { aktifId: aktifGorunumId, liste: gorunumler });
  }, [depolamaAnahtari, aktifGorunumId, gorunumler]);

  const gorunurKolonlar = useMemo(() => {
    const harita = new Map(kolonlar.map((k) => [k.id, k]));
    return ayar.kolonSirasi
      .map((id) => harita.get(id))
      .filter((k): k is KolonTanimi<TRow> => !!k && !ayar.gizliKolonlar.includes(k.id));
  }, [kolonlar, ayar.kolonSirasi, ayar.gizliKolonlar]);

  const varsayilanaDon = useCallback(() => {
    setAyar(varsayilanAyar(kolonlar, varsayilanGizliKolonlar, kolonGenislikSurumu));
    setSayfa(0);
    setSiralama(null);
    setAktifGorunumId(null);
  }, [kolonlar, varsayilanGizliKolonlar, kolonGenislikSurumu]);

  const gorunumUygula = useCallback(
    (gorunumId: string) => {
      const kayit = gorunumler.find((g) => g.id === gorunumId);
      if (!kayit) return;
      const gecerliIdler = new Set(kolonlar.map((k) => k.id));
      const zorunluIdler = new Set(kolonlar.filter((k) => k.zorunlu).map((k) => k.id));
      const kolonSirasi = kolonSirasiniBirlestir(
        kayit.kolonSirasi,
        kolonlar.map((k) => k.id),
        gecerliIdler
      );
      setAyar((a) => ({
        ...a,
        kolonSirasi,
        gizliKolonlar: (kayit.gizliKolonlar ?? []).filter(
          (id) => gecerliIdler.has(id) && !zorunluIdler.has(id)
        ),
        sabitlenmisKolonlar: (kayit.sabitlenmisKolonlar ?? []).filter((id) => gecerliIdler.has(id)),
        kolonGenislikleri: {
          ...a.kolonGenislikleri,
          ...Object.fromEntries(
            Object.entries(kayit.kolonGenislikleri ?? {}).filter(([id]) => gecerliIdler.has(id))
          ),
        },
      }));
      setAktifGorunumId(gorunumId);
      setSayfa(0);
    },
    [gorunumler, kolonlar]
  );

  const gorunumKaydet = useCallback(
    (adHam: string) => {
      const ad = adHam.trim();
      if (!ad) return false;
      const mevcut = gorunumler.find((g) => g.ad.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'));
      const id = mevcut?.id ?? `g-${Date.now()}`;
      const kayit = ayardanGorunum(ayar, id, ad);
      setGorunumler((onceki) => {
        if (mevcut) return onceki.map((g) => (g.id === id ? kayit : g));
        return [...onceki, kayit];
      });
      setAktifGorunumId(id);
      return true;
    },
    [ayar, gorunumler]
  );

  const gorunumSil = useCallback((gorunumId: string) => {
    setGorunumler((onceki) => onceki.filter((g) => g.id !== gorunumId));
    setAktifGorunumId((aktif) => (aktif === gorunumId ? null : aktif));
  }, []);

  const kolonGizle = useCallback((kolonId: string, gizle: boolean) => {
    const kolon = kolonlar.find((k) => k.id === kolonId);
    if (kolon?.zorunlu && gizle) return;
    setAyar((a) => ({
      ...a,
      gizliKolonlar: gizle ? [...new Set([...a.gizliKolonlar, kolonId])] : a.gizliKolonlar.filter((id) => id !== kolonId),
    }));
  }, [kolonlar]);

  const kolonTasi = useCallback((kolonId: string, yon: 'yukari' | 'asagi') => {
    setAyar((a) => {
      const sira = [...a.kolonSirasi];
      const idx = sira.indexOf(kolonId);
      if (idx < 0) return a;
      const hedef = yon === 'yukari' ? idx - 1 : idx + 1;
      if (hedef < 0 || hedef >= sira.length) return a;
      [sira[idx], sira[hedef]] = [sira[hedef], sira[idx]];
      return { ...a, kolonSirasi: sira };
    });
  }, []);

  const kolonSurukleBirak = useCallback((kaynakId: string, hedefId: string) => {
    const hedefKolon = kolonlar.find((k) => k.id === hedefId);
    const kaynakKolon = kolonlar.find((k) => k.id === kaynakId);
    if (hedefKolon?.sabitSag || kaynakKolon?.sabitSag) return;
    setAyar((a) => {
      const sira = [...a.kolonSirasi];
      const kaynakIdx = sira.indexOf(kaynakId);
      const hedefIdx = sira.indexOf(hedefId);
      if (kaynakIdx < 0 || hedefIdx < 0) return a;
      sira.splice(kaynakIdx, 1);
      sira.splice(hedefIdx, 0, kaynakId);
      return { ...a, kolonSirasi: sira };
    });
  }, [kolonlar]);

  const kolonGenislikAyarla = useCallback((kolonId: string, genislik: number) => {
    const kolon = kolonlar.find((k) => k.id === kolonId);
    const min = kolon?.minGenislik ?? 60;
    setAyar((a) => ({
      ...a,
      kolonGenislikleri: { ...a.kolonGenislikleri, [kolonId]: Math.max(min, genislik) },
    }));
  }, [kolonlar]);

  const sabitlenmisToggle = useCallback((kolonId: string) => {
    setAyar((a) => {
      const varMi = a.sabitlenmisKolonlar.includes(kolonId);
      return {
        ...a,
        // Aynı anda tek bir sütun sabitlenir.
        sabitlenmisKolonlar: varMi ? [] : [kolonId],
      };
    });
  }, []);

  const cizgiModuAyarla = useCallback((mod: DataGridCizgiModu) => {
    setAyar((a) => ({ ...a, cizgiModu: mod }));
  }, []);

  const sayfaBoyutuAyarla = useCallback((boyut: number) => {
    setAyar((a) => ({ ...a, sayfaBoyutu: boyut }));
    setSayfa(0);
  }, []);

  const siralamaToggle = useCallback((kolonId: string) => {
    setSiralama((onceki) => {
      if (!onceki || onceki.kolonId !== kolonId) return { kolonId, yon: 'asc' };
      if (onceki.yon === 'asc') return { kolonId, yon: 'desc' };
      return null;
    });
    setSayfa(0);
  }, []);

  const secimToggle = useCallback((id: string) => {
    setSeciliIdler((s) => {
      const yeni = new Set(s);
      if (yeni.has(id)) yeni.delete(id);
      else yeni.add(id);
      return yeni;
    });
  }, []);

  const tumunuSec = useCallback((idler: string[], sec: boolean) => {
    setSeciliIdler(sec ? new Set(idler) : new Set());
  }, []);

  const secimiTemizle = useCallback(() => setSeciliIdler(new Set()), []);

  return {
    ayar,
    setAyar,
    sayfa,
    setSayfa,
    siralama,
    siralamaToggle,
    seciliIdler,
    secimToggle,
    tumunuSec,
    secimiTemizle,
    gorunurKolonlar,
    varsayilanaDon,
    gorunumler,
    aktifGorunumId,
    gorunumUygula,
    gorunumKaydet,
    gorunumSil,
    kolonGizle,
    kolonTasi,
    kolonSurukleBirak,
    kolonGenislikAyarla,
    sabitlenmisToggle,
    cizgiModuAyarla,
    sayfaBoyutuAyarla,
    sutunMenuAcik,
    setSutunMenuAcik,
    suruklenenKolon,
    setSuruklenenKolon,
  };
}

export function satirlariIsle<TRow extends { id: string }>(
  satirlar: TRow[],
  kolonlar: KolonTanimi<TRow>[],
  siralama: { kolonId: string; yon: 'asc' | 'desc' } | null
): TRow[] {
  let sonuc = [...satirlar];

  if (siralama?.yon) {
    const kolon = kolonlar.find((k) => k.id === siralama.kolonId);
    if (kolon) {
      sonuc.sort((a, b) => {
        const av = kolon.siralamaDegeri?.(a) ?? kolon.degerAl(a);
        const bv = kolon.siralamaDegeri?.(b) ?? kolon.degerAl(b);
        const as = typeof av === 'number' ? av : String(av ?? '');
        const bs = typeof bv === 'number' ? bv : String(bv ?? '');
        const cmp = as < bs ? -1 : as > bs ? 1 : 0;
        return siralama.yon === 'asc' ? cmp : -cmp;
      });
    }
  }

  return sonuc;
}

export function sayfala<TRow>(satirlar: TRow[], sayfa: number, boyut: number) {
  const toplam = satirlar.length;
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / boyut));
  const gecerliSayfa = Math.min(sayfa, sayfaSayisi - 1);
  const baslangic = gecerliSayfa * boyut;
  return {
    satirlar: satirlar.slice(baslangic, baslangic + boyut),
    toplam,
    sayfa: gecerliSayfa,
    sayfaSayisi,
    baslangic: toplam ? baslangic + 1 : 0,
    bitis: Math.min(baslangic + boyut, toplam),
  };
}
