export type EklentiKategori = 'one-cikan' | 'populer' | 'onerilen';

export type EklentiDurum = 'kurulu' | 'aktif' | 'pasif';

export type EklentiKaynak = 'katalog' | 'yukleme';

export interface EklentiKart {
  kod: string;
  ad: string;
  aciklama: string;
  gelistirici: string;
  ikon: string;
  kategori: EklentiKategori;
  surum: string;
  puan: number;
  etkinKurulum: number;
  sonGuncelleme: string;
  publicHook?: string;
  kurulu: boolean;
  durum?: EklentiDurum;
  kaynak?: EklentiKaynak;
  ayarlarJson?: Record<string, unknown>;
}

export interface AktifEklentiPublic {
  kod: string;
  ayarlarJson: Record<string, unknown>;
  manifestJson: Record<string, unknown>;
  kaynak: string;
}

export const EKLENTI_SEKMELER = [
  { id: 'one-cikan', ad: 'Öne çıkan' },
  { id: 'populer', ad: 'Popüler' },
  { id: 'onerilen', ad: 'Önerilen' },
  { id: 'kurulu', ad: 'Kurulu' },
] as const;

export type EklentiListeSekme = (typeof EKLENTI_SEKMELER)[number]['id'];
