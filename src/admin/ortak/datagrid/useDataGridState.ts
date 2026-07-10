import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DataGridAyar, DataGridCizgiModu, KolonTanimi, SiralamaYonu } from './types';

const GECERLI_CIZGI_MODLARI: DataGridCizgiModu[] = ['yok', 'yatay', 'dikey', 'tam'];

function cizgiModuOku(
  kayit: Partial<DataGridAyar & { cizgilerAcik?: boolean }>,
  varsayilan: DataGridCizgiModu
): DataGridCizgiModu {
  if (kayit.cizgiModu && GECERLI_CIZGI_MODLARI.includes(kayit.cizgiModu)) return kayit.cizgiModu;
  if (typeof kayit.cizgilerAcik === 'boolean') return kayit.cizgilerAcik ? 'tam' : 'yatay';
  return varsayilan;
}

function varsayilanAyar<TRow>(
  kolonlar: KolonTanimi<TRow>[],
  gizliKolonlar: string[] = [],
  kolonGenislikSurumu?: number
): DataGridAyar {
  return {
    kolonSirasi: kolonlar.map((k) => k.id),
    gizliKolonlar: gizliKolonlar.filter((id) => kolonlar.some((k) => k.id === id)),
    sabitlenmisKolonlar: [],
    kolonGenislikleri: Object.fromEntries(kolonlar.map((k) => [k.id, k.genislik ?? 120])),
    sayfaBoyutu: 10,
    cizgiModu: 'tam',
    kolonGenislikSurumu,
  };
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
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return varsayilan;
    const kayit = JSON.parse(ham) as Partial<DataGridAyar>;
    const gecerliIdler = new Set(kolonlar.map((k) => k.id));
    const hamSira = legacyKolonSirasiDuzenle(kayit.kolonSirasi ?? varsayilan.kolonSirasi);
    const kolonSirasi = kolonSirasiniBirlestir(
      hamSira,
      varsayilan.kolonSirasi,
      gecerliIdler
    );
    const kayitliSurum = kayit.kolonGenislikSurumu ?? 0;
    const genislikGuncelle =
      kolonGenislikSurumu !== undefined && kayitliSurum < kolonGenislikSurumu;
    const kolonGenislikleri = genislikGuncelle
      ? { ...varsayilan.kolonGenislikleri }
      : { ...varsayilan.kolonGenislikleri, ...kayit.kolonGenislikleri };
    const { kolonGenislikleri: _eskiGen, kolonGenislikSurumu: _eskiSurum, ...kayitDiger } = kayit;
    return {
      ...varsayilan,
      ...kayitDiger,
      kolonSirasi,
      kolonGenislikleri,
      kolonGenislikSurumu: genislikGuncelle
        ? kolonGenislikSurumu
        : (kolonGenislikSurumu ?? kayit.kolonGenislikSurumu),
      cizgiModu: cizgiModuOku(kayit, varsayilan.cizgiModu),
      gizliKolonlar: (kayit.gizliKolonlar ?? []).filter((id) => gecerliIdler.has(id)),
      sabitlenmisKolonlar: (kayit.sabitlenmisKolonlar ?? varsayilan.sabitlenmisKolonlar).filter((id) =>
        gecerliIdler.has(id)
      ),
    };
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
  const [ayar, setAyar] = useState<DataGridAyar>(() =>
    ayarOku(depolamaAnahtari, kolonRef, varsayilanGizliKolonlar, kolonGenislikSurumu)
  );
  const [sayfa, setSayfa] = useState(0);
  const [siralama, setSiralama] = useState<{ kolonId: string; yon: SiralamaYonu } | null>(null);
  const [seciliIdler, setSeciliIdler] = useState<Set<string>>(new Set());
  const [sutunMenuAcik, setSutunMenuAcik] = useState(false);
  const [suruklenenKolon, setSuruklenenKolon] = useState<string | null>(null);

  useEffect(() => {
    ayarKaydet(depolamaAnahtari, ayar);
  }, [ayar, depolamaAnahtari]);

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
  }, [kolonlar, varsayilanGizliKolonlar, kolonGenislikSurumu]);

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
