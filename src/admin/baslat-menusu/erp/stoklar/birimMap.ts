import type { AdminBirim, BirimForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import type { StokBirimListeSatir } from './birimListeTipler';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';

export function birimdenListeSatir(b: AdminBirim): StokBirimListeSatir {
  return {
    id: b.id,
    fiyatAd: b.fiyatAdi,
    birim: b.birimAdi,
    carpan: b.carpan,
    satisFiyati1: b.satisFiyati,
    satisFiyati2: null,
    satisFiyati3: null,
    kdvYuzde: b.satisKdv,
    kdvDahil: b.kdvDahil,
    barkod: b.barkod,
    alisFiyati: b.alisFiyati,
    alisKdv: b.alisKdv,
    aktif: b.aktif,
  };
}

export function listeSatirdanBirimForm(satir: StokBirimListeSatir, urunId: string): BirimForm {
  return {
    urunId,
    fiyatAdi: satir.fiyatAd.trim() || 'PERAKENDE',
    birimAdi: satir.birim.trim() || 'ADET',
    carpan: satir.carpan > 0 ? satir.carpan : 1,
    barkod: satir.barkod ?? '',
    alisKdv: satir.alisKdv ?? satir.kdvYuzde,
    satisKdv: satir.kdvYuzde,
    alisFiyati: satir.alisFiyati ?? 0,
    satisFiyati: satir.satisFiyati1 ?? 0,
    kdvDahil: satir.kdvDahil,
    aktif: satir.aktif ?? true,
  };
}

export function birimdenFiyatDuzenleSatir(b: AdminBirim): StokFiyatDuzenleSatir {
  return {
    id: b.id,
    fiyatAdi: b.fiyatAdi,
    birim: b.birimAdi,
    carpan: b.carpan,
    barkod: b.barkod,
    kdv: b.satisKdv,
    kdvTipi: b.kdvDahil ? 'dahil' : 'haric',
    alisFiyati: b.alisFiyati,
    satisFiyati1: b.satisFiyati,
    pb1: 'TL',
    satisFiyati2: null,
    pb2: 'TL',
    satisFiyati3: null,
    pb3: 'TL',
    satisFiyati4: null,
    pb4: 'TL',
    satisFiyati5: null,
    pb5: 'TL',
    satisFiyati6: null,
    pb6: 'TL',
    alisKdv: b.alisKdv,
    aktif: b.aktif,
  };
}

export function fiyatDuzenleSatirdanBirimForm(
  satir: StokFiyatDuzenleSatir,
  urunId: string
): BirimForm {
  return {
    urunId,
    fiyatAdi: satir.fiyatAdi.trim() || 'PERAKENDE',
    birimAdi: satir.birim.trim() || 'ADET',
    carpan: satir.carpan > 0 ? satir.carpan : 1,
    barkod: satir.barkod.trim(),
    alisKdv: satir.alisKdv ?? satir.kdv,
    satisKdv: satir.kdv,
    alisFiyati: satir.alisFiyati ?? 0,
    satisFiyati: satir.satisFiyati1 ?? 0,
    kdvDahil: satir.kdvTipi === 'dahil',
    aktif: satir.aktif ?? true,
  };
}

export function yeniIdGecici(): string {
  return `yeni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function geciciIdMi(id: string): boolean {
  return id.startsWith('yeni-');
}
