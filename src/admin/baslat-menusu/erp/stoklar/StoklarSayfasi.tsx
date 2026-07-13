import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import '@/admin/ortak/datagrid/datagrid.css';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import { stokSil, stoklariGetir } from './api';
import { StokGelismisArama } from './StokGelismisArama';
import { StokKarti } from './StokKarti';
import {
  gelismisFiltreAktifMi,
  stokAramaKriteriVarMi,
  stoklariFiltrele,
} from './stokFiltre';
import {
  bosStokGelismisFiltre,
  type AdminStok,
  type StokGelismisFiltre,
  type StokKartModu,
} from './tipler';

type Gorunum = 'liste' | 'kart';

function secimKolonu(): KolonTanimi<AdminStok> {
  return {
    id: 'secim',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 40,
    zorunlu: true,
    siralama: false,
    degerAl: () => null,
  };
}

function islemlerKolonu(): KolonTanimi<AdminStok> {
  return {
    id: 'islemler',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 68,
    sabitSag: true,
    siralama: false,
    degerAl: () => null,
  };
}

export function StoklarSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler();
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [kartModu, setKartModu] = useState<StokKartModu>('yeni');
  const [kayitlar, setKayitlar] = useState<AdminStok[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreMetni, setFiltreMetni] = useState('');
  const [uygulananFiltreMetni, setUygulananFiltreMetni] = useState('');
  const [aramaGosterildi, setAramaGosterildi] = useState(false);
  const [gelismisFiltre, setGelismisFiltre] = useState<StokGelismisFiltre>(bosStokGelismisFiltre());
  const [gelismisTaslak, setGelismisTaslak] = useState<StokGelismisFiltre>(bosStokGelismisFiltre());
  const [gelismisAcik, setGelismisAcik] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aktifStokId, setAktifStokId] = useState<string | null>(null);
  const [silme, setSilme] = useState<AdminStok | null>(null);
  const [kartKirli, setKartKirli] = useState(false);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const kaydetRef = useRef<(() => Promise<void>) | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await stoklariGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Stoklar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const filtrelenmis = useMemo(
    () => stoklariFiltrele(kayitlar, uygulananFiltreMetni, gelismisFiltre),
    [kayitlar, uygulananFiltreMetni, gelismisFiltre]
  );

  const tekSeciliId = seciliIdler.length === 1 ? seciliIdler[0] : null;

  const listeyeDon = useCallback(() => {
    setGorunum('liste');
    setAktifStokId(null);
    setKartKirli(false);
    void yukle();
  }, [yukle]);

  const yeniAc = useCallback(() => {
    if (!eklemeVar) return;
    setKartModu('yeni');
    setAktifStokId(null);
    setGorunum('kart');
  }, [eklemeVar]);

  const duzenleAc = useCallback(() => {
    if (!duzenlemeVar || !tekSeciliId) return;
    setKartModu('duzenle');
    setAktifStokId(tekSeciliId);
    setGorunum('kart');
  }, [duzenlemeVar, tekSeciliId]);

  const inceleAc = useCallback(() => {
    if (!tekSeciliId) return;
    setKartModu('incele');
    setAktifStokId(tekSeciliId);
    setGorunum('kart');
  }, [tekSeciliId]);

  const placeholderBildir = useCallback(
    (baslik: string) => {
      basariBildir(`${baslik} ekranı yakında eklenecek.`, baslik);
    },
    [basariBildir]
  );

  const kaydet = useCallback(async () => {
    await kaydetRef.current?.();
  }, []);

  const gelismisAraAc = useCallback(() => {
    setGelismisTaslak(gelismisFiltre);
    setGelismisAcik(true);
  }, [gelismisFiltre]);

  const aramaSonuclariniGoster = useCallback(() => {
    setSeciliIdler([]);
    setAramaGosterildi(true);
  }, []);

  const hizliAraUygula = useCallback(() => {
    const taslakGelismis = gelismisAcik ? gelismisTaslak : gelismisFiltre;
    if (!stokAramaKriteriVarMi(filtreMetni, taslakGelismis)) {
      hataBildir('Aramak için stok kodu veya adı girin ya da gelişmiş arama kullanın.');
      return;
    }
    setUygulananFiltreMetni(filtreMetni);
    if (gelismisAcik) {
      setGelismisFiltre(gelismisTaslak);
      setGelismisAcik(false);
    }
    aramaSonuclariniGoster();
  }, [aramaSonuclariniGoster, filtreMetni, gelismisAcik, gelismisFiltre, gelismisTaslak, hataBildir]);

  const gelismisUygula = useCallback(() => {
    setGelismisFiltre(gelismisTaslak);
    setUygulananFiltreMetni(filtreMetni);
    setGelismisAcik(false);
    aramaSonuclariniGoster();
  }, [aramaSonuclariniGoster, filtreMetni, gelismisTaslak]);

  useModulAksiyonlari(
    {
      kaydet: gorunum === 'kart' && kartModu !== 'incele' ? () => void kaydet() : undefined,
      ekle: gorunum === 'liste' ? yeniAc : undefined,
      guncelle: gorunum === 'liste' ? duzenleAc : undefined,
      onizle: gorunum === 'liste' ? inceleAc : undefined,
      stokAra: gorunum === 'liste' ? gelismisAraAc : undefined,
      stokFiyatAnaliz:
        gorunum === 'liste' && tekSeciliId ? () => placeholderBildir('Fiyat Analiz') : undefined,
      stokEnvanterAnaliz:
        gorunum === 'liste' && tekSeciliId ? () => placeholderBildir('Envanter Analiz') : undefined,
      stokBirimListesi:
        gorunum === 'liste' && tekSeciliId ? () => placeholderBildir('Birim Listesi') : undefined,
      stokFiyatDuzenle:
        gorunum === 'liste' && tekSeciliId ? () => placeholderBildir('Fiyat Düzenle') : undefined,
    },
    {
      kaydet:
        gorunum === 'kart' &&
        kartModu !== 'incele' &&
        kartKirli &&
        (kartModu === 'yeni' ? eklemeVar : duzenlemeVar),
      ekle: gorunum === 'liste' && eklemeVar,
      guncelle: gorunum === 'liste' && !!tekSeciliId && duzenlemeVar,
      onizle: gorunum === 'liste' && !!tekSeciliId,
      stokAra: gorunum === 'liste',
      stokFiyatAnaliz: gorunum === 'liste' && !!tekSeciliId,
      stokEnvanterAnaliz: gorunum === 'liste' && !!tekSeciliId,
      stokBirimListesi: gorunum === 'liste' && !!tekSeciliId,
      stokFiyatDuzenle: gorunum === 'liste' && !!tekSeciliId && duzenlemeVar,
    },
    gorunum === 'kart' ? kartKirli : false
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await stokSil(silme.id);
      basariBildir('Stok silindi.');
      setSilme(null);
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  const kolonlar = useMemo((): KolonTanimi<AdminStok>[] => {
    return [
      secimKolonu(),
      {
        id: 'urunTipi',
        baslik: 'Stok Tipi',
        tip: 'metin',
        genislik: 100,
        siralama: true,
        degerAl: (s) => s.urunTipi,
      },
      {
        id: 'urunKodu',
        baslik: 'Stok Kodu',
        tip: 'metin',
        genislik: 120,
        minGenislik: 90,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.urunKodu,
        goster: (s) => <span className="dg-urun-kodu-alt">{s.urunKodu || '—'}</span>,
      },
      {
        id: 'sinifGrup',
        baslik: 'Sınıf Grup',
        tip: 'metin',
        genislik: 110,
        siralama: false,
        degerAl: () => '',
        goster: () => '—',
      },
      {
        id: 'urunAdi',
        baslik: 'Stok Adı',
        tip: 'metin',
        genislik: 220,
        minGenislik: 140,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.urunAdi,
        goster: (s) => <span className="dg-urun-adi-ust">{s.urunAdi || '—'}</span>,
      },
      {
        id: 'anaBirim',
        baslik: 'Ana Birim',
        tip: 'metin',
        genislik: 100,
        siralama: true,
        degerAl: (s) => s.anaBirim,
        goster: (s) => s.anaBirim || '—',
      },
      {
        id: 'durum',
        baslik: 'Durum',
        tip: 'salt-okunur',
        genislik: 88,
        siralama: true,
        degerAl: (s) => s.aktif,
        siralamaDegeri: (s) => (s.aktif ? 1 : 0),
        goster: (s) => <TanimDurumRozeti aktif={s.aktif} />,
      },
      {
        id: 'guncelleme',
        baslik: 'Güncelleme',
        tip: 'tarih',
        genislik: 130,
        siralama: true,
        degerAl: (s) => s.guncelleme,
        goster: (s) => tarihSaatFormatla(s.guncelleme),
      },
      islemlerKolonu(),
    ];
  }, []);

  return (
    <AdminModulKabuk baslik="Stoklar" aciklama="Stok kartlarını listeleyin, arayın ve yönetin.">
      <div className="ap-tanimlar-sayfa">
        {gorunum === 'kart' ? (
          <StokKarti
            mod={kartModu}
            stokId={aktifStokId}
            onGeri={listeyeDon}
            onKaydedildi={listeyeDon}
            kaydetRef={kaydetRef}
            onKirliDegistir={setKartKirli}
          />
        ) : (
          <div className={`dg-urun-slayt-kabuk${gelismisAcik ? ' dg-urun-slayt-kabuk--arama' : ''}`}>
            <div className="dg-urun-slayt-tablo">
              <div className="dg-demo-sayfa">
                <form
                  className="stoklar-liste-ara-cubugu"
                  onSubmit={(e) => {
                    e.preventDefault();
                    hizliAraUygula();
                  }}
                >
                  <div className="stoklar-liste-hizli-ara">
                    <label className="stoklar-liste-hizli-ara-alan">
                      <span>Ara</span>
                      <input
                        type="search"
                        value={filtreMetni}
                        onChange={(e) => setFiltreMetni(e.target.value)}
                        placeholder="Stok kodu veya adı…"
                        aria-label="Stok ara"
                      />
                    </label>
                  </div>
                  <button type="submit" className="stoklar-hizli-ara-tus">
                    Ara
                  </button>
                  <button
                    type="button"
                    className={`stoklar-gelismis-ara-tus${gelismisFiltreAktifMi(gelismisFiltre) ? ' stoklar-gelismis-ara-tus--aktif' : ''}`}
                    onClick={gelismisAraAc}
                  >
                    Gelişmiş Ara
                    {gelismisFiltreAktifMi(gelismisFiltre) ? (
                      <span className="stoklar-gelismis-ara-tus-nokta" aria-hidden />
                    ) : null}
                  </button>
                </form>

                {!aramaGosterildi ? (
                  <div className="stoklar-liste-bekleme">
                    <p className="stoklar-liste-bekleme-baslik">Stok arayın</p>
                    <p className="stoklar-liste-bekleme-metin">
                      Listeyi görmek için stok kodu veya adı yazıp Ara&apos;ya basın. Kayıt
                      bulunamazsa boş liste açılır; aksiyon çubuğundan Yeni ile ekleyebilirsiniz.
                    </p>
                  </div>
                ) : yukleniyor ? (
                  <TanimYukleniyor />
                ) : (
                  <DataGrid
                    key="stoklar_kayitlar_v1"
                    tabloBaslik="Stoklar"
                    tabloAltBaslik="Arama sonuçları"
                    yukleniyor={false}
                    gridApiRef={gridApiRef}
                    kolonlar={kolonlar}
                    satirlar={filtrelenmis}
                    depolamaAnahtari="stoklar_kayitlar_v1"
                    bosMesaj="Aramanızla eşleşen stok bulunamadı. Yeni ile stok kartı ekleyebilirsiniz."
                    satirSinifAdi={(s) => (!s.aktif ? 'dg-satir--pasif' : undefined)}
                    onSatirTikla={(s) => {
                      setKartModu('incele');
                      setAktifStokId(s.id);
                      setGorunum('kart');
                    }}
                    onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                    onSecimDegistir={setSeciliIdler}
                    formulMenuGoster={false}
                  />
                )}
              </div>
            </div>

            <StokGelismisArama
              acik={gelismisAcik}
              filtre={gelismisTaslak}
              onFiltreDegistir={setGelismisTaslak}
              onUygula={gelismisUygula}
              onKapat={() => setGelismisAcik(false)}
              sonucSayisi={stoklariFiltrele(kayitlar, filtreMetni, gelismisTaslak).length}
            />
          </div>
        )}
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu stok kartını silmek istiyor musunuz?"
        hedefMetin={silme ? `${silme.urunAdi} (${silme.urunKodu})` : ''}
        ariaLabel="Stok silme onayı"
      />
    </AdminModulKabuk>
  );
}
