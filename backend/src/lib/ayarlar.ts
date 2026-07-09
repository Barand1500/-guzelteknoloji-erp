import { prisma } from './prisma.js';

/** 0 = panel genel ayarlar */
export const PANEL_FIRMA_ID = 0;

export const AYAR_ANAHTARLARI = {
  siteAktif: 'site_aktif',
  domain: 'domain',
  bakim: 'bakim',
  sayfa404: 'sayfa_404',
  panelDili: 'panel_dili',
  panelCeviriler: 'panel_ceviriler',
  logSaklamaGun: 'log_saklama_gun',
  kenarlikRenk: 'kenarlik_renk',
  kenarlikNeon: 'kenarlik_neon',
  yedekleme: 'yedekleme',
  guvenlik: 'guvenlik',
  script: 'script',
  sagTikPaneli: 'sag_tik_paneli',
} as const;

type AyarAnahtar = (typeof AYAR_ANAHTARLARI)[keyof typeof AYAR_ANAHTARLARI];

function kenarlikRenkDogrula(deger: unknown): string {
  const s = String(deger ?? 'turuncu').trim();
  if (s === 'turuncu' || s === 'mavi') return s;
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return 'turuncu';
}

async function ayarKaydet(firmaId: number, anahtar: AyarAnahtar, deger: unknown) {
  await prisma.ayar.upsert({
    where: { firmaId_anahtar: { firmaId, anahtar } },
    create: { firmaId, anahtar, deger: deger as object },
    update: { deger: deger as object },
  });
}

async function ayarOku<T>(firmaId: number, anahtar: AyarAnahtar, varsayilan: T): Promise<T> {
  const kayit = await prisma.ayar.findUnique({
    where: { firmaId_anahtar: { firmaId, anahtar } },
  });
  if (!kayit) return varsayilan;
  return kayit.deger as T;
}

export async function tumAyarlarOku(firmaId = PANEL_FIRMA_ID) {
  const [
    siteAktif,
    domain,
    bakim,
    sayfa404,
    panelDili,
    panelCeviriler,
    logSaklamaGun,
    kenarlikRenk,
    kenarlikNeon,
    yedekleme,
    guvenlik,
    script,
    sagTikPaneli,
  ] = await Promise.all([
    ayarOku(firmaId, AYAR_ANAHTARLARI.siteAktif, true),
    ayarOku(firmaId, AYAR_ANAHTARLARI.domain, ''),
    ayarOku(firmaId, AYAR_ANAHTARLARI.bakim, {
      modu: false,
      baslik: 'Bakim Calismasi',
      mesaj: 'Site gecici olarak bakimda.',
      gorselUrl: '',
      tahminiSure: '',
      ipBeyazListe: [] as string[],
    }),
    ayarOku(firmaId, AYAR_ANAHTARLARI.sayfa404, {
      baslik: 'Sayfa Bulunamadi',
      mesaj: 'Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.',
      gorselUrl: '',
      menuTipi: 'ust',
      oneriSayfaId: null,
      anaSayfaButonu: true,
    }),
    ayarOku(firmaId, AYAR_ANAHTARLARI.panelDili, 'tr'),
    ayarOku(firmaId, AYAR_ANAHTARLARI.panelCeviriler, {} as Record<string, Record<string, string>>),
    ayarOku(firmaId, AYAR_ANAHTARLARI.logSaklamaGun, 90),
    ayarOku(firmaId, AYAR_ANAHTARLARI.kenarlikRenk, 'turuncu'),
    ayarOku(firmaId, AYAR_ANAHTARLARI.kenarlikNeon, false),
    ayarOku(firmaId, AYAR_ANAHTARLARI.yedekleme, {
      otomatik: false,
      gun: 7,
      format: 'json',
    }),
    ayarOku(firmaId, AYAR_ANAHTARLARI.guvenlik, {
      basliklari: true,
      robotsEngelle: false,
    }),
    ayarOku(firmaId, AYAR_ANAHTARLARI.script, {
      googleAnalytics: '',
      headerScript: '',
      bodyAcilisScript: '',
      footerScript: '',
    }),
    ayarOku(firmaId, AYAR_ANAHTARLARI.sagTikPaneli, { aktif: true, ogeler: [], modulIdler: [] }),
  ]);

  return {
    siteAktif,
    domain,
    bakim,
    sayfa404,
    panelDili,
    panelCeviriler,
    logSaklamaGun,
    kenarlikRenk,
    kenarlikNeon,
    yedekleme,
    guvenlik,
    script,
    sagTikPaneli,
  };
}

export async function ayarlariFormdanKaydet(form: Record<string, unknown>, firmaId = PANEL_FIRMA_ID) {
  const bakim = {
    modu: Boolean(form.bakimModu),
    baslik: String(form.bakimBaslik ?? ''),
    mesaj: String(form.bakimMesaji ?? ''),
    gorselUrl: String(form.bakimGorselUrl ?? ''),
    tahminiSure: String(form.bakimTahminiSure ?? ''),
    ipBeyazListe: Array.isArray(form.bakimIpBeyazListe) ? form.bakimIpBeyazListe : [],
  };

  await Promise.all([
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.bakim, bakim),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.sayfa404, form.sayfa404 ?? {}),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.panelDili, String(form.panelDili ?? 'tr')),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.panelCeviriler, form.panelCeviriler ?? {}),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.logSaklamaGun, Number(form.logSaklamaGun ?? 90)),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.kenarlikRenk, kenarlikRenkDogrula(form.kenarlikRenk)),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.kenarlikNeon, form.kenarlikNeon === true),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.yedekleme, {
      otomatik: Boolean(form.otomatikYedekleme),
      gun: Number(form.otomatikYedeklemeGun ?? 7),
      format: String(form.yedeklemeFormati ?? 'json'),
    }),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.guvenlik, {
      basliklari: form.guvenlikBasliklari !== false,
      robotsEngelle: Boolean(form.robotsEngelle),
    }),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.script, form.scriptAyarlari ?? {}),
    ayarKaydet(firmaId, AYAR_ANAHTARLARI.sagTikPaneli, form.sagTikPaneli ?? {}),
  ]);
}

export async function varsayilanAyarlarOlustur(firmaId = PANEL_FIRMA_ID) {
  const mevcut = await prisma.ayar.count({ where: { firmaId } });
  if (mevcut > 0) return;

  await ayarlariFormdanKaydet(
    {
      bakimModu: false,
      bakimBaslik: 'Bakim Calismasi',
      bakimMesaji: 'Site gecici olarak bakimda. Lutfen daha sonra tekrar deneyin.',
      logSaklamaGun: 90,
      kenarlikRenk: 'turuncu',
      kenarlikNeon: false,
      panelDili: 'tr',
      otomatikYedekleme: false,
      otomatikYedeklemeGun: 7,
      yedeklemeFormati: 'json',
      guvenlikBasliklari: true,
      robotsEngelle: false,
      sayfa404: {
        baslik: 'Sayfa Bulunamadi',
        mesaj: 'Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.',
        gorselUrl: '',
        menuTipi: 'ust',
        oneriSayfaId: null,
        anaSayfaButonu: true,
      },
      sagTikPaneli: { aktif: true, ogeler: [], modulIdler: [] },
      scriptAyarlari: {
        googleAnalytics: '',
        headerScript: '',
        bodyAcilisScript: '',
        footerScript: '',
      },
    },
    firmaId
  );

  await ayarKaydet(firmaId, AYAR_ANAHTARLARI.siteAktif, true);
  await ayarKaydet(firmaId, AYAR_ANAHTARLARI.domain, '');
}
