import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';

export type YetkiKodu =
  | 'goruntuleme'
  | 'ekleme'
  | 'duzenleme'
  | 'silme'
  | 'kullanici_yonetimi';

/** Eski sürümlerde kaldırılmış yetkiler — matriste gösterilmez */
const KALDIRILAN_YETKILER = new Set([
  'yayinlama',
  'dosya_yukleme',
  'seo_duzenleme',
  'tema_duzenleme',
]);

export const YETKI_ETIKETLERI: Record<YetkiKodu, string> = {
  goruntuleme: 'Görüntüleme',
  ekleme: 'Ekleme',
  duzenleme: 'Düzenleme',
  silme: 'Silme',
  kullanici_yonetimi: 'Kullanıcı Yönetimi',
};

const GECERLI_YETKI_KODLARI: YetkiKodu[] = [
  'goruntuleme',
  'ekleme',
  'duzenleme',
  'silme',
  'kullanici_yonetimi',
];

export const GECERLI_YETKI_LISTESI: YetkiTanimi[] = GECERLI_YETKI_KODLARI.map((kod) => ({
  kod,
  etiket: YETKI_ETIKETLERI[kod],
}));

export function gecerliYetkiMi(kod: string): kod is YetkiKodu {
  return GECERLI_YETKI_KODLARI.includes(kod as YetkiKodu);
}

export function rollerTemizle(roller: RolTanimi[]): RolTanimi[] {
  return roller.map((rol) => ({
    ...rol,
    yetkiler: rol.yetkiler.filter(
      (y) => !KALDIRILAN_YETKILER.has(y) && gecerliYetkiMi(y)
    ),
  }));
}

export interface RolTanimi {
  kod: string;
  baslik: string;
  aciklama: string;
  yetkiler: YetkiKodu[];
  sistemRolu?: boolean;
}

export interface YetkiTanimi {
  kod: YetkiKodu;
  etiket: string;
}

export async function adminRolleriGetir(): Promise<{ roller: RolTanimi[]; yetkiler: YetkiTanimi[] }> {
  const veri = await adminJsonFetch<{ roller?: RolTanimi[]; yetkiler?: YetkiTanimi[] }>('/roller', {
    headers: adminHeaders(),
  });
  return {
    roller: veri.roller ?? [],
    yetkiler: veri.yetkiler ?? GECERLI_YETKI_LISTESI,
  };
}

export async function adminRolleriKaydet(
  roller: RolTanimi[]
): Promise<{ roller: RolTanimi[]; yetkiler: YetkiTanimi[] }> {
  return adminJsonFetch('/roller', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ roller }),
  });
}

export function baslikdanKodUret(baslik: string, mevcutKodlar: string[]): string {
  const temiz = baslik
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  let kod = temiz || 'YENI_ROL';
  if (!mevcutKodlar.includes(kod)) return kod;
  let sayac = 2;
  while (mevcutKodlar.includes(`${kod}_${sayac}`)) sayac += 1;
  return `${kod}_${sayac}`;
}
