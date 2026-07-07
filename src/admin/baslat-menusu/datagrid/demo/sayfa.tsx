import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';

import type { HizliGirisApi, HizliGirisEnterBaglami } from '@/admin/ortak/datagrid/types';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';

import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';

import { paraFormatla } from '@/admin/ortak/datagrid/formatYardimci';

import { DEMO_SIPARIS_SATIRLARI, satirHesapla, yeniSiparisSatiriOlustur, type SiparisSatiri } from './demoVeri';

import { SatirDuzenlePanel } from './SatirDuzenlePanel';
import { KategoriYonetimModal } from './KategoriYonetimModal';
import { BASLANGIC_KATEGORILER, kategoriSecenekleri, type DemoKategori } from './kategoriVeri';
import { UrunAramaSlayt } from './UrunAramaSlayt';
import { URUN_KATALOGU } from './urunKatalogu';
import {
  hizliGirisUrunAlaniDolu,
  hizliGirisUrunSorgusu,
  urunleriAra,
  yuzdeAramaModu,
  type UrunKaydi,
  URUN_ARAMA_ALANLARI,
} from './urunAramaYardimci';



const VARSAYILAN_GIZLI = ['kayit', 'guncelleme', 'pb'];



function siparisKolonlari(): KolonTanimi<SiparisSatiri>[] {

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
      id: 'stokKodu',
      baslik: 'Stok Kodu',
      tip: 'metin',
      genislik: 108,
      minGenislik: 88,
      zorunlu: true,
      filtre: true,
      siralama: true,
      duzenlenebilir: true,
      degerAl: (s) => s.urun.sku,
      degerYaz: (s, d) => satirHesapla({ ...s, urun: { ...s.urun, sku: String(d).trim() || s.urun.sku } }),
      siralamaDegeri: (s) => s.urun.sku,
      filtreDegeri: (s) => s.urun.sku,
      goster: (s) => <span className="dg-stok-kodu">{s.urun.sku}</span>,
    },
    {
      id: 'urun',
      baslik: 'Ürün',
      tip: 'birlesik',
      genislik: 200,
      minGenislik: 140,
      filtre: true,
      siralama: true,
      duzenlenebilir: true,
      degerAl: (s) => ({ ust: s.urun.ad, alt: s.urun.kur }),
      degerYaz: (s, d) =>
        satirHesapla({ ...s, urun: { ...s.urun, ad: String(d).trim() || s.urun.ad } }),
      siralamaDegeri: (s) => s.urun.ad,
      filtreDegeri: (s) => `${s.urun.sku} ${s.urun.ad}`,
    },

    {

      id: 'kategori',

      baslik: 'Kategori',

      tip: 'metin',

      genislik: 88,

      gruplama: true,

      filtre: true,

      siralama: true,

      duzenlenebilir: true,

      degerAl: (s) => s.kategori,

      degerYaz: (s, d) => satirHesapla({ ...s, kategori: String(d).trim() || s.kategori }),

      filtreDegeri: (s) => s.kategori,

      goster: (s) => <span className="dg-kategori-etiket">{s.kategori}</span>,

    },

    {

      id: 'miktar',

      baslik: 'Miktar',

      tip: 'metin',

      genislik: 76,

      duzenlenebilir: true,

      formulaTip: 'sayi',

      filtre: true,

      siralama: true,

      degerAl: (s) => s.miktar,

      degerYaz: (s, d) => satirHesapla({ ...s, miktar: Number(d) || 0 }),

      siralamaDegeri: (s) => s.miktar,

      filtreDegeri: (s) => String(s.miktar),

      goster: (s) => (

        <span className="dg-miktar">

          <span className="dg-rozet">{s.miktar}</span>

          <span className="dg-miktar-birim">ADET</span>

        </span>

      ),

    },

    {

      id: 'fiyat',

      baslik: 'Fiyat',

      tip: 'para',

      genislik: 100,
      minGenislik: 88,

      duzenlenebilir: true,

      formulaTip: 'sayi',

      filtre: true,

      siralama: true,

      degerAl: (s) => s.fiyat,

      degerYaz: (s, d) => {

        const fiyat = typeof d === 'number' ? d : ifadeHesapla(String(d), 'sayi') ?? s.fiyat;

        return satirHesapla({ ...s, fiyat });

      },

      siralamaDegeri: (s) => s.fiyat,

    },

    {

      id: 'tutar',

      baslik: 'Tutar',

      tip: 'para',

      genislik: 88,

      siralama: true,

      degerAl: (s) => s.tutar,

      siralamaDegeri: (s) => s.tutar,

    },

    {

      id: 'satirIskonto',

      baslik: 'Satır İsk.',

      tip: 'iskonto',

      genislik: 84,

      duzenlenebilir: true,

      formulaTip: 'iskonto',

      siralama: true,

      degerAl: (s) => ({ yuzde: s.satirIskontoYuzde, tutar: s.satirIskontoTutar }),

      degerYaz: (s, d) => {

        const yuzde = typeof d === 'number' ? d : Number(d);

        return satirHesapla({ ...s, satirIskontoYuzde: yuzde });

      },

      siralamaDegeri: (s) => s.satirIskontoYuzde,

    },

    {

      id: 'netTutar',

      baslik: 'Net',

      tip: 'para',

      genislik: 88,

      siralama: true,

      degerAl: (s) => s.netTutar,

      siralamaDegeri: (s) => s.netTutar,

    },

    {

      id: 'altIskonto',

      baslik: 'Alt İsk.',

      tip: 'iskonto',

      genislik: 84,

      duzenlenebilir: true,

      formulaTip: 'iskonto',

      siralama: true,

      degerAl: (s) => ({ yuzde: s.altIskontoYuzde, tutar: s.altIskontoTutar }),

      degerYaz: (s, d) => {

        const yuzde = typeof d === 'number' ? d : Number(d);

        return satirHesapla({ ...s, altIskontoYuzde: yuzde });

      },

      siralamaDegeri: (s) => s.altIskontoYuzde,

    },

    {

      id: 'gercekToplam',

      baslik: 'Gerçek',

      tip: 'para',

      genislik: 88,

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

        const yuzde = typeof d === 'number' ? d : Number(d);

        return satirHesapla({ ...s, toplamKdvYuzde: Number.isFinite(yuzde) ? yuzde : s.toplamKdvYuzde });

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

      genislik: 90,

      siralama: true,

      degerAl: (s) => s.toplamTutar,

      siralamaDegeri: (s) => s.toplamTutar,

    },

    {

      id: 'pb',

      baslik: 'PB',

      tip: 'metin',

      genislik: 36,

      degerAl: (s) => s.pb,

    },

    {

      id: 'etiketler',

      baslik: 'Etiket',

      tip: 'etiket',

      genislik: 72,

      minGenislik: 64,

      filtre: true,

      degerAl: (s) => s.etiketler,

      filtreDegeri: (s) => s.etiketler.map((e) => e.metin).join(' '),

    },

    {

      id: 'kayit',

      baslik: 'Kayıt',

      tip: 'tarih',

      genislik: 108,

      filtre: true,

      siralama: true,

      degerAl: (s) => s.kayitTarihi,

      siralamaDegeri: (s) => s.kayitTarihi,

      filtreDegeri: (s) => s.kayitTarihi,

    },

    {

      id: 'guncelleme',

      baslik: 'Güncelleme',

      tip: 'tarih',

      genislik: 108,

      siralama: true,

      degerAl: (s) => s.guncellemeTarihi,

      siralamaDegeri: (s) => s.guncellemeTarihi,

    },

    {

      id: 'durum',

      baslik: 'Durum',

      tip: 'toggle',

      genislik: 56,

      siralama: true,

      degerAl: (s) => s.durum,

      degerYaz: (s, d) => satirHesapla({ ...s, durum: Boolean(d) }),

      siralamaDegeri: (s) => (s.durum ? 1 : 0),

    },

    {

      id: 'islemler',

      baslik: '',

      tip: 'salt-okunur',

      genislik: 44,

      sabitSag: true,

      siralama: false,

      degerAl: () => null,

    },

  ];

}



export function DatagridDemoSayfasi() {

  const [satirlar, setSatirlar] = useState<SiparisSatiri[]>(DEMO_SIPARIS_SATIRLARI);

  const [kategoriler, setKategoriler] = useState<DemoKategori[]>(BASLANGIC_KATEGORILER);

  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);

  const [kdvDahil, setKdvDahil] = useState(true);

  const [yukleniyor, setYukleniyor] = useState(true);
  const [slaytMod, setSlaytMod] = useState<'tablo' | 'arama'>('tablo');
  const [aramaSorgusu, setAramaSorgusu] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState<UrunKaydi[]>([]);
  const [seciliIndeks, setSeciliIndeks] = useState(0);
  const hizliGirisApiRef = useRef<HizliGirisApi | null>(null);

  const kolonlar = useMemo(() => siparisKolonlari(), []);

  const kategoriListe = useMemo(() => kategoriSecenekleri(kategoriler), [kategoriler]);

  const gorunurSatirlar = useMemo(
    () => satirlar.map((s) => satirHesapla(s, kdvDahil)),
    [satirlar, kdvDahil]
  );

  const hizliGirisOnizleme = useCallback(
    (degerler: Record<string, string>) => {
      const s = yeniSiparisSatiriOlustur(degerler, kdvDahil);
      return {
        tutar: paraFormatla(s.tutar),
        netTutar: paraFormatla(s.netTutar),
        gercekToplam: paraFormatla(s.gercekToplam),
        toplamTutar: <span className="dg-onizle-toplam">{paraFormatla(s.toplamTutar)}</span>,
        satirIskonto: paraFormatla(s.satirIskontoTutar),
        altIskonto: paraFormatla(s.altIskontoTutar),
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

  const aramayiKapat = useCallback(() => {
    setSlaytMod('tablo');
    setAramaSorgusu('');
    setAramaSonuclari([]);
    setSeciliIndeks(0);
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.dg-hizli-giris-girdi')?.focus());
  }, []);

  const urunSecVeEkle = useCallback(
    (urun: UrunKaydi) => {
      const mevcut = hizliGirisApiRef.current?.degerler ?? {};
      const degerler = {
        ...mevcut,
        stokKodu: urun.sku,
        urun: urun.ad,
      };
      const yeni = yeniSiparisSatiriOlustur(degerler, kdvDahil);
      setSatirlar((onceki) => [yeni, ...onceki]);
      hizliGirisApiRef.current?.sifirla();
      setSlaytMod('tablo');
      setAramaSorgusu('');
      setAramaSonuclari([]);
      setSeciliIndeks(0);
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.dg-hizli-giris-girdi')?.focus());
    },
    [kdvDahil]
  );

  const hizliGirisUrunEnter = useCallback(
    ({ alanId, degerler, engelle }: HizliGirisEnterBaglami) => {
      if (!URUN_ARAMA_ALANLARI.includes(alanId as (typeof URUN_ARAMA_ALANLARI)[number])) return;
      if (!hizliGirisUrunAlaniDolu(degerler)) return;
      engelle();
      aramayiAc(hizliGirisUrunSorgusu(degerler, alanId));
    },
    [aramayiAc]
  );



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

    <div className="dg-demo-sayfa">

      <KategoriYonetimModal
        acik={kategoriModalAcik}
        onKapat={() => setKategoriModalAcik(false)}
        kategoriler={kategoriler}
        onDegistir={setKategoriler}
      />

      <UrunAramaSlayt
        mod={slaytMod}
        sorgu={aramaSorgusu}
        sonuclar={aramaSonuclari}
        seciliIndeks={seciliIndeks}
        onSeciliDegistir={setSeciliIndeks}
        onSec={urunSecVeEkle}
        onGeri={aramayiKapat}
      >
      <DataGrid

        tabloBaslik="Sipariş İçeriği"

        tabloAltBaslik="Görünür sütunlar ve sırası"

        kolonlar={kolonlar}

        satirlar={gorunurSatirlar}

        depolamaAnahtari="gt_datagrid_demo_v9"
        hizliGirisKolonlari={[
          {
            kolonId: 'secim',
            colspan: 3,
            anaAlan: 'urun',
            placeholder: 'Ürün adı...',
            birlesik: [{ kolonId: 'stokKodu', placeholder: 'Stok kodu / Barkod...' }],
          },
          {
            kolonId: 'kategori',
            tip: 'secim',
            placeholder: 'Seç...',
            varsayilan: 'Genel',
            secenekler: kategoriListe,
          },
          { kolonId: 'miktar', placeholder: '1', varsayilan: '1' },
          {
            kolonId: 'fiyat',
            placeholder: kdvDahil ? 'KDV dahil fiyat' : 'KDV hariç fiyat',
            ipucu: kdvDahil ? 'Birim fiyat (KDV dahil)' : 'Birim fiyat (KDV hariç)',
          },
          { kolonId: 'satirIskonto', placeholder: '0 veya 20+20', ipucu: 'Bileşik iskonto', varsayilan: '0' },
          { kolonId: 'altIskonto', placeholder: '0', varsayilan: '0' },
          { kolonId: 'toplamKdv', placeholder: '%20', ipucu: 'KDV oranı (%)', varsayilan: '20' },
          { kolonId: 'etiketler', placeholder: 'Drone, Yeni', ipucu: 'Virgülle ayırın' },
          { kolonId: 'durum', tip: 'toggle', varsayilan: 'true' },
        ]}
        kolonBaslikEki={(kolonId) =>
          kolonId === 'kategori' ? (
            <button
              type="button"
              className="dg-baslik-aksiyon"
              title="Kategori yönetimi"
              onClick={(e) => {
                e.stopPropagation();
                setKategoriModalAcik(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              +
            </button>
          ) : null
        }
        satirSinifAdi={(s) => (!s.durum ? 'dg-satir--pasif' : undefined)}
        hizliGirisOnizleme={hizliGirisOnizleme}
        hizliGirisApiRef={hizliGirisApiRef}
        onHizliGirisEnter={hizliGirisUrunEnter}
        hizliGirisInputSinif={(alanId, deger) =>
          (alanId === 'stokKodu' || alanId === 'urun') && yuzdeAramaModu(deger)
            ? 'dg-hizli-giris-girdi--arama'
            : undefined
        }
        hizliGirisInputPlaceholder={(alanId, deger, varsayilan) => {
          if ((alanId === 'stokKodu' || alanId === 'urun') && yuzdeAramaModu(deger)) {
            return alanId === 'stokKodu' ? '%kod ile ara… Enter' : '%ad ile ara… Enter';
          }
          if (alanId === 'stokKodu' || alanId === 'urun') {
            return alanId === 'stokKodu' ? 'Stok kodu… Enter ile ara' : 'Ürün adı… Enter ile ara';
          }
          return varsayilan;
        }}
        onHizliGiris={(degerler) => {
          if (hizliGirisUrunAlaniDolu(degerler)) return;
          if (!degerler.stokKodu?.trim() && !degerler.urun?.trim()) return;
          const yeni = yeniSiparisSatiriOlustur(degerler, kdvDahil);
          setSatirlar((onceki) => [yeni, ...onceki]);
        }}

        varsayilanGizliKolonlar={VARSAYILAN_GIZLI}

        bosMesaj="Henüz sipariş satırı bulunmamaktadır."

        yukleniyor={yukleniyor}

        kdvDahil={kdvDahil}

        kdvDahilGoster

        onKdvDahilDegistir={setKdvDahil}

        onSatirlarDegistir={setSatirlar}

        onSatirGuncelle={(s) => satirHesapla(s, kdvDahil)}

        satirDuzenlePaneli={(satir, onKaydet, onKapat) => (

          <SatirDuzenlePanel

            satir={satir}

            kategoriler={kategoriler.map((k) => k.ad)}

            kdvDahil={kdvDahil}

            onKaydet={(g) => onKaydet(satirHesapla(g, kdvDahil))}

            onKapat={onKapat}

          />

        )}

      />

      </UrunAramaSlayt>

    </div>

  );

}


