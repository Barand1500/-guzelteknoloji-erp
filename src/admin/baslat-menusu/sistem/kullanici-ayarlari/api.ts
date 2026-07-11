import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { KisayolHaritasi } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import type { SekmePanelAyarlari } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

const TABAN = '/kullanici-ayarlari';

export async function kisayolAyarlariGetir(): Promise<{ harita: Partial<KisayolHaritasi> }> {
  return adminJsonFetch<{ harita: Partial<KisayolHaritasi> }>(`${TABAN}/kisayol`, {
    headers: adminHeaders(),
  });
}

export async function kisayolAyarlariGuncelle(harita: KisayolHaritasi): Promise<{ harita: KisayolHaritasi }> {
  return adminJsonFetch<{ harita: KisayolHaritasi }>(`${TABAN}/kisayol`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ harita }),
  });
}

export async function sekmeAyarlariGetir(): Promise<{ ayarlar: Partial<SekmePanelAyarlari> }> {
  return adminJsonFetch<{ ayarlar: Partial<SekmePanelAyarlari> }>(`${TABAN}/sekme`, {
    headers: adminHeaders(),
  });
}

export async function sekmeAyarlariGuncelle(
  ayarlar: SekmePanelAyarlari
): Promise<{ ayarlar: SekmePanelAyarlari }> {
  return adminJsonFetch<{ ayarlar: SekmePanelAyarlari }>(`${TABAN}/sekme`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ ayarlar }),
  });
}

export async function kullaniciAyarlariSunucudanYukle(): Promise<void> {
  const [kisayol, sekme] = await Promise.all([kisayolAyarlariGetir(), sekmeAyarlariGetir()]);
  const { kisayolAyarlariBellegeYaz } = await import('@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci');
  const { sekmeAyarlariBellegeYaz } = await import('@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci');
  kisayolAyarlariBellegeYaz(kisayol.harita);
  sekmeAyarlariBellegeYaz(sekme.ayarlar);
}
