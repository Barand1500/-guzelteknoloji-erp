/** Tekil yetki tanımları — legacy anahtarlarla uyumlu (backend bağlantısında aynı id kullanılacak) */
export interface TanimlarYetkiTanim {
  id: string;
  etiket: string;
}

export const TANIMLAR_YETKI_TANIMLARI: TanimlarYetkiTanim[] = [
  { id: 'AcikHesapIslemi', etiket: 'Açık Hesap İşlemi' },
  { id: 'AltPusula', etiket: 'Alt Pusula' },
  { id: 'Android_CariKartAcma', etiket: 'Android Cari Kart Açma' },
  { id: 'Ayarlar', etiket: 'Ayarlar' },
  { id: 'BaskaGarsonunMasasinaSiparis', etiket: 'Başka Garsonun Masasına Sipariş' },
  { id: 'DirekOdemeAlma', etiket: 'Direkt Ödeme Alma' },
  { id: 'DoluMasayaMasaTasima', etiket: 'Dolu Masaya Masa Taşıma' },
  { id: 'ErkenOdemeyiTemizleme', etiket: 'Erken Ödemeyi Temizleme' },
  { id: 'EskiPusulaListesiGorme', etiket: 'Eski Pusula Listesi Görme' },
  { id: 'HesapPusulasiYazdirma', etiket: 'Hesap Pusulası Yazdırma' },
  { id: 'IkramYapma', etiket: 'İkram Yapma' },
  { id: 'IptalEtme', etiket: 'İptal Etme' },
  { id: 'IskontoYapma', etiket: 'İskonto Yapma' },
  { id: 'KasaIslemiGiderKaydi', etiket: 'Kasa İşlemi Gider Kaydı' },
  { id: 'KrediKartiOdeme', etiket: 'Kredi Kartı Ödeme' },
  { id: 'KurGirme', etiket: 'Kur Girme' },
  { id: 'ListedenCariSecebilme', etiket: 'Listeden Cari Seçebilme' },
  { id: 'MasaDegistirmeIslemi', etiket: 'Masa Değiştirme İşlemi' },
  { id: 'MasaKilidiAcma', etiket: 'Masa Kilidi Açma' },
  { id: 'MusteriKartiTanimlama', etiket: 'Müşteri Kartı Tanımlama' },
  { id: 'NakitOdeme', etiket: 'Nakit Ödeme' },
  { id: 'OdemeAlma', etiket: 'Ödeme Alma' },
  { id: 'OnlineOdeme', etiket: 'Online Ödeme' },
  { id: 'OturumSonlandirma', etiket: 'Oturum Sonlandırma' },
  { id: 'PaketciAtama', etiket: 'Paketçi Atama' },
  { id: 'PaketServisi', etiket: 'Paket Servisi' },
  { id: 'PaketServisiDuzenlemeYapma', etiket: 'Paket Servisi Düzenleme Yapma' },
  { id: 'PaketServisiInceleme', etiket: 'Paket Servisi İnceleme' },
  { id: 'PaketServisiIptalEtme', etiket: 'Paket Servisi İptal Etme' },
  { id: 'PaketServisiOdemeAlma', etiket: 'Paket Servisi Ödeme Alma' },
  { id: 'ParcaliOdeme', etiket: 'Parçalı Ödeme' },
  { id: 'PasifCarileriGorme', etiket: 'Pasif Carileri Görme' },
  { id: 'RaporAlma', etiket: 'Rapor Alma' },
  { id: 'SayimListele', etiket: 'Sayım Listele' },
  { id: 'SayimYapma', etiket: 'Sayım Yapma' },
  { id: 'StokSeviyelendirme', etiket: 'Stok Seviyelendirme' },
  { id: 'TekMakinadaKullanilabilsin', etiket: 'Tek Makinada Kullanılabilsin' },
  { id: 'TicketOdeme', etiket: 'Ticket Ödeme' },
  { id: 'TutarGirme', etiket: 'Tutar Girme' },
  { id: 'Uretim', etiket: 'Üretim' },
  { id: 'UrunIadesi', etiket: 'Ürün İadesi' },
  { id: 'ZayiYapma', etiket: 'Zayi Yapma' },
];

export interface TanimlarKullaniciYetkiKaydi {
  yetkiler: Record<string, boolean>;
}

export function bosYetkiKaydi(): TanimlarKullaniciYetkiKaydi {
  const yetkiler: Record<string, boolean> = {};
  for (const y of TANIMLAR_YETKI_TANIMLARI) yetkiler[y.id] = false;
  return { yetkiler };
}

export function tumYetkilerAcik(): Record<string, boolean> {
  const yetkiler: Record<string, boolean> = {};
  for (const y of TANIMLAR_YETKI_TANIMLARI) yetkiler[y.id] = true;
  return yetkiler;
}

export function yetkileriKopyala(kaynak: Record<string, boolean>): Record<string, boolean> {
  const temel = bosYetkiKaydi().yetkiler;
  const birlesik: Record<string, boolean> = { ...temel };
  for (const y of TANIMLAR_YETKI_TANIMLARI) {
    if (y.id in kaynak) birlesik[y.id] = kaynak[y.id];
  }
  return birlesik;
}
