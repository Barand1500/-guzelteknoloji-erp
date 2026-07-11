import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  tanimEkleEtiketi,
  tanimHizliGirisKaydet,
  tanimHizliGirisKolonlari,
} from '@/admin/baslat-menusu/tanimlar/araclar/tanimKayitHizliGiris';
import { DepoSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DepoSekme';
import { DonemSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DonemSekme';
import { FirmaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/FirmaSekme';
import { KasaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/KasaSekme';
import { SubeSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/SubeSekme';
import { TanimBagliSilOnayModal } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimBagliSilOnayModal';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
  GomuluDuzenleSecenek,
  TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import '@/admin/ortak/datagrid/datagrid.css';
import { DatagridSagTikMenu, type SatirEkleKonumu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';

const VARSAYILAN_GIZLI: string[] = [];

type SilmeHedef =
  | { tip: 'firma'; kayit: AdminFirma }
  | { tip: 'sube'; kayit: AdminSube }
  | { tip: 'depo'; kayit: AdminDepo }
  | { tip: 'kasa'; kayit: AdminKasa }
  | { tip: 'donem'; kayit: AdminDonem };

type KayitKonum =
  | { seviye: 'firmalar' }
  | { seviye: 'firma'; firmaId: string; sekme: 'subeler' | 'donemler' }
  | { seviye: 'sube'; firmaId: string; subeId: string; sekme: 'depolar' | 'kasalar' };

function secimKolonu<TRow extends { id: string }>(): KolonTanimi<TRow> {
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

function islemlerKolonu<TRow extends { id: string }>(): KolonTanimi<TRow> {
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

function durumKolonu<TRow extends { aktif: boolean }>(): KolonTanimi<TRow> {
  return {
    id: 'durum',
    baslik: 'Durum',
    tip: 'salt-okunur',
    genislik: 88,
    siralama: true,
    degerAl: (s) => s.aktif,
    siralamaDegeri: (s) => (s.aktif ? 1 : 0),
    goster: (s) => <TanimDurumRozeti aktif={s.aktif} />,
  };
}

function olusturmaKolonu<TRow extends { olusturma: string }>(): KolonTanimi<TRow> {
  return {
    id: 'olusturma',
    baslik: 'Kayıt Tarihi',
    tip: 'tarih',
    genislik: 130,
    siralama: true,
    degerAl: (s) => s.olusturma,
    goster: (s) => tarihSaatFormatla(s.olusturma),
  };
}

function guncellemeKolonu<TRow extends { guncelleme: string }>(): KolonTanimi<TRow> {
  return {
    id: 'guncelleme',
    baslik: 'Güncelleme Tarihi',
    tip: 'tarih',
    genislik: 130,
    siralama: true,
    degerAl: (s) => s.guncelleme,
    goster: (s) => tarihSaatFormatla(s.guncelleme),
  };
}

interface GezginSekme {
  id: string;
  etiket: string;
}

function GezginSekmeler({
  sekmeler,
  aktif,
  onSec,
}: {
  sekmeler: GezginSekme[];
  aktif: string;
  onSec: (id: string) => void;
}) {
  return (
    <div className="ap-tanimlar-gezgin-sekme-bar">
      <TanimModCubugu
        sekmeler={sekmeler.map((s) => ({ id: s.id, ad: s.etiket }))}
        aktif={aktif}
        onDegistir={onSec}
        ariaLabel="Alt kayıt türü"
        kompakt
      />
    </div>
  );
}

export function TanimKayitlarOzeti() {
  const { firmaBagliPasifMi, subeBagliPasifMi } = useTanimFirmaDurumu();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const sayfaRef = useRef<HTMLDivElement>(null);
  const { setRehberModulId } = useAdminAksiyon();
  const gridApiRef = useRef<DataGridApi | null>(null);
  const [seciliSatirSayisi, setSeciliSatirSayisi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [donemler, setDonemler] = useState<AdminDonem[]>([]);
  const [konum, setKonum] = useState<KayitKonum>({ seviye: 'firmalar' });
  const [silme, setSilme] = useState<SilmeHedef | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  const veriSeti = useMemo(
    () => ({ firmalar, subeler, depolar, kasalar, donemler }),
    [firmalar, subeler, depolar, kasalar, donemler]
  );

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [f, s, d, k, dn] = await Promise.all([
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
      setDonemler(dn);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (konum.seviye === 'firmalar') return;
    const firmaVar = firmalar.some((f) => f.id === konum.firmaId);
    if (!firmaVar) {
      setKonum({ seviye: 'firmalar' });
      return;
    }
    if (konum.seviye === 'sube') {
      const subeVar = subeler.some((s) => s.id === konum.subeId);
      if (!subeVar) {
        setKonum({ seviye: 'firma', firmaId: konum.firmaId, sekme: 'subeler' });
      }
    }
  }, [konum, firmalar, subeler]);

  const seciliFirma = useMemo(() => {
    if (konum.seviye === 'firmalar') return null;
    return firmalar.find((f) => f.id === konum.firmaId) ?? null;
  }, [konum, firmalar]);

  const seciliSube = useMemo(() => {
    if (konum.seviye !== 'sube') return null;
    return subeler.find((s) => s.id === konum.subeId) ?? null;
  }, [konum, subeler]);

  const aktifKayitTipi = useMemo((): TanimSekmeId => {
    if (konum.seviye === 'firmalar') return 'firma';
    if (konum.seviye === 'firma') return konum.sekme === 'donemler' ? 'donem' : 'sube';
    return konum.sekme === 'kasalar' ? 'kasa' : 'depo';
  }, [konum]);

  useEffect(() => {
    setRehberModulId(`tanimlar-${aktifKayitTipi}`);
    return () => setRehberModulId(null);
  }, [aktifKayitTipi, setRehberModulId]);

  const ekleEtiketi = useMemo(() => tanimEkleEtiketi(aktifKayitTipi), [aktifKayitTipi]);

  const hizliGirisBaglam = useMemo(
    () => ({
      firmaId: seciliFirma?.id,
      subeId: seciliSube?.id,
    }),
    [seciliFirma, seciliSube]
  );

  const hizliGirisKaydet = useCallback(
    async (degerler: Record<string, string>) => {
      try {
        const sonuc = await tanimHizliGirisKaydet(aktifKayitTipi, degerler, hizliGirisBaglam);
        if (!sonuc.ok) {
          hataBildir(sonuc.mesaj);
          return false;
        }
        basariBildir(sonuc.mesaj);
        await yukle();
        return true;
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Kayıt eklenemedi');
        return false;
      }
    },
    [aktifKayitTipi, hizliGirisBaglam, basariBildir, hataBildir, yukle]
  );

  const yeniEkle = useCallback(() => {
    gridApiRef.current?.hizliGirisOdakla();
  }, []);

  useEffect(() => {
    gridApiRef.current?.hizliGirisKapat();
    setSeciliSatirSayisi(0);
  }, [konum, aktifKayitTipi]);

  const silmeAc = useCallback((hedef: SilmeHedef) => {
    setSilme(hedef);
  }, []);

  const silmeKapat = useCallback(() => {
    if (siliniyor) return;
    setSilme(null);
  }, [siliniyor]);

  const aktifBaglanti = useMemo(() => {
    if (!silme) return null;
    return tanimBaglantiOzeti(silme.tip, silme.kayit.id, veriSeti);
  }, [silme, veriSeti]);

  const silmeUygula = useCallback(
    async (mod?: TanimSilModu) => {
      if (!silme) return;
      setSiliniyor(true);
      try {
        const { tip, kayit } = silme;
        if (tip === 'firma') await firmaSil(kayit.id, mod);
        else if (tip === 'sube') await subeSil(kayit.id, mod);
        else if (tip === 'depo') await depoSil(kayit.id);
        else if (tip === 'kasa') await kasaSil(kayit.id);
        else await donemSil(kayit.id);

        const hedef = tanimHedefMetni(tip, kayit);
        if (mod === 'pasif') {
          basariBildir(`${hedef} ve bağlı kayıtlar pasif yapıldı.`);
        } else {
          basariBildir(`${hedef} silindi.`);
        }

        if (tip === 'firma' && konum.seviye !== 'firmalar') {
          setKonum({ seviye: 'firmalar' });
        } else if (tip === 'sube' && konum.seviye === 'sube') {
          setKonum({ seviye: 'firma', firmaId: konum.firmaId, sekme: 'subeler' });
        }

        setSilme(null);
        await yukle();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
      } finally {
        setSiliniyor(false);
      }
    },
    [silme, basariBildir, hataBildir, yukle, konum]
  );

  const panelKapat = useCallback(
    (onKapat: () => void) => {
      void yukle();
      onKapat();
    },
    [yukle]
  );

  const satirDuzenlePaneli = useCallback(
    (satir: { id: string }, _onKaydet: unknown, onKapat: () => void) => {
      const opts: GomuluDuzenleSecenek = {
        id: satir.id,
        onKapat: () => panelKapat(onKapat),
        panel: true,
      };
      switch (aktifKayitTipi) {
        case 'firma':
          return <FirmaSekme gomuluDuzenle={opts} />;
        case 'sube':
          return <SubeSekme gomuluDuzenle={opts} />;
        case 'depo':
          return <DepoSekme gomuluDuzenle={opts} />;
        case 'kasa':
          return <KasaSekme gomuluDuzenle={opts} />;
        case 'donem':
          return <DonemSekme gomuluDuzenle={opts} />;
      }
    },
    [aktifKayitTipi, panelKapat]
  );

  const satirDuzenleAc = useCallback((id: string) => {
    gridApiRef.current?.satirDuzenleAc(id);
  }, []);

  const sagTikSatirSil = useCallback(
    (satir: { id: string }) => {
      switch (aktifKayitTipi) {
        case 'firma': {
          const kayit = firmalar.find((f) => f.id === satir.id);
          if (kayit) silmeAc({ tip: 'firma', kayit });
          break;
        }
        case 'sube': {
          const kayit = subeler.find((s) => s.id === satir.id);
          if (kayit) silmeAc({ tip: 'sube', kayit });
          break;
        }
        case 'depo': {
          const kayit = depolar.find((d) => d.id === satir.id);
          if (kayit) silmeAc({ tip: 'depo', kayit });
          break;
        }
        case 'kasa': {
          const kayit = kasalar.find((k) => k.id === satir.id);
          if (kayit) silmeAc({ tip: 'kasa', kayit });
          break;
        }
        case 'donem': {
          const kayit = donemler.find((d) => d.id === satir.id);
          if (kayit) silmeAc({ tip: 'donem', kayit });
          break;
        }
      }
    },
    [aktifKayitTipi, firmalar, subeler, depolar, kasalar, donemler, silmeAc]
  );

  const sagTikSatirSilMetni = useCallback(
    (satir: { id: string }) => {
      switch (aktifKayitTipi) {
        case 'firma': {
          const kayit = firmalar.find((f) => f.id === satir.id);
          return kayit ? tanimHedefMetni('firma', kayit) : `Kayıt #${satir.id}`;
        }
        case 'sube': {
          const kayit = subeler.find((s) => s.id === satir.id);
          return kayit ? tanimHedefMetni('sube', kayit) : `Kayıt #${satir.id}`;
        }
        case 'depo': {
          const kayit = depolar.find((d) => d.id === satir.id);
          return kayit ? tanimHedefMetni('depo', kayit) : `Kayıt #${satir.id}`;
        }
        case 'kasa': {
          const kayit = kasalar.find((k) => k.id === satir.id);
          return kayit ? tanimHedefMetni('kasa', kayit) : `Kayıt #${satir.id}`;
        }
        case 'donem': {
          const kayit = donemler.find((d) => d.id === satir.id);
          return kayit ? tanimHedefMetni('donem', kayit) : `Kayıt #${satir.id}`;
        }
      }
    },
    [aktifKayitTipi, firmalar, subeler, depolar, kasalar, donemler]
  );

  const sagTikSatirEkle = useCallback((_konum: SatirEkleKonumu, _satirId: string) => {
    gridApiRef.current?.hizliGirisOdakla();
  }, []);

  const firmaKolonlari = useMemo((): KolonTanimi<AdminFirma>[] => {
    return [
      secimKolonu<AdminFirma>(),
      {
        id: 'firmaKodu',
        baslik: 'Firma Kodu',
        tip: 'metin',
        genislik: 110,
        minGenislik: 90,
        zorunlu: true,
        siralama: true,
        degerAl: (f) => f.firmaKodu,
        goster: (f) => <span className="dg-urun-kodu-alt">{f.firmaKodu || '—'}</span>,
      },
      {
        id: 'firmaAdi',
        baslik: 'Firma Adı',
        tip: 'metin',
        genislik: 200,
        minGenislik: 140,
        zorunlu: true,
        siralama: true,
        degerAl: (f) => f.firmaAdi,
        goster: (f) => <span className="dg-urun-adi-ust">{f.firmaAdi || '—'}</span>,
      },
      {
        id: 'vergiDairesi',
        baslik: 'Vergi Dairesi',
        tip: 'metin',
        genislik: 140,
        siralama: true,
        degerAl: (f) => f.vergiDairesi || '—',
      },
      {
        id: 'vergiNo',
        baslik: 'Vergi No',
        tip: 'metin',
        genislik: 110,
        siralama: true,
        degerAl: (f) => f.vergiNo || '—',
      },
      {
        id: 'bagli',
        baslik: 'Bağlı Kayıt',
        tip: 'metin',
        genislik: 140,
        siralama: false,
        degerAl: (f) => {
          const s = subeler.filter((x) => x.firmaId === f.id).length;
          const d = donemler.filter((x) => x.firmaId === f.id).length;
          return `${s} şube · ${d} dönem`;
        },
      },
      olusturmaKolonu<AdminFirma>(),
      guncellemeKolonu<AdminFirma>(),
      durumKolonu<AdminFirma>(),
      islemlerKolonu<AdminFirma>(),
    ];
  }, [subeler, donemler]);

  const subeKolonlari = useMemo((): KolonTanimi<AdminSube>[] => {
    const metin = (id: string, baslik: string, genislik: number, al: (s: AdminSube) => string): KolonTanimi<AdminSube> => ({
      id,
      baslik,
      tip: 'metin',
      genislik,
      minGenislik: Math.min(genislik, 72),
      siralama: true,
      degerAl: (s) => al(s) || '—',
    });

    return [
      secimKolonu<AdminSube>(),
      {
        id: 'subeKodu',
        baslik: 'Şube Kodu',
        tip: 'metin',
        genislik: 100,
        minGenislik: 88,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.subeKodu,
        goster: (s) => <span className="dg-urun-kodu-alt">{s.subeKodu || '—'}</span>,
      },
      {
        id: 'subeAdi',
        baslik: 'Şube Adı',
        tip: 'metin',
        genislik: 160,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (s) => s.subeAdi,
        goster: (s) => <span className="dg-urun-adi-ust">{s.subeAdi || '—'}</span>,
      },
      {
        id: 'ilIlce',
        baslik: 'İl/İlçe',
        tip: 'metin',
        genislik: 130,
        siralama: true,
        degerAl: (s) => [s.il, s.ilce].filter(Boolean).join(' / ') || '—',
        siralamaDegeri: (s) => `${s.il} ${s.ilce}`,
      },
      metin('mahalle', 'Mahalle', 110, (s) => s.mahalle),
      metin('postaKodu', 'Posta Kodu', 88, (s) => s.postaKodu),
      metin('adres', 'Adres', 220, (s) => s.adres),
      metin('efaturaSeri', 'E-Fatura Seri', 96, (s) => s.efaturaSeri),
      metin('earsivSeri', 'E-Arşiv Seri', 96, (s) => s.earsivSeri),
      metin('eirsaliyeSeri', 'E-İrsaliye Seri', 104, (s) => s.eirsaliyeSeri),
      metin('mersis', 'MERSİS', 120, (s) => s.mersis),
      metin('ticaretSicil', 'Ticaret Sicil', 110, (s) => s.ticaretSicil),
      olusturmaKolonu<AdminSube>(),
      guncellemeKolonu<AdminSube>(),
      durumKolonu<AdminSube>(),
      islemlerKolonu<AdminSube>(),
    ];
  }, []);

  const donemKolonlari = useMemo((): KolonTanimi<AdminDonem>[] => {
    return [
      secimKolonu<AdminDonem>(),
      {
        id: 'donemKodu',
        baslik: 'Dönem Kodu',
        tip: 'metin',
        genislik: 110,
        minGenislik: 90,
        zorunlu: true,
        siralama: true,
        degerAl: (d) => d.donemKodu,
        goster: (d) => <span className="dg-urun-kodu-alt">{d.donemKodu || '—'}</span>,
      },
      {
        id: 'donemAdi',
        baslik: 'Dönem Adı',
        tip: 'metin',
        genislik: 160,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (d) => d.donemAdi,
        goster: (d) => <span className="dg-urun-adi-ust">{d.donemAdi || '—'}</span>,
      },
      olusturmaKolonu<AdminDonem>(),
      guncellemeKolonu<AdminDonem>(),
      durumKolonu<AdminDonem>(),
      islemlerKolonu<AdminDonem>(),
    ];
  }, []);

  const depoKolonlari = useMemo((): KolonTanimi<AdminDepo>[] => {
    const metin = (id: string, baslik: string, genislik: number, al: (d: AdminDepo) => string): KolonTanimi<AdminDepo> => ({
      id,
      baslik,
      tip: 'metin',
      genislik,
      minGenislik: Math.min(genislik, 72),
      siralama: true,
      degerAl: (d) => al(d) || '—',
    });

    return [
      secimKolonu<AdminDepo>(),
      {
        id: 'depoKodu',
        baslik: 'Depo Kodu',
        tip: 'metin',
        genislik: 100,
        minGenislik: 88,
        zorunlu: true,
        siralama: true,
        degerAl: (d) => d.depoKodu,
        goster: (d) => <span className="dg-urun-kodu-alt">{d.depoKodu || '—'}</span>,
      },
      {
        id: 'depoAdi',
        baslik: 'Depo Adı',
        tip: 'metin',
        genislik: 160,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (d) => d.depoAdi,
        goster: (d) => <span className="dg-urun-adi-ust">{d.depoAdi || '—'}</span>,
      },
      metin('il', 'İl', 100, (d) => d.il),
      metin('ilce', 'İlçe', 100, (d) => d.ilce),
      metin('mahalle', 'Mahalle', 110, (d) => d.mahalle),
      metin('postaKodu', 'Posta Kodu', 88, (d) => d.postaKodu),
      metin('adres', 'Adres', 220, (d) => d.adres),
      olusturmaKolonu<AdminDepo>(),
      guncellemeKolonu<AdminDepo>(),
      durumKolonu<AdminDepo>(),
      islemlerKolonu<AdminDepo>(),
    ];
  }, []);

  const kasaKolonlari = useMemo((): KolonTanimi<AdminKasa>[] => {
    return [
      secimKolonu<AdminKasa>(),
      {
        id: 'kasaKodu',
        baslik: 'Kasa Kodu',
        tip: 'metin',
        genislik: 100,
        minGenislik: 88,
        zorunlu: true,
        siralama: true,
        degerAl: (k) => k.kasaKodu,
        goster: (k) => <span className="dg-urun-kodu-alt">{k.kasaKodu || '—'}</span>,
      },
      {
        id: 'kasaAdi',
        baslik: 'Kasa Adı',
        tip: 'metin',
        genislik: 160,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (k) => k.kasaAdi,
        goster: (k) => <span className="dg-urun-adi-ust">{k.kasaAdi || '—'}</span>,
      },
      {
        id: 'paraBirimi',
        baslik: 'Para Birimi',
        tip: 'metin',
        genislik: 100,
        siralama: true,
        degerAl: (k) => k.paraBirimi || '—',
      },
      olusturmaKolonu<AdminKasa>(),
      guncellemeKolonu<AdminKasa>(),
      durumKolonu<AdminKasa>(),
      islemlerKolonu<AdminKasa>(),
    ];
  }, []);

  const breadcrumb = useMemo(() => {
    const ogeler: { etiket: string; onTikla?: () => void }[] = [
      { etiket: 'Firmalar', onTikla: () => setKonum({ seviye: 'firmalar' }) },
    ];
    if (seciliFirma) {
      ogeler.push({
        etiket: `${seciliFirma.firmaKodu} — ${seciliFirma.firmaAdi}`,
        onTikla:
          konum.seviye === 'sube'
            ? () => setKonum({ seviye: 'firma', firmaId: seciliFirma.id, sekme: 'subeler' })
            : undefined,
      });
    }
    if (seciliSube) {
      ogeler.push({ etiket: `${seciliSube.subeKodu} — ${seciliSube.subeAdi}` });
    }
    return ogeler;
  }, [seciliFirma, seciliSube, konum.seviye]);

  const aktifGrid = useMemo(() => {
    if (konum.seviye === 'firmalar') {
      return { kolonlar: firmaKolonlari, satirlar: firmalar };
    }
    if (konum.seviye === 'firma' && seciliFirma) {
      if (konum.sekme === 'subeler') {
        return { kolonlar: subeKolonlari, satirlar: subeler.filter((s) => s.firmaId === seciliFirma.id) };
      }
      return { kolonlar: donemKolonlari, satirlar: donemler.filter((d) => d.firmaId === seciliFirma.id) };
    }
    if (konum.seviye === 'sube' && seciliSube) {
      if (konum.sekme === 'depolar') {
        return { kolonlar: depoKolonlari, satirlar: depolar.filter((d) => d.subeId === seciliSube.id) };
      }
      return { kolonlar: kasaKolonlari, satirlar: kasalar.filter((k) => k.subeId === seciliSube.id) };
    }
    return { kolonlar: firmaKolonlari, satirlar: firmalar };
  }, [
    konum,
    seciliFirma,
    seciliSube,
    firmaKolonlari,
    subeKolonlari,
    donemKolonlari,
    depoKolonlari,
    kasaKolonlari,
    firmalar,
    subeler,
    depolar,
    kasalar,
    donemler,
  ]);

  const gridOrtak = useMemo(
    () => ({
      tabloAltBaslik: 'Görünür sütunlar ve sırası',
      yukleniyor,
      varsayilanGizliKolonlar: VARSAYILAN_GIZLI,
      gridApiRef,
      satirDuzenlePaneli,
      satirPanelModu: 'cubuk' as const,
      formulMenuGoster: false,
      hizliGirisIstegeBagli: true,
      hizliGirisVarsayilanAlan: true,
      hizliGirisKolonlari: tanimHizliGirisKolonlari(aktifKayitTipi),
      onHizliGiris: hizliGirisKaydet,
      onSecimDegistir: (ids: string[]) => setSeciliSatirSayisi(ids.length),
    }),
    [yukleniyor, satirDuzenlePaneli, aktifKayitTipi, hizliGirisKaydet]
  );

  const gridIcerik = useMemo((): ReactNode => {
    if (konum.seviye === 'firmalar') {
      return (
        <DataGrid
          key="tanimlar_kayitlar_firmalar_v5"
          {...gridOrtak}
          tabloBaslik="Tanım Kayıtları"
          kolonlar={firmaKolonlari}
          satirlar={firmalar}
          depolamaAnahtari="tanimlar_kayitlar_firmalar_v5"
          bosMesaj="Henüz firma tanımı yok"
          satirSinifAdi={(f) => (!f.aktif ? 'dg-satir--pasif' : undefined)}
          onSatirTikla={(f) => setKonum({ seviye: 'firma', firmaId: f.id, sekme: 'subeler' })}
          onSatirSil={(f) => silmeAc({ tip: 'firma', kayit: f })}
        />
      );
    }

    if (konum.seviye === 'firma' && seciliFirma) {
      const firmaSubeler = subeler.filter((s) => s.firmaId === seciliFirma.id);
      const firmaDonemler = donemler.filter((d) => d.firmaId === seciliFirma.id);
      const sekme = konum.sekme;

      return (
        <div className="ap-tanimlar-gezgin-icerik">
          <GezginSekmeler
            sekmeler={[
              { id: 'subeler', etiket: `Şubeler (${firmaSubeler.length})` },
              { id: 'donemler', etiket: `Dönemler (${firmaDonemler.length})` },
            ]}
            aktif={sekme}
            onSec={(id) =>
              setKonum({
                seviye: 'firma',
                firmaId: seciliFirma.id,
                sekme: id as 'subeler' | 'donemler',
              })
            }
          />
          {sekme === 'subeler' ? (
            <DataGrid
              key="tanimlar_kayitlar_subeler_v6"
              {...gridOrtak}
              tabloBaslik="Şubeler"
              kolonlar={subeKolonlari}
              satirlar={firmaSubeler}
              depolamaAnahtari="tanimlar_kayitlar_subeler_v6"
              bosMesaj="Bu firmaya bağlı şube yok"
              satirSinifAdi={(s) =>
                firmaBagliPasifMi(s.aktif, s.firmaId) ? 'dg-satir--pasif' : undefined
              }
              onSatirTikla={(s) =>
                setKonum({
                  seviye: 'sube',
                  firmaId: seciliFirma.id,
                  subeId: s.id,
                  sekme: 'depolar',
                })
              }
              onSatirSil={(s) => silmeAc({ tip: 'sube', kayit: s })}
            />
          ) : (
            <DataGrid
              key="tanimlar_kayitlar_donemler_v5"
              {...gridOrtak}
              tabloBaslik="Dönemler"
              kolonlar={donemKolonlari}
              satirlar={firmaDonemler}
              depolamaAnahtari="tanimlar_kayitlar_donemler_v5"
              bosMesaj="Bu firmaya bağlı dönem yok"
              satirSinifAdi={(d) =>
                firmaBagliPasifMi(d.aktif, d.firmaId) ? 'dg-satir--pasif' : undefined
              }
              onSatirTikla={(d) => satirDuzenleAc(d.id)}
              onSatirSil={(d) => silmeAc({ tip: 'donem', kayit: d })}
            />
          )}
        </div>
      );
    }

    if (konum.seviye === 'sube' && seciliFirma && seciliSube) {
      const subeDepolar = depolar.filter((d) => d.subeId === seciliSube.id);
      const subeKasalar = kasalar.filter((k) => k.subeId === seciliSube.id);
      const sekme = konum.sekme;

      return (
        <div className="ap-tanimlar-gezgin-icerik">
          <GezginSekmeler
            sekmeler={[
              { id: 'depolar', etiket: `Depolar (${subeDepolar.length})` },
              { id: 'kasalar', etiket: `Kasalar (${subeKasalar.length})` },
            ]}
            aktif={sekme}
            onSec={(id) =>
              setKonum({
                seviye: 'sube',
                firmaId: seciliFirma.id,
                subeId: seciliSube.id,
                sekme: id as 'depolar' | 'kasalar',
              })
            }
          />
          {sekme === 'depolar' ? (
            <DataGrid
              key="tanimlar_kayitlar_depolar_v6"
              {...gridOrtak}
              tabloBaslik="Depolar"
              kolonlar={depoKolonlari}
              satirlar={subeDepolar}
              depolamaAnahtari="tanimlar_kayitlar_depolar_v6"
              bosMesaj="Bu şubeye bağlı depo yok"
              satirSinifAdi={(d) =>
                subeBagliPasifMi(d.aktif, d.subeId) ? 'dg-satir--pasif' : undefined
              }
              onSatirTikla={(d) => satirDuzenleAc(d.id)}
              onSatirSil={(d) => silmeAc({ tip: 'depo', kayit: d })}
            />
          ) : (
            <DataGrid
              key="tanimlar_kayitlar_kasalar_v5"
              {...gridOrtak}
              tabloBaslik="Kasalar"
              kolonlar={kasaKolonlari}
              satirlar={subeKasalar}
              depolamaAnahtari="tanimlar_kayitlar_kasalar_v5"
              bosMesaj="Bu şubeye bağlı kasa yok"
              satirSinifAdi={(k) =>
                subeBagliPasifMi(k.aktif, k.subeId) ? 'dg-satir--pasif' : undefined
              }
              onSatirTikla={(k) => satirDuzenleAc(k.id)}
              onSatirSil={(k) => silmeAc({ tip: 'kasa', kayit: k })}
            />
          )}
        </div>
      );
    }

    return null;
  }, [
    konum,
    firmalar,
    subeler,
    depolar,
    kasalar,
    donemler,
    seciliFirma,
    seciliSube,
    gridOrtak,
    firmaKolonlari,
    subeKolonlari,
    donemKolonlari,
    depoKolonlari,
    kasaKolonlari,
    firmaBagliPasifMi,
    subeBagliPasifMi,
    silmeAc,
    satirDuzenleAc,
  ]);

  if (yukleniyor && firmalar.length === 0) return <TanimYukleniyor />;

  const silmeHedefMetni = silme ? tanimHedefMetni(silme.tip, silme.kayit) : '';
  const bagliSilGoster =
    !!silme &&
    (silme.tip === 'firma' || silme.tip === 'sube') &&
    !!aktifBaglanti?.bagliVar;

  return (
    <div ref={sayfaRef} className="dg-demo-sayfa dg-demo-sag-tik-alan">
      <DatagridSagTikMenu
        konteynerRef={sayfaRef}
        kolonlar={aktifGrid.kolonlar as unknown as KolonTanimi<{ id: string }>[]}
        satirlar={aktifGrid.satirlar}
        seciliSatirSayisi={seciliSatirSayisi}
        gridApiRef={gridApiRef}
        menuEtiketi="Tanım kayıtları menüsü"
        satirCogaltGoster={false}
        seciliSilGoster={false}
        dahiliSilmeOnay={false}
        onSatirEkleBaslat={sagTikSatirEkle}
        onSatirSil={sagTikSatirSil}
        satirSilMetniAl={sagTikSatirSilMetni}
        onBilgi={basariBildir}
      />

      <div className="dg-tanimlar-kayit-ust">
        <nav className="ap-tanimlar-gezgin-yol" aria-label="Kayıt konumu">
          <ol className="ap-tanimlar-gezgin-yol-liste">
            {breadcrumb.map((oge, idx) => (
              <li key={`${oge.etiket}-${idx}`} className="ap-tanimlar-gezgin-yol-oge">
                {oge.onTikla ? (
                  <button type="button" className="ap-tanimlar-gezgin-yol-tus" onClick={oge.onTikla}>
                    {oge.etiket}
                  </button>
                ) : (
                  <span className="ap-tanimlar-gezgin-yol-metin">{oge.etiket}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <button type="button" className="ap-tanimlar-yeni-ekle" onClick={yeniEkle}>
          <span aria-hidden>+</span>
          {ekleEtiketi}
        </button>
      </div>

      {gridIcerik}

      {bagliSilGoster && aktifBaglanti ? (
        <TanimBagliSilOnayModal
          acik
          onKapat={silmeKapat}
          onOnayla={(mod) => void silmeUygula(mod)}
          hedefMetin={silmeHedefMetni}
          bagliOzet={aktifBaglanti.ozetSatirlari}
        />
      ) : (
        <SilmeOnayModal
          acik={!!silme && !bagliSilGoster}
          onKapat={silmeKapat}
          onOnayla={() => void silmeUygula()}
          hedefMetin={silmeHedefMetni}
        />
      )}
    </div>
  );
}
