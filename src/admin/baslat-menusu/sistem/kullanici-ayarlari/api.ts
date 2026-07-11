import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';
import {
  kisayolAyarlariBellegeYaz,
  kisayolAyarlariOku,
  type KisayolHaritasi,
} from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import {
  sekmeAyarlariBellegeYaz,
  sekmeAyarlariOku,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

const TABAN = '/kullanici-ayarlari';

/** Lokal gelistirmede (BACKEND_YOK) bellek modu; sunucuda gercek veritabani. */
export function kullaniciAyarlariVeritabaniModuMu(): boolean {
  return !BACKEND_YOK;
}

export async function kisayolAyarlariGetir(): Promise<{ harita: Partial<KisayolHaritasi> }> {
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    return { harita: kisayolAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ harita?: Partial<KisayolHaritasi> }>(`${TABAN}/kisayol`, {
    headers: adminHeaders(),
  });
  return { harita: yanit.harita ?? {} };
}

export async function kisayolAyarlariGuncelle(harita: KisayolHaritasi): Promise<{ harita: KisayolHaritasi }> {
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    kisayolAyarlariBellegeYaz(harita);
    return { harita: kisayolAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ harita?: KisayolHaritasi }>(`${TABAN}/kisayol`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ harita }),
  });
  const kayitli = yanit.harita ?? harita;
  kisayolAyarlariBellegeYaz(kayitli);
  return { harita: kisayolAyarlariOku() };
}

export async function sekmeAyarlariGetir(): Promise<{ ayarlar: Partial<SekmePanelAyarlari> }> {
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
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    sekmeAyarlariBellegeYaz(ayarlar);
    return { ayarlar: sekmeAyarlariOku() };
  }
  const yanit = await adminJsonFetch<{ ayarlar?: SekmePanelAyarlari }>(`${TABAN}/sekme`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ ayarlar }),
  });
  const kayitli = yanit.ayarlar ?? ayarlar;
  sekmeAyarlariBellegeYaz(kayitli);
  return { ayarlar: sekmeAyarlariOku() };
}

export async function kullaniciAyarlariSunucudanYukle(): Promise<void> {
  if (!kullaniciAyarlariVeritabaniModuMu()) {
    return;
  }
  const [kisayol, sekme] = await Promise.all([kisayolAyarlariGetir(), sekmeAyarlariGetir()]);
  kisayolAyarlariBellegeYaz(kisayol.harita ?? {});
  sekmeAyarlariBellegeYaz(sekme.ayarlar ?? {});
}
