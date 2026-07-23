import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TanimKayitModal,
  type TanimModalHedef,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitModal';
import { TanimBagliSilOnayModal } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimBagliSilOnayModal';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type {
  TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tanimHedefMetni } from '@/admin/baslat-menusu/tanimlar/araclar/tanimBaglilari';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { DonemlerPaneli } from './DonemlerPaneli';
import { KayitlarUstBar } from './KayitlarUstBar';
import { SubelerPaneli } from './SubelerPaneli';
import { TIP_ETIKET, type KayitTipi, type SilmeHedef } from './tipler';
import { useKayitlarVeri } from './useKayitlarVeri';

type FirmaIcSekme = 'subeler' | 'donemler';

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
  const [modalHedef, setModalHedef] = useState<TanimModalHedef | null>(null);
  const [sonEkleTipi, setSonEkleTipi] = useState<KayitTipi>('firma');

  useEffect(() => {
    setRehberModulId('tanimlar');
    return () => setRehberModulId(null);
  }, [setRehberModulId]);

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

      <div className="ap-tanimlar-kayit-ana ap-tanimlar-kayit-ana--hiyerarsi">
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
            </div>

            {icSekme === 'subeler' ? (
              <SubelerPaneli
                subeler={firmaSubeleri}
                depolar={firmaDepolari}
                kasalar={firmaKasalari}
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
