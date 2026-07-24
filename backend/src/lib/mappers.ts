import type { Depo, Donem, F001Cari, Firma, Kasa, Kullanici, Rol, Sube } from '@prisma/client';
import { tumAyarlarOku } from './ayarlar.js';
import { prisma } from './prisma.js';

const VARSAYILAN_SITE = {
  id: 1,
  ad: 'ERP',
  slug: 'guzel-teknoloji-erp',
  domain: null as string | null,
  aktif: true,
};

const YETKI_ETIKETLERI: Record<string, string> = {
  goruntuleme: 'Goruntuleme',
  ekleme: 'Ekleme',
  duzenleme: 'Duzenleme',
  silme: 'Silme',
  kullanici_yonetimi: 'Kullanici Yonetimi',
};

export const GECERLI_YETKILER = Object.keys(YETKI_ETIKETLERI);

const VARSAYILAN_ROL_YETKILERI: Record<string, string[]> = {
  YONETICI: [...GECERLI_YETKILER],
  SUPER_ADMIN: [...GECERLI_YETKILER],
  AJANS_ADMIN: [...GECERLI_YETKILER],
  MUSTERI_ADMIN: ['goruntuleme', 'ekleme', 'duzenleme', 'silme'],
  EDITOR: ['goruntuleme', 'ekleme', 'duzenleme'],
  SEO_EDITOR: ['goruntuleme', 'duzenleme'],
  GORUNTULEME: ['goruntuleme'],
};

const BOS_YETKI_VARSAYILAN_ROLLER = new Set(['YONETICI', 'SUPER_ADMIN', 'AJANS_ADMIN']);

function rollerAyristir(rol: string): string[] {
  return [...new Set(rol.split(/[,;|]/).map((r) => r.trim()).filter(Boolean))];
}

export async function kullaniciYetkileriAl(kullanici: Kullanici): Promise<{
  birlesik: string[];
  modul: Record<string, string[]>;
}> {
  const roller = rollerAyristir(kullanici.rol);
  const satirlar = await prisma.rol.findMany({
    where: {
      rolAdi: roller.length === 1 ? roller[0] : { in: roller.length ? roller : ['__yok__'] },
      durum: true,
    },
  });

  const birlesik = new Set<string>();
  const modul: Record<string, Set<string>> = {};

  for (const kod of roller) {
    const varsayilan = VARSAYILAN_ROL_YETKILERI[kod] ?? ['goruntuleme'];
    if (BOS_YETKI_VARSAYILAN_ROLLER.has(kod)) {
      for (const y of varsayilan) birlesik.add(y);
    }
  }

  if (satirlar.length === 0) {
    const varsayilan = roller.flatMap((kod) => VARSAYILAN_ROL_YETKILERI[kod] ?? ['goruntuleme']);
    return { birlesik: [...new Set(varsayilan)], modul: {} };
  }

  for (const satir of satirlar) {
    const prefix = await modulPrefixAl(satir.modulId);
    const liste = (Array.isArray(satir.yetki) ? (satir.yetki as string[]) : []).filter((y) =>
      GECERLI_YETKILER.includes(y)
    );
    if (!modul[prefix]) modul[prefix] = new Set();
    for (const y of liste) {
      modul[prefix]!.add(y);
      birlesik.add(y);
    }
  }

  const sonuc = [...birlesik];
  if (sonuc.length === 0) {
    const varsayilan = roller.flatMap((kod) => VARSAYILAN_ROL_YETKILERI[kod] ?? ['goruntuleme']);
    return {
      birlesik: [...new Set(varsayilan)],
      modul: Object.fromEntries(Object.entries(modul).map(([k, v]) => [k, [...v]])),
    };
  }
  return {
    birlesik: sonuc,
    modul: Object.fromEntries(Object.entries(modul).map(([k, v]) => [k, [...v]])),
  };
}

const modulPrefixOnbellek = new Map<number, string>();

async function modulPrefixAl(modulId: number): Promise<string> {
  const onbellek = modulPrefixOnbellek.get(modulId);
  if (onbellek) return onbellek;

  const modul = await prisma.modul.findUnique({ where: { id: modulId } });
  const prefix = modul?.prefix ?? String(modulId);
  modulPrefixOnbellek.set(modulId, prefix);
  return prefix;
}

export function tarihIso(d: Date): string {
  return d.toISOString();
}

export async function kullaniciYanit(
  k: Kullanici,
  yetkiPaket: { birlesik: string[]; modul: Record<string, string[]> },
  oturumSecimi?: {
    firma: Firma;
    donem: Donem;
    sube: Sube;
    kasa: Kasa;
  }
) {
  const tam = await prisma.kullanici.findUnique({
    where: { id: k.id },
    include: {
      firma: true,
      donem: true,
      sube: true,
      depo: true,
      kasa: true,
    },
  });

  const kayit = tam ?? k;
  const firma = oturumSecimi?.firma ?? tam?.firma;
  const donem = oturumSecimi?.donem ?? tam?.donem;
  const sube = oturumSecimi?.sube ?? tam?.sube;
  const kasa = oturumSecimi?.kasa ?? tam?.kasa;

  return {
    id: kayit.id,
    kullaniciKodu: kayit.kullaniciKodu,
    ad: kayit.adSoyad,
    rol: kayit.rol,
    yetkiler: yetkiPaket.birlesik,
    yetkilerModul: yetkiPaket.modul,
    oturum: firma
      ? {
          firmaKodu: firma.firmaKodu,
          firmaAdi: firma.firmaAdi,
          donemKodu: donem?.donemKodu ?? '',
          donemAdi: donem?.donemAdi ?? '',
          subeKodu: sube?.subeKodu ?? '',
          subeAdi: sube?.subeAdi ?? '',
          kasaKodu: kasa?.kasaKodu ?? '',
          kasaAdi: kasa?.kasaAdi ?? '',
        }
      : undefined,
  };
}

export async function adminKullaniciYanit(k: Kullanici) {
  const ham = k.oturumYetkileri;
  let oturumYetkileri: unknown[] = [];
  let subeIds: string[] = [];
  let depoIds: string[] = [];
  let kasaIds: string[] = [];

  if (Array.isArray(ham)) {
    oturumYetkileri = ham;
  } else if (ham && typeof ham === 'object') {
    const o = ham as Record<string, unknown>;
    oturumYetkileri = Array.isArray(o.yetkiler) ? o.yetkiler : [];
    subeIds = Array.isArray(o.subeIds) ? o.subeIds.map(String) : [];
    depoIds = Array.isArray(o.depoIds) ? o.depoIds.map(String) : [];
    kasaIds = Array.isArray(o.kasaIds) ? o.kasaIds.map(String) : [];
  } else if (k.firmaId && k.donemId) {
    oturumYetkileri = [{ firmaId: k.firmaId, donemId: k.donemId }];
  }

  if (!subeIds.length && k.subeId != null) subeIds = [String(k.subeId)];
  if (!depoIds.length && k.depoId != null) depoIds = [String(k.depoId)];
  if (!kasaIds.length && k.kasaId != null) kasaIds = [String(k.kasaId)];

  return {
    id: String(k.id),
    kullaniciKodu: k.kullaniciKodu,
    ad: k.adSoyad,
    rol: k.rol,
    aktif: k.durum,
    firmaId: String(k.firmaId),
    donemId: k.donemId != null ? String(k.donemId) : '',
    subeId: k.subeId != null ? String(k.subeId) : '',
    depoId: k.depoId != null ? String(k.depoId) : '',
    kasaId: k.kasaId != null ? String(k.kasaId) : '',
    subeIds,
    depoIds,
    kasaIds,
    oturumYetkileri,
    pin: k.pin ?? '',
    olusturma: tarihIso(k.kayitTarihi),
    guncelleme: tarihIso(k.guncellemeTarihi),
  };
}

export async function sistemAyarlariYanitOlustur(surum: string) {
  const ayarlar = await tumAyarlarOku(0);
  const bakim = ayarlar.bakim as {
    modu?: boolean;
    baslik?: string;
    mesaj?: string;
    gorselUrl?: string;
    tahminiSure?: string;
    ipBeyazListe?: string[];
  };
  const sayfa404 = ayarlar.sayfa404 as Record<string, unknown>;
  const yedekleme = ayarlar.yedekleme as { otomatik?: boolean; gun?: number; format?: string };
  const guvenlik = ayarlar.guvenlik as { basliklari?: boolean; robotsEngelle?: boolean };
  const scriptAyarlari = ayarlar.script as Record<string, string>;
  const sagTikPaneli = ayarlar.sagTikPaneli as Record<string, unknown>;
  const varsayilanAyarlar = ayarlar.varsayilanAyarlar as Record<string, unknown> | null;
  const panelGorunum = ayarlar.panelGorunum as { rollerTasarim?: string } | null;

  return {
    site: {
      ...VARSAYILAN_SITE,
      aktif: Boolean(ayarlar.siteAktif),
      domain: String(ayarlar.domain || '') || null,
    },
    sistem: {
      siteAktif: Boolean(ayarlar.siteAktif),
      domain: String(ayarlar.domain ?? ''),
      bakimModu: Boolean(bakim.modu),
      bakimBaslik: String(bakim.baslik ?? 'Bakim Calismasi'),
      bakimMesaji: String(bakim.mesaj ?? ''),
      bakimGorselUrl: String(bakim.gorselUrl ?? ''),
      bakimTahminiSure: String(bakim.tahminiSure ?? ''),
      bakimIpBeyazListe: Array.isArray(bakim.ipBeyazListe) ? bakim.ipBeyazListe : [],
      logSaklamaGun: Number(ayarlar.logSaklamaGun ?? 90),
      kenarlikRenk: String(ayarlar.kenarlikRenk ?? 'turuncu'),
      kenarlikNeon: Boolean(ayarlar.kenarlikNeon),
      panelDili: String(ayarlar.panelDili ?? 'tr'),
      panelCeviriler: ayarlar.panelCeviriler ?? {},
      sayfa404: {
        baslik: String(sayfa404.baslik ?? 'Sayfa Bulunamadi'),
        mesaj: String(sayfa404.mesaj ?? ''),
        gorselUrl: String(sayfa404.gorselUrl ?? ''),
        menuTipi: (sayfa404.menuTipi as string) ?? 'ust',
        oneriSayfaId: (sayfa404.oneriSayfaId as string | null) ?? null,
        anaSayfaButonu: sayfa404.anaSayfaButonu !== false,
      },
      otomatikYedekleme: Boolean(yedekleme.otomatik),
      otomatikYedeklemeGun: Number(yedekleme.gun ?? 7),
      yedeklemeFormati: yedekleme.format ?? 'json',
      guvenlikBasliklari: guvenlik.basliklari !== false,
      robotsEngelle: Boolean(guvenlik.robotsEngelle),
      sagTikPaneli,
      varsayilanAyarlar: varsayilanAyarlar ?? undefined,
      panelGorunum: panelGorunum ?? { rollerTasarim: 'yeni-renkli' },
      scriptAyarlari: {
        googleAnalytics: scriptAyarlari.googleAnalytics ?? '',
        headerScript: scriptAyarlari.headerScript ?? '',
        bodyAcilisScript: scriptAyarlari.bodyAcilisScript ?? '',
        footerScript: scriptAyarlari.footerScript ?? '',
      },
    },
    surum,
  };
}

export function rolSatirlarindanOzet(
  satirlar: Rol[],
  moduller: { id: number; prefix: string }[]
) {
  const prefixById = new Map(moduller.map((m) => [m.id, m.prefix]));
  const gruplar = new Map<
    string,
    { kod: string; baslik: string; modulYetkileri: Record<string, Set<string>> }
  >();

  for (const satir of satirlar) {
    const prefix = prefixById.get(satir.modulId) ?? String(satir.modulId);
    const mevcut = gruplar.get(satir.rolAdi) ?? {
      kod: satir.rolAdi,
      baslik: satir.rolAdi,
      modulYetkileri: {},
    };
    if (!mevcut.modulYetkileri[prefix]) mevcut.modulYetkileri[prefix] = new Set<string>();
    const liste = Array.isArray(satir.yetki) ? (satir.yetki as string[]) : [];
    for (const y of liste) {
      if (GECERLI_YETKILER.includes(y)) mevcut.modulYetkileri[prefix].add(y);
    }
    gruplar.set(satir.rolAdi, mevcut);
  }

  return [...gruplar.values()]
    .sort((a, b) => a.kod.localeCompare(b.kod))
    .map((g) => ({
      kod: g.kod,
      baslik: g.baslik,
      aciklama: '',
      modulYetkileri: Object.fromEntries(
        Object.entries(g.modulYetkileri).map(([prefix, set]) => [prefix, [...set]])
      ),
      sistemRolu: true,
    }));
}

export function yetkiListesiYanit() {
  return GECERLI_YETKILER.map((kod) => ({
    kod,
    etiket: YETKI_ETIKETLERI[kod] ?? kod,
  }));
}

export function adminFirmaYanit(f: Firma) {
  return {
    id: String(f.id),
    firmaKodu: f.firmaKodu,
    firmaAdi: f.firmaAdi,
    vergiDairesi: f.vergiDairesi ?? '',
    vergiNo: f.vergiNo ?? '',
    aktif: f.durum,
    olusturma: tarihIso(f.kayitTarihi),
    guncelleme: tarihIso(f.guncellemeTarihi),
  };
}

export function adminDonemYanit(d: Donem) {
  return {
    id: String(d.id),
    firmaId: String(d.firmaId),
    donemKodu: d.donemKodu,
    donemAdi: d.donemAdi,
    aktif: d.durum,
    olusturma: tarihIso(d.kayitTarihi),
    guncelleme: tarihIso(d.guncellemeTarihi),
  };
}

function adresMetni(s: {
  cadde?: string | null;
  sokak?: string | null;
  bina?: string | null;
  no?: string | null;
}) {
  return [s.cadde, s.sokak, s.bina, s.no].filter((p) => p && String(p).trim()).join(' ').trim();
}

export function adminSubeYanit(s: Sube) {
  return {
    id: String(s.id),
    firmaId: String(s.firmaId),
    subeKodu: s.subeKodu,
    subeAdi: s.subeAdi,
    il: s.il ?? '',
    ilce: s.ilce ?? '',
    mahalle: s.mahalle ?? '',
    postaKodu: s.postaKodu ?? '',
    adres: adresMetni(s),
    efaturaSeri: s.efaturaSeri ?? '',
    earsivSeri: s.earsivSeri ?? '',
    eirsaliyeSeri: s.eirsaliyeSeri ?? '',
    mersis: s.mersis ?? '',
    ticaretSicil: s.ticaretSicil ?? '',
    aktif: s.durum,
    olusturma: tarihIso(s.kayitTarihi),
    guncelleme: tarihIso(s.guncellemeTarihi),
  };
}

export function adminDepoYanit(d: Depo & { sube?: { subeKodu: string; subeAdi: string } | null }) {
  return {
    id: String(d.id),
    subeId: String(d.subeId),
    subeKodu: d.sube?.subeKodu ?? '',
    subeAdi: d.sube?.subeAdi ?? '',
    depoKodu: d.depoKodu,
    depoAdi: d.depoAdi,
    il: d.il ?? '',
    ilce: d.ilce ?? '',
    mahalle: d.mahalle ?? '',
    postaKodu: d.postaKodu ?? '',
    adres: adresMetni(d),
    aktif: d.durum,
    olusturma: tarihIso(d.kayitTarihi),
    guncelleme: tarihIso(d.guncellemeTarihi),
  };
}

export function adminKasaYanit(k: Kasa & { sube?: { subeKodu: string; subeAdi: string } | null }) {
  return {
    id: String(k.id),
    subeId: String(k.subeId),
    subeKodu: k.sube?.subeKodu ?? '',
    subeAdi: k.sube?.subeAdi ?? '',
    kasaKodu: k.kasaKodu,
    kasaAdi: k.kasaAdi,
    paraBirimi: k.paraBirimi,
    aktif: k.durum,
    olusturma: tarihIso(k.kayitTarihi),
    guncelleme: tarihIso(k.guncellemeTarihi),
  };
}

export function adminCariYanit(c: F001Cari) {
  return {
    id: String(c.id),
    firmaId: String(c.firmaId),
    ustId: c.ustId != null ? String(c.ustId) : '',
    cariTipi: c.cariTipi,
    isletmeTuru: c.isletmeTuru ?? '',
    cariKodu: c.cariKodu,
    cariAdi: c.cariAdi,
    unvan: c.unvan ?? '',
    yetkili: c.yetkili ?? '',
    vergiDairesi: c.vergiDairesi ?? '',
    vergiNo: c.vergiNo ?? '',
    il: c.il ?? '',
    ilce: c.ilce ?? '',
    adres: c.adres ?? '',
    telefon: c.telefon ?? '',
    eposta: c.eposta ?? '',
    web: c.web ?? '',
    efatura: c.efatura,
    efaturaTipi: c.efaturaTipi ?? '',
    alias: c.alias ?? '',
    aktif: c.durum,
    olusturma: tarihIso(c.kayitTarihi),
    guncelleme: tarihIso(c.guncellemeTarihi),
  };
}
