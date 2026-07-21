import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { DgSecimUstKutu } from '@/admin/ortak/datagrid/DgSecimUstKutu';
import '@/admin/ortak/datagrid/datagrid.css';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { stokGuncelle, stokSil, stoklariGetir } from './api';
import { StokGelismisArama } from './StokGelismisArama';
import { StokFiyatDuzenle } from './StokFiyatDuzenle';
import { StokBirimListesi } from './StokBirimListesi';
import { StokEnvanterAnaliz } from './StokEnvanterAnaliz';
import { StokFiyatAnaliz } from './StokFiyatAnaliz';
import { StokKarti } from './StokKarti';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
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

type Gorunum = 'liste' | 'kart' | 'fiyatAnaliz' | 'envanterAnaliz' | 'birimListesi' | 'fiyatDuzenle';

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
  const [kartModu, setKartModu] = useState<StokKartModu>('duzenle');
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
  const [altKirli, setAltKirli] = useState(false);
  const [fiyatAnalizStok, setFiyatAnalizStok] = useState<AdminStok | null>(null);
  const [envanterAnalizStok, setEnvanterAnalizStok] = useState<AdminStok | null>(null);
  const [birimListesiStok, setBirimListesiStok] = useState<AdminStok | null>(null);
  const [fiyatDuzenleStok, setFiyatDuzenleStok] = useState<AdminStok | null>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const kaydetRef = useRef<(() => Promise<void>) | null>(null);
  const sayfaRef = useRef<HTMLDivElement | null>(null);

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

  /** Liste secimi veya alt ekrandaki stok — aksiyon cubugu baglami */
  const baglamStokId =
    tekSeciliId ??
    aktifStokId ??
    fiyatAnalizStok?.id ??
    envanterAnalizStok?.id ??
    birimListesiStok?.id ??
    fiyatDuzenleStok?.id ??
    null;

  const stokBul = useCallback(
    (id: string) =>
      kayitlar.find((k) => k.id === id) ?? filtrelenmis.find((k) => k.id === id) ?? null,
    [filtrelenmis, kayitlar]
  );

  const stokSatirSec = useCallback((satirId: string) => {
    gridApiRef.current?.secimAyarla([satirId]);
  }, []);

  const listeyeDon = useCallback(() => {
    setGorunum('liste');
    setAktifStokId(null);
    setFiyatAnalizStok(null);
    setEnvanterAnalizStok(null);
    setBirimListesiStok(null);
    setFiyatDuzenleStok(null);
    setKartKirli(false);
    setAltKirli(false);
    void yukle();
  }, [yukle]);

  const yeniAc = useCallback(() => {
    if (!eklemeVar) return;
    setKartModu('yeni');
    setAktifStokId(null);
    setGorunum('kart');
  }, [eklemeVar]);

  const duzenleAc = useCallback(
    (satirId?: string) => {
      const hedefId = satirId ?? baglamStokId;
      if (!duzenlemeVar) return;
      if (!hedefId) {
        hataBildir('Düzenlemek için bir stok satırı seçin.');
        return;
      }
      setSeciliIdler([hedefId]);
      setKartModu('duzenle');
      setAktifStokId(hedefId);
      setGorunum('kart');
    },
    [baglamStokId, duzenlemeVar, hataBildir]
  );

  const sagTikDuzenle = useCallback(
    (satirId: string) => {
      duzenleAc(satirId);
    },
    [duzenleAc]
  );

  const inceleAc = useCallback(
    (satirId?: string) => {
      const hedefId = satirId ?? baglamStokId;
      if (!hedefId) {
        hataBildir('İncelemek için bir stok satırı seçin.');
        return;
      }
      setSeciliIdler([hedefId]);
      setKartModu('incele');
      setAktifStokId(hedefId);
      setGorunum('kart');
    },
    [baglamStokId, hataBildir]
  );

  const placeholderBildir = useCallback(
    (baslik: string) => {
      basariBildir(`${baslik} ekranı yakında eklenecek.`, baslik);
    },
    [basariBildir]
  );

  const fiyatAnalizAc = useCallback(() => {
    const hedefId = baglamStokId;
    if (!hedefId) {
      hataBildir('Fiyat analizi için bir stok satırı seçin.');
      return;
    }
    if (gorunum === 'fiyatAnaliz' && fiyatAnalizStok?.id === hedefId) return;
    const stok = stokBul(hedefId) ?? fiyatAnalizStok;
    if (!stok || stok.id !== hedefId) {
      hataBildir('Seçili stok bulunamadı.');
      return;
    }
    setSeciliIdler([hedefId]);
    setFiyatAnalizStok(stok);
    setGorunum('fiyatAnaliz');
  }, [baglamStokId, fiyatAnalizStok, gorunum, hataBildir, stokBul]);

  const envanterAnalizAc = useCallback(() => {
    const hedefId = baglamStokId;
    if (!hedefId) {
      hataBildir('Envanter analizi için bir stok satırı seçin.');
      return;
    }
    if (gorunum === 'envanterAnaliz' && envanterAnalizStok?.id === hedefId) return;
    const stok = stokBul(hedefId) ?? envanterAnalizStok;
    if (!stok || stok.id !== hedefId) {
      hataBildir('Seçili stok bulunamadı.');
      return;
    }
    setSeciliIdler([hedefId]);
    setEnvanterAnalizStok(stok);
    setGorunum('envanterAnaliz');
  }, [baglamStokId, envanterAnalizStok, gorunum, hataBildir, stokBul]);

  const birimListesiAc = useCallback(() => {
    const hedefId = baglamStokId;
    if (!hedefId) {
      hataBildir('Birim listesi için bir stok satırı seçin.');
      return;
    }
    if (gorunum === 'birimListesi' && birimListesiStok?.id === hedefId) return;
    const stok = stokBul(hedefId) ?? birimListesiStok;
    if (!stok || stok.id !== hedefId) {
      hataBildir('Seçili stok bulunamadı.');
      return;
    }
    setSeciliIdler([hedefId]);
    setBirimListesiStok(stok);
    setGorunum('birimListesi');
  }, [baglamStokId, birimListesiStok, gorunum, hataBildir, stokBul]);

  const fiyatDuzenleAc = useCallback(() => {
    if (!duzenlemeVar) return;
    const hedefId = baglamStokId;
    if (!hedefId) {
      hataBildir('Fiyat düzenlemek için bir stok satırı seçin.');
      return;
    }
    if (gorunum === 'fiyatDuzenle' && fiyatDuzenleStok?.id === hedefId) return;
    const stok = stokBul(hedefId) ?? fiyatDuzenleStok;
    if (!stok || stok.id !== hedefId) {
      hataBildir('Seçili stok bulunamadı.');
      return;
    }
    setSeciliIdler([hedefId]);
    setFiyatDuzenleStok(stok);
    setGorunum('fiyatDuzenle');
  }, [baglamStokId, duzenlemeVar, fiyatDuzenleStok, gorunum, hataBildir, stokBul]);

  const kaydet = useCallback(async () => {
    if (!kaydetRef.current) {
      hataBildir('Kayıt formu henüz hazır değil.');
      throw new Error('Kayıt formu henüz hazır değil.');
    }
    await kaydetRef.current();
  }, [hataBildir]);

  const gelismisAraAc = useCallback(() => {
    setGelismisTaslak(gelismisFiltre);
    setGelismisAcik(true);
  }, [gelismisFiltre]);

  const araAksiyon = useCallback(() => {
    if (gorunum !== 'liste') {
      listeyeDon();
      return;
    }
    gelismisAraAc();
  }, [gelismisAraAc, gorunum, listeyeDon]);

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

  const kartFormu = gorunum === 'kart' && kartModu !== 'incele';
  const birimFiyatFormu =
    gorunum === 'birimListesi' || gorunum === 'fiyatDuzenle' || gorunum === 'fiyatAnaliz';
  const kaydedilebilirForm = kartFormu || birimFiyatFormu;
  const stokSecili = Boolean(baglamStokId);

  useModulAksiyonlari(
    {
      kaydet: kaydedilebilirForm ? () => kaydet() : undefined,
      ekle: eklemeVar ? yeniAc : undefined,
      sil: silmeVar
        ? () => {
            const hedefId = baglamStokId ?? seciliIdler[0];
            if (!hedefId) {
              hataBildir('Silmek için bir stok seçin.');
              return;
            }
            const hedef = stokBul(hedefId);
            if (hedef) setSilme(hedef);
          }
        : undefined,
      guncelle: duzenlemeVar ? () => duzenleAc(baglamStokId ?? undefined) : undefined,
      stokAra: araAksiyon,
      stokFiyatAnaliz: fiyatAnalizAc,
      stokEnvanterAnaliz: envanterAnalizAc,
      stokBirimListesi: birimListesiAc,
      stokFiyatDuzenle: fiyatDuzenleAc,
    },
    {
      kaydet:
        (kartFormu && (kartModu === 'yeni' ? eklemeVar : duzenlemeVar)) ||
        (birimFiyatFormu && duzenlemeVar),
      ekle: eklemeVar,
      sil: silmeVar && Boolean(baglamStokId || seciliIdler.length > 0),
      guncelle: duzenlemeVar && stokSecili,
      stokAra: true,
      stokFiyatAnaliz: stokSecili,
      stokEnvanterAnaliz: stokSecili,
      stokBirimListesi: stokSecili,
      stokFiyatDuzenle: duzenlemeVar && stokSecili,
    },
    kaydedilebilirForm ? (kartFormu ? kartKirli : altKirli) : false
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await stokSil(silme.id);
      basariBildir('Stok silindi.');
      setSilme(null);
      if (gorunum === 'kart') listeyeDon();
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, gorunum, hataBildir, listeyeDon, silme, yukle]);

  const topluDurumAyarla = useCallback(
    async (aktif: boolean) => {
      if (!duzenlemeVar) {
        hataBildir('Durum değiştirme yetkiniz yok.');
        return;
      }
      if (seciliIdler.length === 0) {
        hataBildir('Durum değiştirmek için en az bir stok seçin.');
        return;
      }
      try {
        await Promise.all(
          seciliIdler.map(async (id) => {
            const s = stokBul(id);
            if (!s) return;
            await stokGuncelle(id, {
              ustId: s.ustId,
              urunTipi: s.urunTipi,
              urunNevi: s.urunNevi,
              urunKodu: s.urunKodu,
              marka: s.marka,
              urunAdi: s.urunAdi,
              anaBirim: s.anaBirim,
              varsayilanBirim: s.varsayilanBirim,
              mensei: s.mensei,
              aktif,
            });
          })
        );
        basariBildir(
          aktif
            ? `${seciliIdler.length} stok aktif yapıldı.`
            : `${seciliIdler.length} stok pasif yapıldı.`
        );
        gridApiRef.current?.secimAyarla([]);
        setSeciliIdler([]);
        await yukle();
      } catch (e) {
        hataBildir(e instanceof Error ? e.message : 'Durum güncellenemedi');
      }
    },
    [basariBildir, duzenlemeVar, hataBildir, seciliIdler, stokBul, yukle]
  );

  const kolonlar = useMemo((): KolonTanimi<AdminStok>[] => {
    return [
      secimKolonu(),
      {
        id: 'stokTipiKodu',
        baslik: 'Stok Kodu/Tipi',
        tip: 'metin',
        genislik: 150,
        minGenislik: 110,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => `${s.urunKodu} ${s.urunTipi}`,
        siralamaDegeri: (s) => `${s.urunKodu} ${s.urunTipi}`,
        goster: (s) => {
          const kod = s.urunKodu?.trim() ?? '';
          const tip = s.urunTipi?.trim() ?? '';
          if (!kod && !tip) return <>—</>;
          return (
            <div className="dg-iskonto-hucre dg-urun-kodu-adi-hucre">
              {kod ? <span className="dg-urun-kodu-alt">{kod}</span> : null}
              {tip ? <span className="dg-urun-adi-ust">{tip}</span> : null}
            </div>
          );
        },
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

  const modulBaslik =
    gorunum === 'kart' && kartModu === 'yeni'
      ? 'Yeni Stok Kartı'
      : gorunum === 'kart' && kartModu === 'duzenle'
        ? 'Stok Kartı Düzenleme'
        : gorunum === 'kart' && kartModu === 'incele'
          ? 'Stok Kartı İnceleme'
          : 'Stoklar';

  const modulAciklama =
    gorunum === 'liste' ? 'Stok kartlarını listeleyin, arayın ve yönetin.' : undefined;

  return (
    <AdminModulKabuk
      baslik={modulBaslik}
      aciklama={modulAciklama}
      ustAksiyon={
        gorunum === 'kart' ? (
          <button
            type="button"
            className="cari-listeye-don-ikon"
            onClick={listeyeDon}
            title="Geri Dön"
            aria-label="Geri Dön"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : gorunum === 'liste' && aramaGosterildi && !yukleniyor ? (
          <div className="dg-modul-ust-araclar">
            <DgSecimUstKutu
              sayi={seciliIdler.length}
              durumTuslari={duzenlemeVar}
              onAktif={() => void topluDurumAyarla(true)}
              onPasif={() => void topluDurumAyarla(false)}
              onDisaAktar={() => gridApiRef.current?.csvIndir(true)}
              onTemizle={() => {
                gridApiRef.current?.secimAyarla([]);
                setSeciliIdler([]);
              }}
            />
            <div className="dg-ikon-grup dg-modul-ust-ikonlar">
              <button
                type="button"
                className="dg-tus dg-tus-ikon"
                title="Sütun görünürlüğü"
                onClick={(e) => gridApiRef.current?.sutunMenuToggle(e.currentTarget)}
              >
                <DgIkon ad="sutun" />
              </button>
              <button
                type="button"
                className="dg-tus dg-tus-ikon"
                title="CSV indir"
                onClick={() => gridApiRef.current?.csvIndir()}
              >
                <DgIkon ad="indir" />
              </button>
            </div>
          </div>
        ) : null
      }
    >
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
        ) : gorunum === 'fiyatAnaliz' && fiyatAnalizStok ? (
          <StokFiyatAnaliz
            stok={fiyatAnalizStok}
            onGeri={listeyeDon}
            onDuzenle={() => duzenleAc(fiyatAnalizStok.id)}
            onIncele={() => inceleAc(fiyatAnalizStok.id)}
            kaydetRef={kaydetRef}
            onKirliDegistir={setAltKirli}
            onGorunumDuzenle={() => placeholderBildir('Görünümü Düzenle')}
            onGorunumKaydet={() => placeholderBildir('Görünümü Kaydet')}
          />
        ) : gorunum === 'envanterAnaliz' && envanterAnalizStok ? (
          <StokEnvanterAnaliz
            stok={envanterAnalizStok}
            onGeri={listeyeDon}
            onDuzenle={() => duzenleAc(envanterAnalizStok.id)}
            onIncele={() => inceleAc(envanterAnalizStok.id)}
            onGorunumDuzenle={() => placeholderBildir('Görünümü Düzenle')}
            onGorunumKaydet={() => placeholderBildir('Görünümü Kaydet')}
          />
        ) : gorunum === 'birimListesi' && birimListesiStok ? (
          <StokBirimListesi
            stok={birimListesiStok}
            onGeri={listeyeDon}
            onDuzenle={() => duzenleAc(birimListesiStok.id)}
            onIncele={() => inceleAc(birimListesiStok.id)}
            kaydetRef={kaydetRef}
            onKirliDegistir={setAltKirli}
            onGorunumDuzenle={() => placeholderBildir('Görünümü Düzenle')}
            onGorunumKaydet={() => placeholderBildir('Görünümü Kaydet')}
          />
        ) : gorunum === 'fiyatDuzenle' && fiyatDuzenleStok ? (
          <StokFiyatDuzenle
            stok={fiyatDuzenleStok}
            onGeri={listeyeDon}
            onDuzenle={() => duzenleAc(fiyatDuzenleStok.id)}
            onIncele={() => inceleAc(fiyatDuzenleStok.id)}
            kaydetRef={kaydetRef}
            onKirliDegistir={setAltKirli}
            onGorunumDuzenle={() => placeholderBildir('Görünümü Düzenle')}
            onGorunumKaydet={() => placeholderBildir('Görünümü Kaydet')}
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
                      bulunamazsa boş liste açılır.
                    </p>
                  </div>
                ) : yukleniyor ? (
                  <TanimYukleniyor />
                ) : (
                  <div ref={sayfaRef} className="dg-demo-sag-tik-alan stoklar-tablo-alan">
                    <StoklarSagTikMenu
                      konteynerRef={sayfaRef}
                      duzenlemeVar={duzenlemeVar}
                      onDuzenle={sagTikDuzenle}
                      onIncele={(id) => stokSatirSec(id)}
                      onSatirSec={stokSatirSec}
                      onGorunumDuzenle={() => placeholderBildir('Görünümü Düzenle')}
                      onGorunumKaydet={() => placeholderBildir('Görünümü Kaydet')}
                    />
                    <DataGrid
                      key="stoklar_kayitlar_v2"
                      tabloBaslik=""
                      tabloAltBaslik=""
                      yukleniyor={false}
                      gridApiRef={gridApiRef}
                      kolonlar={kolonlar}
                      satirlar={filtrelenmis}
                      depolamaAnahtari="stoklar_kayitlar_v2"
                      bosMesaj="Aramanızla eşleşen stok bulunamadı."
                      satirSinifAdi={(s) => (!s.aktif ? 'dg-satir--pasif' : undefined)}
                      onSatirTikla={(s) => stokSatirSec(s.id)}
                      onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                      onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                      onSecimDegistir={setSeciliIdler}
                      formulMenuGoster={false}
                      ustSolAraclarGoster={false}
                      ustSagAraclarGoster={false}
                      ustAracGoster={false}
                      topluBarGoster={false}
                    />
                  </div>
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
