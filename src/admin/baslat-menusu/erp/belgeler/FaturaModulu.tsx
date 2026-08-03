import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import type { DataGridApi, HizliGirisApi, HizliGirisEnterBaglami } from '@/admin/ortak/datagrid/types';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { DatagridSagTikMenu, type SatirEkleKonumu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useAdminLogMesaji, useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { subeleriGetir, depolariGetir, kasalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import type { AdminDepo, AdminKasa, AdminSube } from '@/admin/baslat-menusu/tanimlar/tipler';
import {
  satirHesapla,
  satirlariKdvModunaCevir,
  yeniSiparisSatiriOlustur,
  type SiparisSatiri,
} from '@/admin/baslat-menusu/datagrid/demo/demoVeri';
import { siparisKolonlari } from '@/admin/baslat-menusu/datagrid/demo/sayfa';
import { SatirDuzenlePanel } from '@/admin/baslat-menusu/datagrid/demo/SatirDuzenlePanel';
import { UrunAramaSlayt } from '@/admin/baslat-menusu/datagrid/demo/UrunAramaSlayt';
import { birimSecenekleri } from '@/admin/baslat-menusu/datagrid/demo/birimVeri';
import { paraBirimiSecenekleri } from '@/admin/baslat-menusu/datagrid/demo/paraBirimiVeri';
import { PARA_BIRIMLERI_GUNCELLENDI } from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';
import {
  hizliGirisUrunSorgusu,
  urunAramaSorgusuMetni,
  urunKoduAdiEtiket,
  urunKoduAdiKodAl,
  urunleriAra,
  yuzdeAramaModu,
  type UrunKaydi,
  URUN_ARAMA_ALANLARI,
} from '@/admin/baslat-menusu/datagrid/demo/urunAramaYardimci';
import { hucrePanoyaMetni } from '@/admin/baslat-menusu/datagrid/demo/sagTikYardimci';
import {
  belgeIskontoUygula,
  belgeTurEtiketi,
  bosBelgeIskontolari,
  bosBelgeIskontoTutarlari,
  bugunIso,
  cariTipiBelgeyeUygunMu,
  gecerliBelgeIskontolari,
  gecerliBelgeIskontoTutarlari,
  satirToplamlari,
  type BelgeIskontoDizisi,
  type BelgeIskontoTutarsal,
  type BelgeKayit,
  type BelgeTur,
  type BelgeYon,

  type StokBakiyeSatir,
  type StokEksikSatir,
} from './tipler';
import {
  belgeGuncelle,
  belgeOlustur,
  belgeOnayla,
  belgeSil,
  belgedenAktar,
  belgelerGetir,
  iadeTaslagiOlustur,

  seriOner,
  stokBakiyeleriGetir,
  stokEksikleriBul,
  stokGirisiEkle,
} from './api';
import { stokUrunKataloguGetir } from './urunKatalogAdapter';
import { CariOutlinedAramaAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAramaAcilir';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { FaturaCariBulModal } from './FaturaCariBulModal';
import { FaturaBolumDuzen } from './FaturaBolumDuzen';
import { HizliStokEkleModal } from './HizliStokEkleModal';
import { StokEksikUyariModal, type StokTamamlamaSatiri } from './StokEksikUyariModal';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';
import {
  OtOutlinedAcilir,
  OtOutlinedAlan,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';
import { TarihSecici } from '@/admin/ortak/TarihSecici';
import { belgeBaslatOkuVeTemizle, BELGE_BASLAT_OLAY } from './belgeBaslat';
import {
  BELGE_NEVILERI_GUNCELLENDI,
  BELGE_YON_SECENEKLERI,
  belgeNeviBul,
  belgeNeviFormSecenekleri,
  belgeYonEtiketi,
  yonIcinVarsayilanBelgeNevi,
  SABIT_BELGE_NEVI_SATIS,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import '@/admin/baslat-menusu/ozel-tanimlar/ozel-tanimlar.css';
import './fatura.css';

const VARSAYILAN_GIZLI = ['etiketler', 'kayit', 'guncelleme'];
const KOLON_GENISLIK_SURUMU = 9;
const TURLER: BelgeTur[] = ['SIPARIS', 'IRSALIYE', 'FATURA', 'IADE'];
const VARSAYILAN_CARI_VADE_GUN = 30;

type VadeModu = 'CARI' | 'MANUEL';

interface FaturaModuluProps {
  /** Geriye uyum — verilirse başlangıç yönü sabittir; yoksa belge nevisinden gelir */
  yon?: BelgeYon;
  modulId?: string;
  baslik?: string;
}

type Gorunum = 'liste' | 'form';

function para(n: number) {
  return sayiFormatla(n);
}

function cariVadeTarihiHesapla(tarihIso: string, gun = VARSAYILAN_CARI_VADE_GUN) {
  const d = new Date(`${tarihIso}T00:00:00`);
  d.setDate(d.getDate() + gun);
  return tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate());
}

function kodAdEtiket(kod: string, adi: string) {
  const k = (kod || '').trim();
  const a = (adi || '').trim();
  if (!k) return a || '—';
  if (!a || a.toLocaleLowerCase('tr') === k.toLocaleLowerCase('tr')) return k;
  return `${k} — ${a}`;
}

/** Seçili alanda yalnızca kod (veya kod yoksa ad) */
function kodAdKisa(kod: string, adi: string) {
  const k = (kod || '').trim();
  if (k) return k;
  return (adi || '').trim() || '—';
}

function belgeNoZamanDamgasiOlustur() {
  const d = new Date();
  const parca = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${parca(d.getMonth() + 1)}${parca(d.getDate())}-${parca(d.getHours())}${parca(d.getMinutes())}${parca(d.getSeconds())}`;
}

function faturaAltMetin(yon: BelgeYon) {
  if (yon === 'SATIS') {
    return 'Belge nevi ile alış/satış · Stok ve cari hareket · Sipariş → İrsaliye → Fatura';
  }
  return 'Belge nevi ile alış/satış · Stok ve cari hareket · Sipariş → İrsaliye → Fatura';
}

export function FaturaModulu({
  yon: sabitYon,
  modulId = 'belgeler',
  baslik = 'Belgeler',
}: FaturaModuluProps) {
  const belgelerYetki = useYetkiler('belgeler');
  const alisYetki = useYetkiler('alis-faturasi');
  const satisYetki = useYetkiler('satis-faturasi');
  const goruntulemeVar =
    belgelerYetki.goruntulemeVar || alisYetki.goruntulemeVar || satisYetki.goruntulemeVar;
  const eklemeVar = belgelerYetki.eklemeVar || alisYetki.eklemeVar || satisYetki.eklemeVar;
  const duzenlemeVar =
    belgelerYetki.duzenlemeVar || alisYetki.duzenlemeVar || satisYetki.duzenlemeVar;
  const silmeVar = belgelerYetki.silmeVar || alisYetki.silmeVar || satisYetki.silmeVar;
  const logMesajiAyarla = useAdminLogMesaji();

  const [gorunum, setGorunum] = useState<Gorunum>('form');
  const [listeFiltreTur, setListeFiltreTur] = useState<BelgeTur | 'HEPSI'>('HEPSI');
  const [liste, setListe] = useState<BelgeKayit[]>([]);
  const [listeYukleniyor, setListeYukleniyor] = useState(true);

  const [belgeNeviId, setBelgeNeviId] = useState(
    () => sabitYon ? yonIcinVarsayilanBelgeNevi(sabitYon).id : SABIT_BELGE_NEVI_SATIS
  );
  const [neviSurumu, setNeviSurumu] = useState(0);
  const aktifNevi = useMemo(() => {
    void neviSurumu;
    return belgeNeviBul(belgeNeviId) ?? yonIcinVarsayilanBelgeNevi(sabitYon ?? 'SATIS');
  }, [belgeNeviId, neviSurumu, sabitYon]);
  const yon: BelgeYon = aktifNevi.yon;

  const [aktifId, setAktifId] = useState<string | null>(null);
  const [tur, setTur] = useState<BelgeTur>('FATURA');
  const [belgeNo, setBelgeNo] = useState('');
  const [seri, setSeri] = useState('');
  const [siraNo, setSiraNo] = useState(0);
  const [tarih, setTarih] = useState(bugunIso());
  const [vadeTarihi, setVadeTarihi] = useState('');
  const [vadeModu, setVadeModu] = useState<VadeModu>('CARI');
  const [aciklama, setAciklama] = useState('');
  const [belgeIskontolari, setBelgeIskontolari] = useState<BelgeIskontoDizisi>(() => bosBelgeIskontolari());
  const [belgeIskontoTutarlari, setBelgeIskontoTutarlari] = useState<BelgeIskontoTutarsal>(() =>
    bosBelgeIskontoTutarlari()
  );
  const [subeId, setSubeId] = useState('');
  const [depoId, setDepoId] = useState('');
  const [kasaId, setKasaId] = useState('');
  const [cariId, setCariId] = useState('');
  const [baslikDetayAcik, setBaslikDetayAcik] = useState(false);
  const [finansDetayAcik, setFinansDetayAcik] = useState(false);
  const [cariBulAcik, setCariBulAcik] = useState(false);
  const [kaynakBelgeId, setKaynakBelgeId] = useState<string | null>(null);
  const [kaynakBelgeNo, setKaynakBelgeNo] = useState('');

  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [cariler, setCariler] = useState<AdminCari[]>([]);
  const [durum, setDurum] = useState<BelgeKayit['durum']>('TASLAK');
  const [satirlar, setSatirlar] = useState<SiparisSatiri[]>([]);
  const [kdvDahil, setKdvDahil] = useState(true);
  const [katalog, setKatalog] = useState<UrunKaydi[]>([]);
  const [bakiyeler, setBakiyeler] = useState<StokBakiyeSatir[]>([]);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silOnayId, setSilOnayId] = useState<string | null>(null);

  const [slaytMod, setSlaytMod] = useState<'tablo' | 'arama'>('tablo');
  const [aramaSorgusu, setAramaSorgusu] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState<UrunKaydi[]>([]);
  const [seciliIndeks, setSeciliIndeks] = useState(0);
  const [seciliSatirSayisi, setSeciliSatirSayisi] = useState(0);
  const [satirEkleBaglam, setSatirEkleBaglam] = useState<{ satirId: string; konum: SatirEkleKonumu } | null>(null);
  const [hizliStokAranan, setHizliStokAranan] = useState<string | null>(null);
  const [hizliStokModu, setHizliStokModu] = useState<'soru' | 'form'>('soru');
  const [stokEksikleri, setStokEksikleri] = useState<StokEksikSatir[]>([]);
  const hizliStokDegerleriRef = useRef<Record<string, string>>({});
  const seciliSatirIdleriRef = useRef<string[]>([]);
  const hizliGirisApiRef = useRef<HizliGirisApi | null>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);
  const musteriGridRef = useRef<HTMLDivElement>(null);

  const saltOkunur = durum !== 'TASLAK';
  const [pbSurumu, setPbSurumu] = useState(0);
  useEffect(() => {
    const yenile = () => setPbSurumu((n) => n + 1);
    window.addEventListener(PARA_BIRIMLERI_GUNCELLENDI, yenile);
    return () => window.removeEventListener(PARA_BIRIMLERI_GUNCELLENDI, yenile);
  }, []);
  const kolonlar = useMemo(() => siparisKolonlari(kdvDahil), [kdvDahil, pbSurumu]);
  const pbSecenekleri = useMemo(() => {
    void pbSurumu;
    return paraBirimiSecenekleri();
  }, [pbSurumu]);
  const seciliSube = useMemo(() => subeler.find((s) => s.id === subeId) ?? null, [subeler, subeId]);
  const seciliDepo = useMemo(() => depolar.find((d) => d.id === depoId) ?? null, [depolar, depoId]);
  const seciliKasa = useMemo(() => kasalar.find((k) => k.id === kasaId) ?? null, [kasalar, kasaId]);
  const seciliCari = useMemo(() => cariler.find((c) => c.id === cariId) ?? null, [cariler, cariId]);
  const filtrelenmisCariler = useMemo(() => {
    const uygun = cariler.filter((c) => cariTipiBelgeyeUygunMu(yon, c.cariTipi));
    return uygun.length > 0 ? uygun : cariler;
  }, [cariler, yon]);
  const subeDepolari = useMemo(
    () => depolar.filter((d) => !subeId || d.subeId === subeId),
    [depolar, subeId]
  );
  const turSecenekleri = useMemo(() => BELGE_YON_SECENEKLERI, []);
  const neviSecenekleri = useMemo(() => {
    void neviSurumu;
    return belgeNeviFormSecenekleri(true).map((n) => ({ value: n.value, label: n.label }));
  }, [neviSurumu]);
  const subeSecenekleri = useMemo(
    () => subeler.map((s) => ({ value: s.id, label: kodAdEtiket(s.subeKodu, s.subeAdi) })),
    [subeler]
  );
  const depoSecenekleri = useMemo(
    () => subeDepolari.map((d) => ({ value: d.id, label: kodAdEtiket(d.depoKodu, d.depoAdi) })),
    [subeDepolari]
  );
  const subeKasalari = useMemo(
    () => kasalar.filter((k) => !subeId || k.subeId === subeId),
    [kasalar, subeId]
  );
  const kasaSecenekleri = useMemo(
    () => subeKasalari.map((k) => ({ value: k.id, label: kodAdEtiket(k.kasaKodu, k.kasaAdi) })),
    [subeKasalari]
  );
  const cariSecenekleri = useMemo(
    () =>
      filtrelenmisCariler.map((c) => ({
        value: c.id,
        label: `${c.cariKodu} — ${c.cariAdi || c.unvan} (${c.cariTipi})`,
      })),
    [filtrelenmisCariler]
  );
  
  const toplamlar = useMemo(() => {
    const ham = satirToplamlari(satirlar.map((s) => satirHesapla(s, kdvDahil)));
    const isk = belgeIskontoUygula(
      ham.araToplam,
      ham.kdvToplam,
      belgeIskontolari,
      belgeIskontoTutarlari
    );
    return {
      tutar: isk.tutar,
      araToplam: isk.netAra,
      kdvToplam: isk.kdvToplam,
      genelToplam: isk.genelToplam,
      netAra: isk.netAra,
      iskontoToplam: isk.iskontoToplam,
      iskontoTutarlari: isk.iskontoTutarlari,
    };
  }, [satirlar, kdvDahil, belgeIskontolari, belgeIskontoTutarlari]);

  const oransalIskontoYaz = useCallback((indeks: number, ham: string) => {
    const n = Number(String(ham).replace(',', '.'));
    const yuzde = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
    setBelgeIskontolari((onceki) => {
      const sonraki = [...onceki] as BelgeIskontoDizisi;
      sonraki[indeks] = yuzde;
      return sonraki;
    });
  }, []);

  const tutarsalIskontoYaz = useCallback((indeks: number, ham: string) => {
    const n = Number(String(ham).replace(',', '.'));
    const tutar = Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
    setBelgeIskontoTutarlari((onceki) => {
      const sonraki = [...onceki] as BelgeIskontoTutarsal;
      sonraki[indeks] = tutar;
      return sonraki;
    });
  }, []);

  const gorunurSatirlar = useMemo(
    () => satirlar.map((s) => satirHesapla(s, kdvDahil)),
    [satirlar, kdvDahil]
  );
  const efektifVadeTarihi = useMemo(() => {
    if (vadeModu === 'CARI' && tarih) return cariVadeTarihiHesapla(tarih);
    return vadeTarihi || null;
  }, [vadeModu, tarih, vadeTarihi]);

  const filtreliListe = useMemo(
    () => (listeFiltreTur === 'HEPSI' ? liste : liste.filter((b) => b.tur === listeFiltreTur)),
    [liste, listeFiltreTur]
  );

  const katalogYenile = useCallback(
    async (depo?: string) => {
      const urunler = await stokUrunKataloguGetir(yon, depo || depoId || null);
      setKatalog(urunler);
      setBakiyeler(stokBakiyeleriGetir(depo || depoId || undefined));
    },
    [yon, depoId]
  );

  const listeyiYukle = useCallback(async () => {
    setListeYukleniyor(true);
    try {
      const [belgeler, cariListe, subeListe, depoListe, kasaListe] = await Promise.all([
        sabitYon ? belgelerGetir(sabitYon) : belgelerGetir(null),
        carileriGetir(),
        subeleriGetir(),
        depolariGetir(),
        kasalariGetir(),
      ]);
      setListe(belgeler);
      setCariler(cariListe.filter((c) => c.aktif));
      setSubeler(subeListe.filter((s) => s.aktif));
      setDepolar(depoListe.filter((d) => d.aktif));
      setKasalar(kasaListe.filter((k) => k.aktif));
      const varsayilanDepo = depoListe.find((d) => d.aktif)?.id;
      await katalogYenile(varsayilanDepo);
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Liste yüklenemedi');
    } finally {
      setListeYukleniyor(false);
    }
  }, [sabitYon, logMesajiAyarla, katalogYenile]);

  useEffect(() => {
    void listeyiYukle();
  }, [listeyiYukle]);

  useEffect(() => {
    const h = () => setNeviSurumu((n) => n + 1);
    window.addEventListener(BELGE_NEVILERI_GUNCELLENDI, h);
    return () => window.removeEventListener(BELGE_NEVILERI_GUNCELLENDI, h);
  }, []);

  useEffect(() => {
    void katalogYenile(depoId);
  }, [depoId, katalogYenile]);

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>(`.ap-modul-panel[data-ap-kesif-modul="${modulId}"]`);
    if (!panel) return;
    panel.classList.add('ap-modul-panel--datagrid');
    return () => panel.classList.remove('ap-modul-panel--datagrid');
  }, [modulId, gorunum]);

  useLayoutEffect(() => {
    if (!baslikDetayAcik) return;
    const root = musteriGridRef.current;
    if (!root) return;
    const sol = root.querySelector<HTMLElement>('.fatura-ust-detay-cari');
    const orta = root.querySelector<HTMLElement>('.fatura-ust-lokasyon-sutun');
    const sag = root.querySelector<HTMLElement>('.fatura-ust-aciklama-sutun');
    if (!sol || !orta || !sag) return;

    const esitle = () => {
      orta.style.minHeight = '';
      sag.style.minHeight = '';
      const h = Math.ceil(sol.getBoundingClientRect().height);
      if (h <= 0) return;
      orta.style.minHeight = `${h}px`;
      sag.style.minHeight = `${h}px`;
    };

    esitle();
    const ro = new ResizeObserver(esitle);
    ro.observe(sol);
    return () => {
      ro.disconnect();
      orta.style.minHeight = '';
      sag.style.minHeight = '';
    };
  }, [baslikDetayAcik, seciliCari]);

  const numarayiYenile = useCallback(
    (hedefTur: BelgeTur, sube?: AdminSube | null) => {
      const oner = seriOner(yon, hedefTur, {
        efaturaSeri: sube?.efaturaSeri,
        earsivSeri: sube?.earsivSeri,
        eirsaliyeSeri: sube?.eirsaliyeSeri,
        subeKodu: sube?.subeKodu,
      });
      setSeri(oner.seri);
      setSiraNo(oner.siraNo);
      setBelgeNo(oner.belgeNo);
    },
    [yon]
  );

  const formuSifirla = useCallback(
    (hedefTur: BelgeTur = 'FATURA', onSeciliCariId?: string) => {
      const sube = subeler[0] ?? null;
      const depo = depolar.find((d) => !sube || d.subeId === sube.id) ?? depolar[0] ?? null;
      const kasa = kasalar.find((k) => !sube || k.subeId === sube.id) ?? kasalar[0] ?? null;
      setAktifId(null);
      setTur(hedefTur);
      setTarih(bugunIso());
      setVadeTarihi('');
      setVadeModu('CARI');
      setAciklama('');
      setBelgeIskontolari(bosBelgeIskontolari());
      setBelgeIskontoTutarlari(bosBelgeIskontoTutarlari());
      setSubeId(sube?.id ?? '');
      setDepoId(depo?.id ?? '');
      setKasaId(kasa?.id ?? '');
      setCariId(onSeciliCariId ?? '');
      setKaynakBelgeId(null);
      setKaynakBelgeNo('');
      setDurum('TASLAK');
      setSatirlar([]);
      setKdvDahil(true);
      setSeciliSatirSayisi(0);
      seciliSatirIdleriRef.current = [];
      numarayiYenile(hedefTur, sube);
    },
    [subeler, depolar, kasalar, numarayiYenile]
  );

  const yeniBelgeAc = useCallback(
    (hedefTur?: BelgeTur, onSeciliCariId?: string, onNeviId?: string) => {
      if (!eklemeVar) {
        logMesajiAyarla('Ekleme yetkisi yok');
        return;
      }
      if (onNeviId) setBelgeNeviId(onNeviId);
      const nevi = belgeNeviBul(onNeviId || belgeNeviId) ?? aktifNevi;
      const turHedef = hedefTur ?? nevi.varsayilanTur ?? 'FATURA';
      formuSifirla(turHedef, onSeciliCariId);
      setTur(turHedef);
      setGorunum('form');
    },
    [eklemeVar, formuSifirla, logMesajiAyarla, belgeNeviId, aktifNevi]
  );

  const belgeAc = useCallback(async (b: BelgeKayit) => {
    setAktifId(b.id);
    setBelgeNeviId(b.belgeNeviId || yonIcinVarsayilanBelgeNevi(b.yon).id);
    setTur(b.tur);
    setBelgeNo(b.belgeNo);
    setSeri(b.seri);
    setSiraNo(b.siraNo);
    setTarih(b.tarih);
    const cariVade = b.tarih ? cariVadeTarihiHesapla(b.tarih) : '';
    if (!b.vadeTarihi || b.vadeTarihi === cariVade) {
      setVadeModu('CARI');
      setVadeTarihi('');
    } else {
      setVadeModu('MANUEL');
      setVadeTarihi(b.vadeTarihi);
    }
    setAciklama(b.aciklama ?? '');
    setBelgeIskontolari(gecerliBelgeIskontolari(b.belgeIskontolari));
    setBelgeIskontoTutarlari(gecerliBelgeIskontoTutarlari(b.belgeIskontoTutarlari));
    setSubeId(b.subeId ?? '');
    setDepoId(b.depoId ?? '');
    setKasaId(b.kasaId ?? '');
    setCariId(b.cariId ?? '');
    setKaynakBelgeId(b.kaynakBelgeId);
    setKaynakBelgeNo(b.kaynakBelgeNo);
    setDurum(b.durum);
    setKdvDahil(b.kdvDahil !== false);
    setSatirlar(Array.isArray(b.satirlar) ? b.satirlar : []);
    setGorunum('form');
  }, []);

  const baslatIslendiRef = useRef(false);

  const baslatUygula = useCallback(
    (baslat: { cariId?: string; belgeId?: string; yeni?: boolean; belgeNeviId?: string }) => {
      if (baslat.belgeId) {
        const b = liste.find((x) => x.id === baslat.belgeId);
        if (b) {
          void belgeAc(b);
          return;
        }
        void (async () => {
          try {
            const { belgeGetir } = await import('./api');
            const kayit = await belgeGetir(baslat.belgeId!);
            await belgeAc(kayit);
          } catch {
            logMesajiAyarla('Belge açılamadı');
            yeniBelgeAc(undefined, baslat.cariId, baslat.belgeNeviId);
          }
        })();
        return;
      }
      if (baslat.yeni || baslat.cariId) {
        yeniBelgeAc(undefined, baslat.cariId, baslat.belgeNeviId);
        return;
      }
      yeniBelgeAc();
    },
    [liste, belgeAc, yeniBelgeAc, logMesajiAyarla]
  );

  useEffect(() => {
    if (listeYukleniyor) return;
    const baslat = belgeBaslatOkuVeTemizle();
    if (baslat) {
      baslatIslendiRef.current = true;
      baslatUygula(baslat);
      return;
    }
    if (!baslatIslendiRef.current) {
      baslatIslendiRef.current = true;
      // Liste yok — doğrudan yeni belge formu
      yeniBelgeAc();
    }
  }, [listeYukleniyor, baslatUygula, yeniBelgeAc]);

  // Cari → Belge Ekle: sekme zaten açıksa sessionStorage + olay ile cariyi uygula
  useEffect(() => {
    const dinle = () => {
      if (listeYukleniyor) return;
      const baslat = belgeBaslatOkuVeTemizle();
      if (!baslat) return;
      baslatIslendiRef.current = true;
      baslatUygula(baslat);
    };
    window.addEventListener(BELGE_BASLAT_OLAY, dinle);
    return () => window.removeEventListener(BELGE_BASLAT_OLAY, dinle);
  }, [listeYukleniyor, baslatUygula]);

  const girdiAl = useCallback(
    () => ({
      yon,
      tur,
      belgeNeviId: aktifNevi.id,
      belgeNeviAdi: aktifNevi.adi,
      belgeNo: belgeNo.trim(),
      seri,
      siraNo,
      tarih,
      vadeTarihi: efektifVadeTarihi,
      subeId: subeId || null,
      subeKodu: seciliSube?.subeKodu ?? '',
      subeAdi: seciliSube?.subeAdi ?? '',
      depoId: depoId || null,
      depoKodu: seciliDepo?.depoKodu ?? '',
      depoAdi: seciliDepo?.depoAdi ?? '',
      cariId: cariId || null,
      cariKodu: seciliCari?.cariKodu ?? '',
      cariAdi: seciliCari?.cariAdi ?? seciliCari?.unvan ?? '',
      aciklama,
      kasaId: kasaId || null,
      kasaKodu: seciliKasa?.kasaKodu ?? '',
      kasaAdi: seciliKasa?.kasaAdi ?? '',
      kdvDahil,
      belgeIskontolari,
      belgeIskontoTutarlari,
      araToplam: toplamlar.araToplam,
      kdvToplam: toplamlar.kdvToplam,
      genelToplam: toplamlar.genelToplam,
      kaynakBelgeId,
      kaynakBelgeNo,
      satirlar: gorunurSatirlar,
    }),
    [
      yon,
      tur,
      aktifNevi,
      belgeNo,
      seri,
      siraNo,
      tarih,
      efektifVadeTarihi,
      subeId,
      seciliSube,
      depoId,
      seciliDepo,
      cariId,
      seciliCari,
      aciklama,
      kasaId,
      seciliKasa,
      kdvDahil,
      belgeIskontolari,
      belgeIskontoTutarlari,
      toplamlar,
      kaynakBelgeId,
      kaynakBelgeNo,
      gorunurSatirlar,
    ]
  );

  /** Kaydet = kaydet + onayla: taslak yok, doğrudan cari/stok hareketi oluşur */
  const kaydet = useCallback(
    async (secenek?: { negatifStokIzin?: boolean }): Promise<BelgeKayit | null> => {
      if (saltOkunur) return null;
      if (!(aktifId ? duzenlemeVar : eklemeVar)) {
        logMesajiAyarla('Kayıt yetkisi yok');
        return null;
      }
      if (!belgeNo.trim()) {
        logMesajiAyarla('Belge no gerekli');
        return null;
      }
      if (!cariId) {
        logMesajiAyarla('Cari seçimi gerekli');
        return null;
      }
      if (!subeId) {
        logMesajiAyarla('Şube seçimi gerekli');
        return null;
      }
      if (!depoId) {
        logMesajiAyarla('Depo seçimi gerekli');
        return null;
      }
      if (!gorunurSatirlar.some((s) => s.durum !== false)) {
        logMesajiAyarla('En az bir satır gerekli');
        return null;
      }
      if (!secenek?.negatifStokIzin) {
        const eksikler = stokEksikleriBul(gorunurSatirlar, yon, tur, depoId);
        if (eksikler.length) {
          setStokEksikleri(eksikler);
          return null;
        }
      }
      setKaydediliyor(true);
      const yeniBelgeMi = !aktifId;
      try {
        const kayit = aktifId ? await belgeGuncelle(aktifId, girdiAl()) : await belgeOlustur(girdiAl());
        let onayli: BelgeKayit;
        try {
          onayli = await belgeOnayla(kayit.id, secenek);
        } catch (onayHata) {
          // Onay geçmezse yarım (taslak) kayıt listede kalmasın
          if (yeniBelgeMi) await belgeSil(kayit.id).catch(() => undefined);
          throw onayHata;
        }
        setAktifId(onayli.id);
        setDurum(onayli.durum);
        setBelgeNo(onayli.belgeNo);
        setSeri(onayli.seri);
        setSiraNo(onayli.siraNo);
        setStokEksikleri([]);
        logMesajiAyarla('Belge kaydedildi — cari ve stok hareketi oluştu');
        await listeyiYukle();
        await katalogYenile(onayli.depoId ?? depoId);
        return onayli;
      } catch (err) {
        logMesajiAyarla(err instanceof Error ? err.message : 'Kayıt başarısız');
        return null;
      } finally {
        setKaydediliyor(false);
      }
    },
    [
      saltOkunur,
      aktifId,
      duzenlemeVar,
      eklemeVar,
      belgeNo,
      cariId,
      subeId,
      depoId,
      yon,
      tur,
      gorunurSatirlar,
      girdiAl,
      logMesajiAyarla,
      listeyiYukle,
      katalogYenile,
    ]
  );

  /** Eksik miktarlar depoya girilir, sonra belge normal akışta kaydedilir */
  const stokTamamlaVeKaydet = useCallback(
    async (tamamlamalar: StokTamamlamaSatiri[]) => {
      if (!depoId) return;
      setKaydediliyor(true);
      try {
        for (const t of tamamlamalar) {
          await stokGirisiEkle({
            urunKodu: t.urunKodu,
            urunAdi: t.urunAdi,
            depoId,
            depoKodu: seciliDepo?.depoKodu,
            miktar: t.eklenecek,
            birim: t.birim,
            aciklama: 'STOK TAMAMLAMA',
          });
        }
        await katalogYenile(depoId);
      } finally {
        setKaydediliyor(false);
      }
      setStokEksikleri([]);
      await kaydet();
    },
    [depoId, seciliDepo, katalogYenile, kaydet]
  );

  const eksiyeDusurVeKaydet = useCallback(async () => {
    setStokEksikleri([]);
    await kaydet({ negatifStokIzin: true });
  }, [kaydet]);

  const sil = useCallback(async () => {
    if (!silOnayId || !silmeVar) return;
    try {
      await belgeSil(silOnayId);
      setSilOnayId(null);
      if (aktifId === silOnayId) {
        yeniBelgeAc();
      }
      logMesajiAyarla('Belge silindi');
      await listeyiYukle();
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Silme başarısız');
    }
  }, [silOnayId, silmeVar, aktifId, yeniBelgeAc, logMesajiAyarla, listeyiYukle]);

  const formKaydetAktif = gorunum === 'form' && !saltOkunur && (aktifId ? duzenlemeVar : eklemeVar);
  const formSilAktif = gorunum === 'form' && Boolean(aktifId) && silmeVar;

  useModulAksiyonlari(
    {
      kaydet: formKaydetAktif ? async () => Boolean(await kaydet()) : undefined,
      ekle: eklemeVar ? () => yeniBelgeAc() : undefined,
      sil: formSilAktif
        ? () => {
            setSilOnayId(aktifId);
          }
        : undefined,
    },
    {
      kaydet: formKaydetAktif && !kaydediliyor,
      ekle: eklemeVar,
      sil: formSilAktif && !kaydediliyor,
    }
  );

  const aktar = useCallback(
    async (hedef: BelgeTur) => {
      if (!aktifId) return;
      try {
        const yeni = await belgedenAktar(aktifId, hedef, {
          efaturaSeri: seciliSube?.efaturaSeri,
          eirsaliyeSeri: seciliSube?.eirsaliyeSeri,
        });
        logMesajiAyarla(`${belgeTurEtiketi(hedef)} taslağı oluşturuldu`);
        await listeyiYukle();
        await belgeAc(yeni);
      } catch (err) {
        logMesajiAyarla(err instanceof Error ? err.message : 'Aktarım başarısız');
      }
    },
    [aktifId, seciliSube, logMesajiAyarla, listeyiYukle, belgeAc]
  );

  const iadeOlustur = useCallback(async () => {
    if (!aktifId) return;
    try {
      const yeni = await iadeTaslagiOlustur(aktifId, { efaturaSeri: seciliSube?.efaturaSeri });
      logMesajiAyarla('İade taslağı oluşturuldu');
      await listeyiYukle();
      await belgeAc(yeni);
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'İade oluşturulamadı');
    }
  }, [aktifId, seciliSube, logMesajiAyarla, listeyiYukle, belgeAc]);

  const kdvModuDegistir = useCallback(
    (yeni: boolean) => {
      if (saltOkunur || yeni === kdvDahil) return;
      setSatirlar((onceki) => satirlariKdvModunaCevir(onceki, kdvDahil, yeni));
      setKdvDahil(yeni);
    },
    [kdvDahil, saltOkunur]
  );

  const aramayiAc = useCallback(
    (sorgu: string) => {
      if (saltOkunur) return;
      setAramaSorgusu(sorgu);
      setAramaSonuclari(urunleriAra(katalog, sorgu));
      setSeciliIndeks(0);
      setSlaytMod('arama');
    },
    [katalog, saltOkunur]
  );

  const aramayiKapat = useCallback((satirEkleKorunsun = false) => {
    setSlaytMod('tablo');
    setAramaSorgusu('');
    setAramaSonuclari([]);
    setSeciliIndeks(0);
    if (!satirEkleKorunsun) setSatirEkleBaglam(null);
  }, []);

  /** Arama sonucundan seçim: satıra eklemez, hızlı giriş alanlarını doldurur */
  const urunSecVeDoldur = useCallback(
    (urun: UrunKaydi) => {
      if (saltOkunur) return;
      const api = hizliGirisApiRef.current;
      const mevcut = api?.degerler ?? {};
      api?.alanAyarla('urunKoduAdi', urunKoduAdiEtiket(urun.sku, urun.ad));
      api?.alanAyarla('miktar', mevcut.miktar?.trim() ? mevcut.miktar : '1');
      api?.alanAyarla('birim', mevcut.birim?.trim() ? mevcut.birim : urun.birim);
      api?.alanAyarla('fiyat', mevcut.fiyat?.trim() ? mevcut.fiyat : String(urun.fiyat));
      api?.alanAyarla('toplamKdv', mevcut.toplamKdv?.trim() ? mevcut.toplamKdv : String(urun.kdv));
      aramayiKapat(true);
      requestAnimationFrame(() => {
        gridApiRef.current?.hizliGirisOdakla?.();
        // Miktar alanına geç — ürün seçildi, kullanıcı düzenleyip ekleyecek
        const miktarEl = document.querySelector<HTMLInputElement>(
          '.dg-hizli-giris-satir input[data-kolon-id="miktar"], .dg-hizli-giris-girdi[data-kolon-id="miktar"]'
        );
        if (miktarEl) {
          miktarEl.focus();
          miktarEl.select();
        }
      });
    },
    [saltOkunur, aramayiKapat]
  );

  /** Yazılan metin katalogda tam kod/ad eşleşmesi yoksa true */
  const katalogDisiMi = useCallback(
    (ham: string | undefined) => {
      const metin = urunAramaSorgusuMetni(ham);
      if (!metin) return true;
      const kod = urunKoduAdiKodAl(metin).toLocaleLowerCase('tr');
      const tam = metin.toLocaleLowerCase('tr');
      return !katalog.some((u) => {
        const sku = u.sku.toLocaleLowerCase('tr');
        const ad = u.ad.toLocaleLowerCase('tr');
        return sku === kod || sku === tam || ad === tam;
      });
    },
    [katalog]
  );

  const hizliStokAc = useCallback(
    (ham: string, degerler?: Record<string, string>, mod: 'soru' | 'form' = 'soru') => {
      hizliStokDegerleriRef.current = degerler ?? {};
      setHizliStokModu(mod);
      setHizliStokAranan(urunAramaSorgusuMetni(ham));
    },
    []
  );

  const hizliGirisSatirEkle = useCallback(
    (degerler: Record<string, string>, katalogGenis: UrunKaydi[]) => {
      const yeni = yeniSiparisSatiriOlustur(degerler, kdvDahil, katalogGenis);
      if (satirEkleBaglam) {
        const { satirId, konum } = satirEkleBaglam;
        setSatirlar((onceki) => {
          const idx = onceki.findIndex((s) => s.id === satirId);
          if (idx < 0) return [...onceki, yeni];
          const listeYeni = [...onceki];
          listeYeni.splice(konum === 'ust' ? idx : idx + 1, 0, yeni);
          return listeYeni;
        });
        setSatirEkleBaglam(null);
      } else {
        /* Son eklenen satır en altta */
        setSatirlar((onceki) => [...onceki, yeni]);
      }
      hizliGirisApiRef.current?.sifirla();
      requestAnimationFrame(() => gridApiRef.current?.odakAyarla(yeni.id, 'urunKoduAdi'));
      return yeni.id;
    },
    [kdvDahil, satirEkleBaglam]
  );

  const hizliStokEklendi = useCallback(
    async (urun: UrunKaydi) => {
      const onceki = hizliStokDegerleriRef.current;
      hizliStokDegerleriRef.current = {};
      setKatalog((k) => (k.some((u) => u.sku === urun.sku) ? k : [...k, urun]));
      setHizliStokAranan(null);
      aramayiKapat(true);

      const api = hizliGirisApiRef.current;
      api?.alanAyarla('urunKoduAdi', urunKoduAdiEtiket(urun.sku, urun.ad));
      api?.alanAyarla('miktar', onceki.miktar?.trim() ? onceki.miktar : '1');
      api?.alanAyarla('birim', onceki.birim?.trim() ? onceki.birim : urun.birim);
      api?.alanAyarla('fiyat', onceki.fiyat?.trim() ? onceki.fiyat : String(urun.fiyat));
      api?.alanAyarla(
        'toplamKdv',
        onceki.toplamKdv?.trim() ? onceki.toplamKdv : String(urun.kdv)
      );

      logMesajiAyarla(`${urun.sku} stok kartı açıldı — alanlar dolduruldu, Enter ile ekleyin`);
      await katalogYenile(depoId);
      requestAnimationFrame(() => {
        const miktarEl = document.querySelector<HTMLInputElement>(
          '.dg-hizli-giris-satir input[data-kolon-id="miktar"], .dg-hizli-giris-girdi[data-kolon-id="miktar"]'
        );
        if (miktarEl) {
          miktarEl.focus();
          miktarEl.select();
        } else {
          gridApiRef.current?.hizliGirisOdakla?.();
        }
      });
    },
    [aramayiKapat, logMesajiAyarla, katalogYenile, depoId]
  );

  const hizliGirisOnizleme = useCallback(
    (degerler: Record<string, string>) => {
      const s = yeniSiparisSatiriOlustur(degerler, kdvDahil, katalog);
      return {
        tutar: sayiFormatla(s.tutar),
        netTutar: sayiFormatla(s.netTutar),
        gercekToplam: sayiFormatla(s.gercekToplam),
        toplamTutar: <span className="dg-onizle-toplam">{sayiFormatla(s.toplamTutar)}</span>,
        satirIskonto: sayiFormatla(s.satirIskontoTutar),
        altIskonto: sayiFormatla(s.altIskontoTutar),
      };
    },
    [kdvDahil, katalog]
  );

  if (!goruntulemeVar) {
    return <YetkisizErisim aciklama={`${baslik} için Görüntüleme yetkisi gerekir.`} />;
  }

  const sayfaSinif = `fatura-sayfa fatura-sayfa--${yon === 'ALIS' ? 'alis' : 'satis'}`;
  const altMetin = faturaAltMetin(yon);

  if (gorunum === 'liste') {
    return (
      <div className={`${sayfaSinif} fatura-sayfa--liste`}>
        <div className="fatura-liste-ust">
          <div>
            <h2 className="fatura-baslik">{baslik}</h2>
            <p className="fatura-alt">{altMetin}</p>
          </div>
          {eklemeVar ? (
            <div className="fatura-liste-aksiyon">
              <button type="button" className="fatura-btn fatura-btn--birincil" onClick={() => yeniBelgeAc()}>
                + Belge Ekle
              </button>
            </div>
          ) : null}
        </div>

        <section className="fatura-liste-bolum">
          <div className="fatura-liste-bolum-ust">
            <h3 className="fatura-bolum-baslik">Belge listesi</h3>
            <div className="fatura-tur-sekme">
              <button
                type="button"
                className={listeFiltreTur === 'HEPSI' ? 'aktif' : ''}
                onClick={() => setListeFiltreTur('HEPSI')}
              >
                Hepsi
              </button>
              {TURLER.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={listeFiltreTur === t ? 'aktif' : ''}
                  onClick={() => setListeFiltreTur(t)}
                >
                  {belgeTurEtiketi(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="fatura-liste-tablo-wrap">
          {listeYukleniyor ? (
            <p className="fatura-bos">Yükleniyor…</p>
          ) : filtreliListe.length === 0 ? (
            <p className="fatura-bos">Kayıt yok. + Belge Ekle ile yeni belge oluşturun.</p>
          ) : (
            <table className="fatura-liste-tablo">
              <thead>
                <tr>
                  <th>Nevi</th>
                  <th>Tür</th>
                  <th>Belge No</th>
                  <th>Tarih</th>
                  <th>Cari</th>
                  <th>Şube/Depo</th>
                  <th>Borç</th>
                  <th>Alacak</th>
                  <th>Toplam</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtreliListe.map((b) => (
                  <tr key={b.id}>
                    <td>{b.belgeNeviAdi || (b.yon === 'ALIS' ? 'Alış' : 'Satış')}</td>
                    <td>{belgeTurEtiketi(b.tur)}</td>
                    <td>
                      <button type="button" className="fatura-link" onClick={() => void belgeAc(b)}>
                        {b.belgeNo}
                      </button>
                      {b.kaynakBelgeNo ? (
                        <div className="fatura-mini">← {b.kaynakBelgeNo}</div>
                      ) : null}
                    </td>
                    <td>{b.tarih}</td>
                    <td>{b.cariAdi || b.cariKodu || '—'}</td>
                    <td>
                      {b.subeKodu || '—'} / {b.depoKodu || '—'}
                    </td>
                    <td className="fatura-sayi">{para(b.cariBorc)}</td>
                    <td className="fatura-sayi">{para(b.cariAlacak)}</td>
                    <td className="fatura-sayi">{para(b.genelToplam)}</td>
                    <td className="fatura-liste-aksiyon">
                      <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void belgeAc(b)}>
                        Aç
                      </button>
                      {silmeVar ? (
                        <button
                          type="button"
                          className="fatura-btn fatura-btn--tehlike"
                          onClick={() => setSilOnayId(b.id)}
                        >
                          Sil
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </section>

        <div className="fatura-bakiye-kutu">
          <h3 className="fatura-bolum-baslik">Depo stok bakiyesi</h3>
          {bakiyeler.length === 0 ? (
            <p className="fatura-bos">Henüz stok hareketi yok. İlk fatura açılışında seed stok yazılır.</p>
          ) : (
            <div className="fatura-liste-tablo-wrap fatura-bakiye-tablo-wrap">
              <table className="fatura-liste-tablo">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Depo</th>
                    <th>Miktar</th>
                  </tr>
                </thead>
                <tbody>
                  {bakiyeler.map((s) => (
                    <tr key={`${s.depoId}-${s.urunKodu}`}>
                      <td>
                        {s.urunKodu} — {s.urunAdi}
                      </td>
                      <td>{s.depoKodu || s.depoId}</td>
                      <td className="fatura-sayi">
                        {s.miktar} {s.birim}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <SilmeOnayModal
          acik={Boolean(silOnayId)}
          onKapat={() => setSilOnayId(null)}
          onOnayla={() => void sil()}
          baslik="Belgeyi silmek istiyor musunuz?"
          hedefMetin={liste.find((b) => b.id === silOnayId)?.belgeNo ?? ''}
          ariaLabel="Belge silme onayı"
        />
      </div>
    );
  }

  const firmaKodu = seciliCari?.cariKodu || '—';
  const firmaAdi = seciliCari
    ? seciliCari.unvan || seciliCari.cariAdi || '—'
    : 'Cari seçilmedi';

  return (
    <div ref={sayfaRef} className={`${sayfaSinif} dg-demo-sayfa dg-demo-sag-tik-alan fatura-sayfa--bolumlu`}>
      <FaturaBolumDuzen
        depolamaAnahtari={`gt_fatura_bolum_${modulId}`}
        ustAcik={baslikDetayAcik}
        altAcik={finansDetayAcik}
        ust={
          <>
      <section className="fatura-ust-serit" aria-label="Belge başlığı">
        <div className="fatura-ust-serit-satir">
          <button
            type="button"
            className={`fatura-ust-firma fatura-ust-firma--tus${seciliCari ? '' : ' fatura-ust-firma--bos'}`}
            title={saltOkunur ? undefined : 'Cari seçmek için tıklayın'}
            disabled={saltOkunur}
            onClick={() => setCariBulAcik(true)}
          >
            <span className="fatura-ust-firma-kod">{firmaKodu}</span>
            <span className="fatura-ust-firma-ad">{firmaAdi}</span>
          </button>

          <div className="fatura-ust-alanlar">
            {!saltOkunur ? (
              <OtOutlinedAcilir
                etiket="Belge Türü"
                deger={yon}
                secenekler={turSecenekleri}
                className="fatura-ust-alan"
                onChange={(v) => {
                  const yeniYon = v === 'ALIS' ? 'ALIS' : 'SATIS';
                  if (aktifNevi.yon === yeniYon) return;
                  const nevi = yonIcinVarsayilanBelgeNevi(yeniYon);
                  setBelgeNeviId(nevi.id);
                  if (!aktifId) {
                    setTur(nevi.varsayilanTur);
                    numarayiYenile(nevi.varsayilanTur, seciliSube);
                  }
                }}
              />
            ) : (
              <div className="fatura-salt-alan fatura-ust-alan">
                <span>Belge Türü</span>
                <strong>{belgeYonEtiketi(yon)}</strong>
              </div>
            )}

            {!saltOkunur ? (
              <OtOutlinedAcilir
                etiket="Belge Nevi"
                deger={belgeNeviId}
                secenekler={neviSecenekleri}
                className="fatura-ust-alan"
                onChange={(id) => {
                  setBelgeNeviId(id);
                  const nevi = belgeNeviBul(id);
                  if (nevi && !aktifId) {
                    setTur(nevi.varsayilanTur);
                    numarayiYenile(nevi.varsayilanTur, seciliSube);
                  }
                }}
              />
            ) : (
              <div className="fatura-salt-alan fatura-ust-alan">
                <span>Belge Nevi</span>
                <strong>{aktifNevi.adi}</strong>
              </div>
            )}

            <CariOutlinedGirdi
              etiket="Belge No"
              deger={belgeNo}
              disabled={saltOkunur}
              onChange={setBelgeNo}
              odakPlaceholder="Seri + sıra"
              className="fatura-ust-alan"
              sonek={
                !saltOkunur ? (
                  <div className="cari-outlined-sonek">
                    <button
                      type="button"
                      className="cari-adres-cek"
                      title="Şu anki tarih ve saati belge no olarak yaz"
                      onClick={() => setBelgeNo(belgeNoZamanDamgasiOlustur())}
                    >
                      Oto
                    </button>
                  </div>
                ) : undefined
              }
            />

            <OtOutlinedAlan
              etiket="Tarih"
              zorunlu
              disabled={saltOkunur}
              className="fatura-outlined-tarih fatura-ust-alan"
            >
              <TarihSecici
                deger={tarih}
                disabled={saltOkunur}
                ariaLabel="Belge tarihi"
                varyant="alan"
                onChange={setTarih}
              />
            </OtOutlinedAlan>
          </div>

          <div className="fatura-ust-serit-sag">
            {durum === 'ONAYLI' && duzenlemeVar ? (
              <div className="fatura-ust-aksiyonlar">
                {tur === 'SIPARIS' ? (
                  <>
                    <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void aktar('IRSALIYE')}>
                      → İrsaliye
                    </button>
                    <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void aktar('FATURA')}>
                      → Fatura
                    </button>
                  </>
                ) : null}
                {tur === 'IRSALIYE' ? (
                  <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void aktar('FATURA')}>
                    → Fatura
                  </button>
                ) : null}
                {tur === 'FATURA' ? (
                  <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void iadeOlustur()}>
                    İade
                  </button>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              className={`fatura-ust-ok${baslikDetayAcik ? ' fatura-ust-ok--acik' : ''}`}
              aria-expanded={baslikDetayAcik}
              aria-controls="fatura-ust-detay"
              title={baslikDetayAcik ? 'Müşteri / cari bilgisini gizle' : 'Müşteri / cari bilgisini göster'}
              onClick={() => setBaslikDetayAcik((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {baslikDetayAcik ? (
          <div id="fatura-ust-detay" className="fatura-ust-detay">
            <div className="fatura-ust-detay-bolum">
              <p className="fatura-sutun-etiket">Müşteri bilgileri</p>
              <div className="fatura-ust-musteri-grid" ref={musteriGridRef}>
                <div className="fatura-ust-detay-cari">
                  <CariOutlinedAramaAcilir
                    etiket={yon === 'SATIS' ? 'Müşteri' : 'Tedarikçi'}
                    deger={cariId}
                    disabled={saltOkunur}
                    secenekler={cariSecenekleri}
                    bosMetin=""
                    aramaPlaceholder="Cari kodu veya unvan ara…"
                    kutuIciArama
                    yalnizcaAramaSonucu
                    onChange={setCariId}
                  />
                  {seciliCari ? (
                    <div className="fatura-musteri-ozet">
                      <div>
                        <span>Yetkili</span>
                        <strong>{seciliCari.yetkili || '—'}</strong>
                      </div>
                      <div>
                        <span>Vergi</span>
                        <strong>
                          {[seciliCari.vergiDairesi, seciliCari.vergiNo].filter(Boolean).join(' · ') ||
                            '—'}
                        </strong>
                      </div>
                      <div>
                        <span>İletişim</span>
                        <strong>{seciliCari.telefon || seciliCari.gsm || seciliCari.eposta || '—'}</strong>
                      </div>
                      <div className="fatura-musteri-ozet--tam">
                        <span>Adres</span>
                        <strong>
                          {[seciliCari.adres, seciliCari.ilce, seciliCari.il].filter(Boolean).join(', ') ||
                            '—'}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="fatura-cari-ozet-bos">Cari seçilmedi — üstten veya buradan seçebilirsiniz.</p>
                  )}
                </div>

                <div className="fatura-ust-lokasyon-sutun">
                  <OtOutlinedAcilir
                    etiket="Şube"
                    deger={subeId}
                    disabled={saltOkunur}
                    secenekler={subeSecenekleri}
                    bosEtiket="Şube seçin…"
                    tusMetin={
                      seciliSube ? kodAdKisa(seciliSube.subeKodu, seciliSube.subeAdi) : undefined
                    }
                    onChange={(id) => {
                      setSubeId(id);
                      const sube = subeler.find((s) => s.id === id) ?? null;
                      const depo = depolar.find((d) => d.subeId === id);
                      const kasa = kasalar.find((k) => k.subeId === id);
                      setDepoId(depo?.id ?? '');
                      setKasaId(kasa?.id ?? '');
                      if (!saltOkunur) numarayiYenile(tur, sube);
                    }}
                  />
                  <OtOutlinedAcilir
                    etiket="Depo"
                    deger={depoId}
                    disabled={saltOkunur}
                    secenekler={depoSecenekleri}
                    bosEtiket="Depo seçin…"
                    tusMetin={
                      seciliDepo ? kodAdKisa(seciliDepo.depoKodu, seciliDepo.depoAdi) : undefined
                    }
                    onChange={setDepoId}
                  />
                  <OtOutlinedAcilir
                    etiket="Kasa"
                    deger={kasaId}
                    disabled={saltOkunur}
                    secenekler={kasaSecenekleri}
                    bosEtiket="Kasa seçin…"
                    tusMetin={
                      seciliKasa ? kodAdKisa(seciliKasa.kasaKodu, seciliKasa.kasaAdi) : undefined
                    }
                    onChange={setKasaId}
                  />
                </div>

                <div className="fatura-ust-aciklama-sutun">
                  <OtOutlinedAlan
                    etiket="Açıklama"
                    disabled={saltOkunur}
                    className="fatura-cari-aciklama-buyuk"
                  >
                    <textarea
                      className="fatura-aciklama-textarea"
                      value={aciklama}
                      disabled={saltOkunur}
                      rows={5}
                      placeholder="Seçilen cari / belge için not ve açıklama…"
                      onChange={(e) => setAciklama(e.target.value)}
                    />
                  </OtOutlinedAlan>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {kaynakBelgeNo ? (
        <p className="fatura-zincir">
          Zincir kaynağı: <strong>{kaynakBelgeNo}</strong>
        </p>
      ) : null}
          </>
        }
        orta={
          <>
      {!saltOkunur ? (
        <DatagridSagTikMenu
          konteynerRef={sayfaRef}
          kolonlar={kolonlar}
          satirlar={gorunurSatirlar}
          seciliSatirSayisi={seciliSatirSayisi}
          gridApiRef={gridApiRef}
          menuEtiketi={`${baslik} menüsü`}
          secimIslemleriGoster={false}
          tabloAraclariGoster={false}
          csvDisaGoster
          hucrePanoyaMetniAl={hucrePanoyaMetni}
          satirSilMetniAl={(satir) => satir.urun.ad || satir.urun.sku || `Satır #${satir.id}`}
          onSatirEkleBaslat={(konum, satirId) => {
            setSatirEkleBaglam({ satirId, konum });
            aramayiAc('');
          }}
          onSatirCogalt={(satir) => {
            const now = new Date().toISOString();
            const kopya = satirHesapla(
              { ...satir, id: `y-${Date.now()}`, kayitTarihi: now, guncellemeTarihi: now },
              kdvDahil
            );
            setSatirlar((onceki) => {
              const idx = onceki.findIndex((s) => s.id === satir.id);
              if (idx < 0) return [kopya, ...onceki];
              const yeni = [...onceki];
              yeni.splice(idx + 1, 0, kopya);
              return yeni;
            });
          }}
          onSatirSil={(satir) => setSatirlar((onceki) => onceki.filter((s) => s.id !== satir.id))}
          onSeciliSil={(ids) => {
            const idSet = new Set(ids);
            setSatirlar((onceki) => onceki.filter((s) => !idSet.has(s.id)));
            seciliSatirIdleriRef.current = [];
            setSeciliSatirSayisi(0);
          }}
          onDegeriYay={(kolonId, deger, gorunenler) => {
            const hedefIdler = new Set(gorunenler.map((s) => s.id));
            setSatirlar((onceki) =>
              onceki.map((s) => {
                if (!hedefIdler.has(s.id)) return s;
                const kolon = kolonlar.find((k) => k.id === kolonId);
                if (!kolon?.degerYaz) return s;
                return satirHesapla(kolon.degerYaz(s, deger), kdvDahil);
              })
            );
          }}
          onBilgi={logMesajiAyarla}
        />
      ) : null}

      <UrunAramaSlayt
        mod={slaytMod}
        sorgu={aramaSorgusu}
        sonuclar={aramaSonuclari}
        seciliIndeks={seciliIndeks}
        onSorguDegistir={(sorgu) => {
          setAramaSorgusu(sorgu);
          setAramaSonuclari(urunleriAra(katalog, sorgu));
          setSeciliIndeks(0);
        }}
        onSeciliDegistir={setSeciliIndeks}
        onSec={urunSecVeDoldur}
        onGeri={() => aramayiKapat(false)}
        onHizliEkle={saltOkunur ? undefined : (sorgu) => hizliStokAc(sorgu, undefined, 'form')}
      >
        <DataGrid
          tabloBaslik="Hareketler"
          tabloAltBaslik="Stok bakiyesi ürün aramada · stok yetmezse kayıtta uyarı verir"
          kolonlar={kolonlar}
          satirlar={gorunurSatirlar}
          depolamaAnahtari={`gt_fatura_${modulId}_v5`}
          kolonGenislikSurumu={KOLON_GENISLIK_SURUMU}
          sutunMenuModu="portal"
          hizliGirisKolonlari={
            saltOkunur
              ? undefined
              : [
                  {
                    kolonId: 'urunKoduAdi',
                    placeholder: 'Ürün Adı veya Kodu…',
                    ipucu: '% ile ara · Enter seç · Enter/+ ekle',
                  },
                  { kolonId: 'miktar', ipucu: 'Miktar ifadesi', varsayilan: '1' },
                  { kolonId: 'birim', tip: 'secim', varsayilan: 'ADET', secenekler: birimSecenekleri() },
                  {
                    kolonId: 'pb',
                    tip: 'secim',
                    varsayilan: pbSecenekleri[0]?.deger ?? 'TRY',
                    secenekler: pbSecenekleri,
                    ipucu: 'Para birimi',
                  },
                  {
                    kolonId: 'fiyat',
                    ipucu: kdvDahil ? 'Fiyat (KDV dahil)' : 'Fiyat (KDV hariç)',
                  },
                  { kolonId: 'satirIskonto', ipucu: 'Bileşik iskonto', varsayilan: '0' },
                  { kolonId: 'altIskonto', varsayilan: '0' },
                  { kolonId: 'toplamKdv', ipucu: 'KDV (%)', varsayilan: '20' },
                  { kolonId: 'etiketler', ipucu: 'Virgülle ayırın' },
                  { kolonId: 'durum', tip: 'toggle', varsayilan: 'true' },
                ]
          }
          satirSinifAdi={(s) => (!s.durum ? 'dg-satir--pasif' : undefined)}
          hizliGirisOnizleme={saltOkunur ? undefined : hizliGirisOnizleme}
          hizliGirisApiRef={hizliGirisApiRef}
          gridApiRef={gridApiRef}
          onHizliGirisEnter={
            saltOkunur
              ? undefined
              : ({ alanId, degerler, engelle }: HizliGirisEnterBaglami) => {
                  if (!URUN_ARAMA_ALANLARI.includes(alanId as (typeof URUN_ARAMA_ALANLARI)[number])) return;
                  if (!yuzdeAramaModu(degerler.urunKoduAdi)) return;
                  engelle();
                  aramayiAc(hizliGirisUrunSorgusu(degerler, alanId));
                }
          }
          hizliGirisInputSinif={(alanId, deger) =>
            alanId === 'urunKoduAdi' && yuzdeAramaModu(deger) ? 'dg-hizli-giris-girdi--arama' : undefined
          }
          onHizliGiris={
            saltOkunur
              ? undefined
              : (degerler) => {
                  const ham = degerler.urunKoduAdi?.trim();
                  if (!ham) return;
                  if (katalogDisiMi(ham)) {
                    // false → hızlı giriş satırı temizlenmez, vazgeçilirse yazılan metin kalır
                    hizliStokAc(ham, degerler, 'soru');
                    return false;
                  }
                  hizliGirisSatirEkle(degerler, katalog);
                }
          }
          varsayilanGizliKolonlar={VARSAYILAN_GIZLI}
          bosMesaj="Satır yok. Stoklardan ürün ekleyin."
          kdvDahil={kdvDahil}
          kdvDahilGoster={!saltOkunur}
          onKdvDahilDegistir={kdvModuDegistir}
          onSatirlarDegistir={saltOkunur ? undefined : setSatirlar}
          onSecimDegistir={(ids) => {
            seciliSatirIdleriRef.current = ids;
            setSeciliSatirSayisi(ids.length);
          }}
          onSatirGuncelle={(s) => satirHesapla(s, kdvDahil)}
          satirPanelModu="cubuk"
          satirDuzenlePaneli={
            saltOkunur
              ? undefined
              : (satir, onKaydet, onKapat) => (
                  <SatirDuzenlePanel
                    satir={satir}
                    kdvDahil={kdvDahil}
                    onKaydet={(g) => onKaydet(satirHesapla(g, kdvDahil))}
                    onKapat={onKapat}
                  />
                )
          }
        />
      </UrunAramaSlayt>
          </>
        }
        alt={
      <section className="fatura-alt-finans" aria-label="Belge toplamı ve iskontolar">
        <button
          type="button"
          className={`fatura-alt-finans-baslik${finansDetayAcik ? ' fatura-alt-finans-baslik--acik' : ''}`}
          aria-expanded={finansDetayAcik}
          aria-controls="fatura-alt-finans-govde"
          onClick={() => setFinansDetayAcik((v) => !v)}
        >
          <span className="fatura-alt-finans-baslik-metin">
            <strong>Belge toplamı</strong>
            <span className="fatura-alt-finans-ozet-mini">
              Genel {para(toplamlar.genelToplam)}
              {toplamlar.iskontoToplam > 0 ? ` · İsk. ${para(toplamlar.iskontoToplam)}` : ''}
            </span>
          </span>
          <span className={`fatura-ust-ok fatura-alt-finans-ok${finansDetayAcik ? ' fatura-ust-ok--acik' : ''}`} aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        {finansDetayAcik ? (
          <div id="fatura-alt-finans-govde" className="fatura-alt-finans-govde">
            <div className="fatura-alt-isk-blok">
              <div className="fatura-alt-isk-grup">
                {[0, 1, 2].map((i) => (
                  <label key={`tut-${i}`} className="fatura-alt-isk-satir">
                    <span>{i + 1}. Alt İskonto Tutarı</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="fatura-isk-girdi"
                      disabled={saltOkunur}
                      value={
                        belgeIskontoTutarlari[i]
                          ? String(belgeIskontoTutarlari[i]).replace('.', ',')
                          : ''
                      }
                      onChange={(e) => tutarsalIskontoYaz(i, e.target.value)}
                      aria-label={`${i + 1}. alt iskonto tutarı`}
                    />
                  </label>
                ))}
              </div>
              <div className="fatura-alt-isk-grup">
                {[0, 1, 2].map((i) => (
                  <label key={`oran-${i}`} className="fatura-alt-isk-satir">
                    <span>{i + 1}. Alt İskonto %</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="fatura-isk-girdi"
                      disabled={saltOkunur}
                      value={
                        belgeIskontolari[i] ? String(belgeIskontolari[i]).replace('.', ',') : ''
                      }
                      onChange={(e) => oransalIskontoYaz(i, e.target.value)}
                      aria-label={`${i + 1}. alt iskonto yüzde`}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="fatura-ozet-mini fatura-ozet-mini--belge">
              <div>
                <span>Tutar</span>
                <strong>{para(toplamlar.tutar)}</strong>
              </div>
              <div>
                <span>Toplam İskonto</span>
                <strong>
                  {toplamlar.iskontoToplam > 0 ? para(toplamlar.iskontoToplam) : ''}
                </strong>
              </div>
              <div>
                <span>AraToplam</span>
                <strong>{para(toplamlar.araToplam)}</strong>
              </div>
              <div>
                <span>KDV</span>
                <strong>{para(toplamlar.kdvToplam)}</strong>
              </div>
              <div className="fatura-ozet-mini--vurgu fatura-ozet-mini--genel">
                <span>Genel Toplam</span>
                <strong>{para(toplamlar.genelToplam)}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </section>
        }
      />

      <FaturaCariBulModal
        acik={cariBulAcik}
        cariler={filtrelenmisCariler}
        onKapat={() => setCariBulAcik(false)}
        onSec={(id) => {
          setCariId(id);
          setCariBulAcik(false);
        }}
      />

      <HizliStokEkleModal
        acik={hizliStokAranan !== null}
        aranan={hizliStokAranan ?? ''}
        yon={yon}
        depoId={depoId || null}
        depoAdi={seciliDepo?.depoAdi ?? ''}
        baslangicModu={hizliStokModu}
        onKapat={() => {
          hizliStokDegerleriRef.current = {};
          setHizliStokAranan(null);
        }}
        onEklendi={(urun) => void hizliStokEklendi(urun)}
      />
      <StokEksikUyariModal
        acik={stokEksikleri.length > 0}
        eksikler={stokEksikleri}
        depoAdi={seciliDepo?.depoAdi ?? ''}
        islemde={kaydediliyor}
        onKapat={() => setStokEksikleri([])}
        onStokEkle={(satirlar) => void stokTamamlaVeKaydet(satirlar)}
        onEksiyeDevam={() => void eksiyeDusurVeKaydet()}
      />
      <SilmeOnayModal
        acik={Boolean(silOnayId)}
        onKapat={() => setSilOnayId(null)}
        onOnayla={() => void sil()}
        baslik="Belgeyi silmek istiyor musunuz?"
        hedefMetin={
          (silOnayId && liste.find((b) => b.id === silOnayId)?.belgeNo) || belgeNo || ''
        }
        ariaLabel="Belge silme onayı"
      />
    </div>
  );
}
