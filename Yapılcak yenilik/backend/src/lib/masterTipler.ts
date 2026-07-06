/** Master DB modelleri — sube Prisma client'inda olmayan tipler */

export type Modul = {
  id: number;
  modulAdi: string;
  prefix: string;
  durum: boolean;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
};

export type Bayi = {
  id: number;
  ustId: number | null;
  unvan: string;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: unknown;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
  durum: boolean;
};

export type Firma = {
  id: number;
  bayiId: number;
  tabelaAdi: string | null;
  unvan: string;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: unknown;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
  durum: boolean;
};

export type Sube = {
  id: number;
  firmaId: number;
  subeAdi: string;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  subeTipi: string;
  dbBilgileri: unknown;
  lisansBilgileri: unknown;
  iskonto: unknown;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
  durum: boolean;
};

export type Paket = {
  id: number;
  paketAdi: string;
  subeSayisi: number;
  personelSayisi: number;
  masaSayisi: number;
  fiyat: unknown;
  paraBirimi: string;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
  durum: boolean;
};

export type Lisans = {
  id: number;
  firmaId: number;
  paketId: number;
  baslangicTarihi: Date;
  bitisTarihi: Date | null;
  kayitTarihi: Date;
  guncellemeTarihi: Date;
  durum: boolean;
};
