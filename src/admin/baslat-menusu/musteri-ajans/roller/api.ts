import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { rolModulYetkileriNormalize } from '@/admin/baslat-menusu/musteri-ajans/roller/rolYardimci';

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

/** Kullanıcı yönetimi yalnızca bu sayfalarda anlamlıdır */
export const KULLANICI_YONETIMI_MODUL_PREFIXLERI = new Set(['kullanicilar', 'roller']);

/** Yetki Matrisi — tüm sayfalara toplu uygulama sekmesi */
export const TUM_SAYFALAR_PREFIX = '__tum_sayfalar__';

export const TUM_SAYFALAR_MODUL: ModulTanimi = {
  id: 'tum-sayfalar',
  ad: 'Tüm sayfalar',
  prefix: TUM_SAYFALAR_PREFIX,
  kategori: 'Toplu uygulama',
  sira: -1,
};

export function tumSayfalarMi(prefix: string): boolean {
  return prefix === TUM_SAYFALAR_PREFIX;
}

export function modulYetkiListesi(modulPrefix: string): YetkiTanimi[] {
  if (tumSayfalarMi(modulPrefix) || KULLANICI_YONETIMI_MODUL_PREFIXLERI.has(modulPrefix)) {
    return GECERLI_YETKI_LISTESI;
  }
  return GECERLI_YETKI_LISTESI.filter((y) => y.kod !== 'kullanici_yonetimi');
}

export function gecerliYetkiMi(kod: string): kod is YetkiKodu {
  return GECERLI_YETKI_KODLARI.includes(kod as YetkiKodu);
}

export interface ModulTanimi {
  id: string;
  ad: string;
  prefix: string;
  ikon?: string;
  kategori?: string;
  sira?: number;
}

export interface RolTanimi {
  kod: string;
  baslik: string;
  aciklama: string;
  modulYetkileri: Record<string, YetkiKodu[]>;
  sistemRolu?: boolean;
}

export interface YetkiTanimi {
  kod: YetkiKodu;
  etiket: string;
}

export interface RolMatrisSatir {
  rolKodu: string;
  modulPrefix: string;
  yetkiler: YetkiKodu[];
}

export interface RolleriGetirYanit {
  roller: RolTanimi[];
  yetkiler: YetkiTanimi[];
  moduller: ModulTanimi[];
  matris?: RolMatrisSatir[];
}

export function rollerTemizle(roller: RolTanimi[], modulPrefixler: string[] = []): RolTanimi[] {
  return roller.map((rol) => {
    const normalize = rolModulYetkileriNormalize(rol, modulPrefixler);
    const modulYetkileri: Record<string, YetkiKodu[]> = {};
    for (const [prefix, liste] of Object.entries(normalize.modulYetkileri)) {
      const temiz = liste.filter((y) => !KALDIRILAN_YETKILER.has(y) && gecerliYetkiMi(y));
      if (temiz.length) modulYetkileri[prefix] = temiz;
    }
    return { ...normalize, modulYetkileri };
  });
}

function apiModulNormalize(moduller: ModulTanimi[]): ModulTanimi[] {
  return moduller.map((m) => ({
    ...m,
    id: m.id || m.prefix.replace(/_/g, '-'),
    prefix: m.prefix,
  }));
}

function apiRolNormalize(
  roller: Array<Partial<RolTanimi> & { kod: string; baslik: string; yetkiler?: YetkiKodu[] }>,
  modulPrefixler: string[]
): RolTanimi[] {
  return rollerTemizle(
    roller.map((rol) => rolModulYetkileriNormalize(rol, modulPrefixler)),
    modulPrefixler
  );
}

export async function adminRolleriGetir(): Promise<RolleriGetirYanit> {
  const veri = await adminJsonFetch<{
    roller?: Array<Partial<RolTanimi> & { kod: string; baslik: string; yetkiler?: YetkiKodu[] }>;
    yetkiler?: YetkiTanimi[];
    moduller?: ModulTanimi[];
    matris?: RolMatrisSatir[];
  }>('/roller', {
    headers: adminHeaders(),
  });

  const moduller = apiModulNormalize(veri.moduller ?? []);
  const prefixler = moduller.map((m) => m.prefix);

  return {
    roller: apiRolNormalize(veri.roller ?? [], prefixler),
    yetkiler: veri.yetkiler ?? GECERLI_YETKI_LISTESI,
    moduller,
    matris: veri.matris,
  };
}

export async function adminRolleriKaydet(roller: RolTanimi[]): Promise<RolleriGetirYanit> {
  const veri = await adminJsonFetch<{
    roller?: Array<Partial<RolTanimi> & { kod: string; baslik: string }>;
    yetkiler?: YetkiTanimi[];
    moduller?: ModulTanimi[];
  }>('/roller', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ roller }),
  });

  const moduller = apiModulNormalize(veri.moduller ?? []);
  const prefixler = moduller.map((m) => m.prefix);

  return {
    roller: apiRolNormalize(veri.roller ?? [], prefixler),
    yetkiler: veri.yetkiler ?? GECERLI_YETKI_LISTESI,
    moduller,
  };
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
