import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DatagridSagTikMenu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
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
import { BankaGelismisArama } from './BankaGelismisArama';
import {
  bankalariFiltrele,
  bosBankaGelismisFiltre,
  gelismisFiltreAktifMi,
  type BankaGelismisFiltre,
} from './bankaFiltre';
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
  const [uygulananFiltreMetni, setUygulananFiltreMetni] = useState('');
  const [gelismisFiltre, setGelismisFiltre] = useState<BankaGelismisFiltre>(bosBankaGelismisFiltre());
  const [gelismisTaslak, setGelismisTaslak] = useState<BankaGelismisFiltre>(bosBankaGelismisFiltre());
  const [gelismisAcik, setGelismisAcik] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [silme, setSilme] = useState<AdminBankaAnlasma | null>(null);
  const [kartKirli, setKartKirli] = useState(false);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);
  const kaydetRef = useRef<(() => Promise<boolean | void | string>) | null>(null);

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

  const filtrelenmis = useMemo(
    () => bankalariFiltrele(kayitlar, uygulananFiltreMetni, gelismisFiltre),
    [kayitlar, uygulananFiltreMetni, gelismisFiltre]
  );

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
    return await kaydetRef.current();
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

  const hizliAraUygula = useCallback(() => {
    if (gelismisAcik) {
      setGelismisFiltre(gelismisTaslak);
      setGelismisAcik(false);
    }
    setUygulananFiltreMetni(filtreMetni);
    setSeciliIdler([]);
  }, [filtreMetni, gelismisAcik, gelismisTaslak]);

  const gelismisAraAc = useCallback(() => {
    setGelismisTaslak(gelismisFiltre);
    setGelismisAcik(true);
  }, [gelismisFiltre]);

  const gelismisUygula = useCallback(() => {
    setGelismisFiltre(gelismisTaslak);
    setGelismisAcik(false);
    setUygulananFiltreMetni(filtreMetni);
    setSeciliIdler([]);
  }, [filtreMetni, gelismisTaslak]);

  const kartFormu = gorunum === 'kart' && kartModu !== 'incele';
  const kayitSecili = Boolean(baglamId);

  useModulAksiyonlari(
    {
      kaydet: kartFormu ? () => kaydet() : undefined,
      ekle: eklemeVar ? yeniAc : undefined,
      guncelle: duzenlemeVar ? () => duzenleAc() : undefined,
      sil: silmeVar ? silAksiyon : undefined,
      onizle: kartFormu ? listeyeDon : undefined,
    },
    {
      kaydet: kartFormu && (kartModu === 'yeni' ? eklemeVar : duzenlemeVar),
      ekle: eklemeVar && gorunum === 'liste',
      guncelle: duzenlemeVar && kayitSecili && gorunum === 'liste',
      sil: silmeVar && kayitSecili && gorunum === 'liste',
      onizle: kartFormu,
    },
    kartFormu ? kartKirli : false,
    {
      onizle: kartFormu ? 'Listeye Dön' : undefined,
    }
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await bankaAnlasmaSil(silme.id);
      basariBildir('Banka kaydı silindi.');
      setSilme(null);
      setSeciliIdler((idler) => idler.filter((id) => id !== silme.id));
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  if (!goruntulemeVar) {
    return (
      <YetkisizErisim aciklama="Bankaları görmek için Görüntüleme yetkisi gerekir." />
    );
  }

  return (
    <AdminModulKabuk>
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
          <div className={`dg-urun-slayt-kabuk${gelismisAcik ? ' dg-urun-slayt-kabuk--arama' : ''}`}>
            <div className="dg-urun-slayt-tablo">
              <div ref={sayfaRef} className="dg-demo-sayfa dg-demo-sag-tik-alan">
                <DatagridSagTikMenu
                  konteynerRef={sayfaRef}
                  kolonlar={kolonlar}
                  satirlar={filtrelenmis}
                  seciliSatirSayisi={seciliIdler.length}
                  gridApiRef={gridApiRef}
                  menuEtiketi="Bankalar menüsü"
                  satirEkleGoster={false}
                  satirCogaltGoster={false}
                  seciliSilGoster={false}
                  dahiliSilmeOnay={false}
                  onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                  onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                  satirSilMetniAl={bankaAnlasmaSatirEtiketi}
                  onAktifYap={
                    duzenlemeVar
                      ? () => {
                          void (async () => {
                            for (const id of seciliIdler) {
                              const k = kayitlar.find((x) => x.id === id);
                              if (!k || k.aktif) continue;
                              await bankaAnlasmaGuncelle(id, {
                                ...bankaAnlasmadanForm(k),
                                aktif: true,
                              });
                            }
                            await yukle();
                          })();
                        }
                      : undefined
                  }
                  onPasifYap={
                    duzenlemeVar
                      ? () => {
                          void (async () => {
                            for (const id of seciliIdler) {
                              const k = kayitlar.find((x) => x.id === id);
                              if (!k || !k.aktif) continue;
                              await bankaAnlasmaGuncelle(id, {
                                ...bankaAnlasmadanForm(k),
                                aktif: false,
                              });
                            }
                            await yukle();
                          })();
                        }
                      : undefined
                  }
                  onSecimiTemizle={() => {
                    gridApiRef.current?.secimAyarla([]);
                    setSeciliIdler([]);
                  }}
                  onBilgi={basariBildir}
                />

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
                        placeholder="Hesap adı, banka veya IBAN…"
                        aria-label="Banka ara"
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

                {yukleniyor ? (
                  <TanimYukleniyor />
                ) : (
                  <div className="stoklar-tablo-alan">
                    <DataGrid
                      key={`banka_anlasmalari_v${BANKA_KOLON_GENISLIK_SURUMU}`}
                      tabloBaslik=""
                      tabloAltBaslik=""
                      yukleniyor={false}
                      gridApiRef={gridApiRef}
                      kolonlar={kolonlar}
                      satirlar={filtrelenmis}
                      depolamaAnahtari={`banka_anlasmalari_v${BANKA_KOLON_GENISLIK_SURUMU}`}
                      bosMesaj="Kayıt bulunamadı. Arama kriterlerini değiştirin veya Yeni ile banka kaydı ekleyin."
                      satirSinifAdi={(s) => (!s.aktif ? 'dg-satir--pasif' : undefined)}
                      onSatirTikla={(s) => gridApiRef.current?.secimAyarla([s.id])}
                      onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                      onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                      onSecimDegistir={setSeciliIdler}
                      formulMenuGoster
                      ustSolAraclarGoster={false}
                      ustSagAraclarGoster={false}
                      ustAracGoster={false}
                      topluBarGoster={false}
                    />
                  </div>
                )}
              </div>
            </div>

            <BankaGelismisArama
              acik={gelismisAcik}
              filtre={gelismisTaslak}
              onFiltreDegistir={setGelismisTaslak}
              onUygula={gelismisUygula}
              onKapat={() => setGelismisAcik(false)}
              sonucSayisi={bankalariFiltrele(kayitlar, filtreMetni, gelismisTaslak).length}
            />
          </div>
        )}
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu banka kaydını silmek istiyor musunuz?"
        hedefMetin={silme ? `«${bankaAnlasmaSatirEtiketi(silme)}»` : ''}
        ariaLabel="Banka kaydı silme onayı"
      />
    </AdminModulKabuk>
  );
}
