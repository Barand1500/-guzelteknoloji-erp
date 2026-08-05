import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import type { DataGridApi, HizliGirisApi, HizliGirisEnterBaglami } from '@/admin/ortak/datagrid/types';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { DatagridSagTikMenu, type SatirEkleKonumu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useAdminLogMesaji, useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import { type AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { BelgeCariAlanYonetModal } from './BelgeCariAlanYonetModal';
import { BelgeListeFiltreYonetModal } from './BelgeListeFiltreYonetModal';
import { belgeCariAlanIcerik } from './BelgeCariAlanGoster';
import {
  belgeCariAlanDuzeniOku,
  belgeCariAltDuzenId,
  belgeCariAltSatirlariBol,
  type BelgeCariAlanDuzeni,
} from './belgeCariAlanDuzeni';
import {
  LISTE_TARIH_ETIKET,
  belgeListeFiltreDuzeniOku,
  type BelgeListeFiltreDuzeni,
  type ListeTarihDonem,
  type ListeTarihDonemSecilebilir,
} from './belgeListeFiltreDuzeni';
import { subeleriGetir, depolariGetir, kasalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import type { AdminDepo, AdminKasa, AdminSube } from '@/admin/baslat-menusu/tanimlar/tipler';
import {
  satirHesapla,
  satirlariKdvModunaCevir,
  kdvHaricFiyattanDahil,
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
  belgeDurumEtiketi,
  bosBelgeIskontolari,
  bosBelgeIskontoTutarlari,
  bugunIso,
  gecerliBelgeIskontolari,
  gecerliBelgeIskontoTutarlari,
  satirToplamlari,
  type BelgeIskontoDizisi,
  type BelgeIskontoTutarsal,
  type BelgeKayit,
  type BelgeTur,
  type BelgeYon,

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
  stokEksikleriBul,
  stokGirisiEkle,
} from './api';
import { stokUrunKataloguGetir } from './urunKatalogAdapter';
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
import { cariBaslatYaz } from '@/admin/baslat-menusu/erp/cari/cariBaslat';
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

const VARSAYILAN_GIZLI = [
  'altIskonto',
  'gercekToplam',
  'etiketler',
  'kayit',
  'guncelleme',
];
const KOLON_GENISLIK_SURUMU = 9;
const VARSAYILAN_CARI_VADE_GUN = 30;

type VadeModu = 'CARI' | 'MANUEL';
type BelgeIskontoModu = 'ORAN' | 'TUTAR';

function iskontoGirdiMetni(deger: number): string {
  if (!deger) return '';
  return String(deger).replace('.', ',');
}

function iskontoSayiOku(ham: string): number {
  const n = Number(String(ham).trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

interface FaturaModuluProps {
  /** Geriye uyum — verilirse başlangıç yönü sabittir; yoksa belge nevisinden gelir */
  yon?: BelgeYon;
  modulId?: string;
  baslik?: string;
  onModulAc?: (modulId: string) => void;
}

type Gorunum = 'liste' | 'form';

function isoGun(d: Date) {
  return tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Belge.tarih (ISO) için dönem aralığı; null = filtre yok */
function listeTarihAraligi(
  donem: ListeTarihDonem,
  baslangic: string,
  bitis: string
): { min: string; max: string } | null {
  const simdi = new Date();
  const bugun = isoGun(simdi);
  const gunOnce = (n: number) => {
    const d = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
    d.setDate(d.getDate() - n);
    return isoGun(d);
  };
  const haftaPazartesi = (referans: Date) => {
    const d = new Date(referans.getFullYear(), referans.getMonth(), referans.getDate());
    const gun = d.getDay();
    const pazartesiOffset = gun === 0 ? -6 : 1 - gun;
    d.setDate(d.getDate() + pazartesiOffset);
    return d;
  };

  if (donem === 'HEPSI') return null;
  if (donem === 'BUGUN') return { min: bugun, max: bugun };
  if (donem === 'DUN') {
    const dun = gunOnce(1);
    return { min: dun, max: dun };
  }
  if (donem === 'HAFTA') {
    return { min: isoGun(haftaPazartesi(simdi)), max: bugun };
  }
  if (donem === 'GECEN_HAFTA') {
    const buPzt = haftaPazartesi(simdi);
    const gecenPzt = new Date(buPzt);
    gecenPzt.setDate(gecenPzt.getDate() - 7);
    const gecenPaz = new Date(buPzt);
    gecenPaz.setDate(gecenPaz.getDate() - 1);
    return { min: isoGun(gecenPzt), max: isoGun(gecenPaz) };
  }
  if (donem === 'AY') {
    return { min: tarihAnahtari(simdi.getFullYear(), simdi.getMonth(), 1), max: bugun };
  }
  if (donem === 'GECEN_AY') {
    const y = simdi.getMonth() === 0 ? simdi.getFullYear() - 1 : simdi.getFullYear();
    const m = simdi.getMonth() === 0 ? 11 : simdi.getMonth() - 1;
    const sonGun = new Date(y, m + 1, 0).getDate();
    return {
      min: tarihAnahtari(y, m, 1),
      max: tarihAnahtari(y, m, sonGun),
    };
  }
  if (donem === 'YIL') {
    return { min: tarihAnahtari(simdi.getFullYear(), 0, 1), max: bugun };
  }
  if (donem === 'GECEN_YIL') {
    const y = simdi.getFullYear() - 1;
    return { min: tarihAnahtari(y, 0, 1), max: tarihAnahtari(y, 11, 31) };
  }
  if (donem === 'SON_7') return { min: gunOnce(6), max: bugun };
  if (donem === 'SON_30') return { min: gunOnce(29), max: bugun };
  if (donem === 'SON_90') return { min: gunOnce(89), max: bugun };
  if (donem !== 'ARALIK') return null;

  const a = (baslangic || '').trim();
  const b = (bitis || '').trim();
  if (!a && !b) return null;
  if (a && b) return a <= b ? { min: a, max: b } : { min: b, max: a };
  if (a) return { min: a, max: a };
  return { min: b, max: b };
}

function belgeTarihUygunMu(belgeTarih: string, aralik: { min: string; max: string } | null) {
  if (!aralik) return true;
  const t = (belgeTarih || '').slice(0, 10);
  if (!t) return false;
  return t >= aralik.min && t <= aralik.max;
}

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

export function FaturaModulu({
  yon: sabitYon,
  modulId = 'belgeler',
  baslik = 'Belgeler',
  onModulAc,
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
  const [listeFiltreNeviId, setListeFiltreNeviId] = useState<string>('HEPSI');
  const [listeFiltreYon, setListeFiltreYon] = useState<BelgeYon | 'HEPSI'>('HEPSI');
  const [listeArama, setListeArama] = useState('');
  const [listeTarihDonem, setListeTarihDonem] = useState<ListeTarihDonem>('HEPSI');
  const [listeTarihBaslangic, setListeTarihBaslangic] = useState('');
  const [listeTarihBitis, setListeTarihBitis] = useState('');
  const [listeFiltreDuzeni, setListeFiltreDuzeni] = useState<BelgeListeFiltreDuzeni>(() =>
    belgeListeFiltreDuzeniOku()
  );
  const [listeFiltreYonetAcik, setListeFiltreYonetAcik] = useState(false);
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
  const [belgeIskontoModu, setBelgeIskontoModu] = useState<BelgeIskontoModu>('ORAN');
  const [belgeIskontoGirdi, setBelgeIskontoGirdi] = useState('');
  const [subeId, setSubeId] = useState('');
  const [depoId, setDepoId] = useState('');
  const [kasaId, setKasaId] = useState('');
  const [cariId, setCariId] = useState('');
  const [baslikDetayAcik, setBaslikDetayAcik] = useState(false);
  const [cariBulAcik, setCariBulAcik] = useState(false);
  const [kaynakBelgeId, setKaynakBelgeId] = useState<string | null>(null);
  const [kaynakBelgeNo, setKaynakBelgeNo] = useState('');

  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [cariler, setCariler] = useState<AdminCari[]>([]);
  const [durum, setDurum] = useState<BelgeKayit['durum']>('TASLAK');
  const [satirlar, setSatirlar] = useState<SiparisSatiri[]>([]);
  const [kdvDahil, setKdvDahil] = useState(false);
  const [katalog, setKatalog] = useState<UrunKaydi[]>([]);
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
  const [alanYonetAcik, setAlanYonetAcik] = useState(false);
  const [cariAlanDuzeni, setCariAlanDuzeni] = useState<BelgeCariAlanDuzeni>(() => belgeCariAlanDuzeniOku());
  const hizliStokDegerleriRef = useRef<Record<string, string>>({});
  const seciliSatirIdleriRef = useRef<string[]>([]);
  const hizliGirisApiRef = useRef<HizliGirisApi | null>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  /** Toplu seçimde sıradaki ürünler (ilk ürün doldurulduktan sonra kalanlar) */
  const topluUrunKuyruguRef = useRef<UrunKaydi[]>([]);
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
  const subeDepolari = useMemo(
    () => depolar.filter((d) => !subeId || d.subeId === subeId),
    [depolar, subeId]
  );
  const turSecenekleri = useMemo(() => BELGE_YON_SECENEKLERI, []);
  const neviSecenekleri = useMemo(() => {
    void neviSurumu;
    return belgeNeviFormSecenekleri(true)
      .filter((n) => n.yon === yon)
      .map((n) => ({ value: n.value, label: n.label }));
  }, [neviSurumu, yon]);
  const listeNeviSekmeleri = useMemo(() => {
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
  const toplamlar = useMemo(() => {
    const hesapli = satirlar.map((s) => satirHesapla(s, kdvDahil));
    const ham = satirToplamlari(hesapli, kdvDahil);
    const isk = belgeIskontoUygula(
      ham.araToplam,
      ham.kdvToplam,
      belgeIskontolari,
      belgeIskontoTutarlari
    );
    const iskontoToplam =
      Math.round((ham.satirIskontoToplam + isk.iskontoToplam) * 100) / 100;
    return {
      /** İskonto öncesi satır tutarları */
      tutar: ham.brutTutar,
      araToplam: isk.netAra,
      kdvToplam: isk.kdvToplam,
      /** Her iki modda da ödenecek (1200) */
      genelToplam: isk.genelToplam,
      netAra: isk.netAra,
      /** Satır + alt + belge iskontosu */
      iskontoToplam,
      iskontoTutarlari: isk.iskontoTutarlari,
    };
  }, [satirlar, kdvDahil, belgeIskontolari, belgeIskontoTutarlari]);

  const belgeIskontoModuDegistir = useCallback(
    (modu: BelgeIskontoModu) => {
      if (saltOkunur || belgeIskontoModu === modu) return;
      setBelgeIskontoModu(modu);
      setBelgeIskontoGirdi('');
      setBelgeIskontolari(bosBelgeIskontolari());
      setBelgeIskontoTutarlari(bosBelgeIskontoTutarlari());
    },
    [belgeIskontoModu, saltOkunur]
  );

  const belgeIskontoYaz = useCallback(
    (ham: string) => {
      if (saltOkunur) return;
      const temiz = ham.replace(/[^\d.,]/g, '');
      const noktaIndeks = Math.max(temiz.lastIndexOf(','), temiz.lastIndexOf('.'));
      let normal = temiz;
      if (noktaIndeks >= 0) {
        const tam = temiz.slice(0, noktaIndeks).replace(/[.,]/g, '');
        const kesir = temiz.slice(noktaIndeks + 1).replace(/[.,]/g, '').slice(0, 4);
        normal = `${tam},${kesir}`;
        if (temiz.endsWith(',') || temiz.endsWith('.')) normal = `${tam},`;
      } else {
        normal = temiz.replace(/[.,]/g, '');
      }

      let sayi = iskontoSayiOku(normal);
      if (belgeIskontoModu === 'ORAN') {
        if (sayi > 100) {
          sayi = 100;
          normal = '100';
        }
        sayi = Math.max(0, sayi);
        setBelgeIskontoGirdi(normal);
        setBelgeIskontolari([sayi, 0, 0, 0, 0, 0]);
        setBelgeIskontoTutarlari(bosBelgeIskontoTutarlari());
        return;
      }

      const maxTutar = satirToplamlari(
        satirlar.map((s) => satirHesapla(s, kdvDahil)),
        kdvDahil
      ).araToplam;
      if (sayi > maxTutar) {
        sayi = maxTutar;
        normal = iskontoGirdiMetni(maxTutar) || '0';
      }
      sayi = Math.max(0, Math.round(sayi * 100) / 100);
      setBelgeIskontoGirdi(normal);
      setBelgeIskontoTutarlari([sayi, 0, 0]);
      setBelgeIskontolari(bosBelgeIskontolari());
    },
    [belgeIskontoModu, saltOkunur, satirlar, kdvDahil]
  );

  const belgeIskontoBlur = useCallback(() => {
    if (saltOkunur) return;
    const sayi = iskontoSayiOku(belgeIskontoGirdi);
    if (belgeIskontoModu === 'ORAN') {
      const yuzde = Math.min(100, Math.max(0, sayi));
      setBelgeIskontoGirdi(iskontoGirdiMetni(yuzde));
      setBelgeIskontolari([yuzde, 0, 0, 0, 0, 0]);
      setBelgeIskontoTutarlari(bosBelgeIskontoTutarlari());
      return;
    }
    const maxTutar = satirToplamlari(
      satirlar.map((s) => satirHesapla(s, kdvDahil)),
      kdvDahil
    ).araToplam;
    const tutar = Math.min(maxTutar, Math.max(0, Math.round(sayi * 100) / 100));
    setBelgeIskontoGirdi(tutar ? sayiFormatla(tutar) : '');
    setBelgeIskontoTutarlari([tutar, 0, 0]);
    setBelgeIskontolari(bosBelgeIskontolari());
  }, [belgeIskontoGirdi, belgeIskontoModu, saltOkunur, satirlar, kdvDahil]);

  useEffect(() => {
    if (neviSecenekleri.length === 0) return;
    if (neviSecenekleri.some((n) => n.value === belgeNeviId)) return;
    setBelgeNeviId(neviSecenekleri[0]!.value);
  }, [neviSecenekleri, belgeNeviId]);

  const gorunurSatirlar = useMemo(
    () => satirlar.map((s) => satirHesapla(s, kdvDahil)),
    [satirlar, kdvDahil]
  );
  const efektifVadeTarihi = useMemo(() => {
    if (vadeModu === 'CARI' && tarih) return cariVadeTarihiHesapla(tarih);
    return vadeTarihi || null;
  }, [vadeModu, tarih, vadeTarihi]);

  const listeTarihAralik = useMemo(
    () => listeTarihAraligi(listeTarihDonem, listeTarihBaslangic, listeTarihBitis),
    [listeTarihDonem, listeTarihBaslangic, listeTarihBitis]
  );

  const filtreliListe = useMemo(() => {
    const q = listeArama.trim().toLocaleLowerCase('tr');
    return liste.filter((b) => {
      if (listeFiltreNeviId !== 'HEPSI' && b.belgeNeviId !== listeFiltreNeviId) return false;
      if (listeFiltreYon !== 'HEPSI' && b.yon !== listeFiltreYon) return false;
      if (!belgeTarihUygunMu(b.tarih, listeTarihAralik)) return false;
      if (!q) return true;
      const haystack = [
        b.belgeNo,
        b.belgeNeviAdi,
        b.cariAdi,
        b.cariKodu,
        b.subeKodu,
        b.depoKodu,
        belgeTurEtiketi(b.tur),
        b.yon === 'ALIS' ? 'giriş' : 'çıkış',
      ]
        .join(' ')
        .toLocaleLowerCase('tr');
      return haystack.includes(q);
    });
  }, [liste, listeFiltreNeviId, listeFiltreYon, listeArama, listeTarihAralik]);

  const listeOzet = useMemo(() => {
    const q = listeArama.trim().toLocaleLowerCase('tr');
    const taban = liste.filter((b) => {
      if (listeFiltreNeviId !== 'HEPSI' && b.belgeNeviId !== listeFiltreNeviId) return false;
      if (!belgeTarihUygunMu(b.tarih, listeTarihAralik)) return false;
      if (!q) return true;
      const haystack = [b.belgeNo, b.belgeNeviAdi, b.cariAdi, b.cariKodu]
        .join(' ')
        .toLocaleLowerCase('tr');
      return haystack.includes(q);
    });
    let giris = 0;
    let cikis = 0;
    let adetGiris = 0;
    let adetCikis = 0;
    for (const b of taban) {
      if (b.yon === 'ALIS') {
        giris += b.genelToplam || 0;
        adetGiris += 1;
      } else {
        cikis += b.genelToplam || 0;
        adetCikis += 1;
      }
    }
    return {
      giris: Math.round(giris * 100) / 100,
      cikis: Math.round(cikis * 100) / 100,
      genel: Math.round((giris + cikis) * 100) / 100,
      adetGiris,
      adetCikis,
      adet: adetGiris + adetCikis,
    };
  }, [liste, listeFiltreNeviId, listeArama, listeTarihAralik]);

  const katalogYenile = useCallback(
    async (depo?: string) => {
      const urunler = await stokUrunKataloguGetir(yon, depo || depoId || null);
      setKatalog(urunler);
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

  const listeyeDon = useCallback(() => {
    setGorunum('liste');
    setSilOnayId(null);
    setStokEksikleri([]);
    void listeyiYukle();
  }, [listeyiYukle]);

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

    const temizle = () => {
      orta.style.height = '';
      orta.style.minHeight = '';
      sag.style.height = '';
      sag.style.minHeight = '';
    };

    const esitle = () => {
      temizle();
      const hedef =
        sol.querySelector<HTMLElement>('.fatura-musteri-ozet, .fatura-cari-ozet-bos') ?? sol;
      const solH = Math.ceil(hedef.getBoundingClientRect().height);
      const duzen4_4 = belgeCariAltDuzenId(cariAlanDuzeni.altSatirlar) === '4-4';
      /* 4-4: sol iki sıra — yan sütunlar sola küçülsün; diğer/boş: ezilmesin */
      const h =
        duzen4_4 && seciliCari
          ? solH
          : Math.max(solH, Math.ceil(orta.scrollHeight), Math.ceil(sag.scrollHeight));
      if (h <= 0) return;
      /* minHeight yetmez — flex çocukların dolması için sabit height gerekir */
      orta.style.height = `${h}px`;
      sag.style.height = `${h}px`;
    };

    esitle();
    const raf = requestAnimationFrame(esitle);
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(esitle);
    });
    ro.observe(sol);
    const ozet = sol.querySelector('.fatura-musteri-ozet, .fatura-cari-ozet-bos');
    if (ozet) ro.observe(ozet);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      temizle();
    };
  }, [baslikDetayAcik, seciliCari, cariAlanDuzeni.alt, cariAlanDuzeni.altSatirlar]);

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
      setBelgeIskontoModu('ORAN');
      setBelgeIskontoGirdi('');
      setSubeId(sube?.id ?? '');
      setDepoId(depo?.id ?? '');
      setKasaId(kasa?.id ?? '');
      setCariId(onSeciliCariId ?? '');
      setKaynakBelgeId(null);
      setKaynakBelgeNo('');
      setDurum('TASLAK');
      setSatirlar([]);
      setKdvDahil(false);
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
    const oranlar = gecerliBelgeIskontolari(b.belgeIskontolari);
    const tutarlar = gecerliBelgeIskontoTutarlari(b.belgeIskontoTutarlari);
    setBelgeIskontolari(oranlar);
    setBelgeIskontoTutarlari(tutarlar);
    if ((tutarlar[0] ?? 0) > 0) {
      setBelgeIskontoModu('TUTAR');
      setBelgeIskontoGirdi(iskontoGirdiMetni(tutarlar[0] ?? 0));
    } else {
      setBelgeIskontoModu('ORAN');
      setBelgeIskontoGirdi(iskontoGirdiMetni(oranlar[0] ?? 0));
    }
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
      setGorunum('liste');
    }
  }, [listeYukleniyor, baslatUygula]);

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
        setGorunum('liste');
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
        setGorunum('liste');
      }
      logMesajiAyarla('Belge silindi');
      await listeyiYukle();
    } catch (err) {
      logMesajiAyarla(err instanceof Error ? err.message : 'Silme başarısız');
    }
  }, [silOnayId, silmeVar, aktifId, logMesajiAyarla, listeyiYukle]);

  const formKaydetAktif = gorunum === 'form' && !saltOkunur && (aktifId ? duzenlemeVar : eklemeVar);
  const formSilAktif = gorunum === 'form' && Boolean(aktifId) && silmeVar;
  const cariyiDuzenleAktif = gorunum === 'form' && Boolean(seciliCari?.id) && duzenlemeVar;
  const filtreleriDuzenleAktif = gorunum === 'liste' && goruntulemeVar;
  const guncelleAktif = cariyiDuzenleAktif || filtreleriDuzenleAktif;
  const listeyeDonAktif = gorunum === 'form';
  const alanYonetAktif = gorunum === 'form';

  const listeTarihPilleri = useMemo(
    () => [
      { id: 'HEPSI' as ListeTarihDonem, etiket: LISTE_TARIH_ETIKET.HEPSI },
      ...listeFiltreDuzeni.tarihFiltreleri.map((id) => ({
        id: id as ListeTarihDonem,
        etiket: LISTE_TARIH_ETIKET[id],
      })),
    ],
    [listeFiltreDuzeni.tarihFiltreleri]
  );

  useEffect(() => {
    if (listeTarihDonem === 'HEPSI') return;
    if (!listeFiltreDuzeni.tarihFiltreleri.includes(listeTarihDonem as ListeTarihDonemSecilebilir)) {
      setListeTarihDonem('HEPSI');
    }
  }, [listeTarihDonem, listeFiltreDuzeni.tarihFiltreleri]);

  useEffect(() => {
    if (!listeFiltreDuzeni.ustBilesenler.includes('TARIH')) {
      setListeTarihDonem((d) => (d === 'HEPSI' ? d : 'HEPSI'));
    }
    if (!listeFiltreDuzeni.ustBilesenler.includes('NEVI')) {
      setListeFiltreNeviId((id) => (id === 'HEPSI' ? id : 'HEPSI'));
    }
    if (!listeFiltreDuzeni.ustBilesenler.includes('ARAMA')) {
      setListeArama((a) => (a ? '' : a));
    }
  }, [listeFiltreDuzeni.ustBilesenler]);

  useModulAksiyonlari(
    {
      kaydet: formKaydetAktif ? async () => Boolean(await kaydet()) : undefined,
      onizle: listeyeDonAktif
        ? () => {
            listeyeDon();
            return false;
          }
        : undefined,
      guncelle: guncelleAktif
        ? () => {
            if (gorunum === 'liste') {
              setListeFiltreYonetAcik(true);
              return;
            }
            if (!seciliCari?.id) return;
            cariBaslatYaz({ cariId: seciliCari.id, duzenle: true });
            onModulAc?.('cari');
          }
        : undefined,
      belgeAlanYonet: alanYonetAktif ? () => setAlanYonetAcik(true) : undefined,
      ekle: gorunum === 'liste' && eklemeVar ? () => yeniBelgeAc() : undefined,
      sil: formSilAktif
        ? () => {
            setSilOnayId(aktifId);
          }
        : undefined,
    },
    {
      kaydet: formKaydetAktif && !kaydediliyor,
      onizle: listeyeDonAktif,
      guncelle: guncelleAktif,
      belgeAlanYonet: alanYonetAktif,
      ekle: gorunum === 'liste' && eklemeVar,
      sil: formSilAktif && !kaydediliyor,
    },
    undefined,
    {
      onizle: 'Listeye Dön',
      guncelle: gorunum === 'liste' ? 'Filtreleri Düzenle' : 'Cariyi Düzenle',
      belgeAlanYonet: 'Alanları Yönet',
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
      topluUrunKuyruguRef.current = [];
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
    if (!satirEkleKorunsun) {
      setSatirEkleBaglam(null);
      topluUrunKuyruguRef.current = [];
    }
  }, []);

  const hizliGiriseUrunDoldur = useCallback((urun: UrunKaydi, miktariKoruma = false) => {
    const api = hizliGirisApiRef.current;
    const mevcut = api?.degerler ?? {};
    const birimFiyat = kdvDahil
      ? kdvHaricFiyattanDahil(urun.fiyat, urun.kdv)
      : urun.fiyat;
    api?.alanAyarla('urunKoduAdi', urunKoduAdiEtiket(urun.sku, urun.ad));
    api?.alanAyarla(
      'miktar',
      miktariKoruma && mevcut.miktar?.trim() ? mevcut.miktar : '1'
    );
    api?.alanAyarla('birim', urun.birim);
    api?.alanAyarla('fiyat', String(birimFiyat));
    api?.alanAyarla('toplamKdv', String(urun.kdv));
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
  }, [kdvDahil]);

  /** Arama sonucundan seçim: satıra eklemez, hızlı giriş alanlarını doldurur */
  const urunSecVeDoldur = useCallback(
    (urun: UrunKaydi) => {
      if (saltOkunur) return;
      topluUrunKuyruguRef.current = [];
      hizliGiriseUrunDoldur(urun, true);
      aramayiKapat(true);
    },
    [saltOkunur, aramayiKapat, hizliGiriseUrunDoldur]
  );

  const urundenSatirOlustur = useCallback(
    (urun: UrunKaydi, idSonek = '') => {
      const birimFiyat = kdvDahil
        ? kdvHaricFiyattanDahil(urun.fiyat, urun.kdv)
        : urun.fiyat;
      const satir = yeniSiparisSatiriOlustur(
        {
          urunKoduAdi: urunKoduAdiEtiket(urun.sku, urun.ad),
          miktar: '1',
          birim: urun.birim,
          fiyat: String(birimFiyat),
          toplamKdv: String(urun.kdv),
        },
        kdvDahil,
        [urun, ...katalog]
      );
      return idSonek ? { ...satir, id: `${satir.id}${idSonek}` } : satir;
    },
    [kdvDahil, katalog]
  );

  /**
   * Toplu seçim:
   * - Fiyatlı ürünler → doğrudan satıra eklenir
   * - 0 fiyatlılar → sırayla hızlı girişte düzenlemeye gelir
   * Tek seçim UrunAramaSlayt’ta onSec → urunSecVeDoldur (bozulmaz)
   */
  const urunTopluSecVeDoldur = useCallback(
    (urunler: UrunKaydi[]) => {
      if (saltOkunur || urunler.length === 0) return;

      if (urunler.length === 1) {
        urunSecVeDoldur(urunler[0]!);
        return;
      }

      const fiyatlilar = urunler.filter((u) => Number(u.fiyat) > 0);
      const fiyatsizlar = urunler.filter((u) => !(Number(u.fiyat) > 0));

      if (fiyatlilar.length > 0) {
        const yeniSatirlar = fiyatlilar.map((u, i) => urundenSatirOlustur(u, `-${i}`));
        setSatirlar((onceki) => {
          if (satirEkleBaglam) {
            const { satirId, konum } = satirEkleBaglam;
            const idx = onceki.findIndex((s) => s.id === satirId);
            if (idx < 0) return [...onceki, ...yeniSatirlar];
            const liste = [...onceki];
            liste.splice(konum === 'ust' ? idx : idx + 1, 0, ...yeniSatirlar);
            return liste;
          }
          return [...onceki, ...yeniSatirlar];
        });
        if (satirEkleBaglam) setSatirEkleBaglam(null);
      }

      if (fiyatsizlar.length > 0) {
        const [ilk, ...kalan] = fiyatsizlar;
        topluUrunKuyruguRef.current = kalan;
        hizliGiriseUrunDoldur(ilk!, false);
        aramayiKapat(true);
        const parcalar: string[] = [];
        if (fiyatlilar.length > 0) parcalar.push(`${fiyatlilar.length} ürün satıra eklendi`);
        parcalar.push(
          kalan.length > 0
            ? `${fiyatsizlar.length} fiyatsız ürün düzenlenecek (${kalan.length} kuyrukta)`
            : '1 fiyatsız ürün düzenlemeye alındı'
        );
        logMesajiAyarla(parcalar.join(' — '));
        return;
      }

      topluUrunKuyruguRef.current = [];
      aramayiKapat(false);
      logMesajiAyarla(`${fiyatlilar.length} ürün satıra eklendi`);
      requestAnimationFrame(() => gridApiRef.current?.hizliGirisOdakla?.());
    },
    [
      saltOkunur,
      urunSecVeDoldur,
      urundenSatirOlustur,
      satirEkleBaglam,
      hizliGiriseUrunDoldur,
      aramayiKapat,
      logMesajiAyarla,
    ]
  );

  /** Yazılan metin katalogda tam kod/ad/barkod eşleşmesi yoksa true */
  const katalogDisiMi = useCallback(
    (ham: string | undefined) => {
      const metin = urunAramaSorgusuMetni(ham);
      if (!metin) return true;
      const kod = urunKoduAdiKodAl(metin).toLocaleLowerCase('tr');
      const tam = metin.toLocaleLowerCase('tr');
      return !katalog.some((u) => {
        const sku = u.sku.toLocaleLowerCase('tr');
        const ad = u.ad.toLocaleLowerCase('tr');
        if (sku === kod || sku === tam || ad === tam) return true;
        return (u.barkodlar ?? []).some(
          (b) => (b ?? '').trim().toLocaleLowerCase('tr') === tam
        );
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

      const sonraki = topluUrunKuyruguRef.current.shift();
      /* DataGrid sifirla + odak sonrası sıradaki ürünü doldur */
      window.setTimeout(() => {
        if (sonraki) {
          const kalan = topluUrunKuyruguRef.current.length;
          if (kalan > 0) {
            logMesajiAyarla(`Sıradaki ürün yüklendi — ${kalan} kaldı`);
          } else {
            logMesajiAyarla('Son seçilen ürün yüklendi');
          }
          hizliGiriseUrunDoldur(sonraki, false);
        } else {
          /* Satır eklenince odak yeni üründe kalmasın; hızlı giriş (ürün kodu/adı) inputuna dön */
          requestAnimationFrame(() => gridApiRef.current?.hizliGirisOdakla?.());
        }
      }, 0);
      return yeni.id;
    },
    [kdvDahil, satirEkleBaglam, hizliGiriseUrunDoldur, logMesajiAyarla]
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
      const birimFiyat = kdvDahil
        ? kdvHaricFiyattanDahil(urun.fiyat, urun.kdv)
        : urun.fiyat;
      api?.alanAyarla('fiyat', onceki.fiyat?.trim() ? onceki.fiyat : String(birimFiyat));
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
    [aramayiKapat, logMesajiAyarla, katalogYenile, depoId, kdvDahil]
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

  const altSatirGruplari = useMemo(
    () => belgeCariAltSatirlariBol(cariAlanDuzeni.alt, cariAlanDuzeni.altSatirlar),
    [cariAlanDuzeni.alt, cariAlanDuzeni.altSatirlar]
  );

  if (!goruntulemeVar) {
    return <YetkisizErisim aciklama={`${baslik} için Görüntüleme yetkisi gerekir.`} />;
  }

  const sayfaSinif = `fatura-sayfa fatura-sayfa--${yon === 'ALIS' ? 'alis' : 'satis'}`;

  if (gorunum === 'liste') {
    return (
      <div className={`${sayfaSinif} fatura-sayfa--liste`}>
        <div className="fatura-liste-ust">
          <div>
            <h2 className="fatura-baslik">{baslik}</h2>
            <p className="fatura-alt">Tüm belgeler · tür ve yön filtresi · giriş / çıkış özeti</p>
          </div>
          {eklemeVar ? (
            <div className="fatura-liste-aksiyon">
              <button type="button" className="fatura-btn fatura-btn--birincil" onClick={() => yeniBelgeAc()}>
                + Belge Ekle
              </button>
            </div>
          ) : null}
        </div>

        <div className="fatura-liste-ozet">
          <button
            type="button"
            className={`fatura-liste-ozet-kart fatura-liste-ozet-kart--giris${listeFiltreYon === 'ALIS' ? ' fatura-liste-ozet-kart--aktif' : ''}`}
            onClick={() => setListeFiltreYon((v) => (v === 'ALIS' ? 'HEPSI' : 'ALIS'))}
          >
            <span>Girişler Toplam</span>
            <strong>{para(listeOzet.giris)}</strong>
            <em>{listeOzet.adetGiris} belge</em>
          </button>
          <button
            type="button"
            className={`fatura-liste-ozet-kart fatura-liste-ozet-kart--cikis${listeFiltreYon === 'SATIS' ? ' fatura-liste-ozet-kart--aktif' : ''}`}
            onClick={() => setListeFiltreYon((v) => (v === 'SATIS' ? 'HEPSI' : 'SATIS'))}
          >
            <span>Çıkışlar Toplam</span>
            <strong>{para(listeOzet.cikis)}</strong>
            <em>{listeOzet.adetCikis} belge</em>
          </button>
          <button
            type="button"
            className={`fatura-liste-ozet-kart fatura-liste-ozet-kart--genel${listeFiltreYon === 'HEPSI' ? ' fatura-liste-ozet-kart--aktif' : ''}`}
            onClick={() => setListeFiltreYon('HEPSI')}
          >
            <span>Genel Toplam</span>
            <strong>{para(listeOzet.genel)}</strong>
            <em>{listeOzet.adet} belge</em>
          </button>
        </div>

        <section className="fatura-liste-bolum">
          <div className="fatura-liste-bolum-ust">
            {listeFiltreDuzeni.ustBilesenler.map((bilesen) => {
              if (bilesen === 'ARAMA') {
                return (
                  <div key="ARAMA" className="fatura-liste-ust-oge fatura-liste-arama">
                    <input
                      type="search"
                      className="fatura-liste-arama-input"
                      value={listeArama}
                      onChange={(e) => setListeArama(e.target.value)}
                      placeholder="Belge no, cari, nevi ara…"
                      aria-label="Belgelerde ara"
                    />
                  </div>
                );
              }
              if (bilesen === 'TARIH') {
                return (
                  <div key="TARIH" className="fatura-liste-ust-oge fatura-liste-tarih-grup">
                    <div className="fatura-liste-tarih-filtre" role="group" aria-label="Tarih filtresi">
                      {listeTarihPilleri.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className={`fatura-liste-tarih-pill${listeTarihDonem === d.id ? ' fatura-liste-tarih-pill--aktif' : ''}`}
                          aria-pressed={listeTarihDonem === d.id}
                          onClick={() => {
                            setListeTarihDonem(d.id);
                            if (d.id === 'ARALIK' && !listeTarihBaslangic && !listeTarihBitis) {
                              const bugun = bugunIso();
                              setListeTarihBaslangic(bugun);
                              setListeTarihBitis(bugun);
                            }
                          }}
                        >
                          {d.etiket}
                        </button>
                      ))}
                    </div>
                    {listeTarihDonem === 'ARALIK' ? (
                      <div className="fatura-liste-tarih-aralik" aria-label="Tarih aralığı">
                        <TarihSecici
                          deger={listeTarihBaslangic}
                          ariaLabel="Başlangıç tarihi"
                          varyant="satir"
                          onChange={setListeTarihBaslangic}
                        />
                        <span className="fatura-liste-tarih-aralik-ayrac" aria-hidden>
                          —
                        </span>
                        <TarihSecici
                          deger={listeTarihBitis}
                          ariaLabel="Bitiş tarihi"
                          varyant="satir"
                          onChange={setListeTarihBitis}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              }
              return (
                <div key="NEVI" className="fatura-liste-ust-oge fatura-tur-sekme" role="tablist" aria-label="Belge nevi">
                  <button
                    type="button"
                    className={listeFiltreNeviId === 'HEPSI' ? 'aktif' : ''}
                    onClick={() => setListeFiltreNeviId('HEPSI')}
                  >
                    Hepsi
                  </button>
                  {listeNeviSekmeleri.map((n) => (
                    <button
                      key={n.value}
                      type="button"
                      className={listeFiltreNeviId === n.value ? 'aktif' : ''}
                      onClick={() => setListeFiltreNeviId(n.value)}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="fatura-liste-tablo-wrap">
            {listeYukleniyor ? (
              <p className="fatura-bos">Yükleniyor…</p>
            ) : filtreliListe.length === 0 ? (
              <p className="fatura-bos">
                {liste.length === 0
                  ? 'Henüz belge yok. + Belge Ekle ile yeni belge oluşturun.'
                  : 'Filtreye uyan belge bulunamadı.'}
              </p>
            ) : (
              <table className="fatura-liste-tablo">
                <thead>
                  <tr>
                    <th>Yön</th>
                    <th>Tür</th>
                    <th>Nevi</th>
                    <th>Belge No</th>
                    <th>Tarih</th>
                    <th>Cari</th>
                    <th>Durum</th>
                    <th>Toplam</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtreliListe.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span
                          className={`fatura-liste-yon-rozet fatura-liste-yon-rozet--${b.yon === 'ALIS' ? 'giris' : 'cikis'}`}
                        >
                          {b.yon === 'ALIS' ? 'Giriş' : 'Çıkış'}
                        </span>
                      </td>
                      <td>{belgeTurEtiketi(b.tur)}</td>
                      <td>{b.belgeNeviAdi || '—'}</td>
                      <td>
                        <button type="button" className="fatura-link" onClick={() => void belgeAc(b)}>
                          {b.belgeNo}
                        </button>
                        {b.kaynakBelgeNo ? <div className="fatura-mini">← {b.kaynakBelgeNo}</div> : null}
                      </td>
                      <td>{b.tarih}</td>
                      <td>
                        <div className="fatura-liste-cari">
                          <strong>{b.cariAdi || '—'}</strong>
                          {b.cariKodu ? <span>{b.cariKodu}</span> : null}
                        </div>
                      </td>
                      <td>
                        <span className={`fatura-liste-durum fatura-liste-durum--${b.durum.toLowerCase()}`}>
                          {belgeDurumEtiketi(b.durum)}
                        </span>
                      </td>
                      <td className="fatura-sayi">{para(b.genelToplam)}</td>
                      <td className="fatura-liste-aksiyon">
                        <button
                          type="button"
                          className="fatura-btn fatura-btn--ghost"
                          onClick={() => void belgeAc(b)}
                        >
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

        <SilmeOnayModal
          acik={Boolean(silOnayId)}
          onKapat={() => setSilOnayId(null)}
          onOnayla={() => void sil()}
          baslik="Belgeyi silmek istiyor musunuz?"
          hedefMetin={liste.find((b) => b.id === silOnayId)?.belgeNo ?? ''}
          ariaLabel="Belge silme onayı"
        />

        <BelgeListeFiltreYonetModal
          acik={listeFiltreYonetAcik}
          baslangic={listeFiltreDuzeni}
          onKapat={() => setListeFiltreYonetAcik(false)}
          onKaydet={setListeFiltreDuzeni}
        />
      </div>
    );
  }

  const firmaKodu = seciliCari?.cariKodu || '—';
  const firmaAdi = seciliCari
    ? seciliCari.cariAdi || seciliCari.unvan || '—'
    : 'Cari seçilmedi';

  return (
    <div ref={sayfaRef} className={`${sayfaSinif} dg-demo-sayfa dg-demo-sag-tik-alan fatura-sayfa--bolumlu`}>
      <FaturaBolumDuzen
        depolamaAnahtari={`gt_fatura_bolum_${modulId}`}
        ustAcik={baslikDetayAcik}
        altAcik
        ust={
          <>
      <section className="fatura-ust-serit" aria-label="Belge başlığı">
        <div className="fatura-ust-serit-satir">
          <div className="fatura-ust-serit-sol">
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

          <button
            type="button"
            className={`fatura-ust-firma fatura-ust-firma--tus${seciliCari ? '' : ' fatura-ust-firma--bos'}`}
            title={saltOkunur ? undefined : 'Cari seçmek için tıklayın'}
            disabled={saltOkunur}
            onClick={() => setCariBulAcik(true)}
          >
            <div className="fatura-ust-firma-ana">
              <span className="fatura-ust-firma-kod">{firmaKodu}</span>
              <span className="fatura-ust-firma-ad">{firmaAdi}</span>
            </div>
            {seciliCari ? (
              <div className="fatura-ust-firma-meta">
                {cariAlanDuzeni.ust.map((alanId) => (
                  <div key={alanId} className="fatura-ust-firma-meta-slot">
                    {belgeCariAlanIcerik(alanId, seciliCari, 'ust')}
                  </div>
                ))}
              </div>
            ) : null}
          </button>

          <div className="fatura-ust-ayrac" aria-hidden />

          <div className="fatura-ust-alanlar">
            {!saltOkunur ? (
              <OtOutlinedAcilir
                etiket="Belge Türü"
                deger={yon}
                secenekler={turSecenekleri}
                className="fatura-ust-alan"
                aranabilir={false}
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
                aranabilir={false}
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
        </div>

        {baslikDetayAcik ? (
          <div id="fatura-ust-detay" className="fatura-ust-detay">
            <div className="fatura-ust-detay-bolum">
              <div
                className={`fatura-ust-musteri-grid${
                  belgeCariAltDuzenId(cariAlanDuzeni.altSatirlar) === '4-4'
                    ? ' fatura-ust-musteri-grid--duzen-4-4'
                    : ''
                }`}
                ref={musteriGridRef}
              >
                <div className="fatura-ust-detay-cari">
                  {seciliCari ? (
                    <div className="fatura-musteri-ozet fatura-musteri-ozet--modern fatura-musteri-ozet--duzenli">
                      {altSatirGruplari.map((satir, sira) => {
                        const sutun = cariAlanDuzeni.altSatirlar[sira] ?? satir.length;
                        return (
                          <div
                            key={`alt-satir-${sira}`}
                            className={`fatura-musteri-ozet-satir fatura-musteri-ozet-satir--n${sutun}`}
                          >
                            {satir.map((alanId) => (
                              <div key={alanId} className="fatura-musteri-ozet-slot">
                                {belgeCariAlanIcerik(alanId, seciliCari, 'alt')}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {cariAlanDuzeni.alt.length === 0 ? (
                        <p className="fatura-cari-ozet-bos">Alt alanda gösterilecek alan yok — Alanları Yönet’ten ekleyin.</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="fatura-cari-ozet-bos">Cari seçilmedi — üstten bir cari seçin.</p>
                  )}
                </div>

                <div className="fatura-ust-lokasyon-sutun">
                  <OtOutlinedAcilir
                    etiket="Şube"
                    deger={subeId}
                    disabled={saltOkunur}
                    secenekler={subeSecenekleri}
                    bosEtiket="Şube seçin…"
                    aranabilir={false}
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
                    aranabilir={false}
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
                    aranabilir={false}
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
        onTopluSec={urunTopluSecVeDoldur}
        onGeri={() => aramayiKapat(false)}
        onHizliEkle={saltOkunur ? undefined : (sorgu) => hizliStokAc(sorgu, undefined, 'form')}
      >
        <DataGrid
          tabloBaslik="Hareketler"
          kolonlar={kolonlar}
          satirlar={gorunurSatirlar}
          depolamaAnahtari={`gt_fatura_${modulId}_v6`}
          kolonGenislikSurumu={KOLON_GENISLIK_SURUMU}
          sutunMenuModu="portal"
          hizliGirisKolonlari={
            saltOkunur
              ? undefined
              : [
                  {
                    kolonId: 'urunKoduAdi',
                    placeholder: 'Barkod, ürün kodu veya adı…',
                    ipucu: 'Barkod okut / kod yaz · % ile ara · Enter ekle',
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
                  { kolonId: 'toplamKdv', ipucu: 'KDV (%)', varsayilan: '20' },
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
      <section className="fatura-alt-finans" aria-label="Belge toplamı">
        <div className="fatura-alt-finans-baslik fatura-alt-finans-baslik--sabit">
          <div className="fatura-alt-finans-ozet-satir">
            <div className="fatura-alt-finans-ozet-kalem fatura-alt-finans-ozet-kalem--iskonto">
              <div className="fatura-alt-iskonto-girdi">
                <FormAcilirSecim
                  className="fatura-alt-iskonto-secim"
                  disabled={saltOkunur}
                  value={belgeIskontoModu}
                  aria-label="İskonto türü"
                  listeYonu="yukari"
                  listeMaxYukseklik={120}
                  secenekler={[
                    { value: 'ORAN', label: 'İskonto Oranı' },
                    { value: 'TUTAR', label: 'İskonto Tutarı' },
                  ]}
                  onChange={(v) =>
                    belgeIskontoModuDegistir(v === 'TUTAR' ? 'TUTAR' : 'ORAN')
                  }
                />
                <div
                  className={`fatura-alt-iskonto-alan${belgeIskontoModu === 'ORAN' ? '' : ' fatura-alt-iskonto-alan--birimsiz'}`}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    className="fatura-alt-iskonto-input"
                    disabled={saltOkunur}
                    value={belgeIskontoGirdi}
                    onChange={(e) => belgeIskontoYaz(e.target.value)}
                    onBlur={belgeIskontoBlur}
                    placeholder={belgeIskontoModu === 'ORAN' ? '0' : '0,00'}
                    aria-label={belgeIskontoModu === 'ORAN' ? 'İskonto oranı' : 'İskonto tutarı'}
                  />
                  {belgeIskontoModu === 'ORAN' ? (
                    <span className="fatura-alt-iskonto-birim" aria-hidden>
                      %
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="fatura-alt-finans-ozet-ozetler">
              <div className="fatura-alt-finans-ozet-kalem">
                <span>Toplam Tutar</span>
                <strong>{para(toplamlar.tutar)}</strong>
              </div>
              <div className="fatura-alt-finans-ozet-kalem">
                <span>Toplam İskonto</span>
                <strong>{para(toplamlar.iskontoToplam)}</strong>
              </div>
              <div className="fatura-alt-finans-ozet-kalem">
                <span>Ara Toplam</span>
                <strong>{para(toplamlar.araToplam)}</strong>
              </div>
              <div className="fatura-alt-finans-ozet-kalem">
                <span>Toplam KDV</span>
                <strong>{para(toplamlar.kdvToplam)}</strong>
              </div>
              <div className="fatura-alt-finans-ozet-kalem fatura-alt-finans-ozet-kalem--toplam">
                <span>Genel Toplam</span>
                <strong>{para(toplamlar.genelToplam)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
        }
      />

      <BelgeCariAlanYonetModal
        acik={alanYonetAcik}
        baslangic={cariAlanDuzeni}
        onKapat={() => setAlanYonetAcik(false)}
        onKaydet={setCariAlanDuzeni}
      />

      <FaturaCariBulModal
        acik={cariBulAcik}
        cariler={cariler}
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
