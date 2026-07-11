import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';
import type { KisayolHaritasi } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import type { SekmePanelAyarlari } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

const TABAN = '/kullanici-ayarlari';

/** Lokal gelistirmede (BACKEND_YOK) bellek modu; sunucuda gercek veritabani. */
export function kullaniciAyarlariVeritabaniModuMu(): boolean {
  return !BACKEND_YOK;
}

export async function kisayolAyarlariGetir(): Promise<{ harita: Partial<KisayolHaritasi> }> {
  const { kisayolAyarlariOku } = await import('@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci');
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    return { harita: kisayolAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ harita?: Partial<KisayolHaritasi> }>(`${TABAN}/kisayol`, {
    headers: adminHeaders(),
  });
  return { harita: yanit.harita ?? {} };
}

export async function kisayolAyarlariGuncelle(harita: KisayolHaritasi): Promise<{ harita: KisayolHaritasi }> {
  const { kisayolAyarlariBellegeYaz, kisayolAyarlariOku } = await import(
    '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci'
  );
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    kisayolAyarlariBellegeYaz(harita);
    return { harita: kisayolAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ harita?: KisayolHaritasi }>(`${TABAN}/kisayol`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ harita }),
  });
  return { harita: yanit.harita ?? harita };
}

export async function sekmeAyarlariGetir(): Promise<{ ayarlar: Partial<SekmePanelAyarlari> }> {
  const { sekmeAyarlariOku } = await import('@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci');
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    return { ayarlar: sekmeAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ ayarlar?: Partial<SekmePanelAyarlari> }>(`${TABAN}/sekme`, {
    headers: adminHeaders(),
  });
  return { ayarlar: yanit.ayarlar ?? {} };
}

export async function sekmeAyarlariGuncelle(
  ayarlar: SekmePanelAyarlari
): Promise<{ ayarlar: SekmePanelAyarlari }> {
  const { sekmeAyarlariBellegeYaz, sekmeAyarlariOku } = await import(
    '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci'
  );
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    sekmeAyarlariBellegeYaz(ayarlar);
    return { ayarlar: sekmeAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ ayarlar?: SekmePanelAyarlari }>(`${TABAN}/sekme`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ ayarlar }),
  });
  return { ayarlar: yanit.ayarlar ?? ayarlar };
}

export async function kullaniciAyarlariSunucudanYukle(): Promise<void> {
  const { kisayolAyarlariBellegeYaz } = await import('@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci');
  const { sekmeAyarlariBellegeYaz } = await import('@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci');

  if (!kullaniciAyarlariVeritabaniModuMu()) {
    return;
  }

  const [kisayol, sekme] = await Promise.all([kisayolAyarlariGetir(), sekmeAyarlariGetir()]);
  kisayolAyarlariBellegeYaz(kisayol.harita ?? {});
  sekmeAyarlariBellegeYaz(sekme.ayarlar ?? {});
}
