import { useEffect, useMemo, useState } from 'react';
import { firmalariGetir, subeleriGetir } from '@/admin/baslat-menusu/tanimlar/api';
import type { AdminFirma, AdminSube } from '@/admin/baslat-menusu/tanimlar/tipler';

export function useTanimFirmaDurumu() {
  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);

  useEffect(() => {
    void Promise.all([firmalariGetir(), subeleriGetir()]).then(([f, s]) => {
      setFirmalar(f);
      setSubeler(s);
    });
  }, []);

  const firmaAktifHaritasi = useMemo(
    () => new Map(firmalar.map((f) => [f.id, f.aktif])),
    [firmalar]
  );

  const subeKayitHaritasi = useMemo(
    () => new Map(subeler.map((s) => [s.id, s])),
    [subeler]
  );

  const firmaAktifMi = (firmaId: string) => firmaAktifHaritasi.get(firmaId) !== false;

  const firmaBagliPasifMi = (kayitAktif: boolean, firmaId: string) =>
    !kayitAktif || !firmaAktifMi(firmaId);

  const subeBagliPasifMi = (kayitAktif: boolean, subeId: string) => {
    if (!kayitAktif) return true;
    const sube = subeKayitHaritasi.get(subeId);
    if (!sube) return false;
    if (!sube.aktif) return true;
    return !firmaAktifMi(sube.firmaId);
  };

  return { firmaBagliPasifMi, subeBagliPasifMi };
}
