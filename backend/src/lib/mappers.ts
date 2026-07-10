import type { Depo, Donem, Firma, Kasa, Kullanici, Rol, Sube } from '@prisma/client';
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

export async function kullaniciYetkileriAl(kullanici: Kullanici): Promise<string[]> {
  const satirlar = await prisma.rol.findMany({
    where: { rolAdi: kullanici.rol, durum: true },
  });

  const birlesik = new Set<string>();
  for (const satir of satirlar) {
    const liste = Array.isArray(satir.yetki) ? (satir.yetki as string[]) : [];
    for (const y of liste) birlesik.add(y);
  }

  if (birlesik.size === 0 && kullanici.rol === 'YONETICI') {
    return [...GECERLI_YETKILER];
  }

  return [...birlesik];
}

export function tarihIso(d: Date): string {
  return d.toISOString();
}

export async function kullaniciYanit(k: Kullanici, yetkiler: string[]) {
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
  const firma = tam?.firma;
  const donem = tam?.donem;
  const sube = tam?.sube;
  const kasa = tam?.kasa;

  return {
    id: kayit.id,
    kullaniciKodu: kayit.kullaniciKodu,
    ad: kayit.adSoyad,
    rol: kayit.rol,
    yetkiler,
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
  return {
    id: k.id,
    kullaniciKodu: k.kullaniciKodu,
    ad: k.adSoyad,
    rol: k.rol,
    aktif: k.durum,
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

export function rolSatirlarindanOzet(satirlar: Rol[]) {
  const gruplar = new Map<string, { kod: string; baslik: string; yetkiler: Set<string> }>();

  for (const satir of satirlar) {
    const mevcut = gruplar.get(satir.rolAdi) ?? {
      kod: satir.rolAdi,
      baslik: satir.rolAdi,
      yetkiler: new Set<string>(),
    };
    const liste = Array.isArray(satir.yetki) ? (satir.yetki as string[]) : [];
    for (const y of liste) mevcut.yetkiler.add(y);
    gruplar.set(satir.rolAdi, mevcut);
  }

  return [...gruplar.values()]
    .sort((a, b) => a.kod.localeCompare(b.kod))
    .map((g) => ({
      kod: g.kod,
      baslik: g.baslik,
      aciklama: '',
      yetkiler: [...g.yetkiler].filter((y) => GECERLI_YETKILER.includes(y)),
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
    id: f.id,
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
    id: d.id,
    firmaId: d.firmaId,
    donemKodu: d.donemKodu,
    donemAdi: d.donemAdi,
    aktif: d.durum,
    olusturma: tarihIso(d.kayitTarihi),
    guncelleme: tarihIso(d.guncellemeTarihi),
  };
}

export function adminSubeYanit(s: Sube) {
  return {
    id: s.id,
    firmaId: s.firmaId,
    subeKodu: s.subeKodu,
    subeAdi: s.subeAdi,
    il: s.il ?? '',
    ilce: s.ilce ?? '',
    mahalle: s.mahalle ?? '',
    cadde: s.cadde ?? '',
    sokak: s.sokak ?? '',
    bina: s.bina ?? '',
    no: s.no ?? '',
    postaKodu: s.postaKodu ?? '',
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
    id: d.id,
    subeId: d.subeId,
    subeKodu: d.sube?.subeKodu ?? '',
    subeAdi: d.sube?.subeAdi ?? '',
    depoKodu: d.depoKodu,
    depoAdi: d.depoAdi,
    il: d.il ?? '',
    ilce: d.ilce ?? '',
    mahalle: d.mahalle ?? '',
    cadde: d.cadde ?? '',
    sokak: d.sokak ?? '',
    bina: d.bina ?? '',
    no: d.no ?? '',
    postaKodu: d.postaKodu ?? '',
    aktif: d.durum,
    olusturma: tarihIso(d.kayitTarihi),
    guncelleme: tarihIso(d.guncellemeTarihi),
  };
}

export function adminKasaYanit(k: Kasa & { sube?: { subeKodu: string; subeAdi: string } | null }) {
  return {
    id: k.id,
    subeId: k.subeId,
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
