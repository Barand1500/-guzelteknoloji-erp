import { cariSeedKayitlari } from '@/admin/baslat-menusu/erp/cari/cariSeedVerisi';
import type { AdminCari, CariFormDegeri } from '@/admin/baslat-menusu/erp/cari/tipler';

const OFFLINE_CARILER_ANAHTAR = 'erp-offline-cariler-v7';

function simdiIso() {
  return new Date().toISOString();
}

function varsayilanCariler(): AdminCari[] {
  return cariSeedKayitlari(simdiIso());
}

function carilerOku(): AdminCari[] {
  try {
    const ham = localStorage.getItem(OFFLINE_CARILER_ANAHTAR);
    if (ham) return JSON.parse(ham) as AdminCari[];
  } catch {
    /* bozuk kayit */
  }
  const varsayilan = varsayilanCariler();
  carilerKaydet(varsayilan);
  return varsayilan;
}

function carilerKaydet(liste: AdminCari[]) {
  localStorage.setItem(OFFLINE_CARILER_ANAHTAR, JSON.stringify(liste));
}

function sonrakiId(liste: AdminCari[]): string {
  return String(Math.max(0, ...liste.map((k) => Number(k.id) || 0)) + 1);
}

function formdanCari(form: CariFormDegeri, id: string, firmaId = '1', olusturma?: string): AdminCari {
  const simdi = simdiIso();
  return {
    id,
    firmaId,
    ustId: form.ustId.trim(),
    cariTipi: form.cariTipi,
    isletmeTuru: form.isletmeTuru,
    cariKodu: form.cariKodu.trim(),
    cariAdi: form.cariAdi.trim(),
    unvan: form.unvan.trim(),
    fiyatTanimi: form.fiyatTanimi.trim(),
    yetkili: form.yetkili.trim(),
    vergiDairesi: form.vergiDairesi.trim(),
    vergiNo: form.vergiNo.trim(),
    il: form.il.trim(),
    ilce: form.ilce.trim(),
    adres: form.adres.trim(),
    telefon: form.telefon.trim(),
    gsm: form.gsm.trim(),
    eposta: form.eposta.trim(),
    web: form.web.trim(),
    efatura: form.efatura,
    earsiv: form.earsiv,
    efaturaTipi: form.efaturaTipi.trim(),
    alias: form.alias.trim(),
    earsivAlias: form.earsivAlias.trim(),
    earsivTeslimSekli: form.earsivTeslimSekli.trim(),
    aktif: form.aktif,
    olusturma: olusturma ?? simdi,
    guncelleme: simdi,
  };
}

export function offlineCarilerGetir(path: string): unknown {
  const cariTipi = new URLSearchParams(path.split('?')[1] ?? '').get('cariTipi')?.trim().toUpperCase();
  let cariler = carilerOku();
  if (cariTipi === 'SATICI' || cariTipi === 'ALICI') {
    cariler = cariler.filter((c) => c.cariTipi === cariTipi);
  }
  return { cariler };
}

export function offlineCarilerYaz(path: string, method: string, body?: BodyInit | null): unknown {
  const liste = carilerOku();
  const idParca = path.split('/').pop();
  const id = idParca && /^\d+$/.test(idParca) ? idParca : null;

  if (method === 'DELETE' && id) {
    const idx = liste.findIndex((c) => c.id === id);
    if (idx < 0) return { mesaj: 'Cari bulunamadi' };
    let mod: 'hepsi' | 'pasif' = 'hepsi';
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body) as { mod?: string };
        if (parsed.mod === 'pasif') mod = 'pasif';
      } catch {
        /* varsayilan */
      }
    }
    if (mod === 'pasif') {
      const guncel = { ...liste[idx], aktif: false, guncelleme: simdiIso() };
      const yeni = [...liste];
      yeni[idx] = guncel;
      carilerKaydet(yeni);
      return { mesaj: 'Cari pasif yapildi' };
    }
    carilerKaydet(liste.filter((c) => c.id !== id));
    return { mesaj: 'Cari silindi' };
  }

  if (method === 'POST' && typeof body === 'string') {
    const form = JSON.parse(body) as CariFormDegeri;
    const kod = form.cariKodu.trim();
    if (liste.some((c) => c.cariKodu === kod)) {
      return { mesaj: 'Bu cari kodu zaten kayitli' };
    }
    const cari = formdanCari(form, sonrakiId(liste));
    carilerKaydet([...liste, cari]);
    return { cari };
  }

  if (method === 'PUT' && id && typeof body === 'string') {
    const idx = liste.findIndex((c) => c.id === id);
    if (idx < 0) return { mesaj: 'Cari bulunamadi' };
    const form = JSON.parse(body) as CariFormDegeri;
    const kod = form.cariKodu.trim();
    if (liste.some((c) => c.id !== id && c.cariKodu === kod)) {
      return { mesaj: 'Bu cari kodu zaten kayitli' };
    }
    const mevcut = liste[idx];
    const cari = formdanCari(form, id, mevcut.firmaId, mevcut.olusturma);
    const yeni = [...liste];
    yeni[idx] = cari;
    carilerKaydet(yeni);
    return { cari };
  }

  return { mesaj: 'Kayit (offline mod)' };
}
