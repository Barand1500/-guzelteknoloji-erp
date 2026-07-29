import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import type { DataGridApi, HizliGirisApi, HizliGirisEnterBaglami } from '@/admin/ortak/datagrid/types';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { DatagridSagTikMenu, type SatirEkleKonumu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { subeleriGetir, depolariGetir, kasalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import type { AdminDepo, AdminKasa, AdminSube } from '@/admin/baslat-menusu/tanimlar/tipler';
import { bankaAnlasmalariGetir } from '@/admin/baslat-menusu/erp/banka-anlasmalari/api';
import type { AdminBankaAnlasma } from '@/admin/baslat-menusu/erp/banka-anlasmalari/tipler';
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
import {
  hizliGirisUrunSorgusu,
  urunleriAra,
  yuzdeAramaModu,
  type UrunKaydi,
  URUN_ARAMA_ALANLARI,
} from '@/admin/baslat-menusu/datagrid/demo/urunAramaYardimci';
import { hucrePanoyaMetni } from '@/admin/baslat-menusu/datagrid/demo/sagTikYardimci';
import {
  belgeDurumEtiketi,
  belgeTurEtiketi,
  bugunIso,
  cariTipiBelgeyeUygunMu,
  satirToplamlari,
  type BelgeKayit,
  type BelgeTur,
  type BelgeYon,
  type OdemeKanali,
  type StokBakiyeSatir,
} from './tipler';
import {
  belgeGuncelle,
  belgeIptal,
  belgeOlustur,
  belgeOnayla,
  belgeSil,
  belgedenAktar,
  belgelerGetir,
  cariBakiyeAl,
  iadeTaslagiOlustur,
  odemeEkle,
  odemeleriGetir,
  seriOner,
  stokBakiyeleriGetir,
} from './api';
import { stokUrunKataloguGetir } from './urunKatalogAdapter';
import { CariOutlinedAramaAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAramaAcilir';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { CariEkstreModal } from './CariEkstreModal';
import { FaturaCariBulModal } from './FaturaCariBulModal';
import { FaturaEskiBelgelerModal } from './FaturaEskiBelgelerModal';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';
import {
  OtOutlinedAcilir,
  OtOutlinedAlan,
  OtOutlinedGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { TarihSecici } from '@/admin/ortak/TarihSecici';
import { belgeBaslatOkuVeTemizle } from './belgeBaslat';
import {
  BELGE_NEVILERI_GUNCELLENDI,
  belgeNeviBul,
  belgeNeviFormSecenekleri,
  yonIcinVarsayilanBelgeNevi,
  SABIT_BELGE_NEVI_SATIS,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import '@/admin/baslat-menusu/ozel-tanimlar/ozel-tanimlar.css';
import './fatura.css';

const VARSAYILAN_GIZLI = ['etiketler', 'kayit', 'guncelleme'];
const KOLON_GENISLIK_SURUMU = 7;
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

function tarihTrGoster(iso: string) {
  if (!iso) return '—';
  const [y, m, g] = iso.split('-');
  return `${g}.${m}.${y}`;
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

  const [gorunum, setGorunum] = useState<Gorunum>('liste');
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
  const [cariBulAcik, setCariBulAcik] = useState(false);
  const [ekstreAcik, setEkstreAcik] = useState(false);
  const [eskiBelgelerAcik, setEskiBelgelerAcik] = useState(false);
  const [aciklama, setAciklama] = useState('');
  const [subeId, setSubeId] = useState('');
  const [depoId, setDepoId] = useState('');
  const [cariId, setCariId] = useState('');
  const [kaynakBelgeId, setKaynakBelgeId] = useState<string | null>(null);
  const [kaynakBelgeNo, setKaynakBelgeNo] = useState('');
  const [cariBorc, setCariBorc] = useState(0);
  const [cariAlacak, setCariAlacak] = useState(0);
  const [odenenTutar, setOdenenTutar] = useState(0);

  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [bankalar, setBankalar] = useState<AdminBankaAnlasma[]>([]);
  const [cariler, setCariler] = useState<AdminCari[]>([]);
  const [durum, setDurum] = useState<BelgeKayit['durum']>('TASLAK');
  const [satirlar, setSatirlar] = useState<SiparisSatiri[]>([]);
  const [kdvDahil, setKdvDahil] = useState(true);
  const [katalog, setKatalog] = useState<UrunKaydi[]>([]);
  const [bakiyeler, setBakiyeler] = useState<StokBakiyeSatir[]>([]);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silOnayId, setSilOnayId] = useState<string | null>(null);

  const [odemeKanal, setOdemeKanal] = useState<OdemeKanali>('KASA');
  const [odemeTutar, setOdemeTutar] = useState('');
  const [odemeKasaId, setOdemeKasaId] = useState('');
  const [odemeBankaId, setOdemeBankaId] = useState('');
  const [odemeListe, setOdemeListe] = useState<Awaited<ReturnType<typeof odemeleriGetir>>>([]);

  const [slaytMod, setSlaytMod] = useState<'tablo' | 'arama'>('tablo');
  const [aramaSorgusu, setAramaSorgusu] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState<UrunKaydi[]>([]);
  const [seciliIndeks, setSeciliIndeks] = useState(0);
  const [seciliSatirSayisi, setSeciliSatirSayisi] = useState(0);
  const [satirEkleBaglam, setSatirEkleBaglam] = useState<{ satirId: string; konum: SatirEkleKonumu } | null>(null);
  const seciliSatirIdleriRef = useRef<string[]>([]);
  const hizliGirisApiRef = useRef<HizliGirisApi | null>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);

  const kolonlar = useMemo(() => siparisKolonlari(kdvDahil), [kdvDahil]);
  const saltOkunur = durum !== 'TASLAK';
  const seciliSube = useMemo(() => subeler.find((s) => s.id === subeId) ?? null, [subeler, subeId]);
  const seciliDepo = useMemo(() => depolar.find((d) => d.id === depoId) ?? null, [depolar, depoId]);
  const seciliCari = useMemo(() => cariler.find((c) => c.id === cariId) ?? null, [cariler, cariId]);
  const filtrelenmisCariler = useMemo(() => {
    const uygun = cariler.filter((c) => cariTipiBelgeyeUygunMu(yon, c.cariTipi));
    return uygun.length > 0 ? uygun : cariler;
  }, [cariler, yon]);
  const subeDepolari = useMemo(
    () => depolar.filter((d) => !subeId || d.subeId === subeId),
    [depolar, subeId]
  );
  const subeKasalar = useMemo(
    () => kasalar.filter((k) => !subeId || k.subeId === subeId),
    [kasalar, subeId]
  );
  const turSecenekleri = useMemo(
    () => TURLER.map((t) => ({ value: t, label: belgeTurEtiketi(t) })),
    []
  );
  const neviSecenekleri = useMemo(() => {
    void neviSurumu;
    return belgeNeviFormSecenekleri(true).map((n) => ({ value: n.value, label: n.label }));
  }, [neviSurumu]);
  const subeSecenekleri = useMemo(
    () => subeler.map((s) => ({ value: s.id, label: `${s.subeKodu} — ${s.subeAdi}` })),
    [subeler]
  );
  const depoSecenekleri = useMemo(
    () => subeDepolari.map((d) => ({ value: d.id, label: `${d.depoKodu} — ${d.depoAdi}` })),
    [subeDepolari]
  );
  const cariSecenekleri = useMemo(
    () =>
      filtrelenmisCariler.map((c) => ({
        value: c.id,
        label: `${c.cariKodu} — ${c.cariAdi || c.unvan} (${c.cariTipi})`,
      })),
    [filtrelenmisCariler]
  );
  const kasaSecenekleri = useMemo(
    () => subeKasalar.map((k) => ({ value: k.id, label: `${k.kasaKodu} — ${k.kasaAdi}` })),
    [subeKasalar]
  );
  const bankaSecenekleri = useMemo(
    () => bankalar.map((b) => ({ value: b.id, label: `${b.hesapKodu} — ${b.hesapIsmi}` })),
    [bankalar]
  );
  const odemeKanalSecenekleri = useMemo(
    () =>
      [
        { value: 'KASA', label: 'Kasa' },
        { value: 'BANKA', label: 'Banka' },
      ] as const,
    []
  );

  const toplamlar = useMemo(
    () => satirToplamlari(satirlar.map((s) => satirHesapla(s, kdvDahil))),
    [satirlar, kdvDahil]
  );
  const gorunurSatirlar = useMemo(
    () => satirlar.map((s) => satirHesapla(s, kdvDahil)),
    [satirlar, kdvDahil]
  );

  const cariBakiye = useMemo(() => {
    if (!seciliCari?.cariKodu) return null;
    return cariBakiyeAl(seciliCari.cariKodu);
  }, [seciliCari, liste, odemeListe, durum]);

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
      const [belgeler, cariListe, subeListe, depoListe, kasaListe, bankaListe] = await Promise.all([
        sabitYon ? belgelerGetir(sabitYon) : belgelerGetir(null),
        carileriGetir(),
        subeleriGetir(),
        depolariGetir(),
        kasalariGetir(),
        Promise.resolve(bankaAnlasmalariGetir()),
      ]);
      setListe(belgeler);
      setCariler(cariListe.filter((c) => c.aktif));
      setSubeler(subeListe.filter((s) => s.aktif));
      setDepolar(depoListe.filter((d) => d.aktif));
      setKasalar(kasaListe.filter((k) => k.aktif));
      setBankalar(bankaListe.filter((b) => b.aktif !== false));
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
      setAktifId(null);
      setTur(hedefTur);
      setTarih(bugunIso());
      setVadeTarihi('');
      setVadeModu('CARI');
      setAciklama('');
      setSubeId(sube?.id ?? '');
      setDepoId(depo?.id ?? '');
      setCariId(onSeciliCariId ?? '');
      setKaynakBelgeId(null);
      setKaynakBelgeNo('');
      setCariBorc(0);
      setCariAlacak(0);
      setOdenenTutar(0);
      setDurum('TASLAK');
      setSatirlar([]);
      setKdvDahil(true);
      setOdemeListe([]);
      setSeciliSatirSayisi(0);
      seciliSatirIdleriRef.current = [];
      numarayiYenile(hedefTur, sube);
    },
    [subeler, depolar, numarayiYenile]
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
    setSubeId(b.subeId ?? '');
    setDepoId(b.depoId ?? '');
    setCariId(b.cariId ?? '');
    setKaynakBelgeId(b.kaynakBelgeId);
    setKaynakBelgeNo(b.kaynakBelgeNo);
    setCariBorc(b.cariBorc);
    setCariAlacak(b.cariAlacak);
    setOdenenTutar(b.odenenTutar);
    setDurum(b.durum);
    setKdvDahil(b.kdvDahil !== false);
    setSatirlar(Array.isArray(b.satirlar) ? b.satirlar : []);
    setGorunum('form');
    setOdemeListe(await odemeleriGetir(b.id));
  }, []);

  const baslatIslendiRef = useRef(false);
  useEffect(() => {
    if (listeYukleniyor || baslatIslendiRef.current) return;
    const baslat = belgeBaslatOkuVeTemizle();
    if (!baslat) {
      baslatIslendiRef.current = true;
      return;
    }
    baslatIslendiRef.current = true;
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
        }
      })();
      return;
    }
    if (baslat.yeni || baslat.cariId) {
      yeniBelgeAc(undefined, baslat.cariId, baslat.belgeNeviId);
    }
  }, [listeYukleniyor, liste, belgeAc, yeniBelgeAc, logMesajiAyarla]);

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
      kdvDahil,
      ...toplamlar,
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
      kdvDahil,
      toplamlar,
      kaynakBelgeId,
      kaynakBelgeNo,
      gorunurSatirlar,
    ]
  );

  const kaydet = useCallback(async (): Promise<BelgeKayit | null> => {
    if (saltOkunur) return null;
    if (!belgeNo.trim()) {
      logMesajiAyarla('Belge no gerekli');
      return null;
    }
    setKaydediliyor(true);
    try {
      const kayit = aktifId ? await belgeGuncelle(aktifId, girdiAl()) : await belgeOlustur(girdiAl());
      setAktifId(kayit.id);
      setDurum(kayit.durum);
      setCariBorc(kayit.cariBorc);
      setCariAlacak(kayit.cariAlacak);
      setBelgeNo(kayit.belgeNo);
      setSeri(kayit.seri);
      setSiraNo(kayit.siraNo);
      logMesajiAyarla('Taslak kaydedildi (mock)');
      await listeyiYukle();
      return kayit;
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Kayıt başarısız');
      return null;
    } finally {
      setKaydediliyor(false);
    }
  }, [saltOkunur, belgeNo, aktifId, girdiAl, logMesajiAyarla, listeyiYukle]);

  const onayla = useCallback(async () => {
    if (!duzenlemeVar) {
      logMesajiAyarla('Düzenleme yetkisi yok');
      return;
    }
    const kayit = await kaydet();
    if (!kayit) return;
    setKaydediliyor(true);
    try {
      const onayli = await belgeOnayla(kayit.id);
      setDurum(onayli.durum);
      setCariBorc(onayli.cariBorc);
      setCariAlacak(onayli.cariAlacak);
      logMesajiAyarla('Onaylandı — stok/cari hareketi yazıldı (mock)');
      await listeyiYukle();
      await katalogYenile(onayli.depoId ?? depoId);
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Onay başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [duzenlemeVar, kaydet, logMesajiAyarla, listeyiYukle, katalogYenile, depoId]);
  void onayla;

  const iptalEt = useCallback(async () => {
    if (!aktifId || !duzenlemeVar) return;
    setKaydediliyor(true);
    try {
      const iptal = await belgeIptal(aktifId);
      setDurum(iptal.durum);
      logMesajiAyarla('Belge iptal edildi — hareketler ters çevrildi');
      await listeyiYukle();
      await katalogYenile(depoId);
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'İptal başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [aktifId, duzenlemeVar, logMesajiAyarla, listeyiYukle, katalogYenile, depoId]);

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

  const odemeKaydet = useCallback(async () => {
    if (!aktifId) return;
    const tutar = Number(String(odemeTutar).replace(',', '.'));
    try {
      const kasa = subeKasalar.find((k) => k.id === odemeKasaId);
      const banka = bankalar.find((b) => b.id === odemeBankaId);
      await odemeEkle({
        belgeId: aktifId,
        tutar,
        kanal: odemeKanal,
        kasaId: odemeKanal === 'KASA' ? odemeKasaId : null,
        kasaKodu: kasa?.kasaKodu ?? '',
        bankaId: odemeKanal === 'BANKA' ? odemeBankaId : null,
        bankaKodu: banka?.hesapKodu ?? '',
        aciklama: yon === 'SATIS' ? 'Tahsilat' : 'Ödeme',
      });
      const guncelOdemeler = await odemeleriGetir(aktifId);
      setOdemeListe(guncelOdemeler);
      const odendi = guncelOdemeler.reduce((t, o) => t + o.tutar, 0);
      setOdenenTutar(odendi);
      setOdemeTutar('');
      logMesajiAyarla('Ödeme kaydedildi (mock kasa/banka)');
      await listeyiYukle();
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Ödeme başarısız');
    }
  }, [
    aktifId,
    odemeTutar,
    odemeKanal,
    odemeKasaId,
    odemeBankaId,
    subeKasalar,
    bankalar,
    yon,
    logMesajiAyarla,
    listeyiYukle,
  ]);

  const sil = useCallback(async () => {
    if (!silOnayId || !silmeVar) return;
    try {
      await belgeSil(silOnayId);
      setSilOnayId(null);
      if (aktifId === silOnayId) {
        setGorunum('liste');
        formuSifirla();
      }
      logMesajiAyarla('Belge silindi');
      await listeyiYukle();
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Silme başarısız');
    }
  }, [silOnayId, silmeVar, aktifId, formuSifirla, logMesajiAyarla, listeyiYukle]);

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

  const aramayiKapat = useCallback(() => {
    setSlaytMod('tablo');
    setAramaSorgusu('');
    setAramaSonuclari([]);
    setSeciliIndeks(0);
    setSatirEkleBaglam(null);
  }, []);

  const urunSecVeEkle = useCallback(
    (urun: UrunKaydi) => {
      if (saltOkunur) return;
      const yeni = yeniSiparisSatiriOlustur(
        {
          urunKoduAdi: urun.sku,
          miktar: '1',
          fiyat: String(urun.fiyat),
          toplamKdv: String(urun.kdv),
          birim: urun.birim,
        },
        kdvDahil,
        katalog
      );
      let eklenenId = yeni.id;
      if (satirEkleBaglam) {
        const { satirId, konum } = satirEkleBaglam;
        setSatirlar((onceki) => {
          const idx = onceki.findIndex((s) => s.id === satirId);
          if (idx < 0) return [yeni, ...onceki];
          const listeYeni = [...onceki];
          listeYeni.splice(konum === 'ust' ? idx : idx + 1, 0, yeni);
          return listeYeni;
        });
        setSatirEkleBaglam(null);
      } else {
        const mevcut = hizliGirisApiRef.current?.degerler ?? {};
        const hizli = yeniSiparisSatiriOlustur(
          {
            ...mevcut,
            urunKoduAdi: urun.sku,
            fiyat: mevcut.fiyat || String(urun.fiyat),
            toplamKdv: mevcut.toplamKdv || String(urun.kdv),
            birim: mevcut.birim || urun.birim,
          },
          kdvDahil,
          katalog
        );
        eklenenId = hizli.id;
        setSatirlar((onceki) => [hizli, ...onceki]);
        hizliGirisApiRef.current?.sifirla();
      }
      aramayiKapat();
      requestAnimationFrame(() => gridApiRef.current?.odakAyarla(eklenenId, 'urunKoduAdi'));
    },
    [saltOkunur, kdvDahil, katalog, satirEkleBaglam, aramayiKapat]
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
      <div className={sayfaSinif}>
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
                  <th>Durum</th>
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
                    <td>
                      <span className={`fatura-durum fatura-durum--${b.durum.toLowerCase()}`}>
                        {belgeDurumEtiketi(b.durum)}
                      </span>
                    </td>
                    <td className="fatura-sayi">{para(b.cariBorc)}</td>
                    <td className="fatura-sayi">{para(b.cariAlacak)}</td>
                    <td className="fatura-sayi">{para(b.genelToplam)}</td>
                    <td className="fatura-liste-aksiyon">
                      <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => void belgeAc(b)}>
                        Aç
                      </button>
                      {silmeVar && b.durum === 'TASLAK' ? (
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
            <table className="fatura-liste-tablo">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Depo</th>
                  <th>Miktar</th>
                </tr>
              </thead>
              <tbody>
                {bakiyeler.slice(0, 20).map((s) => (
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

  const aktifBelgeKalan = aktifId
    ? Math.max(0, Math.round((toplamlar.genelToplam - odenenTutar) * 100) / 100)
    : 0;

  const formBaslik = belgeNo || (aktifId ? 'Belge düzenle' : `Yeni ${belgeTurEtiketi(tur)}`);

  return (
    <div ref={sayfaRef} className={`${sayfaSinif} dg-demo-sayfa dg-demo-sag-tik-alan`}>
      <div className="fatura-form-ust">
        <div className="fatura-form-ust-sol">
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            onClick={() => {
              setGorunum('liste');
              void listeyiYukle();
            }}
          >
            ← Liste
          </button>
          <div className="fatura-form-baslik-wrap">
            <h2 className="fatura-baslik">{baslik}</h2>
            <p className="fatura-alt fatura-form-alt">
              {formBaslik}
              {seciliCari ? ` · ${seciliCari.cariKodu} — ${seciliCari.cariAdi || seciliCari.unvan}` : ''}
            </p>
          </div>
        </div>
        <div className="fatura-form-ust-sag">
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            disabled={saltOkunur}
            onClick={() => setCariBulAcik(true)}
          >
            Cari bul
          </button>
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            disabled={!seciliCari}
            onClick={() => setEkstreAcik(true)}
          >
            Cari ekstre
          </button>
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            disabled={!seciliCari}
            onClick={() => setEskiBelgelerAcik(true)}
          >
            Eski faturalar
          </button>
          {durum === 'ONAYLI' && duzenlemeVar ? (
            <>
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
                  İade oluştur
                </button>
              ) : null}
              <button type="button" className="fatura-btn fatura-btn--tehlike" onClick={() => void iptalEt()}>
                İptal et
              </button>
            </>
          ) : null}
        </div>
      </div>

      <section className="fatura-baslik-form fatura-baslik-form--outlined fatura-genel-kompakt">
        <div className="fatura-genel-3col">
          <div className="fatura-genel-col fatura-genel-col--cari">
            <p className="fatura-sutun-etiket">Cari bilgileri</p>
            <CariOutlinedAramaAcilir
              etiket={yon === 'SATIS' ? 'Müşteri' : 'Tedarikçi'}
              deger={cariId}
              disabled={saltOkunur}
              secenekler={cariSecenekleri}
              bosMetin="Cari seçin…"
              aramaPlaceholder="Kod veya unvan ara…"
              kutuIciArama
              onChange={setCariId}
            />
            {seciliCari ? (
              <div className="fatura-cari-ozet">
                <div className="fatura-cari-ozet-kod">{seciliCari.cariKodu}</div>
                <strong>{seciliCari.unvan || seciliCari.cariAdi || '—'}</strong>
                <span>
                  {[seciliCari.vergiDairesi, seciliCari.vergiNo].filter(Boolean).join(' · ') || 'Vergi bilgisi yok'}
                </span>
                {cariBakiye ? (
                  <span className={cariBakiye.bakiye < 0 ? 'fatura-sayi--eksi' : 'fatura-sayi--arti'}>
                    Bakiye {para(cariBakiye.bakiye)}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="fatura-cari-ozet-bos">Cari seçilmedi</p>
            )}
          </div>

          <div className="fatura-genel-col fatura-belge-grid">
            <p className="fatura-sutun-etiket fatura-belge-grid--tam">Belge bilgileri</p>
            {!saltOkunur ? (
              <OtOutlinedAcilir
                etiket="Belge Nevi"
                deger={belgeNeviId}
                secenekler={neviSecenekleri}
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
              <div className="fatura-salt-alan">
                <span>Belge Nevi</span>
                <strong>{aktifNevi.adi}</strong>
              </div>
            )}
            {!saltOkunur ? (
              <OtOutlinedAcilir
                etiket="Belge türü"
                deger={tur}
                secenekler={turSecenekleri}
                onChange={(v) => {
                  const t = v as BelgeTur;
                  setTur(t);
                  numarayiYenile(t, seciliSube);
                }}
              />
            ) : (
              <div className="fatura-salt-alan">
                <span>Belge türü</span>
                <strong>{belgeTurEtiketi(tur)}</strong>
              </div>
            )}
            <CariOutlinedGirdi
              etiket="Belge No"
              deger={belgeNo}
              disabled={saltOkunur}
              onChange={setBelgeNo}
              odakPlaceholder="Seri + sıra"
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
            <OtOutlinedAlan etiket="Tarih" zorunlu disabled={saltOkunur} className="fatura-outlined-tarih">
              <TarihSecici
                deger={tarih}
                disabled={saltOkunur}
                ariaLabel="Belge tarihi"
                varyant="alan"
                onChange={setTarih}
              />
            </OtOutlinedAlan>

            <OtOutlinedAlan etiket="Vade" className="fatura-vade-alan fatura-belge-grid--vade">
              <div className="fatura-vade-grup">
                <FormAcilirSecim
                  value={vadeModu}
                  onChange={(v) => setVadeModu(v as VadeModu)}
                  secenekler={[
                    { value: 'CARI', label: `Cari vadesi (${VARSAYILAN_CARI_VADE_GUN} gün)` },
                    { value: 'MANUEL', label: 'Manuel tarih' },
                  ]}
                  disabled={saltOkunur}
                  aranabilir={false}
                  bosEtiket="Vade tipi"
                  className="fatura-vade-grup-mod"
                  aria-label="Vade tipi"
                />
                {vadeModu === 'MANUEL' ? (
                  <TarihSecici
                    deger={vadeTarihi}
                    min={tarih || undefined}
                    disabled={saltOkunur}
                    ariaLabel="Vade tarihi"
                    varyant="alan"
                    className="fatura-vade-grup-tarih"
                    onChange={setVadeTarihi}
                  />
                ) : (
                  <div className="fatura-vade-grup-tarih fatura-vade-grup-tarih--salt" aria-live="polite">
                    {tarih ? tarihTrGoster(efektifVadeTarihi ?? '') : '—'}
                  </div>
                )}
              </div>
            </OtOutlinedAlan>

            <OtOutlinedAcilir
              etiket="Şube"
              deger={subeId}
              disabled={saltOkunur}
              secenekler={subeSecenekleri}
              bosEtiket="Şube seçin…"
              onChange={(id) => {
                setSubeId(id);
                const sube = subeler.find((s) => s.id === id) ?? null;
                const depo = depolar.find((d) => d.subeId === id);
                setDepoId(depo?.id ?? '');
                if (!saltOkunur) numarayiYenile(tur, sube);
              }}
            />
            <OtOutlinedAcilir
              etiket="Depo"
              deger={depoId}
              disabled={saltOkunur}
              secenekler={depoSecenekleri}
              bosEtiket="Depo seçin…"
              onChange={setDepoId}
            />
            <OtOutlinedGirdi
              etiket="Açıklama"
              deger={aciklama}
              disabled={saltOkunur}
              onChange={setAciklama}
              odakPlaceholder="İsteğe bağlı not"
              className="fatura-belge-grid--cift"
            />
          </div>

          <div className="fatura-genel-col fatura-genel-col--ozet">
            <p className="fatura-sutun-etiket">Toplamlar</p>
            <div className="fatura-ozet-mini">
              <div>
                <span>Ara toplam</span>
                <strong>{para(toplamlar.araToplam)}</strong>
              </div>
              <div>
                <span>KDV</span>
                <strong>{para(toplamlar.kdvToplam)}</strong>
              </div>
              <div className="fatura-ozet-mini--vurgu">
                <span>Genel toplam</span>
                <strong>{para(toplamlar.genelToplam)}</strong>
              </div>
              <div className="fatura-ozet-mini--borc">
                <span>Cari borç</span>
                <strong>
                  {para(cariBorc || (tur === 'FATURA' && yon === 'SATIS' ? toplamlar.genelToplam : 0))}
                </strong>
              </div>
              <div className="fatura-ozet-mini--alacak">
                <span>Cari alacak</span>
                <strong>
                  {para(cariAlacak || (tur === 'FATURA' && yon === 'ALIS' ? toplamlar.genelToplam : 0))}
                </strong>
              </div>
              {durum === 'ONAYLI' ? (
                <div>
                  <span>Kalan</span>
                  <strong>{para(aktifBelgeKalan)}</strong>
                </div>
              ) : null}
            </div>
            {!saltOkunur ? (
              <button
                type="button"
                className="fatura-btn fatura-btn--ghost fatura-kdv-tus"
                onClick={() => kdvModuDegistir(!kdvDahil)}
              >
                KDV: {kdvDahil ? 'Dahil' : 'Hariç'}
              </button>
            ) : (
              <span className="fatura-tur-rozet fatura-kdv-tus">KDV: {kdvDahil ? 'Dahil' : 'Hariç'}</span>
            )}
          </div>
        </div>
      </section>

      {!saltOkunur ? (
        <div className="fatura-form-kaydet-bar">
          <button
            type="button"
            className="fatura-btn fatura-btn--birincil"
            disabled={kaydediliyor}
            onClick={() => void kaydet()}
          >
            Kaydet
          </button>
        </div>
      ) : null}

      {kaynakBelgeNo ? (
        <p className="fatura-zincir">
          Zincir kaynağı: <strong>{kaynakBelgeNo}</strong>
        </p>
      ) : null}

      {durum === 'ONAYLI' && (tur === 'FATURA' || tur === 'IADE') ? (
        <div className="fatura-odeme-kutu">
          <h3 className="fatura-bolum-baslik">
            {yon === 'SATIS' ? 'Tahsilat (kasa / banka)' : 'Ödeme (kasa / banka)'}
          </h3>
          <div className="fatura-odeme-form fatura-baslik-grid">
            <OtOutlinedAcilir
              etiket="Kanal"
              deger={odemeKanal}
              secenekler={odemeKanalSecenekleri}
              onChange={(v) => setOdemeKanal(v as OdemeKanali)}
            />
            {odemeKanal === 'KASA' ? (
              <OtOutlinedAcilir
                etiket="Kasa"
                deger={odemeKasaId}
                secenekler={kasaSecenekleri}
                bosEtiket="Kasa seçin…"
                onChange={setOdemeKasaId}
              />
            ) : (
              <OtOutlinedAcilir
                etiket="Banka hesabı"
                deger={odemeBankaId}
                secenekler={bankaSecenekleri}
                bosEtiket="Hesap seçin…"
                onChange={setOdemeBankaId}
              />
            )}
            <OtOutlinedGirdi
              etiket="Tutar"
              deger={odemeTutar}
              onChange={setOdemeTutar}
              odakPlaceholder={String(aktifBelgeKalan)}
            />
            <div className="fatura-odeme-kaydet">
              <button type="button" className="fatura-btn fatura-btn--birincil" onClick={() => void odemeKaydet()}>
                Kaydet
              </button>
            </div>
          </div>
          {odemeListe.length > 0 ? (
            <ul className="fatura-odeme-liste">
              {odemeListe.map((o) => (
                <li key={o.id}>
                  {o.kayitTarihi.slice(0, 10)} · {o.kanal} · {para(o.tutar)} · {o.kasaKodu || o.bankaKodu}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

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
        onSec={urunSecVeEkle}
        onGeri={aramayiKapat}
      >
        <DataGrid
          tabloBaslik="Hareketler"
          tabloAltBaslik="Stok bakiyesi ürün aramada · negatif stok satışta engellenir"
          kolonlar={kolonlar}
          satirlar={gorunurSatirlar}
          depolamaAnahtari={`gt_fatura_${modulId}_v3`}
          kolonGenislikSurumu={KOLON_GENISLIK_SURUMU}
          hizliGirisKolonlari={
            saltOkunur
              ? undefined
              : [
                  {
                    kolonId: 'urunKoduAdi',
                    placeholder: 'Ürün Adı veya Kodu…',
                    ipucu: '% İle Ara, ENTER ile Ekle',
                  },
                  { kolonId: 'miktar', ipucu: 'Miktar ifadesi', varsayilan: '1' },
                  { kolonId: 'birim', tip: 'secim', varsayilan: 'ADET', secenekler: birimSecenekleri() },
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
                  if (!degerler.urunKoduAdi?.trim()) return;
                  const yeni = yeniSiparisSatiriOlustur(degerler, kdvDahil, katalog);
                  setSatirlar((onceki) => [yeni, ...onceki]);
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

      <FaturaCariBulModal
        acik={cariBulAcik}
        cariler={filtrelenmisCariler}
        onKapat={() => setCariBulAcik(false)}
        onSec={setCariId}
      />
      <CariEkstreModal acik={ekstreAcik} cari={seciliCari} onKapat={() => setEkstreAcik(false)} />
      <FaturaEskiBelgelerModal
        acik={eskiBelgelerAcik}
        cari={seciliCari}
        belgeler={liste}
        aktifBelgeId={aktifId}
        onKapat={() => setEskiBelgelerAcik(false)}
        onAc={(b) => void belgeAc(b)}
      />
    </div>
  );
}
