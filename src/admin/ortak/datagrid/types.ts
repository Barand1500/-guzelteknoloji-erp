import type { ReactNode } from 'react';

export type SiralamaYonu = 'asc' | 'desc' | null;

export type HucreTipi =
  | 'metin'
  | 'sayi'
  | 'para'
  | 'iskonto'
  | 'tarih'
  | 'badge'
  | 'toggle'
  | 'etiket'
  | 'zengin'
  | 'birlesik'
  | 'salt-okunur';

export interface KolonTanimi<TRow> {
  id: string;
  baslik: string;
  tip: HucreTipi;
  genislik?: number;
  minGenislik?: number;
  zorunlu?: boolean;
  sabitSag?: boolean;
  siralama?: boolean;
  filtre?: boolean;
  duzenlenebilir?: boolean;
  formulaTip?: 'sayi' | 'iskonto';
  gruplama?: boolean;
  degerAl: (satir: TRow) => unknown;
  degerYaz?: (satir: TRow, deger: unknown) => TRow;
  goster?: (satir: TRow, deger: unknown) => ReactNode;
  siralamaDegeri?: (satir: TRow) => string | number;
  filtreDegeri?: (satir: TRow) => string;
}

export interface DataGridAyar {
  kolonSirasi: string[];
  gizliKolonlar: string[];
  sabitlenmisKolonlar: string[];
  kolonGenislikleri: Record<string, number>;
  sayfaBoyutu: number;
  cizgilerAcik: boolean;
  gruplamaKolonId: string | null;
}

export interface HizliGirisKolonu {
  kolonId: string;
  placeholder?: string;
  ipucu?: string;
  varsayilan?: string;
  tip?: 'metin' | 'secim' | 'toggle';
  secenekler?: { deger: string; etiket: string }[];
  grup?: 'temel' | 'fiyat' | 'ekstra';
  /** Bu alan başka kolon hücresinde üstte gösterilir (ör. stok kodu → ürün) */
  birlesik?: { kolonId: string; placeholder?: string }[];
  /** Birleşik hücrede kaç sütun kaplanır (stokKodu+urun gibi) */
  colspan?: number;
  /** colspan kullanıldığında ana metin alanının kolonId'si */
  anaAlan?: string;
  /** Yanında + butonu ile modal açılır */
  modalAksiyon?: boolean;
}

export interface HizliGirisApi {
  degerler: Record<string, string>;
  alanAyarla: (kolonId: string, deger: string) => void;
  onEkle: () => void;
  onizleme: Record<string, ReactNode>;
  kolonlar: HizliGirisKolonu[];
  genisletildi: boolean;
  genisletToggle: () => void;
}

export interface DataGridProps<TRow extends { id: string }> {
  tabloBaslik: string;
  tabloAltBaslik?: string;
  kolonlar: KolonTanimi<TRow>[];
  satirlar: TRow[];
  depolamaAnahtari: string;
  bosMesaj?: string;
  yukleniyor?: boolean;
  hata?: string;
  kdvDahil?: boolean;
  kdvDahilGoster?: boolean;
  onKdvDahilDegistir?: (deger: boolean) => void;
  onSatirlarDegistir?: (satirlar: TRow[]) => void;
  onSatirGuncelle?: (satir: TRow) => TRow;
  satirDuzenlePaneli?: (satir: TRow, onKaydet: (s: TRow) => void, onKapat: () => void) => ReactNode;
  varsayilanGizliKolonlar?: string[];
  kompakt?: boolean;
  hizliGirisKolonlari?: HizliGirisKolonu[];
  hizliGirisModu?: 'satir' | 'kart';
  hizliGirisKarti?: (api: HizliGirisApi) => ReactNode;
  onHizliGiris?: (degerler: Record<string, string>) => void;
  hizliGirisOnizleme?: (degerler: Record<string, string>) => Record<string, ReactNode>;
  hizliGirisModalAc?: (kolonId: string) => void;
  kolonBaslikEki?: (kolonId: string) => ReactNode | null;
  satirSinifAdi?: (satir: TRow) => string | undefined;
}
