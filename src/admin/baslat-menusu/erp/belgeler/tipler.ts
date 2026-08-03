import type { SiparisSatiri } from '@/admin/baslat-menusu/datagrid/demo/demoVeri';

/** Belge yönü — alış / satış */
export type BelgeYon = 'ALIS' | 'SATIS';

/** Belge zinciri adımı */
export type BelgeTur = 'SIPARIS' | 'IRSALIYE' | 'FATURA' | 'IADE';

export type BelgeDurum = 'TASLAK' | 'ONAYLI' | 'IPTAL';

export type BelgeSatiri = SiparisSatiri;

export type OdemeKanali = 'KASA' | 'BANKA';

/** Belge geneli oransal iskonto % (İsk1…İsk6; UI’da ilk 3 kullanılır) */
export type BelgeIskontoDizisi = [number, number, number, number, number, number];

/** Belge geneli tutarsal alt iskonto (1…3) */
export type BelgeIskontoTutarsal = [number, number, number];

export function bosBelgeIskontolari(): BelgeIskontoDizisi {
  return [0, 0, 0, 0, 0, 0];
}

export function bosBelgeIskontoTutarlari(): BelgeIskontoTutarsal {
  return [0, 0, 0];
}

export function gecerliBelgeIskontolari(ham: unknown): BelgeIskontoDizisi {
  const kaynak = Array.isArray(ham) ? ham : [];
  const sonuc = bosBelgeIskontolari();
  for (let i = 0; i < 6; i++) {
    const n = Number(kaynak[i]);
    sonuc[i] = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  }
  return sonuc;
}

export function gecerliBelgeIskontoTutarlari(ham: unknown): BelgeIskontoTutarsal {
  const kaynak = Array.isArray(ham) ? ham : [];
  const sonuc = bosBelgeIskontoTutarlari();
  for (let i = 0; i < 3; i++) {
    const n = Number(kaynak[i]);
    sonuc[i] = Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
  }
  return sonuc;
}

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
  kasaId: string | null;
  kasaKodu: string;
  kasaAdi: string;
  kdvDahil: boolean;
  durum: BelgeDurum;
  /** Belge geneli kademeli iskonto % (İsk1…İsk6) */
  belgeIskontolari: BelgeIskontoDizisi;
  /** Belge geneli tutarsal alt iskonto (1…3) */
  belgeIskontoTutarlari: BelgeIskontoTutarsal;
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
  kasaId?: string | null;
  kasaKodu?: string;
  kasaAdi?: string;
  kdvDahil: boolean;
  belgeIskontolari?: BelgeIskontoDizisi | number[];
  belgeIskontoTutarlari?: BelgeIskontoTutarsal | number[];
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

/** Stok çıkışında bakiyenin yetmediği ürün */
export interface StokEksikSatir {
  urunKodu: string;
  urunAdi: string;
  birim: string;
  /** Depodaki mevcut bakiye */
  mevcut: number;
  /** Belgede istenen toplam miktar */
  istenen: number;
  /** istenen − mevcut (pozitif) */
  eksik: number;
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
  const aktif = satirlar.filter((s) => s.durum !== false);
  const araToplam = aktif.reduce((t, s) => t + (s.gercekToplam || 0), 0);
  const kdvToplam = aktif.reduce((t, s) => t + (s.toplamKdvTutar || 0), 0);
  return {
    araToplam: Math.round(araToplam * 100) / 100,
    kdvToplam: Math.round(kdvToplam * 100) / 100,
    genelToplam: Math.round((araToplam + kdvToplam) * 100) / 100,
  };
}

/**
 * Ara toplam üzerine önce tutarsal (1→3), sonra oransal % (İsk1→İsk6) uygular;
 * KDV’yi kalan ara orana göre ölçekler.
 */
export function belgeIskontoUygula(
  araToplam: number,
  kdvToplam: number,
  iskontolar: BelgeIskontoDizisi | number[],
  tutarsallar: BelgeIskontoTutarsal | number[] = [0, 0, 0]
) {
  const isk = gecerliBelgeIskontolari(iskontolar);
  const tut = gecerliBelgeIskontoTutarlari(tutarsallar);
  let kalan = Math.round(araToplam * 100) / 100;
  const tutarsalUygulanan: BelgeIskontoTutarsal = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const dus = Math.min(kalan, tut[i]!);
    tutarsalUygulanan[i] = dus;
    kalan = Math.round((kalan - dus) * 100) / 100;
  }
  const iskontoTutarlari: BelgeIskontoDizisi = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 6; i++) {
    const yuzde = isk[i]!;
    const tutar = Math.round(kalan * (yuzde / 100) * 100) / 100;
    iskontoTutarlari[i] = tutar;
    kalan = Math.round((kalan - tutar) * 100) / 100;
  }
  const iskontoToplam = Math.round((araToplam - kalan) * 100) / 100;
  const oran = araToplam > 0 ? kalan / araToplam : 1;
  const kdv = Math.round(kdvToplam * oran * 100) / 100;
  const genelToplam = Math.round((kalan + kdv) * 100) / 100;
  return {
    /** İskonto öncesi satır toplamı (= Tutar) */
    tutar: Math.round(araToplam * 100) / 100,
    netAra: kalan,
    iskontoToplam,
    iskontoTutarlari,
    tutarsalUygulanan,
    iskontolar: isk,
    tutarsallar: tut,
    kdvToplam: kdv,
    genelToplam,
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
