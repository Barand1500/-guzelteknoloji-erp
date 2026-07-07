import { adminModulleri } from '@/admin/veri/adminMenuYapisi';
import type { AdminLogKayit } from '@/admin/ortak/api/adminSistemApi';

const MODUL_ADLARI = new Map(adminModulleri.map((m) => [m.id, m.baslik]));

export type LogIslemTuru = 'kaydet' | 'ekle' | 'sil' | 'guncelle' | 'diger';

export interface LogMesajOzet {
  islem: string;
  modulId?: string;
  aksiyonId?: string;
  modulBaslik?: string;
}

export function logMesajiAyikla(mesaj: string): LogMesajOzet {
  const parcalar = mesaj.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
  let islem = parcalar[0] ?? mesaj;
  let modulId: string | undefined;
  let aksiyonId: string | undefined;
  let modulBaslik: string | undefined;

  for (const parca of parcalar.slice(1)) {
    if (parca.startsWith('modul:')) modulId = parca.slice(6);
    else if (parca.startsWith('aksiyon:')) aksiyonId = parca.slice(8);
  }

  const tireIdx = islem.indexOf(' - ');
  if (tireIdx > 0) {
    modulBaslik = islem.slice(tireIdx + 3).trim();
    islem = islem.slice(0, tireIdx).trim();
  }

  if (modulId) {
    modulBaslik = MODUL_ADLARI.get(modulId) ?? modulBaslik;
  }

  return { islem, modulId, aksiyonId, modulBaslik };
}

export function logIslemTuruBul(ozet: LogMesajOzet): LogIslemTuru {
  const id = ozet.aksiyonId?.toLowerCase();
  if (id === 'kaydet' || id === 'ekle' || id === 'sil' || id === 'guncelle') return id;
  const metin = ozet.islem.toLowerCase();
  if (metin.includes('kaydet')) return 'kaydet';
  if (metin.includes('yeni ekle') || metin.includes('ekle')) return 'ekle';
  if (metin.includes('sil')) return 'sil';
  if (metin.includes('güncelle') || metin.includes('guncelle')) return 'guncelle';
  return 'diger';
}

const ISLEM_ETIKET: Record<LogIslemTuru, string> = {
  kaydet: 'Kaydetti',
  ekle: 'Yeni ekledi',
  sil: 'Sildi',
  guncelle: 'Güncelledi',
  diger: 'İşlem yaptı',
};

const ISLEM_IKON: Record<LogIslemTuru, string> = {
  kaydet: '💾',
  ekle: '➕',
  sil: '🗑️',
  guncelle: '🔄',
  diger: '📋',
};

export function logIslemEtiket(tur: LogIslemTuru): string {
  return ISLEM_ETIKET[tur];
}

export function logIslemIkon(tur: LogIslemTuru): string {
  return ISLEM_IKON[tur];
}

export function logIslemSinif(tur: LogIslemTuru): string {
  return `ap-log-islem-${tur}`;
}

const KISA_ISLEM_KELIMELERI = new Set([
  'kaydet',
  'kaydetti',
  'ekle',
  'yeni ekle',
  'yeni ekledi',
  'sil',
  'sildi',
  'güncelle',
  'guncelle',
  'güncelledi',
  'önizle',
  'onizle',
  'yazdır',
  'yayınla',
  'yayinla',
]);

/** Eski kısa format mı, yoksa yeni detaylı cümle mi */
function logEskiKisaFormat(ozet: LogMesajOzet): boolean {
  if (!ozet.islem || !ozet.modulBaslik) return false;
  const islem = ozet.islem.trim();
  if (islem.includes(' sayfasında ') || islem.includes(' sayfasındaki ')) return false;
  if (islem.length > 48) return false;
  const eylem = islem.includes(' - ') ? islem.split(' - ')[0].trim().toLowerCase() : islem.toLowerCase();
  return KISA_ISLEM_KELIMELERI.has(eylem) || eylem === ozet.aksiyonId;
}

/** Kart üstündeki ana açıklama cümlesi */
export function logOzetCumle(ozet: LogMesajOzet, tur: LogIslemTuru): string {
  if (!ozet.islem) return logIslemEtiket(tur);
  if (logEskiKisaFormat(ozet)) {
    const eylem = ozet.islem.includes(' - ') ? ozet.islem.split(' - ')[0].trim() : ozet.islem;
    return `${eylem} işlemini ${ozet.modulBaslik} modülünde yaptı`;
  }
  return ozet.islem;
}

function ayniGun(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function logTarihGrubu(iso: string): string {
  const tarih = new Date(iso);
  const bugun = new Date();
  const dun = new Date(bugun);
  dun.setDate(dun.getDate() - 1);
  if (ayniGun(tarih, bugun)) return 'Bugün';
  if (ayniGun(tarih, dun)) return 'Dün';
  return tarih.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function logSaatFormat(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function logTamTarihFormat(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function logGoreliZaman(iso: string): string {
  const farkMs = Date.now() - new Date(iso).getTime();
  const dk = Math.floor(farkMs / 60000);
  if (dk < 1) return 'Az önce';
  if (dk < 60) return `${dk} dk önce`;
  const saat = Math.floor(dk / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  if (gun < 7) return `${gun} gün önce`;
  return logTamTarihFormat(iso);
}

export function logKullaniciAdi(log: AdminLogKayit): string {
  return log.kullaniciAd?.trim() || log.kullaniciEmail?.split('@')[0] || 'Bilinmeyen kullanıcı';
}

export function logKullaniciBasHarf(log: AdminLogKayit): string {
  return logKullaniciAdi(log).charAt(0).toUpperCase();
}

export function logAramaEslesir(log: AdminLogKayit, arama: string, ozet: LogMesajOzet): boolean {
  if (!arama.trim()) return true;
  const q = arama.trim().toLowerCase();
  const alanlar = [
    log.mesaj,
    log.kullaniciAd,
    log.kullaniciEmail,
    log.ipAdresi,
    ozet.islem,
    ozet.modulBaslik,
    ozet.modulId,
  ];
  return alanlar.some((a) => a?.toLowerCase().includes(q));
}

export function loglariGrupla(loglar: AdminLogKayit[]): { grup: string; kayitlar: AdminLogKayit[] }[] {
  const harita = new Map<string, AdminLogKayit[]>();
  for (const log of loglar) {
    const grup = logTarihGrubu(log.kayitTarihi);
    const liste = harita.get(grup) ?? [];
    liste.push(log);
    harita.set(grup, liste);
  }
  return Array.from(harita.entries()).map(([grup, kayitlar]) => ({ grup, kayitlar }));
}
