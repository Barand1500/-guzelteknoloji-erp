import { adminGizliModuller, adminModulleri, modulIdDenPrefix } from '@/admin/veri/adminMenuYapisi';
import {
  gecerliYetkiMi,
  KULLANICI_YONETIMI_MODUL_PREFIXLERI,
  tumSayfalarMi,
  type ModulTanimi,
  type RolTanimi,
  type YetkiKodu,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';

export { TUM_SAYFALAR_MODUL, TUM_SAYFALAR_PREFIX, tumSayfalarMi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

export type TopluYetkiDurumu = 'hepsi' | 'hicbiri' | 'karisik';

/** Yetkinin uygulanabileceği sayfa prefix'leri (kullanıcı yönetimi yalnızca uygun sayfalar) */
export function yetkiUygunPrefixler(yetkiKod: YetkiKodu, moduller: readonly ModulTanimi[]): string[] {
  const gercek = moduller.filter((m) => !tumSayfalarMi(m.prefix));
  if (yetkiKod === 'kullanici_yonetimi') {
    return gercek
      .filter((m) => KULLANICI_YONETIMI_MODUL_PREFIXLERI.has(m.prefix))
      .map((m) => m.prefix);
  }
  return gercek.map((m) => m.prefix);
}

export function rolTopluYetkiDurumu(
  rol: RolTanimi,
  prefixes: readonly string[],
  yetkiKod: YetkiKodu
): TopluYetkiDurumu {
  if (!prefixes.length) return 'hicbiri';
  let varSayisi = 0;
  for (const prefix of prefixes) {
    if (rolModulYetkileri(rol, prefix).includes(yetkiKod)) varSayisi += 1;
  }
  if (varSayisi === 0) return 'hicbiri';
  if (varSayisi === prefixes.length) return 'hepsi';
  return 'karisik';
}

export function rolModulYetkiTopluAyarla(
  rol: RolTanimi,
  prefixes: readonly string[],
  yetkiKod: YetkiKodu,
  acik: boolean
): RolTanimi {
  const modulYetkileri: Record<string, YetkiKodu[]> = { ...(rol.modulYetkileri ?? {}) };

  for (const prefix of prefixes) {
    const mevcut = (modulYetkileri[prefix] ?? []).filter(gecerliYetkiMi);
    const varMi = mevcut.includes(yetkiKod);
    if (acik && !varMi) {
      modulYetkileri[prefix] = [...mevcut, yetkiKod];
    } else if (!acik && varMi) {
      const yeni = mevcut.filter((y) => y !== yetkiKod);
      if (yeni.length) modulYetkileri[prefix] = yeni;
      else delete modulYetkileri[prefix];
    }
  }

  return { ...rol, modulYetkileri };
}

/** Karışık / hiç → aç; hepsi → kapat — çakışmada tutarlı tek tık davranışı */
export function rolModulYetkiTopluToggle(
  rol: RolTanimi,
  prefixes: readonly string[],
  yetkiKod: YetkiKodu
): RolTanimi {
  const durum = rolTopluYetkiDurumu(rol, prefixes, yetkiKod);
  return rolModulYetkiTopluAyarla(rol, prefixes, yetkiKod, durum !== 'hepsi');
}

export function rolModulListesi(moduller?: ModulTanimi[]): ModulTanimi[] {
  if (moduller?.length) {
    return moduller.map((m) => ({
      ...m,
      prefix: m.prefix || modulIdDenPrefix(m.id),
    }));
  }

  const tum = [...adminModulleri, ...adminGizliModuller];
  return tum.map((m, i) => ({
    id: m.id,
    ad: m.baslik,
    prefix: modulIdDenPrefix(m.id),
    ikon: m.ikon,
    kategori: m.kategori,
    sira: i,
  }));
}

export function rolModulYetkileri(rol: RolTanimi, modulPrefix: string): YetkiKodu[] {
  return (rol.modulYetkileri?.[modulPrefix] ?? []).filter(gecerliYetkiMi);
}

export function rolYetkiBirlestir(rol: RolTanimi): YetkiKodu[] {
  const birlesik = new Set<YetkiKodu>();
  for (const liste of Object.values(rol.modulYetkileri ?? {})) {
    for (const y of liste) {
      if (gecerliYetkiMi(y)) birlesik.add(y);
    }
  }
  return [...birlesik];
}

export function rolModulYetkiSayisi(rol: RolTanimi): number {
  let sayi = 0;
  for (const liste of Object.values(rol.modulYetkileri ?? {})) {
    sayi += liste.filter(gecerliYetkiMi).length;
  }
  return sayi;
}

export function rolModulErisimSayisi(rol: RolTanimi): number {
  return Object.values(rol.modulYetkileri ?? {}).filter((liste) =>
    liste.some((y) => y === 'goruntuleme')
  ).length;
}

export function rolModulYetkiToggle(
  rol: RolTanimi,
  modulPrefix: string,
  yetkiKod: YetkiKodu
): RolTanimi {
  const mevcut = rolModulYetkileri(rol, modulPrefix);
  const varMi = mevcut.includes(yetkiKod);
  const yeniListe = varMi ? mevcut.filter((y) => y !== yetkiKod) : [...mevcut, yetkiKod];
  return {
    ...rol,
    modulYetkileri: {
      ...(rol.modulYetkileri ?? {}),
      [modulPrefix]: yeniListe,
    },
  };
}

export function rolModulYetkileriTemizle(roller: RolTanimi[]): RolTanimi[] {
  return roller.map((rol) => {
    const modulYetkileri: Record<string, YetkiKodu[]> = {};
    for (const [prefix, liste] of Object.entries(rol.modulYetkileri ?? {})) {
      const temiz = liste.filter(gecerliYetkiMi);
      if (temiz.length) modulYetkileri[prefix] = temiz;
    }
    return { ...rol, modulYetkileri };
  });
}

export function bosRolSablonu(kod: string): RolTanimi {
  return {
    kod,
    baslik: '',
    aciklama: '',
    modulYetkileri: {},
    sistemRolu: false,
  };
}

export function rollerEsitMi(a: RolTanimi[], b: RolTanimi[]): boolean {
  if (a.length !== b.length) return false;

  return a.every((rol, i) => {
    const diger = b[i];
    if (rol.kod !== diger.kod || rol.baslik !== diger.baslik || rol.aciklama !== diger.aciklama) {
      return false;
    }

    const anahtarlar = new Set([
      ...Object.keys(rol.modulYetkileri ?? {}),
      ...Object.keys(diger.modulYetkileri ?? {}),
    ]);

    for (const prefix of anahtarlar) {
      const y1 = rolModulYetkileri(rol, prefix).slice().sort().join(',');
      const y2 = rolModulYetkileri(diger, prefix).slice().sort().join(',');
      if (y1 !== y2) return false;
    }

    return true;
  });
}

/** Eski düz yetki listesinden modül bazlı yapıya geçiş */
export function rolModulYetkileriNormalize(
  rol: Partial<RolTanimi> & { kod: string; baslik: string },
  modulPrefixler: string[]
): RolTanimi {
  const modulYetkileri: Record<string, YetkiKodu[]> = { ...(rol.modulYetkileri ?? {}) };

  const eskiDuz = (rol as { yetkiler?: YetkiKodu[] }).yetkiler;
  if (eskiDuz?.length && Object.keys(modulYetkileri).length === 0) {
    const temiz = eskiDuz.filter(gecerliYetkiMi);
    for (const prefix of modulPrefixler) {
      modulYetkileri[prefix] = [...temiz];
    }
  }

  return {
    kod: rol.kod,
    baslik: rol.baslik,
    aciklama: rol.aciklama ?? '',
    modulYetkileri,
    sistemRolu: rol.sistemRolu,
  };
}
