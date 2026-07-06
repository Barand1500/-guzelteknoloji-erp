import {
  bosYetkiKaydi,
  tumYetkilerAcik,
  yetkileriKopyala,
  type TanimlarKullaniciYetkiKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/yetkiTanimlari';

function kayit(yetkiler: Partial<Record<string, boolean>>): TanimlarKullaniciYetkiKaydi {
  const temel = bosYetkiKaydi();
  const birlesik: Record<string, boolean> = { ...temel.yetkiler };
  for (const [anahtar, deger] of Object.entries(yetkiler)) {
    if (deger !== undefined) birlesik[anahtar] = deger;
  }
  return { yetkiler: birlesik };
}

/** Kullanıcı id → yetki kaydı (frontend mock) */
export const TANIMLAR_VARSAYILAN_YETKILER: Record<number, TanimlarKullaniciYetkiKaydi> = {
  1: { yetkiler: tumYetkilerAcik() },
  2: kayit({
    AcikHesapIslemi: true,
    Ayarlar: false,
    IptalEtme: true,
    MasaDegistirmeIslemi: true,
    NakitOdeme: true,
    OdemeAlma: true,
    IskontoYapma: true,
    RaporAlma: true,
    KrediKartiOdeme: true,
    ParcaliOdeme: true,
    HesapPusulasiYazdirma: true,
  }),
  3: kayit({
    AcikHesapIslemi: true,
    IptalEtme: true,
    NakitOdeme: true,
    OdemeAlma: true,
    PaketServisi: true,
    PaketciAtama: true,
    PaketServisiDuzenlemeYapma: true,
    PaketServisiInceleme: true,
    PaketServisiOdemeAlma: true,
    UrunIadesi: true,
    OnlineOdeme: true,
  }),
};

export function yetkiKaydiKopyala(kayitVeri: TanimlarKullaniciYetkiKaydi): TanimlarKullaniciYetkiKaydi {
  return { yetkiler: yetkileriKopyala(kayitVeri.yetkiler) };
}
