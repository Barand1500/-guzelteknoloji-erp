/** Tasarım önizlemesi — API bağlanınca kaldırılacak örnek veriler */

export const ORNEK_KULLANICILAR = [
  { id: 1, ad: 'Sistem Yöneticisi', eposta: 'admin@restorant.local', tip: 'merkez', rol: 'SUPER_ADMIN', aktif: true },
  { id: 2, ad: 'Ahmet Yılmaz', eposta: 'ahmet@lezzet.com', tip: 'firma', rol: 'MUSTERI_ADMIN', aktif: true },
];

export const ORNEK_PAKETLER = [
  { id: 1, ad: 'Başlangıç', sube: 1, personel: 5, masa: 20, fiyat: 499, aktif: true },
  { id: 2, ad: 'Profesyonel', sube: 3, personel: 15, masa: 80, fiyat: 1299, aktif: true },
  { id: 3, ad: 'Kurumsal', sube: 10, personel: 50, masa: 200, fiyat: 3499, aktif: true },
];

export const ORNEK_LISANSLAR = [
  { id: 1, firma: 'Lezzet Durağı', paket: 'Profesyonel', baslangic: '01.01.2026', bitis: '01.01.2027', durum: 'aktif' as const },
  { id: 2, firma: 'Kahve Köşesi', paket: 'Başlangıç', baslangic: '15.03.2026', bitis: '15.06.2026', durum: 'yakinda' as const },
];
