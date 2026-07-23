import type { KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';

export interface KullaniciOturumSecenekleri {
  firmalar: AdminFirma[];
  donemler: AdminDonem[];
  subeler: AdminSube[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
}

export function firmaDonemleri(donemler: AdminDonem[], firmaId: string) {
  return donemler.filter((d) => d.firmaId === firmaId);
}

export function firmaSubeleri(subeler: AdminSube[], firmaId: string) {
  return subeler.filter((s) => s.firmaId === firmaId);
}

export function subeDepolari(depolar: AdminDepo[], subeId: string) {
  return depolar.filter((d) => d.subeId === subeId);
}

export function subeKasalari(kasalar: AdminKasa[], subeId: string) {
  return kasalar.filter((k) => k.subeId === subeId);
}

export function varsayilanOturumAlanlari(
  secenekler: KullaniciOturumSecenekleri
): Pick<
  KullaniciFormDegeri,
  | 'firmaId'
  | 'donemId'
  | 'subeId'
  | 'depoId'
  | 'kasaId'
  | 'subeIds'
  | 'depoIds'
  | 'kasaIds'
  | 'oturumYetkileri'
> {
  const firmaId = secenekler.firmalar[0]?.id ?? '';
  const donemId = firmaDonemleri(secenekler.donemler, firmaId)[0]?.id ?? '';
  const subeId = firmaSubeleri(secenekler.subeler, firmaId)[0]?.id ?? '';
  const depoId = subeDepolari(secenekler.depolar, subeId)[0]?.id ?? '';
  const kasaId = subeKasalari(secenekler.kasalar, subeId)[0]?.id ?? '';
  return {
    firmaId,
    donemId,
    subeId,
    depoId,
    kasaId,
    subeIds: subeId ? [subeId] : [],
    depoIds: depoId ? [depoId] : [],
    kasaIds: kasaId ? [kasaId] : [],
    oturumYetkileri: firmaId && donemId ? [{ firmaId, donemId }] : [],
  };
}

export function firmaDegistir(
  form: KullaniciFormDegeri,
  firmaId: string,
  secenekler: KullaniciOturumSecenekleri
): KullaniciFormDegeri {
  const subeId = firmaSubeleri(secenekler.subeler, firmaId)[0]?.id ?? '';
  const depoId = subeDepolari(secenekler.depolar, subeId)[0]?.id ?? '';
  const kasaId = subeKasalari(secenekler.kasalar, subeId)[0]?.id ?? '';
  return {
    ...form,
    firmaId,
    donemId: firmaDonemleri(secenekler.donemler, firmaId)[0]?.id ?? '',
    subeId,
    depoId,
    kasaId,
    subeIds: subeId ? [subeId] : [],
    depoIds: depoId ? [depoId] : [],
    kasaIds: kasaId ? [kasaId] : [],
  };
}

export function subeDegistir(
  form: KullaniciFormDegeri,
  subeId: string,
  secenekler: KullaniciOturumSecenekleri
): KullaniciFormDegeri {
  const depoId = subeDepolari(secenekler.depolar, subeId)[0]?.id ?? '';
  const kasaId = subeKasalari(secenekler.kasalar, subeId)[0]?.id ?? '';
  return {
    ...form,
    subeId,
    depoId,
    kasaId,
    subeIds: subeId ? [subeId] : [],
    depoIds: depoId ? [depoId] : [],
    kasaIds: kasaId ? [kasaId] : [],
  };
}
