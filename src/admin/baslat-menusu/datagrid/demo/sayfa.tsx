import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';

import type { HizliGirisApi, HizliGirisEnterBaglami, DataGridApi } from '@/admin/ortak/datagrid/types';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';

import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';

import { sayiFormatla, tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';

import {
  DEMO_SIPARIS_SATIRLARI,
  satirHesapla,
  satirlariKdvModunaCevir,
  yeniSiparisSatiriOlustur,
  type SiparisSatiri,
} from './demoVeri';

import { SatirDuzenlePanel } from './SatirDuzenlePanel';
import { birimEtiketi, birimSecenekleri, gecerliBirim } from './birimVeri';
import { gecerliParaBirimi, paraBirimiEtiketi, paraBirimiSecenekleri } from './paraBirimiVeri';
import { UrunAramaSlayt } from './UrunAramaSlayt';
import { URUN_KATALOGU } from './urunKatalogu';
import {
  hizliGirisUrunSorgusu,
  urunleriAra,
  yuzdeAramaModu,
  type UrunKaydi,
  URUN_ARAMA_ALANLARI,
} from './urunAramaYardimci';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { DatagridSagTikMenu, type SatirEkleKonumu } from './DatagridSagTikMenu';



const VARSAYILAN_GIZLI = ['etiketler', 'kayit', 'guncelleme'];

/** Para tutarı kolonları — kompakt varsayılan genişlik */
const PARA_KOLON_GENISLIK = 74;
const PARA_KOLON_MIN = 56;

/** İskonto kolonları — KDV ile aynı genişlik */
const ISKONTO_KOLON_GENISLIK = 76;
const ISKONTO_KOLON_MIN = 64;

/** Kolon genişlik varsayılanları güncellendiğinde artır */
const KOLON_GENISLIK_SURUMU = 7;

function UrunKoduAdiHucre({ satir }: { satir: SiparisSatiri }) {
  const ad = satir.urun.ad?.trim() ?? '';
  const kod = satir.urun.sku?.trim() ?? '';
  const ikili = Boolean(ad && kod && ad.toLowerCase() !== kod.toLowerCase());

  if (!ad && !kod) return <>—</>;

  if (ikili) {
    return (
      <div className="dg-iskonto-hucre dg-urun-kodu-adi-hucre">
        <span className="dg-urun-kodu-alt">{kod}</span>
        <span className="dg-urun-adi-ust">{ad}</span>
      </div>
    );
  }

  if (kod && !ad) return <span className="dg-urun-kodu-alt">{kod}</span>;
  return <span className="dg-urun-adi-ust">{ad || kod}</span>;
}

function siparisKolonlari(kdvDahil: boolean): KolonTanimi<SiparisSatiri>[] {
  const hesapla = (satir: SiparisSatiri, yama: Partial<SiparisSatiri>) =>
    satirHesapla({ ...satir, ...yama }, kdvDahil);

  return [

    {
      id: 'secim',
      baslik: '',
      tip: 'salt-okunur',
      genislik: 40,
      zorunlu: true,
      siralama: false,
      degerAl: () => null,
    },
    {
      id: 'urunKoduAdi',
      baslik: 'Ürün Kodu/Adı',
      tip: 'birlesik',
      genislik: 240,
      minGenislik: 120,
      zorunlu: true,
      siralama: true,
      duzenlenebilir: true,
      degerAl: (s) => ({ ust: s.urun.sku, alt: s.urun.ad }),
      degerYaz: (s, d) =>
        hesapla(s, { urun: { ...s.urun, sku: String(d).trim() || s.urun.sku } }),
      birlesikDuzenle: {
        altDegerAl: (s) => s.urun.ad,
        altDegerYaz: (s, d) =>
          hesapla(s, { urun: { ...s.urun, ad: String(d).trim() || s.urun.ad } }),
      },
      siralamaDegeri: (s) => `${s.urun.sku} ${s.urun.ad}`,
      goster: (s) => <UrunKoduAdiHucre satir={s} />,
    },
    {

      id: 'miktar',

      baslik: 'Miktar',

      tip: 'metin',

      genislik: 56,

      minGenislik: 48,

      duzenlenebilir: true,

      formulaTip: 'sayi',

      siralama: true,

      degerAl: (s) => s.miktar,

      degerYaz: (s, d) => hesapla(s, { miktar: Number(d) || 0 }),

      siralamaDegeri: (s) => s.miktar,

      goster: (s) => <span className="dg-rozet">{s.miktar}</span>,

    },

    {

      id: 'birim',

      baslik: 'Birim',

      tip: 'badge',

      genislik: 70,

      minGenislik: 58,

      zorunlu: true,

      siralama: true,

      duzenlenebilir: true,

      secenekler: birimSecenekleri(),

      degerAl: (s) => s.birim,

      degerYaz: (s, d) => hesapla(s, { birim: gecerliBirim(String(d), s.birim) }),

      siralamaDegeri: (s) => s.birim,

      goster: (s) => <span className="dg-birim-etiket">{birimEtiketi(s.birim)}</span>,

    },

    {

      id: 'fiyat',

      baslik: 'Fiyat',

      tip: 'para',

      genislik: PARA_KOLON_GENISLIK,
      minGenislik: PARA_KOLON_MIN,
      paraSembolu: false,

      duzenlenebilir: true,

      formulaTip: 'sayi',

      siralama: true,

      degerAl: (s) => s.fiyat,

      degerYaz: (s, d) => {

        const fiyat = typeof d === 'number' ? d : ifadeHesapla(String(d), 'sayi') ?? s.fiyat;

        return hesapla(s, { fiyat });

      },

      siralamaDegeri: (s) => s.fiyat,

    },

    {

      id: 'tutar',

      baslik: 'Tutar',

      tip: 'para',

      genislik: PARA_KOLON_GENISLIK,
      minGenislik: PARA_KOLON_MIN,
      paraSembolu: false,

      siralama: true,

      degerAl: (s) => s.tutar,

      siralamaDegeri: (s) => s.tutar,

    },

    {

      id: 'satirIskonto',

      baslik: 'Satır İskontosu',

      tip: 'iskonto',

      genislik: ISKONTO_KOLON_GENISLIK,
      minGenislik: ISKONTO_KOLON_MIN,
      paraSembolu: false,

      duzenlenebilir: true,

      formulaTip: 'iskonto',

      siralama: true,

      degerAl: (s) => ({ yuzde: s.satirIskontoYuzde, tutar: s.satirIskontoTutar }),

      degerYaz: (s, d) => {
        const yuzde =
          typeof d === 'number' ? d : ifadeHesapla(String(d), 'iskonto') ?? parseFloat(String(d).replace(',', '.')) ?? 0;
        return hesapla(s, { satirIskontoYuzde: yuzde });
      },

      siralamaDegeri: (s) => s.satirIskontoYuzde,

    },

    {

      id: 'netTutar',

      baslik: 'Net Tutar',

      tip: 'para',

      genislik: PARA_KOLON_GENISLIK,
      minGenislik: PARA_KOLON_MIN,
      paraSembolu: false,

      siralama: true,

      degerAl: (s) => s.netTutar,

      siralamaDegeri: (s) => s.netTutar,

    },

    {

      id: 'altIskonto',

      baslik: 'Alt İskonto',

      tip: 'iskonto',

      genislik: ISKONTO_KOLON_GENISLIK,
      minGenislik: ISKONTO_KOLON_MIN,
      paraSembolu: false,

      duzenlenebilir: true,

      formulaTip: 'iskonto',

      siralama: true,

      degerAl: (s) => ({ yuzde: s.altIskontoYuzde, tutar: s.altIskontoTutar }),

      degerYaz: (s, d) => {
        const yuzde =
          typeof d === 'number' ? d : ifadeHesapla(String(d), 'iskonto') ?? parseFloat(String(d).replace(',', '.')) ?? 0;
        return hesapla(s, { altIskontoYuzde: yuzde });
      },

      siralamaDegeri: (s) => s.altIskontoYuzde,

    },

    {

      id: 'gercekToplam',

      baslik: 'Gerçek Tutar',

      tip: 'para',

      genislik: PARA_KOLON_GENISLIK,
      minGenislik: PARA_KOLON_MIN,
      paraSembolu: false,

      siralama: true,

      degerAl: (s) => s.gercekToplam,

      siralamaDegeri: (s) => s.gercekToplam,

    },

    {

      id: 'toplamKdv',

      baslik: 'KDV',

      tip: 'iskonto',

      genislik: 76,

      duzenlenebilir: true,

      formulaTip: 'sayi',

      siralama: true,

      degerAl: (s) => ({ yuzde: s.toplamKdvYuzde, tutar: s.toplamKdvTutar }),

      degerYaz: (s, d) => {
        const yuzde =
          typeof d === 'number' ? d : ifadeHesapla(String(d), 'sayi') ?? parseFloat(String(d).replace(',', '.')) ?? s.toplamKdvYuzde;
        return hesapla(s, {
          toplamKdvYuzde: Number.isFinite(yuzde) ? yuzde : s.toplamKdvYuzde,
        });
      },

      goster: (s) => (

        <div className="dg-iskonto-hucre">

          <span className="dg-iskonto-yuzde">%{s.toplamKdvYuzde.toFixed(0)}</span>

          <span className="dg-kdv-vurgu">

            {s.toplamKdvTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

          </span>

        </div>

      ),

      siralamaDegeri: (s) => s.toplamKdvTutar,

    },

    {

      id: 'toplamTutar',

      baslik: 'Toplam',

      tip: 'para',

      genislik: PARA_KOLON_GENISLIK,
      minGenislik: PARA_KOLON_MIN,
      paraSembolu: false,

      siralama: true,

      degerAl: (s) => s.toplamTutar,

      siralamaDegeri: (s) => s.toplamTutar,

    },

    {

      id: 'pb',

      baslik: 'PB',

      tip: 'badge',

      genislik: 36,

      minGenislik: 30,

      siralama: true,

      duzenlenebilir: true,

      secenekler: paraBirimiSecenekleri(),

      degerAl: (s) => s.pb,

      degerYaz: (s, d) => hesapla(s, { pb: gecerliParaBirimi(String(d), s.pb) }),

      siralamaDegeri: (s) => s.pb,

      goster: (s) => <span className="dg-pb-etiket">{paraBirimiEtiketi(s.pb)}</span>,

    },

    {

      id: 'etiketler',

      baslik: 'Etiket',

      tip: 'etiket',

      genislik: 72,

      minGenislik: 64,

      degerAl: (s) => s.etiketler,

    },

    {

      id: 'kayit',

      baslik: 'Kayıt',

      tip: 'tarih',

      genislik: 132,

      siralama: true,

      degerAl: (s) => s.kayitTarihi,

      siralamaDegeri: (s) => s.kayitTarihi,

      goster: (s) => <span>{tarihSaatFormatla(s.kayitTarihi)}</span>,

    },

    {

      id: 'guncelleme',

      baslik: 'Güncelleme',

      tip: 'tarih',

      genislik: 132,

      siralama: true,

      degerAl: (s) => s.guncellemeTarihi,

      siralamaDegeri: (s) => s.guncellemeTarihi,

      goster: (s) => <span>{tarihSaatFormatla(s.guncellemeTarihi)}</span>,

    },

    {

      id: 'durum',

      baslik: 'Durum',

      tip: 'toggle',

      genislik: 56,

      siralama: true,

      degerAl: (s) => s.durum,

      degerYaz: (s, d) => hesapla(s, { durum: Boolean(d) }),

      siralamaDegeri: (s) => (s.durum ? 1 : 0),

    },

    {

      id: 'islemler',

      baslik: '',

      tip: 'salt-okunur',

      genislik: 68,

      sabitSag: true,

      siralama: false,

      degerAl: () => null,

    },

  ];

}



export function DatagridDemoSayfasi() {

  const [satirlar, setSatirlar] = useState<SiparisSatiri[]>(DEMO_SIPARIS_SATIRLARI);

  const [kdvDahil, setKdvDahil] = useState(true);

  const [yukleniyor, setYukleniyor] = useState(true);
  const [slaytMod, setSlaytMod] = useState<'tablo' | 'arama'>('tablo');
  const [aramaSorgusu, setAramaSorgusu] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState<UrunKaydi[]>([]);
  const [seciliIndeks, setSeciliIndeks] = useState(0);
  const [seciliSatirSayisi, setSeciliSatirSayisi] = useState(0);
  const [topluSilmeAcik, setTopluSilmeAcik] = useState(false);
  const [satirEkleBaglam, setSatirEkleBaglam] = useState<{ satirId: string; konum: SatirEkleKonumu } | null>(
    null
  );
  const seciliSatirIdleriRef = useRef<string[]>([]);
  const hizliGirisApiRef = useRef<HizliGirisApi | null>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);
  const logMesajiAyarla = useAdminLogMesaji();

  const kolonlar = useMemo(() => siparisKolonlari(kdvDahil), [kdvDahil]);

  const kdvModuDegistir = useCallback(
    (yeni: boolean) => {
      if (yeni === kdvDahil) return;
      setSatirlar((onceki) => satirlariKdvModunaCevir(onceki, kdvDahil, yeni));
      setKdvDahil(yeni);
    },
    [kdvDahil]
  );

  const gorunurSatirlar = useMemo(
    () => satirlar.map((s) => satirHesapla(s, kdvDahil)),
    [satirlar, kdvDahil]
  );

  const hizliGirisOnizleme = useCallback(
    (degerler: Record<string, string>) => {
      const s = yeniSiparisSatiriOlustur(degerler, kdvDahil, URUN_KATALOGU);
      return {
        tutar: sayiFormatla(s.tutar),
        netTutar: sayiFormatla(s.netTutar),
        gercekToplam: sayiFormatla(s.gercekToplam),
        toplamTutar: <span className="dg-onizle-toplam">{sayiFormatla(s.toplamTutar)}</span>,
        satirIskonto: sayiFormatla(s.satirIskontoTutar),
        altIskonto: sayiFormatla(s.altIskontoTutar),
      };
    },
    [kdvDahil]
  );

  const aramayiAc = useCallback((sorgu: string) => {
    setAramaSorgusu(sorgu);
    setAramaSonuclari(urunleriAra(URUN_KATALOGU, sorgu));
    setSeciliIndeks(0);
    setSlaytMod('arama');
  }, []);

  const sagTikSatirEkleBaslat = useCallback((konum: SatirEkleKonumu, satirId: string) => {
    setSatirEkleBaglam({ satirId, konum });
    setAramaSorgusu('');
    setAramaSonuclari(urunleriAra(URUN_KATALOGU, ''));
    setSeciliIndeks(0);
    setSlaytMod('arama');
  }, []);

  const aramaSorgusuDegistir = useCallback((sorgu: string) => {
    setAramaSorgusu(sorgu);
    setAramaSonuclari(urunleriAra(URUN_KATALOGU, sorgu));
    setSeciliIndeks(0);
  }, []);

  const aramayiKapat = useCallback(() => {
    setSlaytMod('tablo');
    setAramaSorgusu('');
    setAramaSonuclari([]);
    setSeciliIndeks(0);
    setSatirEkleBaglam(null);
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.dg-hizli-giris-girdi')?.focus());
  }, []);

  const urunSecVeEkle = useCallback(
    (urun: UrunKaydi) => {
      const yeni = yeniSiparisSatiriOlustur({ urunKoduAdi: urun.sku, miktar: '1' }, kdvDahil, URUN_KATALOGU);

      if (satirEkleBaglam) {
        const { satirId, konum } = satirEkleBaglam;
        setSatirlar((onceki) => {
          const idx = onceki.findIndex((s) => s.id === satirId);
          if (idx < 0) return [yeni, ...onceki];
          const liste = [...onceki];
          liste.splice(konum === 'ust' ? idx : idx + 1, 0, yeni);
          return liste;
        });
        setSatirEkleBaglam(null);
      } else {
        const mevcut = hizliGirisApiRef.current?.degerler ?? {};
        const degerler = {
          ...mevcut,
          urunKoduAdi: urun.sku,
        };
        const hizliGirisSatiri = yeniSiparisSatiriOlustur(degerler, kdvDahil, URUN_KATALOGU);
        setSatirlar((onceki) => [hizliGirisSatiri, ...onceki]);
        hizliGirisApiRef.current?.sifirla();
      }

      setSlaytMod('tablo');
      setAramaSorgusu('');
      setAramaSonuclari([]);
      setSeciliIndeks(0);
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.dg-hizli-giris-girdi')?.focus());
    },
    [kdvDahil, satirEkleBaglam]
  );

  const hizliGirisUrunEnter = useCallback(
    ({ alanId, degerler, engelle }: HizliGirisEnterBaglami) => {
      if (!URUN_ARAMA_ALANLARI.includes(alanId as (typeof URUN_ARAMA_ALANLARI)[number])) return;
      if (!yuzdeAramaModu(degerler.urunKoduAdi)) return;
      engelle();
      aramayiAc(hizliGirisUrunSorgusu(degerler, alanId));
    },
    [aramayiAc]
  );

  const seciliSatirlariSil = useCallback(() => {
    if (!seciliSatirIdleriRef.current.length) return;
    setTopluSilmeAcik(true);
  }, []);

  const topluSilmeOnayla = useCallback(() => {
    const ids = seciliSatirIdleriRef.current;
    setSatirlar((onceki) => onceki.filter((s) => !ids.includes(s.id)));
    seciliSatirIdleriRef.current = [];
    setSeciliSatirSayisi(0);
    setTopluSilmeAcik(false);
  }, []);

  useModulAksiyonlari({ sil: seciliSatirlariSil }, { sil: seciliSatirSayisi > 0 });



  useEffect(() => {

    const t = setTimeout(() => setYukleniyor(false), 400);

    return () => clearTimeout(t);

  }, []);



  useEffect(() => {
    const panel = document.querySelector<HTMLElement>('.ap-modul-panel[data-ap-kesif-modul="datagrid-demo"]');
    if (!panel) return;
    panel.classList.add('ap-modul-panel--datagrid');
    return () => panel.classList.remove('ap-modul-panel--datagrid');
  }, []);



  return (

    <div ref={sayfaRef} className="dg-demo-sayfa dg-demo-sag-tik-alan">

      <DatagridSagTikMenu
        konteynerRef={sayfaRef}
        kolonlar={kolonlar}
        satirlar={gorunurSatirlar}
        kdvDahil={kdvDahil}
        seciliSatirSayisi={seciliSatirSayisi}
        gridApiRef={gridApiRef}
        onSatirlarDegistir={setSatirlar}
        onSatirEkleBaslat={sagTikSatirEkleBaslat}
        onBilgi={logMesajiAyarla}
      />

      <UrunAramaSlayt
        mod={slaytMod}
        sorgu={aramaSorgusu}
        sonuclar={aramaSonuclari}
        seciliIndeks={seciliIndeks}
        onSorguDegistir={aramaSorgusuDegistir}
        onSeciliDegistir={setSeciliIndeks}
        onSec={urunSecVeEkle}
        onGeri={aramayiKapat}
      >
      <DataGrid

        tabloBaslik="Sipariş İçeriği"

        tabloAltBaslik="Görünür sütunlar ve sırası"

        kolonlar={kolonlar}

        satirlar={gorunurSatirlar}

        depolamaAnahtari="gt_datagrid_demo_v21"
        kolonGenislikSurumu={KOLON_GENISLIK_SURUMU}
        hizliGirisKolonlari={[
          {
            kolonId: 'urunKoduAdi',
            placeholder: 'Ürün Adı veya Kodu…',
            ipucu: '% İle Ara, ENTER ile Ekle',
          },
          { kolonId: 'miktar', placeholder: '1 veya 2*5', ipucu: 'Miktar ifadesi', varsayilan: '1' },
          {
            kolonId: 'birim',
            tip: 'secim',
            varsayilan: 'ADET',
            secenekler: birimSecenekleri(),
          },
          {
            kolonId: 'fiyat',
            placeholder: '1000+%10',
            ipucu: kdvDahil ? 'Fiyat ifadesi (KDV dahil)' : 'Fiyat ifadesi (KDV hariç)',
          },
          { kolonId: 'satirIskonto', placeholder: '0 veya 20+20', ipucu: 'Bileşik iskonto', varsayilan: '0' },
          { kolonId: 'altIskonto', placeholder: '0', varsayilan: '0' },
          { kolonId: 'toplamKdv', placeholder: '%20', ipucu: 'KDV oranı (%)', varsayilan: '20' },
          { kolonId: 'etiketler', placeholder: 'Drone, Yeni', ipucu: 'Virgülle ayırın' },
          { kolonId: 'durum', tip: 'toggle', varsayilan: 'true' },
        ]}
        satirSinifAdi={(s) => (!s.durum ? 'dg-satir--pasif' : undefined)}
        hizliGirisOnizleme={hizliGirisOnizleme}
        hizliGirisApiRef={hizliGirisApiRef}
        gridApiRef={gridApiRef}
        onHizliGirisEnter={hizliGirisUrunEnter}
        hizliGirisInputSinif={(alanId, deger) =>
          alanId === 'urunKoduAdi' && yuzdeAramaModu(deger) ? 'dg-hizli-giris-girdi--arama' : undefined
        }
        hizliGirisInputPlaceholder={(alanId, deger, varsayilan) => {
          if (alanId === 'urunKoduAdi' && yuzdeAramaModu(deger)) {
            return '% İle Ara… ENTER';
          }
          if (alanId === 'urunKoduAdi') {
            return 'Ürün Adı veya Kodu… ENTER ile Ekle';
          }
          return varsayilan;
        }}
        onHizliGiris={(degerler) => {
          if (!degerler.urunKoduAdi?.trim()) return;
          const yeni = yeniSiparisSatiriOlustur(degerler, kdvDahil, URUN_KATALOGU);
          setSatirlar((onceki) => [yeni, ...onceki]);
        }}

        varsayilanGizliKolonlar={VARSAYILAN_GIZLI}

        bosMesaj="Henüz sipariş satırı bulunmamaktadır."

        yukleniyor={yukleniyor}

        kdvDahil={kdvDahil}

        kdvDahilGoster

        onKdvDahilDegistir={kdvModuDegistir}

        onSatirlarDegistir={setSatirlar}

        onSecimDegistir={(ids) => {
          seciliSatirIdleriRef.current = ids;
          setSeciliSatirSayisi(ids.length);
        }}

        onSatirGuncelle={(s) => satirHesapla(s, kdvDahil)}

        satirDuzenlePaneli={(satir, onKaydet, onKapat) => (

          <SatirDuzenlePanel

            satir={satir}

            kdvDahil={kdvDahil}

            onKaydet={(g) => onKaydet(satirHesapla(g, kdvDahil))}

            onKapat={onKapat}

          />

        )}

      />

      </UrunAramaSlayt>

      <SilmeOnayModal
        acik={topluSilmeAcik}
        onKapat={() => setTopluSilmeAcik(false)}
        onOnayla={topluSilmeOnayla}
        baslik="Seçili kayıtları silmek istiyor musunuz?"
        hedefMetin={`${seciliSatirSayisi} kayıt`}
        ariaLabel="Toplu satır silme onayı"
      />
    </div>

  );

}


