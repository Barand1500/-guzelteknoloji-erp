import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DataGridAyar, KolonTanimi, SiralamaYonu } from './types';

function varsayilanAyar<TRow>(
  kolonlar: KolonTanimi<TRow>[],
  gizliKolonlar: string[] = []
): DataGridAyar {
  return {
    kolonSirasi: kolonlar.map((k) => k.id),
    gizliKolonlar: gizliKolonlar.filter((id) => kolonlar.some((k) => k.id === id)),
    sabitlenmisKolonlar: [],
    kolonGenislikleri: Object.fromEntries(kolonlar.map((k) => [k.id, k.genislik ?? 120])),
    sayfaBoyutu: 10,
    cizgilerAcik: false,
    gruplamaKolonId: null,
  };
}

function ayarOku(anahtar: string, kolonlar: KolonTanimi<unknown>[], gizliVarsayilan: string[]): DataGridAyar {
  const varsayilan = varsayilanAyar(kolonlar, gizliVarsayilan);
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return varsayilan;
    const kayit = JSON.parse(ham) as Partial<DataGridAyar>;
    const gecerliIdler = new Set(kolonlar.map((k) => k.id));
    const kolonSirasi = (kayit.kolonSirasi ?? varsayilan.kolonSirasi).filter((id) => gecerliIdler.has(id));
    for (const k of kolonlar) {
      if (!kolonSirasi.includes(k.id)) kolonSirasi.push(k.id);
    }
    return {
      ...varsayilan,
      ...kayit,
      kolonSirasi,
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
  varsayilanGizliKolonlar: string[] = []
) {
  const kolonRef = kolonlar as KolonTanimi<unknown>[];
  const [ayar, setAyar] = useState<DataGridAyar>(() =>
    ayarOku(depolamaAnahtari, kolonRef, varsayilanGizliKolonlar)
  );
  const [sayfa, setSayfa] = useState(0);
  const [siralama, setSiralama] = useState<{ kolonId: string; yon: SiralamaYonu } | null>(null);
  const [filtreler, setFiltreler] = useState<Record<string, string>>({});
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
    setAyar(varsayilanAyar(kolonlar, varsayilanGizliKolonlar));
    setSayfa(0);
    setSiralama(null);
    setFiltreler({});
  }, [kolonlar, varsayilanGizliKolonlar]);

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
        sabitlenmisKolonlar: varMi
          ? a.sabitlenmisKolonlar.filter((id) => id !== kolonId)
          : [...a.sabitlenmisKolonlar, kolonId],
      };
    });
  }, []);

  const cizgiToggle = useCallback(() => {
    setAyar((a) => ({ ...a, cizgilerAcik: !a.cizgilerAcik }));
  }, []);

  const sayfaBoyutuAyarla = useCallback((boyut: number) => {
    setAyar((a) => ({ ...a, sayfaBoyutu: boyut }));
    setSayfa(0);
  }, []);

  const gruplamaAyarla = useCallback((kolonId: string | null) => {
    setAyar((a) => ({ ...a, gruplamaKolonId: kolonId }));
  }, []);

  const siralamaToggle = useCallback((kolonId: string) => {
    setSiralama((onceki) => {
      if (!onceki || onceki.kolonId !== kolonId) return { kolonId, yon: 'asc' };
      if (onceki.yon === 'asc') return { kolonId, yon: 'desc' };
      return null;
    });
    setSayfa(0);
  }, []);

  const filtreAyarla = useCallback((kolonId: string, deger: string) => {
    setFiltreler((f) => ({ ...f, [kolonId]: deger }));
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
    filtreler,
    filtreAyarla,
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
    cizgiToggle,
    sayfaBoyutuAyarla,
    gruplamaAyarla,
    sutunMenuAcik,
    setSutunMenuAcik,
    suruklenenKolon,
    setSuruklenenKolon,
  };
}

export function satirlariIsle<TRow extends { id: string }>(
  satirlar: TRow[],
  kolonlar: KolonTanimi<TRow>[],
  filtreler: Record<string, string>,
  siralama: { kolonId: string; yon: 'asc' | 'desc' } | null
): TRow[] {
  let sonuc = [...satirlar];

  const aktifFiltreler = Object.entries(filtreler).filter(([, v]) => v.trim());
  if (aktifFiltreler.length) {
    sonuc = sonuc.filter((satir) =>
      aktifFiltreler.every(([kolonId, aranan]) => {
        const kolon = kolonlar.find((k) => k.id === kolonId);
        if (!kolon) return true;
        const metin = (kolon.filtreDegeri?.(satir) ?? String(kolon.degerAl(satir) ?? '')).toLowerCase();
        return metin.includes(aranan.toLowerCase());
      })
    );
  }

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
