import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { DgSecimUstKutu } from '@/admin/ortak/datagrid/DgSecimUstKutu';
import '@/admin/ortak/datagrid/datagrid.css';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import '@/admin/baslat-menusu/erp/banka-anlasmalari/banka-anlasmalari.css';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { bankaAnlasmaGuncelle, bankaAnlasmaSil, bankaAnlasmalariGetir } from './api';
import { BankaAnlasmaKart } from './bilesenler/BankaAnlasmaKart';
import { BANKA_KOLON_GENISLIK_SURUMU, bankaAnlasmaKolonlari } from './bankaKolonlari';
import { bankaAnlasmadanForm, bankaAnlasmaSatirEtiketi } from './bankaYardimci';
import type { AdminBankaAnlasma, BankaKartModu } from './tipler';

type Gorunum = 'liste' | 'kart';

export function BankaAnlasmalariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { goruntulemeVar, eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('banka-anlasmalari');
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [kartModu, setKartModu] = useState<BankaKartModu>('yeni');
  const [kayitlar, setKayitlar] = useState<AdminBankaAnlasma[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreMetni, setFiltreMetni] = useState('');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [silme, setSilme] = useState<AdminBankaAnlasma | null>(null);
  const [kartKirli, setKartKirli] = useState(false);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const kaydetRef = useRef<(() => Promise<void>) | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await bankaAnlasmalariGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıtlar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const filtrelenmis = useMemo(() => {
    const q = filtreMetni.trim().toLocaleLowerCase('tr');
    if (!q) return kayitlar;
    return kayitlar.filter((k) => {
      const iban = k.ibanModu === 'TR' ? `tr${k.iban}` : k.iban;
      return (
        k.hesapIsmi.toLocaleLowerCase('tr').includes(q) ||
        k.bankaAdi.toLocaleLowerCase('tr').includes(q) ||
        iban.toLocaleLowerCase('tr').includes(q) ||
        k.hesapNumarasi.toLocaleLowerCase('tr').includes(q)
      );
    });
  }, [filtreMetni, kayitlar]);

  const kolonlar = useMemo(() => bankaAnlasmaKolonlari(), []);
  const baglamId = seciliIdler[0] ?? aktifId;

  const listeyeDon = useCallback(() => {
    setGorunum('liste');
    setAktifId(null);
    setKartKirli(false);
    void yukle();
  }, [yukle]);

  const yeniAc = useCallback(() => {
    if (!eklemeVar) return;
    setKartModu('yeni');
    setAktifId(null);
    setGorunum('kart');
  }, [eklemeVar]);

  const duzenleAc = useCallback(
    (satirId?: string) => {
      const hedefId = satirId ?? baglamId;
      if (!duzenlemeVar) return;
      if (!hedefId) {
        hataBildir('Düzenlemek için bir satır seçin.');
        return;
      }
      setSeciliIdler([hedefId]);
      setKartModu('duzenle');
      setAktifId(hedefId);
      setGorunum('kart');
    },
    [baglamId, duzenlemeVar, hataBildir]
  );

  const kaydet = useCallback(async () => {
    if (!kaydetRef.current) {
      hataBildir('Kayıt formu henüz hazır değil.');
      throw new Error('Kayıt formu henüz hazır değil.');
    }
    await kaydetRef.current();
  }, [hataBildir]);

  const silAksiyon = useCallback(() => {
    if (!silmeVar) return;
    const hedefId = baglamId;
    if (!hedefId) {
      hataBildir('Silmek için bir satır seçin.');
      return;
    }
    const kayit = kayitlar.find((k) => k.id === hedefId);
    if (!kayit) {
      hataBildir('Seçili kayıt bulunamadı.');
      return;
    }
    setSilme(kayit);
  }, [baglamId, hataBildir, kayitlar, silmeVar]);

  const kartFormu = gorunum === 'kart' && kartModu !== 'incele';
  const kayitSecili = Boolean(baglamId);

  useModulAksiyonlari(
    {
      kaydet: kartFormu ? () => kaydet() : undefined,
      ekle: eklemeVar ? yeniAc : undefined,
      guncelle: duzenlemeVar ? () => duzenleAc() : undefined,
      sil: silmeVar ? silAksiyon : undefined,
    },
    {
      kaydet: kartFormu && (kartModu === 'yeni' ? eklemeVar : duzenlemeVar),
      ekle: eklemeVar && gorunum === 'liste',
      guncelle: duzenlemeVar && kayitSecili && gorunum === 'liste',
      sil: silmeVar && kayitSecili && gorunum === 'liste',
    },
    kartFormu ? kartKirli : false
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await bankaAnlasmaSil(silme.id);
      basariBildir('Banka anlaşması silindi.');
      setSilme(null);
      setSeciliIdler((idler) => idler.filter((id) => id !== silme.id));
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  if (!goruntulemeVar) {
    return (
      <YetkisizErisim aciklama="Banka anlaşmalarını görmek için Görüntüleme yetkisi gerekir." />
    );
  }

  return (
    <AdminModulKabuk
      baslik={gorunum === 'kart' ? (kartModu === 'yeni' ? 'Yeni Banka Anlaşması' : 'Banka Anlaşması') : 'Banka Anlaşmaları'}
      aciklama={
        gorunum === 'kart'
          ? 'Hesap tipine göre banka, kredi veya POS bilgilerini yönetin.'
          : 'Banka hesapları, kredi ve POS anlaşmaları.'
      }
      ustAksiyon={
        gorunum === 'kart' ? (
          <button
            type="button"
            className="cari-listeye-don-ikon cari-listeye-don-ikon--liste"
            onClick={listeyeDon}
            title="Listeleme"
            aria-label="Listeye dön"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <path
                d="M8 6h12M8 12h12M8 18h12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M4 6h.01M4 12h.01M4 18h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : !yukleniyor ? (
          <div className="dg-modul-ust-araclar">
            <DgSecimUstKutu
              sayi={seciliIdler.length}
              durumTuslari={duzenlemeVar}
              onAktif={() => {
                void (async () => {
                  for (const id of seciliIdler) {
                    const k = kayitlar.find((x) => x.id === id);
                    if (!k || k.aktif) continue;
                    await bankaAnlasmaGuncelle(id, { ...bankaAnlasmadanForm(k), aktif: true });
                  }
                  await yukle();
                })();
              }}
              onPasif={() => {
                void (async () => {
                  for (const id of seciliIdler) {
                    const k = kayitlar.find((x) => x.id === id);
                    if (!k || !k.aktif) continue;
                    await bankaAnlasmaGuncelle(id, { ...bankaAnlasmadanForm(k), aktif: false });
                  }
                  await yukle();
                })();
              }}
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
          <BankaAnlasmaKart
            mod={kartModu}
            kayitId={aktifId}
            onKaydedildi={listeyeDon}
            kaydetRef={kaydetRef}
            onKirliDegistir={setKartKirli}
          />
        ) : (
          <div className="dg-urun-slayt-kabuk">
            <div className="dg-urun-slayt-tablo">
              <form
                className="stoklar-liste-ara-cubugu"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="stoklar-liste-hizli-ara">
                  <label className="stoklar-liste-hizli-ara-alan">
                    <span>Ara</span>
                    <input
                      type="search"
                      value={filtreMetni}
                      onChange={(e) => setFiltreMetni(e.target.value)}
                      placeholder="Hesap ismi, banka veya IBAN…"
                      aria-label="Banka anlaşması ara"
                    />
                  </label>
                </div>
              </form>

              {yukleniyor ? (
                <TanimYukleniyor />
              ) : (
                <div className="stoklar-tablo-alan">
                  <DataGrid
                    key={`banka_anlasmalari_v${BANKA_KOLON_GENISLIK_SURUMU}`}
                    tabloBaslik=""
                    tabloAltBaslik="Banka anlaşmaları"
                    yukleniyor={false}
                    gridApiRef={gridApiRef}
                    kolonlar={kolonlar}
                    satirlar={filtrelenmis}
                    depolamaAnahtari={`banka_anlasmalari_v${BANKA_KOLON_GENISLIK_SURUMU}`}
                    bosMesaj="Henüz banka anlaşması yok. Yeni ile ekleyebilirsiniz."
                    satirSinifAdi={(s) => (!s.aktif ? 'dg-satir--pasif' : undefined)}
                    onSatirTikla={(s) => gridApiRef.current?.secimAyarla([s.id])}
                    onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                    onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                    onSecimDegistir={setSeciliIdler}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu banka anlaşmasını silmek istiyor musunuz?"
        hedefMetin={silme ? `«${bankaAnlasmaSatirEtiketi(silme)}»` : ''}
        ariaLabel="Banka anlaşması silme onayı"
      />
    </AdminModulKabuk>
  );
}
