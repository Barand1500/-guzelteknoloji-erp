import { bankaEtiketi } from './bankalar';
import type { AdminBankaAnlasma, BankaAnlasmaFormDegeri } from './tipler';

const ANAHTAR = 'erp-banka-anlasmalari-kayitlar-v1';

function oku(): AdminBankaAnlasma[] {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (!ham) return [];
    const liste = JSON.parse(ham) as AdminBankaAnlasma[];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function yaz(liste: AdminBankaAnlasma[]) {
  localStorage.setItem(ANAHTAR, JSON.stringify(liste));
}

function simdi(): string {
  return new Date().toISOString();
}

function formdanKayit(
  form: BankaAnlasmaFormDegeri,
  mevcut?: AdminBankaAnlasma
): AdminBankaAnlasma {
  const zaman = simdi();
  const kredi = form.hesapTipi === 'KREDI';
  const banka = form.hesapTipi === 'BANKA';
  const pos = form.hesapTipi === 'POS';
  return {
    id: mevcut?.id ?? `ba-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    hesapTipi: form.hesapTipi,
    hesapIsmi: form.hesapIsmi.trim(),
    bankaKodu: form.bankaKodu,
    bankaAdi: bankaEtiketi(form.bankaKodu),
    bankaSubesi: banka ? form.bankaSubesi.trim() : '',
    bankaSubeKodu: banka ? form.bankaSubeKodu.trim() : '',
    hesapNumarasi: banka ? form.hesapNumarasi.trim() : '',
    ibanModu: banka ? form.ibanModu : 'TR',
    iban: banka ? form.iban.trim().toLocaleUpperCase('tr') : '',
    dovizCinsi: pos ? '' : form.dovizCinsi,
    kartNo: kredi ? form.kartNo.trim() : '',
    sonKullanmaTarihi: kredi ? form.sonKullanmaTarihi.trim() : '',
    hesapKesimGunu: kredi ? form.hesapKesimGunu.trim() : '',
    odemeGunu: kredi ? form.odemeGunu.trim() : '',
    kartLimiti: kredi ? form.kartLimiti.trim() : '',
    kartTuru: kredi ? form.kartTuru : '',
    anlasmaNo: pos ? form.anlasmaNo.trim() : '',
    baslangicTarihi: pos ? form.baslangicTarihi : '',
    bitisTarihi: pos ? form.bitisTarihi : '',
    komisyonUygulamaTipi: pos ? form.komisyonUygulamaTipi : '',
    puanUygulamaTipi: pos ? form.puanUygulamaTipi : '',
    valor: pos ? form.valor : false,
    posKomisyonSatirlari: pos ? form.posKomisyonSatirlari : [],
    iletisimKisiler: form.iletisimKisiler,
    acikKisismlar: form.acikKisismlar,
    aktif: form.aktif,
    olusturma: mevcut?.olusturma ?? zaman,
    guncelleme: zaman,
  };
}

export async function bankaAnlasmalariGetir(): Promise<AdminBankaAnlasma[]> {
  return oku().slice().sort((a, b) => b.guncelleme.localeCompare(a.guncelleme));
}

export async function bankaAnlasmaOlustur(
  form: BankaAnlasmaFormDegeri
): Promise<AdminBankaAnlasma> {
  const kayit = formdanKayit(form);
  yaz([kayit, ...oku()]);
  return kayit;
}

export async function bankaAnlasmaGuncelle(
  id: string,
  form: BankaAnlasmaFormDegeri
): Promise<AdminBankaAnlasma> {
  const liste = oku();
  const idx = liste.findIndex((k) => k.id === id);
  if (idx < 0) throw new Error('Kayıt bulunamadı');
  const kayit = formdanKayit(form, liste[idx]);
  const sonraki = [...liste];
  sonraki[idx] = kayit;
  yaz(sonraki);
  return kayit;
}

export async function bankaAnlasmaSil(id: string): Promise<void> {
  yaz(oku().filter((k) => k.id !== id));
}
