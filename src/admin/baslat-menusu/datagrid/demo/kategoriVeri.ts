export interface DemoKategori {
  id: string;
  ad: string;
  ustId?: string | null;
}

export const BASLANGIC_KATEGORILER: DemoKategori[] = [
  { id: 'kat-otvt', ad: 'OT/VT Ürünleri' },
  { id: 'kat-dokunmatik', ad: 'Dokunmatik POS', ustId: 'kat-otvt' },
  { id: 'kat-fiyatgor', ad: 'Fiyatgör ve Kiosk', ustId: 'kat-otvt' },
  { id: 'kat-el', ad: 'El Terminalleri', ustId: 'kat-otvt' },
  { id: 'kat-elektronik', ad: 'Elektronik' },
  { id: 'kat-yazilim', ad: 'Yazılım' },
  { id: 'kat-aksesuar', ad: 'Aksesuar' },
  { id: 'kat-genel', ad: 'Genel' },
];

export function kategoriSecenekleri(kategoriler: DemoKategori[]) {
  return kategoriler.map((k) => ({ deger: k.ad, etiket: k.ad }));
}

export function kategoriYolu(kategoriler: DemoKategori[], id: string): string {
  const parcalar: string[] = [];
  let mevcut = kategoriler.find((k) => k.id === id);
  while (mevcut) {
    parcalar.unshift(mevcut.ad);
    mevcut = mevcut.ustId ? kategoriler.find((k) => k.id === mevcut!.ustId) : undefined;
  }
  return parcalar.join(' › ');
}
