import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TanimKayitModal,
  type TanimModalHedef,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitModal';
import { TanimBagliSilOnayModal } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimBagliSilOnayModal';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
  TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import '@/admin/ortak/datagrid/datagrid.css';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tanimHedefMetni } from '@/admin/baslat-menusu/tanimlar/araclar/tanimBaglilari';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { DonemlerPaneli } from './DonemlerPaneli';
import { KayitlarUstBar } from './KayitlarUstBar';
import { kayitlarGridKolonlari } from './kayitlarGridKolonlari';
import { satirlariKur } from './satirlariKur';
import { SubelerPaneli } from './SubelerPaneli';
import { TIP_ETIKET, type KayitTipi, type SilmeHedef, type TanimSatir } from './tipler';
import { useKayitlarVeri } from './useKayitlarVeri';

type FirmaIcSekme = 'subeler' | 'donemler';

function GozIkon({ kapali }: { kapali?: boolean }) {
  if (kapali) {
    return (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
        <path
          d="M2 8s2.2-3.5 6-3.5S14 8 14 8s-2.2 3.5-6 3.5S2 8 2 8Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="8" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 13.5 13 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M2 8s2.2-3.5 6-3.5S14 8 14 8s-2.2 3.5-6 3.5S2 8 2 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function KartIkon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="5.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2.5" width="5.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9.5" width="5.5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9.5" width="5.5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function KayitlarSayfasi() {
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('tanimlar');
  const { setRehberModulId } = useAdminAksiyon();
  const {
    yukleniyor,
    firmalar,
    subeler,
    depolar,
    kasalar,
    donemler,
    seciliFirmaId,
    seciliFirma,
    firmaSubeleri,
    setAktifSubeId,
    firmaSec,
    firmaPasifMi,
    subePasifMi,
    subeMap,
    yukle,
    silinecek,
    setSilinecek,
    bagliSil,
    setBagliSil,
    bagliOzet,
    silBaslat: silBaslatVeri,
    silOnayla,
    hataBildir,
  } = useKayitlarVeri();

  const [icSekme, setIcSekme] = useState<FirmaIcSekme>('subeler');
  const [gozAcik, setGozAcik] = useState(false);
  const [yatayKart, setYatayKart] = useState(false);
  const [modalHedef, setModalHedef] = useState<TanimModalHedef | null>(null);
  const [sonEkleTipi, setSonEkleTipi] = useState<KayitTipi>('firma');

  useEffect(() => {
    setRehberModulId('tanimlar');
    return () => setRehberModulId(null);
  }, [setRehberModulId]);

  useEffect(() => {
    setGozAcik(false);
    setYatayKart(false);
  }, [seciliFirmaId]);

  const firmaDonemleri = useMemo(
    () => donemler.filter((d) => d.firmaId === seciliFirmaId),
    [donemler, seciliFirmaId]
  );

  const firmaDepolari = useMemo(() => {
    const idler = new Set(firmaSubeleri.map((s) => s.id));
    return depolar.filter((d) => idler.has(d.subeId));
  }, [depolar, firmaSubeleri]);

  const firmaKasalari = useMemo(() => {
    const idler = new Set(firmaSubeleri.map((s) => s.id));
    return kasalar.filter((k) => idler.has(k.subeId));
  }, [kasalar, firmaSubeleri]);

  const gridSatirlari = useMemo(() => {
    const tum = satirlariKur({
      firma: seciliFirma,
      firmaSubeleri,
      donemler,
      depolar,
      kasalar,
      subeMap,
    }).filter((s) => s.tip !== 'firma');

    if (icSekme === 'donemler') return tum.filter((s) => s.tip === 'donem');
    return tum.filter((s) => s.tip === 'sube');
  }, [seciliFirma, firmaSubeleri, donemler, depolar, kasalar, subeMap, icSekme]);

  const ekleAc = useCallback(
    (tip: KayitTipi, subeId?: string) => {
      if (!eklemeVar) {
        hataBildir('Yeni kayıt ekleme yetkiniz yok');
        return;
      }
      setSonEkleTipi(tip);
      if (tip === 'firma') {
        setModalHedef({ tip: 'firma', mod: 'ekle' });
        return;
      }
      if (!seciliFirmaId) {
        hataBildir('Önce bir firma seçin');
        return;
      }
      if (firmaPasifMi(seciliFirmaId)) {
        hataBildir('Pasif firmaya kayıt eklenemez');
        return;
      }
      if (tip === 'sube') {
        setModalHedef({ tip: 'sube', mod: 'ekle', firmaId: seciliFirmaId });
        return;
      }
      if (tip === 'donem') {
        setModalHedef({ tip: 'donem', mod: 'ekle', firmaId: seciliFirmaId });
        return;
      }
      if (tip === 'depo' || tip === 'kasa') {
        if (!subeId) {
          hataBildir(
            tip === 'depo'
              ? 'Depo eklemek için şube satırından + Depo kullanın'
              : 'Kasa eklemek için şube satırından + Kasa kullanın'
          );
          return;
        }
        setAktifSubeId(subeId);
        setModalHedef({ tip, mod: 'ekle', firmaId: seciliFirmaId, subeId });
      }
    },
    [eklemeVar, hataBildir, seciliFirmaId, firmaPasifMi, setAktifSubeId]
  );

  const kaydedildi = useCallback(
    async (_tip: TanimSekmeId, firmaId?: string) => {
      await yukle(firmaId ?? seciliFirmaId);
    },
    [yukle, seciliFirmaId]
  );

  const aksiyonEkle = useCallback(() => {
    if (sonEkleTipi === 'depo' || sonEkleTipi === 'kasa') {
      ekleAc(icSekme === 'donemler' ? 'donem' : 'sube');
      return;
    }
    ekleAc(sonEkleTipi);
  }, [ekleAc, sonEkleTipi, icSekme]);

  useModulAksiyonlari(
    {
      ekle: eklemeVar ? aksiyonEkle : undefined,
      sil: undefined,
    },
    {
      ekle: eklemeVar && (sonEkleTipi === 'firma' || !!seciliFirmaId),
      sil: false,
    },
    false,
    {
      ekle: `Yeni ${TIP_ETIKET[sonEkleTipi === 'depo' || sonEkleTipi === 'kasa' ? (icSekme === 'donemler' ? 'donem' : 'sube') : sonEkleTipi]}`,
    }
  );

  const silHedef = useCallback(
    (hedef: SilmeHedef) => {
      if (!silmeVar) {
        hataBildir('Kayıt silme yetkiniz yok');
        return;
      }
      silBaslatVeri(hedef);
    },
    [silmeVar, hataBildir, silBaslatVeri]
  );

  const duzenleAc = useCallback(
    (satir: TanimSatir) => {
      if (!duzenlemeVar) {
        hataBildir('Kayıt düzenleme yetkiniz yok');
        return;
      }
      if (satir.tip === 'firma')
        setModalHedef({ tip: 'firma', mod: 'duzenle', kayit: satir.kayit as AdminFirma });
      else if (satir.tip === 'sube')
        setModalHedef({ tip: 'sube', mod: 'duzenle', kayit: satir.kayit as AdminSube });
      else if (satir.tip === 'depo')
        setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: satir.kayit as AdminDepo });
      else if (satir.tip === 'kasa')
        setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: satir.kayit as AdminKasa });
      else if (satir.tip === 'donem')
        setModalHedef({ tip: 'donem', mod: 'duzenle', kayit: satir.kayit as AdminDonem });
    },
    [duzenlemeVar, hataBildir]
  );

  const gridSil = useCallback(
    (satir: TanimSatir) => {
      const hedef: SilmeHedef =
        satir.tip === 'firma'
          ? { tip: 'firma', kayit: satir.kayit as AdminFirma }
          : satir.tip === 'sube'
            ? { tip: 'sube', kayit: satir.kayit as AdminSube }
            : satir.tip === 'depo'
              ? { tip: 'depo', kayit: satir.kayit as AdminDepo }
              : satir.tip === 'kasa'
                ? { tip: 'kasa', kayit: satir.kayit as AdminKasa }
                : { tip: 'donem', kayit: satir.kayit as AdminDonem };
      silHedef(hedef);
    },
    [silHedef]
  );

  const kolonlar = useMemo(() => kayitlarGridKolonlari(), []);

  const satirSinifAdi = useCallback(
    (s: TanimSatir) => {
      const pasif =
        !s.aktif ||
        firmaPasifMi(s.firmaId) ||
        ((s.tip === 'depo' || s.tip === 'kasa') &&
          s.subeId != null &&
          subePasifMi(s.subeId));
      return pasif ? 'ap-tanimlar-satir--pasif' : undefined;
    },
    [firmaPasifMi, subePasifMi]
  );

  if (yukleniyor && firmalar.length === 0) return <TanimYukleniyor />;

  const firmaPasif = !!seciliFirmaId && firmaPasifMi(seciliFirmaId);

  return (
    <div className="ap-tanimlar-kayit-sayfa">
      <KayitlarUstBar
        firmalar={firmalar}
        seciliFirmaId={seciliFirmaId}
        onFirmaSec={firmaSec}
        eklemeVar={eklemeVar}
        duzenlemeVar={duzenlemeVar}
        firmaPasif={firmaPasif}
        onFirmaEkle={() => ekleAc('firma')}
        onFirmaDuzenle={() => {
          if (!seciliFirma || !duzenlemeVar) return;
          setModalHedef({ tip: 'firma', mod: 'duzenle', kayit: seciliFirma });
        }}
      />

      <div
        className={`ap-tanimlar-kayit-ana ap-tanimlar-kayit-ana--hiyerarsi${gozAcik ? ' ap-tanimlar-kayit-ana--grid' : ''}`}
      >
        {!seciliFirma && firmalar.length === 0 ? (
          <p className="ap-tanimlar-firma-bos">Henüz firma yok — + Firma ile ekleyin</p>
        ) : !seciliFirma ? (
          <p className="ap-tanimlar-firma-bos">Firma arayıp seçin</p>
        ) : (
          <>
            <div className="ap-tanimlar-ic-sekme" role="tablist" aria-label="Firma içeriği">
              <button
                type="button"
                role="tab"
                aria-selected={icSekme === 'subeler'}
                className={`ap-tanimlar-ic-sekme-tus${icSekme === 'subeler' ? ' ap-tanimlar-ic-sekme-tus--aktif' : ''}`}
                onClick={() => setIcSekme('subeler')}
              >
                Şubeler
                <span className="ap-tanimlar-ic-sekme-sayi">{firmaSubeleri.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={icSekme === 'donemler'}
                className={`ap-tanimlar-ic-sekme-tus${icSekme === 'donemler' ? ' ap-tanimlar-ic-sekme-tus--aktif' : ''}`}
                onClick={() => setIcSekme('donemler')}
              >
                Dönemler
                <span className="ap-tanimlar-ic-sekme-sayi">{firmaDonemleri.length}</span>
              </button>

              <div className="ap-tanimlar-gorunum-grup" role="group" aria-label="Görünüm">
                {!gozAcik ? (
                  <button
                    type="button"
                    className={`ap-tanimlar-goz-tus${yatayKart ? ' ap-tanimlar-goz-tus--aktif' : ''}`}
                    onClick={() => setYatayKart((v) => !v)}
                    title={yatayKart ? 'Liste görünümü' : 'Yatay kart görünümü'}
                    aria-pressed={yatayKart}
                    aria-label={yatayKart ? 'Liste görünümü' : 'Yatay kart görünümü'}
                  >
                    <KartIkon />
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`ap-tanimlar-goz-tus${gozAcik ? ' ap-tanimlar-goz-tus--aktif' : ''}`}
                  onClick={() => setGozAcik((v) => !v)}
                  title={gozAcik ? 'Tabloyu kapat' : 'Tablo görünümü'}
                  aria-pressed={gozAcik}
                  aria-label={gozAcik ? 'Tabloyu kapat' : 'Tablo görünümü'}
                >
                  <GozIkon kapali={gozAcik} />
                </button>
              </div>
            </div>

            {gozAcik ? (
              <div className="ap-tanimlar-goz-grid">
                <DataGrid
                  tabloBaslik=""
                  kolonlar={kolonlar}
                  satirlar={gridSatirlari}
                  depolamaAnahtari="tanimlar-kayitlar-goz-v3"
                  kompakt
                  formulMenuGoster={false}
                  sutunSabitleGoster={false}
                  bosMesaj={
                    icSekme === 'donemler'
                      ? 'Bu firmada dönem kaydı yok'
                      : 'Bu firmada şube kaydı yok'
                  }
                  onSatirTikla={duzenlemeVar ? duzenleAc : undefined}
                  onSatirDuzenle={duzenlemeVar ? duzenleAc : undefined}
                  onSatirSil={silmeVar ? gridSil : undefined}
                  satirSinifAdi={satirSinifAdi}
                />
              </div>
            ) : icSekme === 'subeler' ? (
              <SubelerPaneli
                subeler={firmaSubeleri}
                depolar={firmaDepolari}
                kasalar={firmaKasalari}
                yatayKart={yatayKart}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                silmeVar={silmeVar}
                firmaPasif={firmaPasif}
                onSubeEkle={() => ekleAc('sube')}
                onSubeDuzenle={(s) =>
                  setModalHedef({ tip: 'sube', mod: 'duzenle', kayit: s })
                }
                onSubeSil={(s) => silHedef({ tip: 'sube', kayit: s })}
                onDepoEkle={(subeId) => ekleAc('depo', subeId)}
                onKasaEkle={(subeId) => ekleAc('kasa', subeId)}
                onDepoDuzenle={(d) =>
                  setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: d })
                }
                onKasaDuzenle={(k) =>
                  setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: k })
                }
                onDepoSil={(d) => silHedef({ tip: 'depo', kayit: d })}
                onKasaSil={(k) => silHedef({ tip: 'kasa', kayit: k })}
              />
            ) : (
              <DonemlerPaneli
                donemler={firmaDonemleri}
                yatayKart={yatayKart}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                silmeVar={silmeVar}
                firmaPasif={firmaPasif}
                onDonemEkle={() => ekleAc('donem')}
                onDonemDuzenle={(d) =>
                  setModalHedef({ tip: 'donem', mod: 'duzenle', kayit: d })
                }
                onDonemSil={(d) => silHedef({ tip: 'donem', kayit: d })}
              />
            )}
          </>
        )}
      </div>

      <TanimKayitModal
        hedef={modalHedef}
        subeler={subeler}
        firmalar={firmalar}
        onKapat={() => setModalHedef(null)}
        onKaydedildi={(tip, firmaId) => void kaydedildi(tip, firmaId)}
      />

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) void silOnayla(silinecek);
        }}
        baslik="Bu kaydı silmek istiyor musunuz?"
        hedefMetin={silinecek ? tanimHedefMetni(silinecek.tip, silinecek.kayit) : ''}
        ariaLabel="Tanım kaydı silme onayı"
      />

      <TanimBagliSilOnayModal
        acik={!!bagliSil}
        onKapat={() => setBagliSil(null)}
        onOnayla={(mod) => {
          if (bagliSil) void silOnayla(bagliSil, mod);
        }}
        hedefMetin={bagliSil ? tanimHedefMetni(bagliSil.tip, bagliSil.kayit) : ''}
        bagliOzet={bagliOzet}
      />
    </div>
  );
}
