export type SekmeYukseklik = 'kucuk' | 'orta' | 'buyuk';
export type VarsayilanAcilis = 'tek-sekme' | 'yeni-sekme';
export type SekmeGorunumModu = 'isim' | 'ikon' | 'ikon-isim';
export type SekmeYerlesim = 'dikdortgen' | 'kare';

export type SekmeAramaGorunum = 'ikon' | 'input';
export type BaslatMenuTasarim = 'klasik' | 'modern';
export type BaslatMenuKategoriGorunum = 'kare' | 'dikdortgen';
export type BaslatMenuKutuBoyutu = 'kucuk' | 'orta' | 'buyuk';

export interface SekmePanelAyarlari {
  sekmeYukseklik: SekmeYukseklik;
  hoverOnizleme: boolean;
  varsayilanAcilis: VarsayilanAcilis;
  yanYanaAcilabilir: boolean;
  surukleAyirPencere: boolean;
  sekmeGorunumModu: SekmeGorunumModu;
  sekmeYerlesim: SekmeYerlesim;
  sekmeAramaAktif: boolean;
  sekmeAramaGorunum: SekmeAramaGorunum;
  baslatMenuTasarim: BaslatMenuTasarim;
  baslatMenuKategoriGorunum: BaslatMenuKategoriGorunum;
  baslatMenuKutuBoyutu: BaslatMenuKutuBoyutu;
  sekmeGecisindeOtomatikKaydet: boolean;
}

export const VARSAYILAN_SEKME_AYARLARI: SekmePanelAyarlari = {
  sekmeYukseklik: 'buyuk',
  hoverOnizleme: false,
  varsayilanAcilis: 'tek-sekme',
  yanYanaAcilabilir: true,
  surukleAyirPencere: true,
  sekmeGorunumModu: 'ikon-isim',
  sekmeYerlesim: 'dikdortgen',
  sekmeAramaAktif: true,
  sekmeAramaGorunum: 'ikon',
  baslatMenuTasarim: 'modern',
  baslatMenuKategoriGorunum: 'dikdortgen',
  baslatMenuKutuBoyutu: 'orta',
  sekmeGecisindeOtomatikKaydet: true,
};

const ESKI_STORAGE_KEY = 'ap-sekme-panel-ayarlari';
const SITE_VARSAYILAN_ANAHTAR = 'erp-site-varsayilan-ayarlar';

let bellekAyarlar: SekmePanelAyarlari | null = null;

function siteVarsayilanSekmeAyarlari(): Partial<SekmePanelAyarlari> {
  try {
    const siteHam = localStorage.getItem(SITE_VARSAYILAN_ANAHTAR);
    const site = siteHam ? (JSON.parse(siteHam) as { sekme?: Partial<SekmePanelAyarlari> }) : null;
    return site?.sekme ?? {};
  } catch {
    return {};
  }
}

function ayarlariNormalize(parsed: Partial<SekmePanelAyarlari> & { grupDavranisi?: string }): SekmePanelAyarlari {
  const { grupDavranisi: _eski, ...gerisi } = parsed;
  return { ...VARSAYILAN_SEKME_AYARLARI, ...siteVarsayilanSekmeAyarlari(), ...gerisi };
}

function eskiLocalStorageTemizle() {
  try {
    localStorage.removeItem(ESKI_STORAGE_KEY);
  } catch {
    /* storage yok */
  }
}

/** Birleştirilmiş sekmeler için Chrome tarzı yan yana split (en fazla 2 panel). */
export function splitSekmeleriHesapla<T extends { id: string; grupId?: string }>(
  sekmeler: T[],
  aktifSekme: T | undefined,
  yanYanaAcilabilir: boolean
): T[] | null {
  if (!yanYanaAcilabilir || !aktifSekme?.grupId) return null;

  const sirali = sekmeler.filter((s) => s.grupId === aktifSekme.grupId);
  if (sirali.length < 2) return null;
  if (sirali.length === 2) return sirali;

  const aktifIdx = sirali.findIndex((s) => s.id === aktifSekme.id);
  if (aktifIdx < 0) return sirali.slice(0, 2);

  const komsuIdx = aktifIdx === 0 ? 1 : aktifIdx - 1;
  return [sirali[aktifIdx], sirali[komsuIdx]];
}

export function sekmeAyarlariOku(): SekmePanelAyarlari {
  if (bellekAyarlar) return { ...bellekAyarlar };
  return ayarlariNormalize({});
}

export function sekmeAyarlariBellegeYaz(ham: Partial<SekmePanelAyarlari>) {
  eskiLocalStorageTemizle();
  bellekAyarlar = ayarlariNormalize(ham);
  window.dispatchEvent(new CustomEvent('ap-sekme-ayarlari-guncellendi'));
}

export function sekmeAyarlariTemizle() {
  eskiLocalStorageTemizle();
  bellekAyarlar = null;
}

export async function sekmeAyarlariSunucuyaKaydet(ayarlar: SekmePanelAyarlari): Promise<SekmePanelAyarlari> {
  const { sekmeAyarlariGuncelle } = await import('@/admin/baslat-menusu/sistem/kullanici-ayarlari/api');
  const yanit = await sekmeAyarlariGuncelle(ayarlar);
  sekmeAyarlariBellegeYaz(yanit.ayarlar);
  return sekmeAyarlariOku();
}

export function sekmeAyarlariLogOzeti(ayarlar: SekmePanelAyarlari): string {
  const gorunum: Record<SekmeGorunumModu, string> = {
    'ikon-isim': 'İkon + isim',
    isim: 'Sadece isim',
    ikon: 'Sadece ikon',
  };
  const boyut: Record<SekmeYukseklik, string> = {
    kucuk: 'Küçük',
    orta: 'Orta',
    buyuk: 'Büyük',
  };
  const acilis =
    ayarlar.varsayilanAcilis === 'yeni-sekme'
      ? 'her seferinde yeni sekme aç'
      : 'aynı modülde mevcut sekmeyi kullan';
  const parcalar = [
    `görünüm: ${gorunum[ayarlar.sekmeGorunumModu]}`,
    `boyut: ${boyut[ayarlar.sekmeYukseklik]}`,
    `varsayılan açılış: ${acilis}`,
    ayarlar.yanYanaAcilabilir ? 'yan yana sekme açık' : 'yan yana sekme kapalı',
    ayarlar.surukleAyirPencere ? 'sürükleyerek ayırma açık' : 'sürükleyerek ayırma kapalı',
    ayarlar.sekmeAramaAktif ? 'sekme araması açık' : 'sekme araması kapalı',
    ayarlar.sekmeGecisindeOtomatikKaydet
      ? 'sekme geçişinde otomatik kaydet açık'
      : 'sekme geçişinde otomatik kaydet kapalı',
  ];
  return `Sekme Yönetimi sayfasında sekme paneli ayarlarını kaydetti (${parcalar.join(', ')})`;
}

export function sekmeYukseklikCss(ayar: SekmeYukseklik) {
  switch (ayar) {
    case 'kucuk':
      return { height: '1.75rem', fontSize: '0.6875rem', padding: '0.25rem 0.5rem' };
    case 'buyuk':
      return { height: '2.5rem', fontSize: '0.875rem', padding: '0.5rem 0.875rem' };
    default:
      return { height: '2rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem' };
  }
}

/** Kare sekme yerleşiminde kare boyutu */
export function sekmeKareOlcusu(yukseklik: SekmeYukseklik, _gorunum?: SekmeGorunumModu) {
  const boy =
    yukseklik === 'kucuk' ? '3.25rem' : yukseklik === 'buyuk' ? '5.5rem' : '4.25rem';
  const ikon =
    yukseklik === 'kucuk' ? '0.9375rem' : yukseklik === 'buyuk' ? '1.375rem' : '1.125rem';
  return { boy, genislik: boy, ikon };
}

export function sekmeTabCssDegiskenleri(
  ayarlar: Pick<SekmePanelAyarlari, 'sekmeYukseklik' | 'sekmeGorunumModu' | 'sekmeYerlesim'>
) {
  const h =
    ayarlar.sekmeYukseklik === 'kucuk' ? '1.75rem' : ayarlar.sekmeYukseklik === 'buyuk' ? '2.5rem' : '2rem';
  const f =
    ayarlar.sekmeYukseklik === 'kucuk' ? '0.6875rem' : ayarlar.sekmeYukseklik === 'buyuk' ? '0.875rem' : '0.75rem';
  const kare = sekmeKareOlcusu(ayarlar.sekmeYukseklik, ayarlar.sekmeGorunumModu);
  const headerYuk =
    ayarlar.sekmeYerlesim === 'kare' ? `calc(${kare.boy} + 0.25rem)` : '3rem';
  return {
    '--ap-tab-height': h,
    '--ap-tab-font-size': f,
    '--ap-sekme-kare-genislik': kare.genislik,
    '--ap-sekme-kare-boyut': kare.boy,
    '--ap-sekme-kare-ikon-boyut': kare.ikon,
    '--ap-header-yukseklik': headerYuk,
  } as Record<string, string>;
}
