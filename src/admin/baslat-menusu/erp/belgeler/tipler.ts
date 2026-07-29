import type { SiparisSatiri } from '@/admin/baslat-menusu/datagrid/demo/demoVeri';

/** Belge yönü — alış / satış */
export type BelgeYon = 'ALIS' | 'SATIS';

/** Belge zinciri adımı */
export type BelgeTur = 'SIPARIS' | 'IRSALIYE' | 'FATURA' | 'IADE';

export type BelgeDurum = 'TASLAK' | 'ONAYLI' | 'IPTAL';

export type BelgeSatiri = SiparisSatiri;

export type OdemeKanali = 'KASA' | 'BANKA';

export interface BelgeKayit {
  id: string;
  yon: BelgeYon;
  tur: BelgeTur;
  /** Belge nevi id (Alış / Satış / kullanıcı tanımlı) */
  belgeNeviId: string;
  belgeNeviAdi: string;
  /** Geriye uyum / filtre: ALIS_FATURA gibi */
  tip: string;
  belgeNo: string;
  seri: string;
  siraNo: number;
  tarih: string;
  vadeTarihi: string | null;
  subeId: string | null;
  subeKodu: string;
  subeAdi: string;
  depoId: string | null;
  depoKodu: string;
  depoAdi: string;
  cariId: string | null;
  cariKodu: string;
  cariAdi: string;
  aciklama: string;
  kdvDahil: boolean;
  durum: BelgeDurum;
  araToplam: number;
  kdvToplam: number;
  genelToplam: number;
  /** Cari etki — net anlaşılır */
  cariBorc: number;
  cariAlacak: number;
  odenenTutar: number;
  kaynakBelgeId: string | null;
  kaynakBelgeNo: string;
  satirlar: BelgeSatiri[];
  onayTarihi: string | null;
  iptalTarihi: string | null;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

export interface BelgeKayitGirdi {
  yon: BelgeYon;
  tur: BelgeTur;
  belgeNeviId?: string;
  belgeNeviAdi?: string;
  belgeNo?: string;
  seri?: string;
  siraNo?: number;
  tarih: string;
  vadeTarihi?: string | null;
  subeId?: string | null;
  subeKodu?: string;
  subeAdi?: string;
  depoId?: string | null;
  depoKodu?: string;
  depoAdi?: string;
  cariId?: string | null;
  cariKodu: string;
  cariAdi: string;
  aciklama?: string;
  kdvDahil: boolean;
  araToplam: number;
  kdvToplam: number;
  genelToplam: number;
  kaynakBelgeId?: string | null;
  kaynakBelgeNo?: string;
  satirlar: BelgeSatiri[];
}

export interface StokBakiyeSatir {
  urunKodu: string;
  urunAdi: string;
  depoId: string;
  depoKodu: string;
  miktar: number;
  birim: string;
}

export interface StokHareketKayit {
  id: string;
  belgeId: string;
  belgeNo: string;
  yon: BelgeYon;
  tur: BelgeTur;
  depoId: string;
  depoKodu: string;
  urunKodu: string;
  urunAdi: string;
  birim: string;
  /** + giriş, − çıkış */
  miktar: number;
  kayitTarihi: string;
}

export interface CariHareketKayit {
  id: string;
  belgeId: string | null;
  odemeId: string | null;
  cariId: string | null;
  cariKodu: string;
  cariAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
  kayitTarihi: string;
}

export interface OdemeKayit {
  id: string;
  belgeId: string;
  belgeNo: string;
  yon: BelgeYon;
  cariId: string | null;
  cariKodu: string;
  tutar: number;
  kanal: OdemeKanali;
  kasaId: string | null;
  kasaKodu: string;
  bankaId: string | null;
  bankaKodu: string;
  aciklama: string;
  kayitTarihi: string;
}

export type BelgeTipi = string;

export function belgeTipKodu(yon: BelgeYon, tur: BelgeTur): string {
  return `${yon}_${tur}`;
}

export function belgeDurumEtiketi(durum: BelgeDurum): string {
  if (durum === 'ONAYLI') return 'Onaylı';
  if (durum === 'IPTAL') return 'İptal';
  return 'Taslak';
}

export function belgeTurEtiketi(tur: BelgeTur): string {
  if (tur === 'SIPARIS') return 'Sipariş';
  if (tur === 'IRSALIYE') return 'İrsaliye';
  if (tur === 'IADE') return 'İade';
  return 'Fatura';
}

export function bugunIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function satirToplamlari(satirlar: BelgeSatiri[]) {
  const araToplam = satirlar.reduce((t, s) => t + (s.gercekToplam || 0), 0);
  const kdvToplam = satirlar.reduce((t, s) => t + (s.toplamKdvTutar || 0), 0);
  const genelToplam = satirlar.reduce((t, s) => t + (s.toplamTutar || 0), 0);
  return {
    araToplam: Math.round(araToplam * 100) / 100,
    kdvToplam: Math.round(kdvToplam * 100) / 100,
    genelToplam: Math.round(genelToplam * 100) / 100,
  };
}

/** Satış faturası → cari BORÇ; alış faturası → cari ALACAK */
export function cariEtkiHesapla(yon: BelgeYon, tur: BelgeTur, genelToplam: number): {
  cariBorc: number;
  cariAlacak: number;
} {
  const t = Math.round(genelToplam * 100) / 100;
  if (tur === 'SIPARIS') return { cariBorc: 0, cariAlacak: 0 };
  if (tur === 'IRSALIYE') return { cariBorc: 0, cariAlacak: 0 };

  if (tur === 'IADE') {
    if (yon === 'SATIS') return { cariBorc: 0, cariAlacak: t };
    return { cariBorc: t, cariAlacak: 0 };
  }

  if (yon === 'SATIS') return { cariBorc: t, cariAlacak: 0 };
  return { cariBorc: 0, cariAlacak: t };
}

/** Stok hareket yönü: alış/giriş +, satış/çıkış −; iade tersine */
export function stokMiktarIsareti(yon: BelgeYon, tur: BelgeTur): number {
  if (tur === 'SIPARIS') return 0;
  if (tur === 'IADE') return yon === 'SATIS' ? 1 : -1;
  return yon === 'ALIS' ? 1 : -1;
}

/** Satış tarafı müşteri tipleri; alış tarafı tedarikçi */
export function cariTipiBelgeyeUygunMu(yon: BelgeYon, cariTipi: string): boolean {
  const tip = cariTipi.trim().toLocaleUpperCase('tr');
  if (!tip) return true;
  const musteri = new Set(['ALICI', 'BAYI', 'DAGITICI', 'SON_KULLANICI', 'MUSTERI']);
  const tedarikci = new Set(['SATICI', 'TEDARIKCI', 'TEDARİKÇİ']);
  if (yon === 'SATIS') {
    if (tedarikci.has(tip) && !musteri.has(tip)) return false;
    return true;
  }
  if (musteri.has(tip) && !tedarikci.has(tip)) return false;
  return true;
}

export function kalanOdeme(b: BelgeKayit): number {
  return Math.max(0, Math.round((b.genelToplam - b.odenenTutar) * 100) / 100);
}
