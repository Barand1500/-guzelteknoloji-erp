import type { AksiyonId } from '@/baglamlar/AdminAksiyonContext';

const AKSİYON_CUMLE: Partial<Record<AksiyonId, (modul: string) => string>> = {
  kaydet: (m) => `${m} sayfasındaki değişiklikleri kaydetti`,
  hizliKaydet: (m) => `${m} sayfasında hızlı kayıt yaptı`,
  guncelle: (m) => `${m} sayfasında güncelleme yaptı`,
  ekle: (m) => `${m} sayfasında yeni kayıt ekledi`,
  altEkle: (m) => `${m} sayfasında alt kayıt ekledi`,
  sil: (m) => `${m} sayfasında kayıt sildi`,
  onizle: (m) => `${m} sayfasını yazdırdı`,
  yayinla: (m) => `${m} sayfasında yayınlama yaptı`,
  oncekiKayit: (m) => `${m} sayfasında önceki kayda geçti`,
  sonrakiKayit: (m) => `${m} sayfasında sonraki kayda geçti`,
};

export function varsayilanLogMesaji(
  modulBaslik: string,
  aksiyonId: string,
  aksiyonEtiket?: string
): string {
  const fabrika = AKSİYON_CUMLE[aksiyonId as AksiyonId];
  if (fabrika) return fabrika(modulBaslik);
  if (aksiyonEtiket) return `${modulBaslik} sayfasında «${aksiyonEtiket}» işlemini yaptı`;
  return `${modulBaslik} sayfasında işlem yaptı`;
}

/** Modül sayfalarında logMesajiAyarla ile kullanılacak kısa yardımcılar */
export const logMesaj = {
  kaydetti: (sayfa: string, detay: string) => `${sayfa} sayfasında ${detay}`,
  ekledi: (sayfa: string, detay: string) => `${sayfa} sayfasında ${detay} ekledi`,
  guncelledi: (sayfa: string, detay: string) => `${sayfa} sayfasında ${detay} güncelledi`,
  sildi: (sayfa: string, detay: string) => `${sayfa} sayfasında ${detay} sildi`,
  yapti: (sayfa: string, detay: string) => `${sayfa} sayfasında ${detay}`,
};
