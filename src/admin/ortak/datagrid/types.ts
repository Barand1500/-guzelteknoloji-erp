import type { MutableRefObject, ReactNode } from 'react';

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
  /** Başlık kısaltıldığında tam metin (tooltip) */
  baslikIpucu?: string;
  tip: HucreTipi;
  genislik?: number;
  minGenislik?: number;
  zorunlu?: boolean;
  sabitSag?: boolean;
  siralama?: boolean;
  duzenlenebilir?: boolean;
  formulaTip?: 'sayi' | 'iskonto';
  secenekler?: { deger: string; etiket: string }[];
  degerAl: (satir: TRow) => unknown;
  degerYaz?: (satir: TRow, deger: unknown) => TRow;
  goster?: (satir: TRow, deger: unknown) => ReactNode;
  siralamaDegeri?: (satir: TRow) => string | number;
  /** false ise para/iskonto tutar hücrelerinde yalnızca sayı gösterilir (₺ vb. sembol yok) */
  paraSembolu?: boolean;
  /** birlesik tipinde alt satır (ör. ürün kodu) ayrı düzenlenebilir */
  birlesikDuzenle?: {
    altDegerAl: (satir: TRow) => string;
    altDegerYaz: (satir: TRow, deger: unknown) => TRow;
  };
}

export type DataGridCizgiModu = 'yok' | 'yatay' | 'dikey' | 'tam';

export interface DataGridAyar {
  kolonSirasi: string[];
  gizliKolonlar: string[];
  sabitlenmisKolonlar: string[];
  kolonGenislikleri: Record<string, number>;
  sayfaBoyutu: number;
  cizgiModu: DataGridCizgiModu;
  /** Kolon varsayılan genişlikleri güncellendiğinde artırılır; eski kayıtlı genişlikleri sıfırlar */
  kolonGenislikSurumu?: number;
  /** Kolon şeması değişince eski localStorage ayarını geçersiz kılar */
  kolonImzasi?: string;
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
  /** true ise birleşik alanlar yatay değil dikey dizilir */
  birlesikDikey?: boolean;
  /** colspan kullanıldığında ana metin alanının kolonId'si */
  anaAlan?: string;
  /** Yanında + butonu ile modal açılır */
  modalAksiyon?: boolean;
}

export interface HizliGirisEnterBaglami {
  alanId: string;
  degerler: Record<string, string>;
  engelle: () => void;
}

export interface HizliGirisApi {
  degerler: Record<string, string>;
  alanAyarla: (kolonId: string, deger: string) => void;
  onEkle: () => void;
  sifirla: () => void;
  onizleme: Record<string, ReactNode>;
  kolonlar: HizliGirisKolonu[];
  genisletildi: boolean;
  genisletToggle: () => void;
}

export interface DataGridApi {
  satirDuzenleAc: (satirId: string) => void;
  csvIndir: (sadeceSecili?: boolean) => void;
  hizliGirisOdakla: () => void;
  hizliGirisKapat: () => void;
  seciliIdler: () => string[];
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
  onHizliGiris?: (degerler: Record<string, string>) => void | boolean | Promise<void | boolean>;
  onHizliGirisEnter?: (baglam: HizliGirisEnterBaglami) => void;
  hizliGirisInputSinif?: (alanId: string, deger: string) => string | undefined;
  hizliGirisInputPlaceholder?: (alanId: string, deger: string, varsayilan: string) => string;
  hizliGirisApiRef?: MutableRefObject<HizliGirisApi | null>;
  gridApiRef?: MutableRefObject<DataGridApi | null>;
  onSecimDegistir?: (seciliIdler: string[]) => void;
  hizliGirisOnizleme?: (degerler: Record<string, string>) => Record<string, ReactNode>;
  hizliGirisModalAc?: (kolonId: string) => void;
  kolonBaslikEki?: (kolonId: string) => ReactNode | null;
  satirSinifAdi?: (satir: TRow) => string | undefined;
  /** Artırıldığında kayıtlı kolon genişlikleri varsayılanlara döner */
  kolonGenislikSurumu?: number;
  onSatirTikla?: (satir: TRow) => void;
  onSatirDuzenle?: (satir: TRow) => void;
  onSatirSil?: (satir: TRow) => void;
  /** true ise hızlı giriş satırı yalnızca hizliGirisOdakla ile açılır */
  hizliGirisIstegeBagli?: boolean;
  /** true ise tanımlı olmayan veri kolonları için varsayılan metin kutusu gösterilir */
  hizliGirisVarsayilanAlan?: boolean;
  /** false ise üst araç çubuğundaki sayı formülleri (ƒx) gizlenir */
  formulMenuGoster?: boolean;
  /** 'cubuk' modunda satır düzenle paneli aksiyon çubuğunun üstünden açılır */
  satirPanelModu?: 'sheet' | 'cubuk';
}
