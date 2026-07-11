export type KisayolIslemId =
  | 'rehber'
  | 'kaydet'
  | 'ekle'
  | 'guncelle'
  | 'sil'
  | 'oncekiKayit'
  | 'sonrakiKayit';

export interface KisayolTanimi {
  id: KisayolIslemId;
  etiket: string;
  aciklama: string;
  varsayilan: string;
}

export const KISAYOL_ISLEMLERI: KisayolTanimi[] = [
  { id: 'rehber', etiket: 'Rehber', aciklama: 'Nasıl kullanılır modalını açar', varsayilan: 'F1' },
  { id: 'kaydet', etiket: 'Kaydet', aciklama: 'Aktif modülde kaydet', varsayilan: 'Ctrl+S' },
  { id: 'ekle', etiket: 'Yeni Ekle', aciklama: 'Aktif modülde yeni kayıt', varsayilan: 'Ctrl+N' },
  { id: 'guncelle', etiket: 'Güncelle', aciklama: 'Aktif modülde güncelle / yazdır / önizle', varsayilan: 'Ctrl+P' },
  { id: 'sil', etiket: 'Sil', aciklama: 'Aktif modülde silme', varsayilan: 'Delete' },
  {
    id: 'oncekiKayit',
    etiket: 'Önceki Kayıt',
    aciklama: 'Aktif modülde bir önceki kayda geç',
    varsayilan: 'Alt+ArrowLeft',
  },
  {
    id: 'sonrakiKayit',
    etiket: 'Sonraki Kayıt',
    aciklama: 'Aktif modülde bir sonraki kayda geç',
    varsayilan: 'Alt+ArrowRight',
  },
];

const ESKI_STORAGE_KEY = 'ap-kisayol-ayarlari';

export type KisayolHaritasi = Record<KisayolIslemId, string>;

let bellekHarita: KisayolHaritasi | null = null;

export function varsayilanKisayollar(): KisayolHaritasi {
  return KISAYOL_ISLEMLERI.reduce((acc, k) => {
    acc[k.id] = k.varsayilan;
    return acc;
  }, {} as KisayolHaritasi);
}

function haritaNormalize(kayitli?: Partial<KisayolHaritasi> & { onizle?: string } | null): KisayolHaritasi {
  const ham = kayitli ?? {};
  if (ham.onizle && !ham.guncelle) {
    ham.guncelle = ham.onizle;
    delete ham.onizle;
  }
  return { ...varsayilanKisayollar(), ...ham };
}

function eskiLocalStorageTemizle() {
  try {
    localStorage.removeItem(ESKI_STORAGE_KEY);
  } catch {
    /* storage yok */
  }
}

export function kisayolAyarlariOku(): KisayolHaritasi {
  if (bellekHarita) return { ...bellekHarita };
  return varsayilanKisayollar();
}

export function kisayolAyarlariBellegeYaz(ham?: Partial<KisayolHaritasi> | null) {
  eskiLocalStorageTemizle();
  bellekHarita = haritaNormalize(ham);
  window.dispatchEvent(new CustomEvent('ap-kisayol-ayarlari-guncellendi'));
}

export function kisayolAyarlariTemizle() {
  eskiLocalStorageTemizle();
  bellekHarita = null;
}

export async function kisayolAyarlariSunucuyaKaydet(harita: KisayolHaritasi): Promise<KisayolHaritasi> {
  const { kisayolAyarlariGuncelle } = await import('@/admin/baslat-menusu/sistem/kullanici-ayarlari/api');
  const yanit = await kisayolAyarlariGuncelle(harita);
  kisayolAyarlariBellegeYaz(yanit.harita ?? harita);
  return kisayolAyarlariOku();
}

export function tusKombinasyonuYakala(e: KeyboardEvent): string {
  const parcalar: string[] = [];
  if (e.ctrlKey || e.metaKey) parcalar.push('Ctrl');
  if (e.altKey) parcalar.push('Alt');
  if (e.shiftKey) parcalar.push('Shift');
  const anahtar = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parcalar.push(anahtar);
  }
  return parcalar.join('+');
}

export function kisayolCakismaBul(
  harita: KisayolHaritasi,
  islemId: KisayolIslemId,
  yeniKombinasyon: string
): KisayolIslemId | null {
  const norm = yeniKombinasyon.trim();
  if (!norm) return null;
  for (const [id, komb] of Object.entries(harita) as [KisayolIslemId, string][]) {
    if (id !== islemId && komb === norm) return id;
  }
  return null;
}

export function klavyeOlayiEslesir(e: KeyboardEvent, kombinasyon: string): boolean {
  if (!kombinasyon) return false;
  return tusKombinasyonuYakala(e) === kombinasyon;
}
