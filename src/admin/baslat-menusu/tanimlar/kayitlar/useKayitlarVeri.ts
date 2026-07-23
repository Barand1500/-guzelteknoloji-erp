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
import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { TIP_ETIKET, type SilmeHedef } from './tipler';

export function useKayitlarVeri() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const logMesajiAyarla = useAdminLogMesaji();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [depolar, setDepolar] = useState<AdminDepo[]>([]);
  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);
  const [donemler, setDonemler] = useState<AdminDonem[]>([]);
  const [seciliFirmaId, setSeciliFirmaId] = useState<string | null>(null);
  const [aktifSubeId, setAktifSubeId] = useState<string | null>(null);
  const [silinecek, setSilinecek] = useState<SilmeHedef | null>(null);
  const [bagliSil, setBagliSil] = useState<SilmeHedef | null>(null);

  const yukle = useCallback(
    async (seciliKorunsun?: string | null) => {
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
    },
    [hataBildir]
  );

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const seciliFirma = useMemo(
    () => firmalar.find((f) => f.id === seciliFirmaId) ?? null,
    [firmalar, seciliFirmaId]
  );

  const firmaSubeleri = useMemo(
    () => subeler.filter((s) => s.firmaId === seciliFirmaId),
    [subeler, seciliFirmaId]
  );

  useEffect(() => {
    if (!aktifSubeId) return;
    if (!firmaSubeleri.some((s) => s.id === aktifSubeId)) {
      setAktifSubeId(null);
    }
  }, [aktifSubeId, firmaSubeleri]);

  const aktifSube = useMemo(
    () => firmaSubeleri.find((s) => s.id === aktifSubeId) ?? null,
    [firmaSubeleri, aktifSubeId]
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

  const subeMap = useMemo(() => {
    const m = new Map<string, AdminSube>();
    for (const s of subeler) m.set(s.id, s);
    return m;
  }, [subeler]);

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

  const silBaslat = useCallback(
    (hedef: SilmeHedef) => {
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
    [firmalar, subeler, depolar, kasalar, donemler]
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
        if (hedef.tip === 'sube' && hedef.kayit.id === aktifSubeId) setAktifSubeId(null);
        const yeniSecili =
          hedef.tip === 'firma' && hedef.kayit.id === seciliFirmaId ? null : seciliFirmaId;
        await yukle(yeniSecili);
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
      }
    },
    [logMesajiAyarla, basariBildir, hataBildir, seciliFirmaId, aktifSubeId, yukle]
  );

  const firmaSec = useCallback((firmaId: string) => {
    setSeciliFirmaId(firmaId || null);
    setAktifSubeId(null);
  }, []);

  return {
    yukleniyor,
    firmalar,
    subeler,
    depolar,
    kasalar,
    donemler,
    seciliFirmaId,
    seciliFirma,
    firmaSubeleri,
    aktifSubeId,
    aktifSube,
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
    silBaslat,
    silOnayla,
    hataBildir,
    basariBildir,
  };
}
