import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import {
  VARSAYILAN_SEKME_AYARLARI,
  sekmeAyarlariKaydet,
  sekmeAyarlariKullaniciAyarla,
  sekmeAyarlariOku,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import {
  kisayolAyarlariKaydet,
  kisayolAyarlariKullaniciAyarla,
  kisayolAyarlariOku,
  varsayilanKisayollar,
  type KisayolHaritasi,
} from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';

export async function sekmeAyarlariGetirApi(): Promise<Partial<SekmePanelAyarlari>> {
  const veri = await adminJsonFetch<{ ayarlar: Partial<SekmePanelAyarlari> }>('/kullanici-ayarlari/sekme', {
    headers: adminHeaders(),
  });
  return veri.ayarlar ?? {};
}

export async function sekmeAyarlariKaydetApi(ayarlar: SekmePanelAyarlari): Promise<SekmePanelAyarlari> {
  const veri = await adminJsonFetch<{ ayarlar: SekmePanelAyarlari }>('/kullanici-ayarlari/sekme', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ ayarlar }),
  });
  return veri.ayarlar ?? ayarlar;
}

export async function kisayolAyarlariGetirApi(): Promise<Partial<KisayolHaritasi>> {
  const veri = await adminJsonFetch<{ harita: Partial<KisayolHaritasi> }>('/kullanici-ayarlari/kisayol', {
    headers: adminHeaders(),
  });
  return veri.harita ?? {};
}

export async function kisayolAyarlariKaydetApi(harita: KisayolHaritasi): Promise<KisayolHaritasi> {
  const veri = await adminJsonFetch<{ harita: KisayolHaritasi }>('/kullanici-ayarlari/kisayol', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ harita }),
  });
  return veri.harita ?? harita;
}

function panelOlaylariniYayinla() {
  window.dispatchEvent(new CustomEvent('ap-sekme-ayarlari-guncellendi'));
  window.dispatchEvent(new CustomEvent('ap-kisayol-ayarlari-guncellendi'));
}

/** Oturum acildiginda kullaniciya ait panel ayarlarini sunucudan yerel onbellege ceker. */
export async function kullaniciPanelAyarlariYukle(kullaniciId: string | number): Promise<void> {
  sekmeAyarlariKullaniciAyarla(kullaniciId);
  kisayolAyarlariKullaniciAyarla(kullaniciId);

  try {
    const [sekmeHam, kisayolHam] = await Promise.all([sekmeAyarlariGetirApi(), kisayolAyarlariGetirApi()]);

    if (Object.keys(sekmeHam).length > 0) {
      sekmeAyarlariKaydet({ ...VARSAYILAN_SEKME_AYARLARI, ...sekmeHam }, false);
    }

    if (Object.keys(kisayolHam).length > 0) {
      kisayolAyarlariKaydet({ ...varsayilanKisayollar(), ...kisayolHam }, false);
    }

    panelOlaylariniYayinla();
  } catch {
    sekmeAyarlariOku();
    kisayolAyarlariOku();
  }
}

export async function sekmeAyarlariKaliciKaydet(ayarlar: SekmePanelAyarlari): Promise<SekmePanelAyarlari> {
  sekmeAyarlariKaydet(ayarlar, false);
  try {
    const kayit = await sekmeAyarlariKaydetApi(ayarlar);
    sekmeAyarlariKaydet(kayit, false);
    return kayit;
  } catch {
    sekmeAyarlariKaydet(ayarlar, true);
    return ayarlar;
  }
}

export async function kisayolAyarlariKaliciKaydet(harita: KisayolHaritasi): Promise<KisayolHaritasi> {
  kisayolAyarlariKaydet(harita, false);
  try {
    const kayit = await kisayolAyarlariKaydetApi(harita);
    kisayolAyarlariKaydet(kayit, false);
    return kayit;
  } catch {
    kisayolAyarlariKaydet(harita, true);
    return harita;
  }
}
