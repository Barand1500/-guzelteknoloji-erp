import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  depoSil,
  depolariGetir,
  donemSil,
  donemleriGetir,
  firmaSil,
  firmalariGetir,
  kasaSil,
  kasalariGetir,
  subeSil,
  subeleriGetir,
  type TanimSilModu,
} from '@/admin/baslat-menusu/tanimlar/api';
import {
  tanimBaglantiOzeti,
  tanimHedefMetni,
} from '@/admin/baslat-menusu/tanimlar/araclar/tanimBaglilari';
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
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

type KayitTipi = TanimSekmeId;

interface TanimSatir {
  id: string;
  tip: KayitTipi;
  kod: string;
  ad: string;
  donemMetin: string;
  subeMetin: string;
  depoMetin: string;
  kasaMetin: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
  firmaId: string;
  kayit:
    | AdminFirma
    | AdminSube
    | AdminDepo
    | AdminKasa
    | AdminDonem;
}

type SilmeHedef =
  | { tip: 'firma'; kayit: AdminFirma }
  | { tip: 'sube'; kayit: AdminSube }
  | { tip: 'depo'; kayit: AdminDepo }
  | { tip: 'kasa'; kayit: AdminKasa }
  | { tip: 'donem'; kayit: AdminDonem };

const TIP_ETIKET: Record<KayitTipi, string> = {
  firma: 'Firma',
  sube: 'Şube',
  depo: 'Depo',
  kasa: 'Kasa',
  donem: 'Dönem',
};

const TIP_SIRASI: Record<KayitTipi, number> = {
  firma: 0,
  donem: 1,
  sube: 2,
  depo: 3,
  kasa: 4,
};

const EKLE_BUTONLARI: { tip: KayitTipi; etiket: string; ikon: string }[] = [
  { tip: 'firma', etiket: 'Firma', ikon: '🏢' },
  { tip: 'sube', etiket: 'Şube', ikon: '🏪' },
  { tip: 'depo', etiket: 'Depo', ikon: '📦' },
  { tip: 'kasa', etiket: 'Kasa', ikon: '💰' },
  { tip: 'donem', etiket: 'Dönem', ikon: '📅' },
];

const TIP_FILTRE_SECENEKLER = [
  { value: '', label: 'Tümü' },
  { value: 'firma', label: 'Firma' },
  { value: 'sube', label: 'Şube' },
  { value: 'depo', label: 'Depo' },
  { value: 'kasa', label: 'Kasa' },
  { value: 'donem', label: 'Dönem' },
];

function hucreMetin(deger: string) {
  const v = deger.trim();
  if (!v) return <span className="ap-tanimlar-hucre-bos">—</span>;
  return <span className="ap-tanimlar-hucre-metin">{v}</span>;
}

export function TanimKayitlarOzeti() {
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('tanimlar');
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const logMesajiAyarla = useAdminLogMesaji();
  const { setRehberModulId } = useAdminAksiyon();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [donemler, setDonemler] = useState<AdminDonem[]>([]);
  const [seciliFirmaId, setSeciliFirmaId] = useState<string | null>(null);
  const [firmaArama, setFirmaArama] = useState('');
  const [tipFiltre, setTipFiltre] = useState('');
  const [modalHedef, setModalHedef] = useState<TanimModalHedef | null>(null);
  const [silinecek, setSilinecek] = useState<SilmeHedef | null>(null);
  const [bagliSil, setBagliSil] = useState<SilmeHedef | null>(null);

  useEffect(() => {
    setRehberModulId('tanimlar');
    return () => setRehberModulId(null);
  }, [setRehberModulId]);

  const yukle = useCallback(async (seciliKorunsun?: string | null) => {
    setYukleniyor(true);
    try {
      const [f, s, d, k, don] = await Promise.all([
        firmalariGetir(),
        subeleriGetir(),
        depolariGetir(),
        kasalariGetir(),
        donemleriGetir(),
      ]);
      setFirmalar(f);
      setSubeler(s);
      setDepolar(d);
      setKasalar(k);
      setDonemler(don);
      setSeciliFirmaId((onceki) => {
        const hedef = seciliKorunsun !== undefined ? seciliKorunsun : onceki;
        if (hedef && f.some((x) => x.id === hedef)) return hedef;
        return f[0]?.id ?? null;
      });
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıtlar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const filtreliFirmalar = useMemo(() => {
    const q = firmaArama.trim().toLocaleLowerCase('tr');
    if (!q) return firmalar;
    return firmalar.filter(
      (f) =>
        f.firmaAdi.toLocaleLowerCase('tr').includes(q) ||
        f.firmaKodu.toLocaleLowerCase('tr').includes(q)
    );
  }, [firmalar, firmaArama]);

  const seciliFirma = useMemo(
    () => firmalar.find((f) => f.id === seciliFirmaId) ?? null,
    [firmalar, seciliFirmaId]
  );

  const firmaPasifMi = useCallback(
    (firmaId: string) => firmalar.find((f) => f.id === firmaId)?.aktif === false,
    [firmalar]
  );

  const subePasifMi = useCallback(
    (subeId: string) => {
      const sube = subeler.find((s) => s.id === subeId);
      if (!sube) return false;
      if (sube.aktif === false) return true;
      return firmaPasifMi(sube.firmaId);
    },
    [subeler, firmaPasifMi]
  );

  const firmaSubeleri = useMemo(
    () => subeler.filter((s) => s.firmaId === seciliFirmaId),
    [subeler, seciliFirmaId]
  );

  const subeMap = useMemo(() => {
    const m = new Map<string, AdminSube>();
    for (const s of subeler) m.set(s.id, s);
    return m;
  }, [subeler]);

  const satirlar = useMemo((): TanimSatir[] => {
    if (!seciliFirma) return [];
    const subeIdleri = new Set(firmaSubeleri.map((s) => s.id));
    const liste: TanimSatir[] = [];

    liste.push({
      id: `firma:${seciliFirma.id}`,
      tip: 'firma',
      kod: seciliFirma.firmaKodu,
      ad: seciliFirma.firmaAdi,
      donemMetin: '',
      subeMetin: '',
      depoMetin: '',
      kasaMetin: '',
      aktif: seciliFirma.aktif,
      olusturma: seciliFirma.olusturma,
      guncelleme: seciliFirma.guncelleme,
      firmaId: seciliFirma.id,
      kayit: seciliFirma,
    });

    for (const d of donemler.filter((x) => x.firmaId === seciliFirma.id)) {
      liste.push({
        id: `donem:${d.id}`,
        tip: 'donem',
        kod: d.donemKodu,
        ad: d.donemAdi,
        donemMetin: `${d.donemKodu} — ${d.donemAdi}`,
        subeMetin: '',
        depoMetin: '',
        kasaMetin: '',
        aktif: d.aktif,
        olusturma: d.olusturma,
        guncelleme: d.guncelleme,
        firmaId: seciliFirma.id,
        kayit: d,
      });
    }

    for (const s of firmaSubeleri) {
      liste.push({
        id: `sube:${s.id}`,
        tip: 'sube',
        kod: s.subeKodu,
        ad: s.subeAdi,
        donemMetin: '',
        subeMetin: `${s.subeKodu} — ${s.subeAdi}`,
        depoMetin: '',
        kasaMetin: '',
        aktif: s.aktif,
        olusturma: s.olusturma,
        guncelleme: s.guncelleme,
        firmaId: seciliFirma.id,
        kayit: s,
      });
    }

    for (const d of depolar.filter((x) => subeIdleri.has(x.subeId))) {
      const sube = subeMap.get(d.subeId);
      liste.push({
        id: `depo:${d.id}`,
        tip: 'depo',
        kod: d.depoKodu,
        ad: d.depoAdi,
        donemMetin: '',
        subeMetin: sube ? `${sube.subeKodu} — ${sube.subeAdi}` : d.subeKodu ?? '',
        depoMetin: `${d.depoKodu} — ${d.depoAdi}`,
        kasaMetin: '',
        aktif: d.aktif,
        olusturma: d.olusturma,
        guncelleme: d.guncelleme,
        firmaId: seciliFirma.id,
        kayit: d,
      });
    }

    for (const k of kasalar.filter((x) => subeIdleri.has(x.subeId))) {
      const sube = subeMap.get(k.subeId);
      liste.push({
        id: `kasa:${k.id}`,
        tip: 'kasa',
        kod: k.kasaKodu,
        ad: k.kasaAdi,
        donemMetin: '',
        subeMetin: sube ? `${sube.subeKodu} — ${sube.subeAdi}` : k.subeKodu ?? '',
        depoMetin: '',
        kasaMetin: `${k.kasaKodu} — ${k.kasaAdi}`,
        aktif: k.aktif,
        olusturma: k.olusturma,
        guncelleme: k.guncelleme,
        firmaId: seciliFirma.id,
        kayit: k,
      });
    }

    return liste.sort((a, b) => {
      const tipFark = TIP_SIRASI[a.tip] - TIP_SIRASI[b.tip];
      if (tipFark !== 0) return tipFark;
      return a.kod.localeCompare(b.kod, 'tr');
    });
  }, [seciliFirma, firmaSubeleri, donemler, depolar, kasalar, subeMap]);

  const gosterilenSatirlar = useMemo(() => {
    if (!tipFiltre) return satirlar;
    return satirlar.filter((s) => s.tip === tipFiltre);
  }, [satirlar, tipFiltre]);

  const ekleAc = useCallback(
    (tip: KayitTipi) => {
      if (!eklemeVar) {
        hataBildir('Yeni kayıt ekleme yetkiniz yok');
        return;
      }
      if (tip === 'firma') {
        setModalHedef({ tip: 'firma', mod: 'ekle' });
        return;
      }
      if (!seciliFirmaId) {
        hataBildir('Önce soldan bir firma seçin');
        return;
      }
      if (firmaPasifMi(seciliFirmaId)) {
        hataBildir('Pasif firmaya kayıt eklenemez');
        return;
      }
      const varsayilanSube =
        firmaSubeleri.find((s) => s.subeKodu === 'MERKEZ')?.id ?? firmaSubeleri[0]?.id;
      if (tip === 'sube') setModalHedef({ tip: 'sube', mod: 'ekle', firmaId: seciliFirmaId });
      else if (tip === 'donem') setModalHedef({ tip: 'donem', mod: 'ekle', firmaId: seciliFirmaId });
      else if (tip === 'depo') {
        if (!varsayilanSube) {
          hataBildir('Depo eklemek için önce şube oluşturun');
          return;
        }
        setModalHedef({ tip: 'depo', mod: 'ekle', firmaId: seciliFirmaId, subeId: varsayilanSube });
      } else if (tip === 'kasa') {
        if (!varsayilanSube) {
          hataBildir('Kasa eklemek için önce şube oluşturun');
          return;
        }
        setModalHedef({ tip: 'kasa', mod: 'ekle', firmaId: seciliFirmaId, subeId: varsayilanSube });
      }
    },
    [eklemeVar, seciliFirmaId, firmaPasifMi, firmaSubeleri, hataBildir]
  );

  const duzenleAc = useCallback(
    (satir: TanimSatir) => {
      if (!duzenlemeVar) {
        hataBildir('Kayıt düzenleme yetkiniz yok');
        return;
      }
      if (satir.tip === 'firma') setModalHedef({ tip: 'firma', mod: 'duzenle', kayit: satir.kayit as AdminFirma });
      else if (satir.tip === 'sube') setModalHedef({ tip: 'sube', mod: 'duzenle', kayit: satir.kayit as AdminSube });
      else if (satir.tip === 'depo') setModalHedef({ tip: 'depo', mod: 'duzenle', kayit: satir.kayit as AdminDepo });
      else if (satir.tip === 'kasa') setModalHedef({ tip: 'kasa', mod: 'duzenle', kayit: satir.kayit as AdminKasa });
      else if (satir.tip === 'donem') setModalHedef({ tip: 'donem', mod: 'duzenle', kayit: satir.kayit as AdminDonem });
    },
    [duzenlemeVar, hataBildir]
  );

  const silBaslat = useCallback(
    (satir: TanimSatir) => {
      if (!silmeVar) {
        hataBildir('Kayıt silme yetkiniz yok');
        return;
      }
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

      const ozet = tanimBaglantiOzeti(hedef.tip, hedef.kayit.id, {
        firmalar,
        subeler,
        depolar,
        kasalar,
        donemler,
      });
      if (ozet.bagliVar) setBagliSil(hedef);
      else setSilinecek(hedef);
    },
    [silmeVar, hataBildir, firmalar, subeler, depolar, kasalar, donemler]
  );

  const silOnayla = useCallback(
    async (hedef: SilmeHedef, mod?: TanimSilModu) => {
      try {
        const metin = tanimHedefMetni(hedef.tip, hedef.kayit);
        if (hedef.tip === 'firma') await firmaSil(hedef.kayit.id, mod);
        else if (hedef.tip === 'sube') await subeSil(hedef.kayit.id, mod);
        else if (hedef.tip === 'depo') await depoSil(hedef.kayit.id);
        else if (hedef.tip === 'kasa') await kasaSil(hedef.kayit.id);
        else await donemSil(hedef.kayit.id);

        logMesajiAyarla(logMesaj.sildi(`Tanımlar — ${TIP_ETIKET[hedef.tip]}`, metin));
        basariBildir(`${TIP_ETIKET[hedef.tip]} silindi.`);
        setSilinecek(null);
        setBagliSil(null);
        const yeniSecili =
          hedef.tip === 'firma' && hedef.kayit.id === seciliFirmaId ? null : seciliFirmaId;
        await yukle(yeniSecili);
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
      }
    },
    [logMesajiAyarla, basariBildir, hataBildir, seciliFirmaId, yukle]
  );

  const kaydedildi = useCallback(
    async (_tip: TanimSekmeId, firmaId?: string) => {
      await yukle(firmaId ?? seciliFirmaId);
    },
    [yukle, seciliFirmaId]
  );

  useModulAksiyonlari(
    {
      ekle: eklemeVar
        ? () => ekleAc(tipFiltre === 'firma' || tipFiltre === 'sube' || tipFiltre === 'depo' || tipFiltre === 'kasa' || tipFiltre === 'donem' ? tipFiltre : seciliFirmaId ? 'sube' : 'firma')
        : undefined,
      sil: undefined,
    },
    {
      ekle: eklemeVar && (tipFiltre === 'firma' || !!seciliFirmaId),
      sil: false,
    },
    false
  );

  const kolonlar = useMemo((): KolonTanimi<TanimSatir>[] => {
    return [
      {
        id: 'tip',
        baslik: 'Tip',
        tip: 'metin',
        genislik: 88,
        minGenislik: 72,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => TIP_ETIKET[s.tip],
        siralamaDegeri: (s) => TIP_SIRASI[s.tip],
        goster: (s) => <span className="ap-tanimlar-tip-metin">{TIP_ETIKET[s.tip]}</span>,
      },
      {
        id: 'kod',
        baslik: 'Kod',
        tip: 'metin',
        genislik: 110,
        minGenislik: 80,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.kod,
        goster: (s) => <span className="ap-tanimlar-hucre-kod">{s.kod}</span>,
      },
      {
        id: 'ad',
        baslik: 'Ad',
        tip: 'metin',
        genislik: 180,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.ad,
      },
      {
        id: 'donem',
        baslik: 'Dönem',
        tip: 'metin',
        genislik: 150,
        minGenislik: 110,
        siralama: true,
        degerAl: (s) => s.donemMetin,
        goster: (s) => hucreMetin(s.donemMetin),
      },
      {
        id: 'sube',
        baslik: 'Şube',
        tip: 'metin',
        genislik: 160,
        minGenislik: 120,
        siralama: true,
        degerAl: (s) => s.subeMetin,
        goster: (s) => hucreMetin(s.subeMetin),
      },
      {
        id: 'depo',
        baslik: 'Depo',
        tip: 'metin',
        genislik: 150,
        minGenislik: 110,
        siralama: true,
        degerAl: (s) => s.depoMetin,
        goster: (s) => hucreMetin(s.depoMetin),
      },
      {
        id: 'kasa',
        baslik: 'Kasa',
        tip: 'metin',
        genislik: 150,
        minGenislik: 110,
        siralama: true,
        degerAl: (s) => s.kasaMetin,
        goster: (s) => hucreMetin(s.kasaMetin),
      },
      {
        id: 'durum',
        baslik: 'Durum',
        tip: 'salt-okunur',
        genislik: 88,
        siralama: true,
        degerAl: (s) => (s.aktif ? 'Aktif' : 'Pasif'),
        siralamaDegeri: (s) => (s.aktif ? 1 : 0),
        goster: (s) => (
          <span className={s.aktif ? 'ap-muted' : 'ap-tanimlar-hucre-bos'}>
            {s.aktif ? 'Aktif' : 'Pasif'}
          </span>
        ),
      },
      {
        id: 'olusturma',
        baslik: 'Kayıt',
        tip: 'tarih',
        genislik: 120,
        siralama: true,
        degerAl: (s) => s.olusturma,
        goster: (s) => tarihSaatFormatla(s.olusturma),
      },
      {
        id: 'guncelleme',
        baslik: 'Güncelleme',
        tip: 'tarih',
        genislik: 120,
        siralama: true,
        degerAl: (s) => s.guncelleme,
        goster: (s) => tarihSaatFormatla(s.guncelleme),
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
  }, []);

  const bagliOzet = useMemo(() => {
    if (!bagliSil) return [];
    return tanimBaglantiOzeti(bagliSil.tip, bagliSil.kayit.id, {
      firmalar,
      subeler,
      depolar,
      kasalar,
      donemler,
    }).ozetSatirlari;
  }, [bagliSil, firmalar, subeler, depolar, kasalar, donemler]);

  if (yukleniyor && firmalar.length === 0) return <TanimYukleniyor />;

  return (
    <div className="ap-tanimlar-kayit-sayfa">
      <div className="ap-tanimlar-ekle-cubuk" role="toolbar" aria-label="Yeni kayıt ekle">
        <div className="ap-tanimlar-tip-filtre">
          <FormAcilirSecim
            aria-label="Kayıt tipi filtre"
            value={tipFiltre}
            onChange={setTipFiltre}
            secenekler={TIP_FILTRE_SECENEKLER}
            tusMetin={tipFiltre ? undefined : 'Tümü'}
          />
        </div>
        {EKLE_BUTONLARI.map((b) => {
          const firmaGerekli = b.tip !== 'firma';
          const disabled =
            !eklemeVar ||
            (firmaGerekli && !seciliFirmaId) ||
            (firmaGerekli && !!seciliFirmaId && firmaPasifMi(seciliFirmaId));
          return (
            <button
              key={b.tip}
              type="button"
              className="ap-tanimlar-ekle-tus"
              disabled={disabled}
              onClick={() => ekleAc(b.tip)}
              title={
                !eklemeVar
                  ? 'Ekleme yetkiniz yok'
                  : firmaGerekli && !seciliFirmaId
                    ? 'Önce firma seçin'
                    : `Yeni ${b.etiket}`
              }
            >
              <span aria-hidden>{b.ikon}</span>
              <span>+ {b.etiket}</span>
            </button>
          );
        })}
      </div>

      <div className="ap-tanimlar-kayit-duzen">
        <aside className="ap-tanimlar-firma-liste" aria-label="Firmalar">
          <div className="ap-tanimlar-firma-arama">
            <input
              type="search"
              className="ap-tanimlar-firma-arama-input"
              placeholder="Firma ara…"
              value={firmaArama}
              onChange={(e) => setFirmaArama(e.target.value)}
              aria-label="Firma ara"
            />
          </div>
          <div className="ap-tanimlar-firma-scroll">
            {filtreliFirmalar.length === 0 ? (
              <p className="ap-tanimlar-firma-bos">Firma bulunamadı</p>
            ) : (
              filtreliFirmalar.map((f) => {
                const secili = f.id === seciliFirmaId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`ap-tanimlar-firma-oge${secili ? ' ap-tanimlar-firma-oge--aktif' : ''}${!f.aktif ? ' ap-tanimlar-firma-oge--pasif' : ''}`}
                    onClick={() => setSeciliFirmaId(f.id)}
                  >
                    <span className="ap-tanimlar-firma-ad">{f.firmaAdi}</span>
                    <span className="ap-tanimlar-firma-kod">{f.firmaKodu}</span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="ap-tanimlar-kayit-ana">
          {!seciliFirma ? (
            <p className="ap-tanimlar-firma-bos">Soldan bir firma seçin veya + Firma ile ekleyin</p>
          ) : (
            <DataGrid
              tabloBaslik={`${seciliFirma.firmaAdi} kayıtları`}
              kolonlar={kolonlar}
              satirlar={gosterilenSatirlar}
              depolamaAnahtari="tanimlar-kayitlar-duz-v2"
              kompakt
              formulMenuGoster={false}
              sutunSabitleGoster={false}
              bosMesaj="Bu firmaya ait kayıt yok — üstten ekleyin"
              onSatirTikla={duzenlemeVar ? duzenleAc : undefined}
              onSatirDuzenle={duzenlemeVar ? duzenleAc : undefined}
              onSatirSil={silmeVar ? silBaslat : undefined}
              satirSinifAdi={(s) =>
                !s.aktif ||
                firmaPasifMi(s.firmaId) ||
                ((s.tip === 'depo' || s.tip === 'kasa') &&
                  subePasifMi((s.kayit as AdminDepo | AdminKasa).subeId))
                  ? 'ap-tanimlar-satir--pasif'
                  : undefined
              }
            />
          )}
        </div>
      </div>

      <TanimKayitModal
        hedef={modalHedef}
        subeler={subeler}
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
