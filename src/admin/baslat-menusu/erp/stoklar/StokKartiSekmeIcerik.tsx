import { useCallback, useMemo, useState } from 'react';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import { ulkeAra } from '@/veri/ulkeler';
import type { ReactNode } from 'react';
import { yeniIdGecici } from './birimMap';
import { fiyatDuzenleKolonlari } from './StokFiyatDuzenle';
import {
  fiyatDuzenleCarpanYaz,
  fiyatDuzenleKdvYaz,
  fiyatDuzenleSatirGuncelle,
} from './fiyatDuzenleYardimci';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
import type { StokForm, StokKartSekmeId } from './tipler';

function YatayAlan({
  etiket,
  children,
  className,
}: {
  etiket: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`stok-karti-yatay${className ? ` ${className}` : ''}`}>
      <span className="stok-karti-yatay-etiket">{etiket}</span>
      <div className="stok-karti-yatay-kontrol">{children}</div>
    </div>
  );
}

function Metin({
  etiket,
  deger,
  onChange,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
}) {
  return (
    <YatayAlan etiket={etiket}>
      <input className={formInputSinifi} value={deger} onChange={(e) => onChange(e.target.value)} />
    </YatayAlan>
  );
}

function AlanGuncelle(
  setForm: (fn: (f: StokForm) => StokForm) => void,
  alan: keyof StokForm,
  deger: string
) {
  setForm((f) => ({ ...f, [alan]: deger }));
}

export function bosBirimFiyatSatiri(): StokFiyatDuzenleSatir {
  return {
    id: yeniIdGecici(),
    fiyatAdi: 'FİYAT',
    birim: 'ADET',
    carpan: 1,
    barkod: '',
    kdv: 10,
    kdvTipi: 'dahil',
    alisFiyati: null,
    satisFiyati1: null,
    pb1: 'TL',
    satisFiyati2: null,
    pb2: 'TL',
    satisFiyati3: null,
    pb3: 'TL',
    satisFiyati4: null,
    pb4: 'TL',
    satisFiyati5: null,
    pb5: 'TL',
    satisFiyati6: null,
    pb6: 'TL',
    aktif: true,
  };
}

function birimListeKolonlari(duzenlenebilir: boolean): KolonTanimi<StokFiyatDuzenleSatir>[] {
  return [
    {
      id: 'birim',
      baslik: 'Birim',
      tip: 'metin',
      genislik: 100,
      duzenlenebilir,
      siralama: true,
      degerAl: (s) => s.birim,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { birim: String(d).trim() || s.birim }),
    },
    {
      id: 'carpan',
      baslik: 'Çarpan',
      tip: 'sayi',
      genislik: 80,
      duzenlenebilir,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.carpan,
      siralamaDegeri: (s) => s.carpan,
      degerYaz: (s, d) => fiyatDuzenleCarpanYaz(s, d),
      goster: (s) => String(s.carpan),
    },
    {
      id: 'kdv',
      baslik: 'KDV',
      tip: 'sayi',
      genislik: 72,
      duzenlenebilir,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.kdv,
      siralamaDegeri: (s) => s.kdv,
      degerYaz: (s, d) => fiyatDuzenleKdvYaz(s, d),
      goster: (s) => String(s.kdv),
    },
    {
      id: 'barkod',
      baslik: 'Barkod',
      tip: 'metin',
      genislik: 140,
      duzenlenebilir,
      siralama: true,
      degerAl: (s) => s.barkod,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { barkod: String(d).trim() }),
    },
  ];
}

const OZEL_KOD_ALANLARI: { alan: keyof StokForm; etiket: string }[] = [
  { alan: 'ozelTur', etiket: 'Tür' },
  { alan: 'ozelSinif', etiket: 'Sınıf' },
  { alan: 'ozelGrup', etiket: 'Grup' },
  { alan: 'ozel4', etiket: '4-ÖK' },
  { alan: 'ozel5', etiket: '5-ÖK' },
  { alan: 'ozelSezon', etiket: 'Sezon / Yıl' },
  { alan: 'ozelMarka', etiket: 'Marka' },
  { alan: 'ozelModel', etiket: 'Model' },
  { alan: 'ozelRenk', etiket: 'Renk' },
  { alan: 'ozelBeden', etiket: 'Beden/No' },
  { alan: 'ozel11', etiket: '11-ÖK' },
  { alan: 'ozel12', etiket: '12-ÖK' },
  { alan: 'ozel13', etiket: '13-ÖK' },
  { alan: 'ozel14', etiket: '14-ÖK' },
  { alan: 'ozel15', etiket: '15-ÖK' },
  { alan: 'ozel16', etiket: '16-ÖK' },
  { alan: 'ozel17', etiket: '17-ÖK' },
  { alan: 'ozel18', etiket: '18-ÖK' },
  { alan: 'ozel19', etiket: '19-ÖK' },
  { alan: 'ozel20', etiket: '20-ÖK' },
];

const MUHASEBE_ALANLARI: { alan: keyof StokForm; etiket: string }[] = [
  { alan: 'muhStokGiris', etiket: 'Stok Giriş' },
  { alan: 'muhStokCikis', etiket: 'Stok Çıkış' },
  { alan: 'muhStokCikisYDisi', etiket: 'Stok Çıkış (Y. Dışı)' },
  { alan: 'muhStokGirisIade', etiket: 'Stok Giriş İade' },
  { alan: 'muhStokCikisIade', etiket: 'Stok Çıkış İade' },
  { alan: 'muhAlisKalemIsk', etiket: 'Alış Kalem İskontosu' },
  { alan: 'muhAlisAltIsk', etiket: 'Alış Alt İskontosu' },
  { alan: 'muhSatisKalemIsk', etiket: 'Satış Kalem İskontosu' },
  { alan: 'muhSatisAltIsk', etiket: 'Satış Alt İskontosu' },
  { alan: 'muhSatilanMalMaliyeti', etiket: 'Satılan Mal Maliyeti' },
  { alan: 'muhMasraf', etiket: 'Masraf' },
  { alan: 'muhUretimGirisCikis', etiket: 'Üretim Giriş/Çıkış H.' },
  { alan: 'muhUretimBaglantiAlacak', etiket: 'Üretim Bağlantı H. (Alacaklı)' },
  { alan: 'muhUretimBaglantiBorc', etiket: 'Üretim Bağlantı H. (Borçlu)' },
];

/** GİB KDV tevkifat kodları (kod seçilince açıklama ve oran otomatik dolar) */
const TEVKIFAT_SECENEKLERI: { kod: string; aciklama: string; oran: string }[] = [
  { kod: '601', aciklama: 'Yapım İşleri ile Birlikte İfa Edilen Mühendislik-Mimarlık Hizmetleri', oran: '40' },
  { kod: '602', aciklama: 'Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler', oran: '90' },
  { kod: '603', aciklama: 'Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri', oran: '70' },
  { kod: '604', aciklama: 'Yemek Servis Hizmeti', oran: '50' },
  { kod: '605', aciklama: 'Organizasyon Hizmeti', oran: '50' },
  { kod: '606', aciklama: 'İşgücü Temin Hizmetleri', oran: '90' },
  { kod: '607', aciklama: 'Özel Güvenlik Hizmeti', oran: '90' },
  { kod: '608', aciklama: 'Yapı Denetim Hizmetleri', oran: '90' },
  { kod: '609', aciklama: 'Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri', oran: '70' },
  { kod: '612', aciklama: 'Temizlik Hizmeti', oran: '90' },
  { kod: '614', aciklama: 'Servis Taşımacılığı Hizmeti', oran: '50' },
  { kod: '615', aciklama: 'Her Türlü Baskı ve Basım Hizmetleri', oran: '70' },
  { kod: '616', aciklama: 'Diğer Hizmetler', oran: '50' },
  { kod: '623', aciklama: 'Yük Taşımacılığı Hizmeti', oran: '20' },
  { kod: '624', aciklama: 'Ticari Reklam Hizmetleri', oran: '30' },
];

const ANALIZ_ALANLARI: { alan: keyof StokForm; etiket: string }[] = [
  { alan: 'analizSonSatis', etiket: 'Son Satış Fiyatı' },
  { alan: 'analizEski1', etiket: '1. Eski Satış Fiyatı' },
  { alan: 'analizEski2', etiket: '2. Eski Satış Fiyatı' },
  { alan: 'analizEski3', etiket: '3. Eski Satış Fiyatı' },
  { alan: 'analizEski4', etiket: '4. Eski Satış Fiyatı' },
  { alan: 'analizEski5', etiket: '5. Eski Satış Fiyatı' },
  { alan: 'analizEski6', etiket: '6. Eski Satış Fiyatı' },
  { alan: 'analizDegisim1', etiket: '1. Satış Fiyatı Değişim Tarihi' },
  { alan: 'analizDegisim2', etiket: '2. Satış Fiyatı Değişim Tarihi' },
  { alan: 'analizDegisim3', etiket: '3. Satış Fiyatı Değişim Tarihi' },
  { alan: 'analizDegisim4', etiket: '4. Satış Fiyatı Değişim Tarihi' },
  { alan: 'analizDegisim5', etiket: '5. Satış Fiyatı Değişim Tarihi' },
  { alan: 'analizDegisim6', etiket: '6. Satış Fiyatı Değişim Tarihi' },
];

function BirimVeFiyatlarSekmesi({
  form,
  setForm,
  birimSatirlari,
  onBirimSatirlariDegistir,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
  birimSatirlari: StokFiyatDuzenleSatir[];
  onBirimSatirlariDegistir: (satirlar: StokFiyatDuzenleSatir[]) => void;
}) {
  const satirlar = birimSatirlari;
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const pasifGoster = form.kartPasifBirimleriGoster === '1';

  const birimKolonlar = useMemo(() => birimListeKolonlari(true), []);
  const fiyatKolonlar = useMemo(() => fiyatDuzenleKolonlari(true), []);

  const gorunurSatirlar = useMemo(
    () => (pasifGoster ? satirlar : satirlar.filter((s) => s.aktif !== false)),
    [pasifGoster, satirlar]
  );

  const satirlarAyarla = useCallback(
    (yeni: StokFiyatDuzenleSatir[]) => {
      onBirimSatirlariDegistir(yeni);
    },
    [onBirimSatirlariDegistir]
  );

  const yeniSatir = useCallback(() => {
    const satir = bosBirimFiyatSatiri();
    onBirimSatirlariDegistir([...satirlar, satir]);
    setSeciliIdler([satir.id]);
  }, [onBirimSatirlariDegistir, satirlar]);

  return (
    <TanimFormBolum baslik="Birim ve Fiyatlar">
      <div className="stok-karti-sekme-birim-fiyat">
        <div className="stok-karti-birim-fiyat-grid stok-fiyat-duzenle-tablo">
          <DataGrid
            tabloBaslik=""
            kolonlar={birimKolonlar}
            satirlar={gorunurSatirlar}
            onSatirlarDegistir={satirlarAyarla}
            depolamaAnahtari="stok_kart_birim_liste"
            bosMesaj="Birim kaydı yok."
            formulMenuGoster={false}
            ustAracGoster={false}
            topluBarGoster={false}
            onSatirTikla={(s) => setSeciliIdler([s.id])}
            onSecimDegistir={setSeciliIdler}
            satirSinifAdi={(s) => (seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined)}
          />
        </div>

        <div className="stok-karti-birim-fiyat-grid stok-fiyat-duzenle-tablo">
          <DataGrid
            tabloBaslik=""
            kolonlar={fiyatKolonlar}
            satirlar={gorunurSatirlar}
            onSatirlarDegistir={satirlarAyarla}
            depolamaAnahtari="stok_kart_birim_fiyat"
            bosMesaj="Fiyat satırı yok."
            formulMenuGoster={false}
            ustAracGoster={false}
            topluBarGoster={false}
            onSatirTikla={(s) => setSeciliIdler([s.id])}
            onSecimDegistir={setSeciliIdler}
            satirSinifAdi={(s) => (seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined)}
          />
        </div>

        <div className="stok-karti-sekme-alt-tuslar">
          <button type="button" className="ap-tanimlar-duzenle-geri" onClick={yeniSatir}>
            Yeni...
          </button>
          <button
            type="button"
            className="ap-tanimlar-duzenle-geri"
            disabled={seciliIdler.length !== 1}
            onClick={() => {
              /* hücre düzenleme DataGrid çift tık ile */
            }}
          >
            Düzelt...
          </button>
          <label className="stok-karti-checkbox">
            <input
              type="checkbox"
              checked={pasifGoster}
              onChange={(e) =>
                setForm((f) => ({ ...f, kartPasifBirimleriGoster: e.target.checked ? '1' : '' }))
              }
            />
            Pasif Birimleri Göster
          </label>
        </div>
      </div>
    </TanimFormBolum>
  );
}

function OzelKodlarSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="Özel Kodlar">
      <div className="stok-karti-ozel-kodlar">
        <div className="stok-karti-ozel-kodlar-sol">
          {OZEL_KOD_ALANLARI.map(({ alan, etiket }) => (
            <Metin
              key={alan}
              etiket={etiket}
              deger={String(form[alan] ?? '')}
              onChange={(v) => AlanGuncelle(setForm, alan, v)}
            />
          ))}
        </div>
        <div className="stok-karti-ozel-kodlar-sag">
          <div className="stok-karti-ozel-kodlar-ust">
            <YatayAlan etiket="Pl:">
              <FormAcilirSecim
                value={form.ozelPl}
                onChange={(v) => AlanGuncelle(setForm, 'ozelPl', v)}
                secenekler={[
                  { value: '', label: 'Seçilmedi' },
                  { value: '1', label: '1' },
                ]}
              />
            </YatayAlan>
            <YatayAlan etiket="POZ:">
              <FormAcilirSecim
                value={form.ozelPoz}
                onChange={(v) => AlanGuncelle(setForm, 'ozelPoz', v)}
                secenekler={[
                  { value: '', label: 'Seçilmedi' },
                  { value: '1', label: '1' },
                ]}
              />
            </YatayAlan>
          </div>
          <div className="stok-karti-raf-tablo">
            <div className="stok-karti-raf-baslik">
              <span>Depo Adı</span>
              <span>Raf Adı</span>
            </div>
            <div className="stok-karti-raf-bos">Kayıt yok...</div>
          </div>
        </div>
      </div>
    </TanimFormBolum>
  );
}

function MuhasebeSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="Muhasebe Kodları">
      <div className="stok-karti-muhasebe">
        <div className="stok-karti-muhasebe-sol">
          {MUHASEBE_ALANLARI.map(({ alan, etiket }) => (
            <Metin
              key={alan}
              etiket={etiket}
              deger={String(form[alan] ?? '')}
              onChange={(v) => AlanGuncelle(setForm, alan, v)}
            />
          ))}
        </div>
        <div className="stok-karti-gider-cesit">
          <p className="stok-karti-gider-baslik">Gider Çeşit Kodları</p>
          <div className="stok-karti-raf-tablo">
            <div className="stok-karti-raf-baslik">
              <span>Çeşit Kodu</span>
              <span>Açıklama</span>
            </div>
            <div className="stok-karti-raf-bos">Kayıt yok...</div>
          </div>
        </div>
      </div>
    </TanimFormBolum>
  );
}

function ResimSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="Resim">
      <label className="stok-karti-resim-alan">
        {form.resimUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.resimUrl} alt="Stok resmi" className="stok-karti-resim-onizleme" />
        ) : (
          <p className="stok-karti-resim-yazi">Resim yüklemek için bu alana tıklayın…</p>
        )}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const dosya = e.target.files?.[0];
            if (!dosya) return;
            const url = URL.createObjectURL(dosya);
            setForm((f) => ({ ...f, resimUrl: url }));
            e.target.value = '';
          }}
        />
      </label>
    </TanimFormBolum>
  );
}

function AnalizSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="Stok Analiz Bilgileri">
      <div className="stok-karti-analiz">
        {ANALIZ_ALANLARI.map(({ alan, etiket }) => (
          <Metin
            key={alan}
            etiket={etiket}
            deger={String(form[alan] ?? '')}
            onChange={(v) => AlanGuncelle(setForm, alan, v)}
          />
        ))}
      </div>
    </TanimFormBolum>
  );
}

function IstihbaratSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="İstihbarat / Diğer">
      <div className="stok-karti-istihbarat">
        <div className="stok-karti-istihbarat-ust">
          <YatayAlan etiket="Durumu">
            <FormAcilirSecim
              value={form.istihbaratDurum || 'Aktif'}
              onChange={(v) => AlanGuncelle(setForm, 'istihbaratDurum', v)}
              secenekler={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Pasif', label: 'Pasif' },
              ]}
            />
          </YatayAlan>
          <label className="stok-karti-checkbox">
            <input
              type="checkbox"
              checked={form.siparisAlinmasin === '1'}
              onChange={(e) =>
                setForm((f) => ({ ...f, siparisAlinmasin: e.target.checked ? '1' : '' }))
              }
            />
            Sipariş Alınmasın
          </label>
          <label className="stok-karti-checkbox">
            <input
              type="checkbox"
              checked={form.siparisVerilmesin === '1'}
              onChange={(e) =>
                setForm((f) => ({ ...f, siparisVerilmesin: e.target.checked ? '1' : '' }))
              }
            />
            Sipariş Verilmesin
          </label>
        </div>
        <YatayAlan etiket="Depo / Şube">
          <FormAcilirSecim
            value={form.depoSube || 'MERKEZ'}
            onChange={(v) => AlanGuncelle(setForm, 'depoSube', v)}
            secenekler={[{ value: 'MERKEZ', label: 'MERKEZ' }]}
          />
        </YatayAlan>
        <YatayAlan etiket="İstihbarat" className="stok-karti-yatay--blok">
          <textarea
            className={formInputSinifi}
            rows={5}
            value={form.istihbaratNot}
            onChange={(e) => AlanGuncelle(setForm, 'istihbaratNot', e.target.value)}
          />
        </YatayAlan>
        <YatayAlan etiket="Stok Grubu" className="stok-karti-yatay--blok">
          <textarea
            className={formInputSinifi}
            rows={4}
            value={form.stokGrubuNot}
            onChange={(e) => AlanGuncelle(setForm, 'stokGrubuNot', e.target.value)}
          />
        </YatayAlan>
      </div>
    </TanimFormBolum>
  );
}

function EDonusumSekmesi({
  form,
  setForm,
}: {
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
}) {
  return (
    <TanimFormBolum baslik="E-Dönüşüm">
      <div className="stok-karti-e-donusum">
        <div className="stok-karti-istihbarat-ust">
          <label className="stok-karti-checkbox">
            <input
              type="checkbox"
              checked={form.eTicaret === '1'}
              onChange={(e) => setForm((f) => ({ ...f, eTicaret: e.target.checked ? '1' : '' }))}
            />
            E-Ticaret
          </label>
          <label className="stok-karti-checkbox">
            <input
              type="checkbox"
              checked={form.fKasa === '1'}
              onChange={(e) => setForm((f) => ({ ...f, fKasa: e.target.checked ? '1' : '' }))}
            />
            F-Kasa
          </label>
        </div>
        <div className="stok-karti-e-donusum-govde">
          <div className="stok-karti-e-donusum-kolon">
            <Metin etiket="GTIP" deger={form.gtip} onChange={(v) => AlanGuncelle(setForm, 'gtip', v)} />
            <Metin etiket="UNS" deger={form.uns} onChange={(v) => AlanGuncelle(setForm, 'uns', v)} />
            <Metin
              etiket="UBL-TR"
              deger={form.ublTr}
              onChange={(v) => AlanGuncelle(setForm, 'ublTr', v)}
            />
            <Metin
              etiket="CPA Rev 2.1"
              deger={form.cpaRev}
              onChange={(v) => AlanGuncelle(setForm, 'cpaRev', v)}
            />
          </div>
          <div className="stok-karti-e-donusum-kolon">
            <YatayAlan etiket="Menşei">
              <FormAramaSecim
                value={form.eMensei}
                onChange={(v) => AlanGuncelle(setForm, 'eMensei', v)}
                secenekAra={ulkeAra}
                minAramaUzunlugu={2}
                placeholder="En az 2 harf yazın…"
                aria-label="Menşei"
              />
            </YatayAlan>
            <YatayAlan etiket="İstisna">
              <FormAcilirSecim
                value={form.istisna}
                onChange={(v) => AlanGuncelle(setForm, 'istisna', v)}
                secenekler={[{ value: '', label: 'Seçilmedi' }]}
              />
            </YatayAlan>
            <YatayAlan etiket="Özel Matrah">
              <FormAcilirSecim
                value={form.ozelMatrah}
                onChange={(v) => AlanGuncelle(setForm, 'ozelMatrah', v)}
                secenekler={[{ value: '', label: 'Seçilmedi' }]}
              />
            </YatayAlan>
            <YatayAlan etiket="İhraç Kayıt Şekilleri">
              <FormAcilirSecim
                value={form.ihracKayit}
                onChange={(v) => AlanGuncelle(setForm, 'ihracKayit', v)}
                secenekler={[{ value: '', label: 'Seçilmedi' }]}
              />
            </YatayAlan>
          </div>
        </div>
        <div className="stok-karti-tevkifat">
          <div className="stok-karti-tevkifat-sol">
            <span className="stok-karti-yatay-etiket">Tevkifat</span>
            <label className="stok-karti-checkbox">
              <input
                type="checkbox"
                checked={form.tevkifatUygulanacak === '1'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tevkifatUygulanacak: e.target.checked ? '1' : '' }))
                }
              />
              Uygulanacak
            </label>
            <span className="stok-karti-tevkifat-etiket">Kodu</span>
            <div className="stok-karti-tevkifat-kod">
              <FormAcilirSecim
                value={form.tevkifatKodu}
                onChange={(kod) => {
                  const secim = TEVKIFAT_SECENEKLERI.find((t) => t.kod === kod);
                  setForm((f) => ({
                    ...f,
                    tevkifatKodu: kod,
                    tevkifatAciklama: secim ? secim.aciklama : '',
                    tevkifatOran: secim ? secim.oran : '',
                  }));
                }}
                secenekler={[
                  { value: '', label: 'Seçilmedi' },
                  ...TEVKIFAT_SECENEKLERI.map((t) => ({ value: t.kod, label: t.kod })),
                ]}
                aria-label="Tevkifat kodu"
              />
            </div>
            <span className="stok-karti-tevkifat-etiket">Açıklama</span>
            <div className="stok-karti-tevkifat-aciklama">
              <FormAcilirSecim
                value={form.tevkifatAciklama}
                onChange={(aciklama) => {
                  const secim = TEVKIFAT_SECENEKLERI.find((t) => t.aciklama === aciklama);
                  setForm((f) => ({
                    ...f,
                    tevkifatAciklama: aciklama,
                    tevkifatKodu: secim ? secim.kod : '',
                    tevkifatOran: secim ? secim.oran : '',
                  }));
                }}
                secenekler={[
                  { value: '', label: 'Seçilmedi' },
                  ...TEVKIFAT_SECENEKLERI.map((t) => ({
                    value: t.aciklama,
                    label: `${t.kod} - ${t.aciklama}`,
                  })),
                ]}
                aria-label="Tevkifat açıklaması"
              />
            </div>
          </div>
          <div className="stok-karti-tevkifat-sag">
            <span className="stok-karti-yatay-etiket">Oran</span>
            <input
              type="number"
              min={0}
              max={100}
              className={`${formInputSinifi} stok-karti-tevkifat-oran`}
              value={form.tevkifatOran}
              onChange={(e) => AlanGuncelle(setForm, 'tevkifatOran', e.target.value)}
              aria-label="Tevkifat oranı"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </TanimFormBolum>
  );
}

export function StokKartiSekmeIcerik({
  aktifSekme,
  form,
  setForm,
  stokBilgileri,
  birimSatirlari,
  onBirimSatirlariDegistir,
}: {
  aktifSekme: StokKartSekmeId;
  form: StokForm;
  setForm: (fn: (f: StokForm) => StokForm) => void;
  stokBilgileri: ReactNode;
  birimSatirlari: StokFiyatDuzenleSatir[];
  onBirimSatirlariDegistir: (satirlar: StokFiyatDuzenleSatir[]) => void;
}) {
  switch (aktifSekme) {
    case 'stok-bilgileri':
      return <>{stokBilgileri}</>;
    case 'birim-fiyatlar':
      return (
        <BirimVeFiyatlarSekmesi
          form={form}
          setForm={setForm}
          birimSatirlari={birimSatirlari}
          onBirimSatirlariDegistir={onBirimSatirlariDegistir}
        />
      );
    case 'ozel-kodlar':
      return <OzelKodlarSekmesi form={form} setForm={setForm} />;
    case 'muhasebe':
      return <MuhasebeSekmesi form={form} setForm={setForm} />;
    case 'resim':
      return <ResimSekmesi form={form} setForm={setForm} />;
    case 'analiz':
      return <AnalizSekmesi form={form} setForm={setForm} />;
    case 'istihbarat':
      return <IstihbaratSekmesi form={form} setForm={setForm} />;
    case 'e-donusum':
      return <EDonusumSekmesi form={form} setForm={setForm} />;
    default:
      return null;
  }
}
