import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { AdminCari, CariFormDegeri, CariTipi } from '@/admin/baslat-menusu/erp/cari/tipler';

const TABAN = '/cariler';

export type CariSilModu = 'hepsi' | 'pasif';

/** API yanıtında eksik gelebilecek string alanları güvenli hale getirir */
function cariNormalize(c: AdminCari): AdminCari {
  return {
    ...c,
    ustId: c.ustId ?? '',
    isletmeTuru: c.isletmeTuru ?? '',
    unvan: c.unvan ?? '',
    alisFiyatTanimi: c.alisFiyatTanimi ?? '',
    alisFiyatSecimi: c.alisFiyatSecimi ?? '',
    satisFiyatTanimi: c.satisFiyatTanimi ?? '',
    satisFiyatSecimi: c.satisFiyatSecimi ?? '',
    yetkili: c.yetkili ?? '',
    vergiDairesi: c.vergiDairesi ?? '',
    vergiNo: c.vergiNo ?? '',
    il: c.il ?? '',
    ilce: c.ilce ?? '',
    adres: c.adres ?? '',
    telefon: c.telefon ?? '',
    telefonDahili: c.telefonDahili ?? '',
    gsm: c.gsm ?? '',
    eposta: c.eposta ?? '',
    web: c.web ?? '',
    earsiv: c.earsiv ?? false,
    efaturaTipi: c.efaturaTipi ?? '',
    alias: c.alias ?? '',
    earsivAlias: c.earsivAlias ?? '',
    earsivTeslimSekli: c.earsivTeslimSekli ?? '',
  };
}

function cariSilIstegi(id: string, mod?: CariSilModu) {
  return adminJsonFetch(`${TABAN}/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
    body: mod ? JSON.stringify({ mod }) : undefined,
  });
}

export async function carileriGetir(cariTipi?: CariTipi | ''): Promise<AdminCari[]> {
  const sorgu = cariTipi ? `?cariTipi=${encodeURIComponent(cariTipi)}` : '';
  const veri = await adminJsonFetch<{ cariler: AdminCari[] }>(`${TABAN}${sorgu}`, {
    headers: adminHeaders(),
  });
  return (veri.cariler ?? []).map(cariNormalize);
}

export async function cariOlustur(form: CariFormDegeri): Promise<AdminCari> {
  const veri = await adminJsonFetch<{ cari: AdminCari }>(TABAN, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return cariNormalize(veri.cari);
}

export async function cariGuncelle(id: string, form: CariFormDegeri): Promise<AdminCari> {
  const veri = await adminJsonFetch<{ cari: AdminCari }>(`${TABAN}/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return cariNormalize(veri.cari);
}

export async function cariSil(id: string, mod?: CariSilModu): Promise<void> {
  await cariSilIstegi(id, mod);
}
