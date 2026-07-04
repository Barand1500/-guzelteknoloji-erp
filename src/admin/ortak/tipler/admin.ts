export interface KullaniciTercihleri {
  dashboardHizliErisim: string[];
}

export interface OturumBilgisi {
  firmaKodu: string;
  firmaAdi: string;
  donemKodu: string;
  donemAdi: string;
  subeKodu: string;
  subeAdi: string;
  kasaKodu: string;
  kasaAdi: string;
}

export interface AuthKullanici {
  id: string;
  kullaniciKodu?: string;
  email?: string;
  ad: string;
  rol: string;
  tercihler?: KullaniciTercihleri;
  yetkiler?: import('@/admin/baslat-menusu/musteri-ajans/roller/api').YetkiKodu[];
  oturum?: OturumBilgisi;
}

export interface GirisFormu {
  kullaniciKodu: string;
  sifre: string;
  firmaKodu: string;
  donemKodu: string;
  subeKodu: string;
  kasaKodu: string;
}

export interface OturumKasa {
  id: number;
  kasaKodu: string;
  kasaAdi: string;
}

export interface OturumSube {
  id: number;
  subeKodu: string;
  subeAdi: string;
  kasalar: OturumKasa[];
}

export interface OturumDonem {
  id: number;
  donemKodu: string;
  donemAdi: string;
}

export interface OturumFirma {
  id: number;
  firmaKodu: string;
  firmaAdi: string;
  donemler: OturumDonem[];
  subeler: OturumSube[];
}

export interface OturumSecenekleriYanit {
  firmalar: OturumFirma[];
}

export interface AuthYanit {
  token: string;
  kullanici: AuthKullanici;
}

export interface AdminModul {
  id: string;
  baslik: string;
  ikon: string;
  kategori: string;
  yol: string;
  menuGizle?: boolean;
}

export interface AdminSekme {
  id: string;
  modulId: string;
  baslik: string;
  kaydedilmedi?: boolean;
  grupId?: string;
}

export interface AksiyonButonu {
  id: string;
  etiket: string;
  aktif: boolean;
  birincil?: boolean;
}

export interface AdminWidget {
  id: string;
  siteId: string;
  sayfaId?: string | null;
  ad: string;
  tip: string;
  sira: number;
  aktif: boolean;
  baslik?: string | null;
  altBaslik?: string | null;
  aciklama?: string | null;
  gorselUrl?: string | null;
  butonMetni?: string | null;
  butonLink?: string | null;
  arkaPlanRenk?: string | null;
  yaziRenk?: string | null;
  mobilGoster: boolean;
  masaustuGoster: boolean;
  configJson?: Record<string, unknown> | null;
  olusturma: string;
  guncelleme: string;
}

export interface WidgetFormDegeri {
  ad: string;
  tip: string;
  sira: number;
  aktif: boolean;
  baslik: string;
  altBaslik: string;
  aciklama: string;
  gorselUrl: string;
  butonMetni: string;
  butonLink: string;
  arkaPlanRenk: string;
  yaziRenk: string;
  mobilGoster: boolean;
  masaustuGoster: boolean;
  configJsonMetin: string;
  sayfaId: string;
}
