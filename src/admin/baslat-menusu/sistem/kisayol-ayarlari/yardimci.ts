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

const STORAGE_KEY = 'ap-kisayol-ayarlari';

export type KisayolHaritasi = Record<KisayolIslemId, string>;

export function varsayilanKisayollar(): KisayolHaritasi {
  return KISAYOL_ISLEMLERI.reduce((acc, k) => {
    acc[k.id] = k.varsayilan;
    return acc;
  }, {} as KisayolHaritasi);
}

export function kisayolAyarlariOku(): KisayolHaritasi {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanKisayollar();
    const kayitli = JSON.parse(ham) as Partial<KisayolHaritasi> & { onizle?: string };
    if (kayitli.onizle && !kayitli.guncelle) {
      kayitli.guncelle = kayitli.onizle;
      delete kayitli.onizle;
    }
    return { ...varsayilanKisayollar(), ...kayitli };
  } catch {
    return varsayilanKisayollar();
  }
}

export function kisayolAyarlariKaydet(harita: KisayolHaritasi) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(harita));
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
