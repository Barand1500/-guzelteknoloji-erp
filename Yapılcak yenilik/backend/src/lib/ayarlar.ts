import { prisma } from './prisma.js';

/** 0 = merkez/panel genel ayarlar */
export const MERKEZ_SUBE_ID = 0;

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
  const s = String(deger ?? 'mavi').trim();
  if (s === 'turuncu' || s === 'mavi') return s;
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return 'mavi';
}

async function ayarKaydet(subeId: number, anahtar: AyarAnahtar, deger: unknown) {
  await prisma.ayar.upsert({
    where: { subeId_anahtar: { subeId, anahtar } },
    create: { subeId, anahtar, deger: deger as object },
    update: { deger: deger as object },
  });
}

async function ayarOku<T>(subeId: number, anahtar: AyarAnahtar, varsayilan: T): Promise<T> {
  const kayit = await prisma.ayar.findUnique({
    where: { subeId_anahtar: { subeId, anahtar } },
  });
  if (!kayit) return varsayilan;
  return kayit.deger as T;
}

export async function tumAyarlarOku(subeId = MERKEZ_SUBE_ID) {
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
    ayarOku(subeId, AYAR_ANAHTARLARI.siteAktif, true),
    ayarOku(subeId, AYAR_ANAHTARLARI.domain, ''),
    ayarOku(subeId, AYAR_ANAHTARLARI.bakim, {
      modu: false,
      baslik: 'Bakim Calismasi',
      mesaj: 'Site gecici olarak bakimda.',
      gorselUrl: '',
      tahminiSure: '',
      ipBeyazListe: [] as string[],
    }),
    ayarOku(subeId, AYAR_ANAHTARLARI.sayfa404, {
      baslik: 'Sayfa Bulunamadi',
      mesaj: 'Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.',
      gorselUrl: '',
      menuTipi: 'ust',
      oneriSayfaId: null,
      anaSayfaButonu: true,
    }),
    ayarOku(subeId, AYAR_ANAHTARLARI.panelDili, 'tr'),
    ayarOku(subeId, AYAR_ANAHTARLARI.panelCeviriler, {} as Record<string, Record<string, string>>),
    ayarOku(subeId, AYAR_ANAHTARLARI.logSaklamaGun, 90),
    ayarOku(subeId, AYAR_ANAHTARLARI.kenarlikRenk, 'mavi'),
    ayarOku(subeId, AYAR_ANAHTARLARI.kenarlikNeon, false),
    ayarOku(subeId, AYAR_ANAHTARLARI.yedekleme, {
      otomatik: false,
      gun: 7,
      format: 'json',
    }),
    ayarOku(subeId, AYAR_ANAHTARLARI.guvenlik, {
      basliklari: true,
      robotsEngelle: false,
    }),
    ayarOku(subeId, AYAR_ANAHTARLARI.script, {
      googleAnalytics: '',
      headerScript: '',
      bodyAcilisScript: '',
      footerScript: '',
    }),
    ayarOku(subeId, AYAR_ANAHTARLARI.sagTikPaneli, { aktif: true, ogeler: [], modulIdler: [] }),
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

export async function ayarlariFormdanKaydet(form: Record<string, unknown>, subeId = MERKEZ_SUBE_ID) {
  const bakim = {
    modu: Boolean(form.bakimModu),
    baslik: String(form.bakimBaslik ?? ''),
    mesaj: String(form.bakimMesaji ?? ''),
    gorselUrl: String(form.bakimGorselUrl ?? ''),
    tahminiSure: String(form.bakimTahminiSure ?? ''),
    ipBeyazListe: Array.isArray(form.bakimIpBeyazListe) ? form.bakimIpBeyazListe : [],
  };

  await Promise.all([
    ayarKaydet(subeId, AYAR_ANAHTARLARI.bakim, bakim),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.sayfa404, form.sayfa404 ?? {}),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.panelDili, String(form.panelDili ?? 'tr')),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.panelCeviriler, form.panelCeviriler ?? {}),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.logSaklamaGun, Number(form.logSaklamaGun ?? 90)),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.kenarlikRenk, kenarlikRenkDogrula(form.kenarlikRenk)),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.kenarlikNeon, form.kenarlikNeon === true),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.yedekleme, {
      otomatik: Boolean(form.otomatikYedekleme),
      gun: Number(form.otomatikYedeklemeGun ?? 7),
      format: String(form.yedeklemeFormati ?? 'json'),
    }),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.guvenlik, {
      basliklari: form.guvenlikBasliklari !== false,
      robotsEngelle: Boolean(form.robotsEngelle),
    }),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.script, form.scriptAyarlari ?? {}),
    ayarKaydet(subeId, AYAR_ANAHTARLARI.sagTikPaneli, form.sagTikPaneli ?? {}),
  ]);
}

export async function varsayilanAyarlarOlustur(subeId = MERKEZ_SUBE_ID) {
  const mevcut = await prisma.ayar.count({ where: { subeId } });
  if (mevcut > 0) return;

  await ayarlariFormdanKaydet(
    {
      bakimModu: false,
      bakimBaslik: 'Bakim Calismasi',
      bakimMesaji: 'Site gecici olarak bakimda. Lutfen daha sonra tekrar deneyin.',
      logSaklamaGun: 90,
      kenarlikRenk: 'mavi',
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
    subeId
  );

  await ayarKaydet(subeId, AYAR_ANAHTARLARI.siteAktif, true);
  await ayarKaydet(subeId, AYAR_ANAHTARLARI.domain, '');
}
