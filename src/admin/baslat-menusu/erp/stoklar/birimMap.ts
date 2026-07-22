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

export function bosBirimFiyatSatiri(secenek?: {
  fiyatAdi?: string;
  anaBirimMi?: boolean;
  varsayilanMi?: boolean;
}): StokFiyatDuzenleSatir {
  return {
    id: yeniIdGecici(),
    fiyatAdi: secenek?.fiyatAdi ?? 'FİYAT',
    birim: 'ADET',
    carpan: 1,
    barkod: '',
    barkodTip: 'EAN13',
    barkod2: '',
    barkodTip2: 'EAN13',
    barkod3: '',
    barkodTip3: 'EAN13',
    barkod4: '',
    barkodTip4: 'EAN13',
    barkod5: '',
    barkodTip5: 'EAN13',
    barkod6: '',
    barkodTip6: 'EAN13',
    kdv: 10,
    kdvTipi: 'haric',
    alisKdvTipi: 'haric',
    alisFiyati: null,
    alisFiyati2: null,
    alisFiyati3: null,
    alisFiyati4: null,
    alisFiyati5: null,
    alisFiyati6: null,
    satisFiyati1: null,
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
    alisKdv: 10,
    aktif: true,
    anaBirimMi: secenek?.anaBirimMi ?? false,
    varsayilanMi: secenek?.varsayilanMi ?? false,
    birimAciklama: '',
  };
}

/** Satır, boş şablondan (id hariç) hiç değiştirilmemiş mi? */
export function birimSatiriBosMu(s: StokFiyatDuzenleSatir): boolean {
  return (
    s.fiyatAdi === 'FİYAT' &&
    s.birim === 'ADET' &&
    s.carpan === 1 &&
    s.barkod === '' &&
    s.kdv === 10 &&
    s.kdvTipi === 'dahil' &&
    s.alisFiyati === null &&
    s.satisFiyati1 === null &&
    (s.alisKdv === undefined || s.alisKdv === 10) &&
    !s.anaBirimMi &&
    !s.varsayilanMi
  );
}
