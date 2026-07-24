/**
 * Özel Tanımlar alt modül kataloğu.
 * Yeni tanımlar buraya eklenir; hub sayfası otomatik listeler.
 */
export type OzelTanimModulId =
  | 'para-birimleri'
  | 'bankalar-kartlar'
  | 'vergiler'
  | 'cari-stok'
  | 'resmi-tatiller';

export interface OzelTanimModulTanimi {
  id: OzelTanimModulId;
  baslik: string;
  ikon: string;
  aciklama: string;
}

export const OZEL_TANIM_MODULLERI: readonly OzelTanimModulTanimi[] = [
  {
    id: 'para-birimleri',
    baslik: 'Para Birimleri',
    ikon: '💱',
    aciklama: 'Kur, sembol ve otomatik güncelleme tanımları',
  },
  {
    id: 'bankalar-kartlar',
    baslik: 'Bankalar ve Kartlar',
    ikon: '🏦',
    aciklama: 'Banka, kart tipi, marka ve BIN tanımları',
  },
  {
    id: 'vergiler',
    baslik: 'Vergiler',
    ikon: '🧾',
    aciklama: 'Vergi oranları, türleri ve vergi daireleri',
  },
  {
    id: 'cari-stok',
    baslik: 'Cari ve Stok',
    ikon: '📦',
    aciklama: 'Cari tipi, stok tipi ve ölçü birimleri',
  },
  {
    id: 'resmi-tatiller',
    baslik: 'Resmi Tatil Günleri',
    ikon: '📅',
    aciklama: 'Resmi tatil aralıkları ve takvim renkleri',
  },
] as const;

export const OZEL_TANIM_VARSAYILAN_MODUL: OzelTanimModulId = 'para-birimleri';

export function ozelTanimModulBul(id: string): OzelTanimModulTanimi | undefined {
  return OZEL_TANIM_MODULLERI.find((m) => m.id === id);
}

/** Bankalar ve Kartlar iç sekmeleri */
export type BankaKartSekmeId = 'bankalar' | 'kart-tipleri' | 'kart-markalari' | 'bin-kayitlari';

export const BANKA_KART_SEKMELERI: readonly {
  id: BankaKartSekmeId;
  baslik: string;
}[] = [
  { id: 'bankalar', baslik: 'Bankalar' },
  { id: 'kart-tipleri', baslik: 'Kart Tipleri' },
  { id: 'kart-markalari', baslik: 'Kart Markaları' },
  { id: 'bin-kayitlari', baslik: 'BIN Kayıtları' },
] as const;

/** Vergiler iç sekmeleri */
export type VergiSekmeId = 'vergiler' | 'vergi-turleri' | 'vergi-daireleri';

export const VERGI_SEKMELERI: readonly {
  id: VergiSekmeId;
  baslik: string;
}[] = [
  { id: 'vergiler', baslik: 'Vergiler' },
  { id: 'vergi-turleri', baslik: 'Vergi Türleri' },
  { id: 'vergi-daireleri', baslik: 'Vergi Daireleri' },
] as const;

/** Cari ve Stok iç sekmeleri — Fiyat Tanımları yok */
export type CariStokSekmeId = 'cari-tipleri' | 'stok-tipleri' | 'olcu-birimler';

export const CARI_STOK_SEKMELERI: readonly {
  id: CariStokSekmeId;
  baslik: string;
}[] = [
  { id: 'cari-tipleri', baslik: 'Cari Tipleri' },
  { id: 'stok-tipleri', baslik: 'Stok Tipleri' },
  { id: 'olcu-birimler', baslik: 'Ölçü ve Birimler' },
] as const;
