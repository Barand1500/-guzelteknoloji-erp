import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import {
  bosDepoForm,
  bosSubeForm,
  type DepoFormDegeri,
  type DonemFormDegeri,
  type FirmaFormDegeri,
  type KasaFormDegeri,
  type SubeFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';

const TABAN = '/tanimlar';

export type TanimSilModu = 'hepsi' | 'pasif';

function tanimSilIstegi(idYolu: string, mod?: TanimSilModu) {
  return adminJsonFetch(idYolu, {
    method: 'DELETE',
    headers: adminHeaders(),
    body: mod ? JSON.stringify({ mod }) : undefined,
  });
}

/** Yeni firma ile birlikte MERKEZ şube ve MERKEZ depo oluşturur (yoksa). */
async function merkezKayitlariOlustur(firmaId: string): Promise<void> {
  const subeler = await subeleriGetir();
  let merkez = subeler.find((s) => s.firmaId === firmaId && s.subeKodu === 'MERKEZ');
  if (!merkez) {
    merkez = await subeOlustur(
      { ...bosSubeForm, subeKodu: 'MERKEZ', subeAdi: 'MERKEZ', aktif: true },
      firmaId
    );
  }
  const depolar = await depolariGetir();
  const merkezDepoVar = depolar.some((d) => d.subeId === merkez!.id && d.depoKodu === 'MERKEZ');
  if (!merkezDepoVar) {
    await depoOlustur({
      ...bosDepoForm,
      subeId: merkez.id,
      depoKodu: 'MERKEZ',
      depoAdi: 'MERKEZ',
      aktif: true,
    });
  }
}

// ——— Firma ———

export async function firmalariGetir(): Promise<AdminFirma[]> {
  const veri = await adminJsonFetch<{ firmalar: AdminFirma[] }>(`${TABAN}/firmalar`, {
    headers: adminHeaders(),
  });
  return veri.firmalar ?? [];
}

export async function firmaOlustur(form: FirmaFormDegeri): Promise<AdminFirma> {
  const veri = await adminJsonFetch<{ firma: AdminFirma }>(`${TABAN}/firmalar`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  await merkezKayitlariOlustur(veri.firma.id);
  return veri.firma;
}

export async function firmaGuncelle(id: string, form: FirmaFormDegeri): Promise<AdminFirma> {
  const veri = await adminJsonFetch<{ firma: AdminFirma }>(`${TABAN}/firmalar/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.firma;
}

export async function firmaSil(id: string, mod?: TanimSilModu): Promise<void> {
  await tanimSilIstegi(`${TABAN}/firmalar/${id}`, mod);
}

// ——— Dönem ———

export async function donemleriGetir(): Promise<AdminDonem[]> {
  const veri = await adminJsonFetch<{ donemler: AdminDonem[] }>(`${TABAN}/donemler`, {
    headers: adminHeaders(),
  });
  return veri.donemler ?? [];
}

export async function donemOlustur(form: DonemFormDegeri): Promise<AdminDonem> {
  const veri = await adminJsonFetch<{ donem: AdminDonem }>(`${TABAN}/donemler`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.donem;
}

export async function donemGuncelle(id: string, form: DonemFormDegeri): Promise<AdminDonem> {
  const veri = await adminJsonFetch<{ donem: AdminDonem }>(`${TABAN}/donemler/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.donem;
}

export async function donemSil(id: string): Promise<void> {
  await adminJsonFetch(`${TABAN}/donemler/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ——— Şube ———

export async function subeleriGetir(): Promise<AdminSube[]> {
  const veri = await adminJsonFetch<{ subeler: AdminSube[] }>(`${TABAN}/subeler`, {
    headers: adminHeaders(),
  });
  return veri.subeler ?? [];
}

export async function subeOlustur(form: SubeFormDegeri, firmaId?: string): Promise<AdminSube> {
  const veri = await adminJsonFetch<{ sube: AdminSube }>(`${TABAN}/subeler`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(firmaId ? { ...form, firmaId } : form),
  });
  return veri.sube;
}

export async function subeGuncelle(id: string, form: SubeFormDegeri): Promise<AdminSube> {
  const veri = await adminJsonFetch<{ sube: AdminSube }>(`${TABAN}/subeler/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.sube;
}

export async function subeSil(id: string, mod?: TanimSilModu): Promise<void> {
  await tanimSilIstegi(`${TABAN}/subeler/${id}`, mod);
}

// ——— Depo ———

export async function depolariGetir(): Promise<AdminDepo[]> {
  const veri = await adminJsonFetch<{ depolar: AdminDepo[] }>(`${TABAN}/depolar`, {
    headers: adminHeaders(),
  });
  return veri.depolar ?? [];
}

export async function depoOlustur(form: DepoFormDegeri): Promise<AdminDepo> {
  const veri = await adminJsonFetch<{ depo: AdminDepo }>(`${TABAN}/depolar`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.depo;
}

export async function depoGuncelle(id: string, form: DepoFormDegeri): Promise<AdminDepo> {
  const veri = await adminJsonFetch<{ depo: AdminDepo }>(`${TABAN}/depolar/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.depo;
}

export async function depoSil(id: string): Promise<void> {
  await adminJsonFetch(`${TABAN}/depolar/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ——— Kasa ———

export async function kasalariGetir(): Promise<AdminKasa[]> {
  const veri = await adminJsonFetch<{ kasalar: AdminKasa[] }>(`${TABAN}/kasalar`, {
    headers: adminHeaders(),
  });
  return veri.kasalar ?? [];
}

export async function kasaOlustur(form: KasaFormDegeri): Promise<AdminKasa> {
  const veri = await adminJsonFetch<{ kasa: AdminKasa }>(`${TABAN}/kasalar`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.kasa;
}

export async function kasaGuncelle(id: string, form: KasaFormDegeri): Promise<AdminKasa> {
  const veri = await adminJsonFetch<{ kasa: AdminKasa }>(`${TABAN}/kasalar/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(form),
  });
  return veri.kasa;
}

export async function kasaSil(id: string): Promise<void> {
  await adminJsonFetch(`${TABAN}/kasalar/${id}`, { method: 'DELETE', headers: adminHeaders() });
}
