import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { BasitKayitPaneli } from './BasitKayitPaneli';
import { FirmalarPaneli } from './FirmalarPaneli';
import { KayitlarUstBar } from './KayitlarUstBar';
import { kayitlarGridKolonlari } from './kayitlarGridKolonlari';
import { satirlariKur } from './satirlariKur';
import { SubelerPaneli } from './SubelerPaneli';
import { TIP_ETIKET, type KayitTipi, type SilmeHedef, type TanimSatir } from './tipler';
import { useKayitlarVeri } from './useKayitlarVeri';

type KayitIcSekme = 'firmalar' | 'donemler' | 'subeler' | 'depolar' | 'kasalar';
type DuzenleHoverHedef = Extract<TanimModalHedef, { mod: 'duzenle' }>;

const IC_SEKMELER: { id: KayitIcSekme; etiket: string }[] = [
  { id: 'firmalar', etiket: 'Firmalar' },
  { id: 'donemler', etiket: 'Dönemler' },
  { id: 'subeler', etiket: 'Şubeler' },
  { id: 'depolar', etiket: 'Depolar' },
  { id: 'kasalar', etiket: 'Kasalar' },
];

function sekmedenTip(sekme: KayitIcSekme): KayitTipi {
  if (sekme === 'firmalar') return 'firma';
  if (sekme === 'donemler') return 'donem';
  if (sekme === 'subeler') return 'sube';
  if (sekme === 'depolar') return 'depo';
  return 'kasa';
}

function satirDuzenleHedefi(satir: TanimSatir): DuzenleHoverHedef | null {
  if (satir.tip === 'firma') return { tip: 'firma', mod: 'duzenle', kayit: satir.kayit as AdminFirma };
  if (satir.tip === 'sube') return { tip: 'sube', mod: 'duzenle', kayit: satir.kayit as AdminSube };
  if (satir.tip === 'depo') return { tip: 'depo', mod: 'duzenle', kayit: satir.kayit as AdminDepo };
  if (satir.tip === 'kasa') return { tip: 'kasa', mod: 'duzenle', kayit: satir.kayit as AdminKasa };
  if (satir.tip === 'donem') return { tip: 'donem', mod: 'duzenle', kayit: satir.kayit as AdminDonem };
  return null;
}

function firmalariSatirYap(liste: AdminFirma[]): TanimSatir[] {
  return liste.map((f) => ({
    id: `firma:${f.id}`,
    tip: 'firma' as const,
    kod: f.firmaKodu,
    ad: f.firmaAdi,
    baglamMetin: '',
    aktif: f.aktif,
    olusturma: f.olusturma,
    guncelleme: f.guncelleme,
    firmaId: f.id,
    kayit: f,
  }));
}

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

  const [icSekme, setIcSekme] = useState<KayitIcSekme>('firmalar');
  const [gozAcik, setGozAcik] = useState(false);
  const [yatayKart, setYatayKart] = useState(false);
  const [modalHedef, setModalHedef] = useState<TanimModalHedef | null>(null);
  const hoverDuzenleRef = useRef<DuzenleHoverHedef | null>(null);

  const kayitHoverAyarla = useCallback((hedef: DuzenleHoverHedef | null) => {
    hoverDuzenleRef.current = hedef;
  }, []);

  useEffect(() => {
    setRehberModulId('tanimlar');
    return () => setRehberModulId(null);
  }, [setRehberModulId]);

  useEffect(() => {
    setGozAcik(false);
    setYatayKart(false);
    hoverDuzenleRef.current = null;
  }, [seciliFirmaId]);

  useEffect(() => {
    hoverDuzenleRef.current = null;
  }, [icSekme, gozAcik, yatayKart]);

  useEffect(() => {
    if (!duzenlemeVar) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'g' && e.key !== 'G') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (modalHedef || silinecek || bagliSil) return;
      const hedef = hoverDuzenleRef.current;
      if (!hedef) return;
      e.preventDefault();
      setModalHedef(hedef);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duzenlemeVar, modalHedef, silinecek, bagliSil]);

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

  const sekmeSayilari = useMemo(
    () => ({
      firmalar: firmalar.length,
      donemler: firmaDonemleri.length,
      subeler: firmaSubeleri.length,
      depolar: firmaDepolari.length,
      kasalar: firmaKasalari.length,
    }),
    [firmalar.length, firmaDonemleri.length, firmaSubeleri.length, firmaDepolari.length, firmaKasalari.length]
  );

  const gridSatirlari = useMemo(() => {
    if (icSekme === 'firmalar') return firmalariSatirYap(firmalar);

    const tum = satirlariKur({
      firma: seciliFirma,
      firmaSubeleri,
      donemler,
      depolar,
      kasalar,
      subeMap,
    });

    if (icSekme === 'donemler') return tum.filter((s) => s.tip === 'donem');
    if (icSekme === 'subeler') return tum.filter((s) => s.tip === 'sube');
    if (icSekme === 'depolar') return tum.filter((s) => s.tip === 'depo');
    return tum.filter((s) => s.tip === 'kasa');
  }, [icSekme, firmalar, seciliFirma, firmaSubeleri, donemler, depolar, kasalar, subeMap]);

  const ekleAc = useCallback(
    (tip: KayitTipi, subeId?: string) => {
      if (!eklemeVar) {
        hataBildir('Yeni kayıt ekleme yetkiniz yok');
        return;
      }
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
        if (subeId) setAktifSubeId(subeId);
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

  const aktifTip = sekmedenTip(icSekme);

  useModulAksiyonlari(
    {
      ekle: eklemeVar ? () => ekleAc(aktifTip) : undefined,
      sil: undefined,
    },
    {
      ekle: eklemeVar && (aktifTip === 'firma' || !!seciliFirmaId),
      sil: false,
    },
    false,
    {
      ekle: `Yeni ${TIP_ETIKET[aktifTip]}`,
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

  const firmaPasif = !!seciliFirmaId && firmaPasifMi(seciliFirmaId);
  const firmaGerekli = icSekme !== 'firmalar';
  const firmaYok = firmaGerekli && !seciliFirma;

  const gridBosMesaj =
    icSekme === 'firmalar'
      ? 'Firma kaydı yok'
      : icSekme === 'donemler'
        ? 'Bu firmada dönem kaydı yok'
        : icSekme === 'subeler'
          ? 'Bu firmada şube kaydı yok'
          : icSekme === 'depolar'
            ? 'Bu firmada depo kaydı yok'
            : 'Bu firmada kasa kaydı yok';

  if (yukleniyor && firmalar.length === 0) return <TanimYukleniyor />;

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
        <div className="ap-tanimlar-ic-sekme" role="tablist" aria-label="Kayıt türleri">
          {IC_SEKMELER.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={icSekme === s.id}
              className={`ap-tanimlar-ic-sekme-tus${icSekme === s.id ? ' ap-tanimlar-ic-sekme-tus--aktif' : ''}`}
              onClick={() => setIcSekme(s.id)}
            >
              {s.etiket}
              <span className="ap-tanimlar-ic-sekme-sayi">{sekmeSayilari[s.id]}</span>
            </button>
          ))}

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

        {firmaYok ? (
          <p className="ap-tanimlar-firma-bos">
            {firmalar.length === 0
              ? 'Henüz firma yok — Firmalar sekmesinden ekleyin'
              : 'Bu sekme için önce üstten bir firma seçin'}
          </p>
        ) : gozAcik ? (
          <div className="ap-tanimlar-goz-grid">
            <DataGrid
              tabloBaslik=""
              kolonlar={kolonlar}
              satirlar={gridSatirlari}
              depolamaAnahtari={`tanimlar-kayitlar-goz-v5-${icSekme}`}
              kompakt
              formulMenuGoster={false}
              sutunSabitleGoster={false}
              bosMesaj={gridBosMesaj}
              onSatirTikla={duzenlemeVar ? duzenleAc : undefined}
              onSatirDuzenle={duzenlemeVar ? duzenleAc : undefined}
              onSatirHover={
                duzenlemeVar
                  ? (satir) => {
                      if (!satir) {
                        kayitHoverAyarla(null);
                        return;
                      }
                      kayitHoverAyarla(satirDuzenleHedefi(satir));
                    }
                  : undefined
              }
              onSatirSil={silmeVar ? gridSil : undefined}
              satirSinifAdi={satirSinifAdi}
            />
          </div>
        ) : icSekme === 'firmalar' ? (
          <FirmalarPaneli
            firmalar={firmalar}
            subeler={subeler}
            depolar={depolar}
            kasalar={kasalar}
            yatayKart={yatayKart}
            eklemeVar={eklemeVar}
            duzenlemeVar={duzenlemeVar}
            silmeVar={silmeVar}
            onKayitHover={duzenlemeVar ? kayitHoverAyarla : undefined}
            onFirmaEkle={() => ekleAc('firma')}
            onFirmaDuzenle={(f) => setModalHedef({ tip: 'firma', mod: 'duzenle', kayit: f })}
            onFirmaSil={(f) => silHedef({ tip: 'firma', kayit: f })}
            onSubeEkle={(firmaId) => {
              if (firmaPasifMi(firmaId)) {
                hataBildir('Pasif firmaya şube eklenemez');
                return;
              }
              setModalHedef({ tip: 'sube', mod: 'ekle', firmaId });
            }}
            onSubeDuzenle={(s) => setModalHedef({ tip: 'sube', mod: 'duzenle', kayit: s })}
            onSubeSil={(s) => silHedef({ tip: 'sube', kayit: s })}
            onDepoEkle={(firmaId, subeId) => {
              setAktifSubeId(subeId);
              setModalHedef({ tip: 'depo', mod: 'ekle', firmaId, subeId });
            }}
            onKasaEkle={(firmaId, subeId) => {
              setAktifSubeId(subeId);
              setModalHedef({ tip: 'kasa', mod: 'ekle', firmaId, subeId });
            }}
            onDepoDuzenle={(d) => setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: d })}
            onKasaDuzenle={(k) => setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: k })}
            onDepoSil={(d) => silHedef({ tip: 'depo', kayit: d })}
            onKasaSil={(k) => silHedef({ tip: 'kasa', kayit: k })}
          />
        ) : icSekme === 'donemler' ? (
          <BasitKayitPaneli
            kayitlar={firmaDonemleri}
            yatayKart={yatayKart}
            araPlaceholder="Dönem ara…"
            ekleEtiket="+ Dönem"
            bosMesaj="Bu firmada dönem yok — + Dönem ile ekleyin"
            bulunamadiMesaj="Dönem bulunamadı"
            eklemeVar={eklemeVar}
            duzenlemeVar={duzenlemeVar}
            silmeVar={silmeVar}
            ekleKapali={firmaPasif}
            ekleKapaliTitle="Pasif firmaya dönem eklenemez"
            idAl={(d) => d.id}
            adAl={(d) => d.donemAdi}
            metaAl={(d) => `${d.donemKodu}${!d.aktif ? ' · Pasif' : ''}`}
            aktifMi={(d) => d.aktif}
            araEsles={(d, q) =>
              d.donemAdi.toLocaleLowerCase('tr').includes(q) ||
              d.donemKodu.toLocaleLowerCase('tr').includes(q)
            }
            onEkle={() => ekleAc('donem')}
            onDuzenle={(d) => setModalHedef({ tip: 'donem', mod: 'duzenle', kayit: d })}
            onSil={(d) => silHedef({ tip: 'donem', kayit: d })}
            onKayitHover={
              duzenlemeVar
                ? (d) =>
                    kayitHoverAyarla(d ? { tip: 'donem', mod: 'duzenle', kayit: d } : null)
                : undefined
            }
          />
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
            onKayitHover={duzenlemeVar ? kayitHoverAyarla : undefined}
            onSubeEkle={() => ekleAc('sube')}
            onSubeDuzenle={(s) => setModalHedef({ tip: 'sube', mod: 'duzenle', kayit: s })}
            onSubeSil={(s) => silHedef({ tip: 'sube', kayit: s })}
            onDepoEkle={(subeId) => ekleAc('depo', subeId)}
            onKasaEkle={(subeId) => ekleAc('kasa', subeId)}
            onDepoDuzenle={(d) => setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: d })}
            onKasaDuzenle={(k) => setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: k })}
            onDepoSil={(d) => silHedef({ tip: 'depo', kayit: d })}
            onKasaSil={(k) => silHedef({ tip: 'kasa', kayit: k })}
          />
        ) : icSekme === 'depolar' ? (
          <BasitKayitPaneli
            kayitlar={firmaDepolari}
            yatayKart={yatayKart}
            araPlaceholder="Depo ara…"
            ekleEtiket="+ Depo"
            bosMesaj="Bu firmada depo yok — + Depo ile ekleyin"
            bulunamadiMesaj="Depo bulunamadı"
            eklemeVar={eklemeVar}
            duzenlemeVar={duzenlemeVar}
            silmeVar={silmeVar}
            ekleKapali={firmaPasif || firmaSubeleri.length === 0}
            ekleKapaliTitle={
              firmaPasif
                ? 'Pasif firmaya depo eklenemez'
                : 'Önce şube ekleyin'
            }
            idAl={(d) => d.id}
            adAl={(d) => d.depoAdi}
            metaAl={(d) => {
              const sube = subeMap.get(d.subeId);
              const baglam = sube ? `${sube.subeKodu} — ${sube.subeAdi}` : (d.subeKodu ?? '');
              return `${d.depoKodu}${baglam ? ` · ${baglam}` : ''}${!d.aktif ? ' · Pasif' : ''}`;
            }}
            aktifMi={(d) => d.aktif}
            araEsles={(d, q) => {
              const sube = subeMap.get(d.subeId);
              return (
                d.depoAdi.toLocaleLowerCase('tr').includes(q) ||
                d.depoKodu.toLocaleLowerCase('tr').includes(q) ||
                (sube?.subeAdi.toLocaleLowerCase('tr').includes(q) ?? false)
              );
            }}
            onEkle={() => ekleAc('depo')}
            onDuzenle={(d) => setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: d })}
            onSil={(d) => silHedef({ tip: 'depo', kayit: d })}
            onKayitHover={
              duzenlemeVar
                ? (d) =>
                    kayitHoverAyarla(d ? { tip: 'depo', mod: 'duzenle', kayit: d } : null)
                : undefined
            }
          />
        ) : (
          <BasitKayitPaneli
            kayitlar={firmaKasalari}
            yatayKart={yatayKart}
            araPlaceholder="Kasa ara…"
            ekleEtiket="+ Kasa"
            bosMesaj="Bu firmada kasa yok — + Kasa ile ekleyin"
            bulunamadiMesaj="Kasa bulunamadı"
            eklemeVar={eklemeVar}
            duzenlemeVar={duzenlemeVar}
            silmeVar={silmeVar}
            ekleKapali={firmaPasif || firmaSubeleri.length === 0}
            ekleKapaliTitle={
              firmaPasif
                ? 'Pasif firmaya kasa eklenemez'
                : 'Önce şube ekleyin'
            }
            idAl={(k) => k.id}
            adAl={(k) => k.kasaAdi}
            metaAl={(k) => {
              const sube = subeMap.get(k.subeId);
              const baglam = sube ? `${sube.subeKodu} — ${sube.subeAdi}` : (k.subeKodu ?? '');
              return `${k.kasaKodu}${baglam ? ` · ${baglam}` : ''}${!k.aktif ? ' · Pasif' : ''}`;
            }}
            aktifMi={(k) => k.aktif}
            araEsles={(k, q) => {
              const sube = subeMap.get(k.subeId);
              return (
                k.kasaAdi.toLocaleLowerCase('tr').includes(q) ||
                k.kasaKodu.toLocaleLowerCase('tr').includes(q) ||
                (sube?.subeAdi.toLocaleLowerCase('tr').includes(q) ?? false)
              );
            }}
            onEkle={() => ekleAc('kasa')}
            onDuzenle={(k) => setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: k })}
            onSil={(k) => silHedef({ tip: 'kasa', kayit: k })}
            onKayitHover={
              duzenlemeVar
                ? (k) =>
                    kayitHoverAyarla(k ? { tip: 'kasa', mod: 'duzenle', kayit: k } : null)
                : undefined
            }
          />
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
