import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { offlineKullanici } from '@/admin/ortak/api/authApi';
import { tanimlarSeedKayitlari } from '@/admin/baslat-menusu/tanimlar/tanimlarModulleri';
import { raporlarSeedKayitlari } from '@/admin/baslat-menusu/raporlar/raporlarModulleri';
import { paketServisiRaporlariSeedKayitlari } from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiRaporlariModulleri';
import { rezervasyonRaporlariSeedKayitlari } from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonRaporlariModulleri';
import { uygulamaAyarlarSeedKayitlari } from '@/admin/baslat-menusu/uygulama-ayarlari/uygulamaAyarlarModulleri';

const OFFLINE_SISTEM_ANAHTAR = 'restorant-offline-sistem-ayarlari';
const OFFLINE_SEKME_ANAHTAR = 'restorant-offline-sekme-ayarlari';
const OFFLINE_KISAYOL_ANAHTAR = 'restorant-offline-kisayol-ayarlari';
const OFFLINE_MODUL_ANAHTAR = 'restorant-offline-moduller';
const OFFLINE_BAYI_ANAHTAR = 'restorant-offline-bayiler';
const OFFLINE_FIRMA_ANAHTAR = 'restorant-offline-firmalar';
const OFFLINE_SUBE_ANAHTAR = 'restorant-offline-subeler';
const OFFLINE_PAKET_ANAHTAR = 'restorant-offline-paketler';
const OFFLINE_LISANS_ANAHTAR = 'restorant-offline-lisanslar';
const OFFLINE_KULLANICI_ANAHTAR = 'restorant-offline-kullanicilar';
const OFFLINE_LOG_ANAHTAR = 'restorant-offline-loglar';
const OFFLINE_LOG_LIMIT = 500;

interface OfflineModul {
  id: number;
  ad: string;
  prefix: string;
  aktif: boolean;
  rolSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineBayi {
  id: number;
  unvan: string;
  ustId: number | null;
  ustUnvan: string | null;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  firmaSayisi: number;
  altBayiSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineFirma {
  id: number;
  bayiId: number;
  bayiUnvan: string;
  tabelaAdi: string | null;
  unvan: string;
  il: string | null;
  ilce: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  subeSayisi: number;
  lisansDurum: 'aktif' | 'pasif' | 'yakinda' | 'yok';
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineSube {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  subeAdi: string;
  subeTipi: 'restoran' | 'kafe' | 'fast_food' | 'diger';
  il: string | null;
  ilce: string | null;
  adres: string | null;
  telefon: string | null;
  gsm: string | null;
  eposta: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  iskonto: number | null;
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflinePaket {
  id: number;
  paketAdi: string;
  subeSayisi: number;
  personelSayisi: number;
  masaSayisi: number;
  fiyat: number;
  paraBirimi?: string;
  aktif: boolean;
  aktifLisansSayisi: number;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineLisans {
  id: number;
  firmaId: number;
  firmaUnvan: string;
  firmaTabela: string | null;
  paketId: number;
  paketAdi: string;
  baslangicTarihi: string;
  bitisTarihi: string | null;
  durum: 'aktif' | 'pasif' | 'yakinda';
  aktif: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

interface OfflineMasterKullanici {
  id: number;
  ad: string;
  eposta: string;
  gsm: string | null;
  rol: string;
  kullaniciTipi: 'merkez' | 'bayi' | 'firma' | 'sube';
  bayiId: number | null;
  bayiUnvan: string | null;
  firmaId: number | null;
  firmaUnvan: string | null;
  firmaTabela: string | null;
  subeId: number | null;
  subeAdi: string | null;
  iskonto: number | null;
  aktif: boolean;
  sonGirisTarihi: string | null;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

const VARSAYILAN_OFFLINE_MODULLER: OfflineModul[] = [
  { id: 1, ad: 'Master', prefix: 'master', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 2, ad: 'Kullanicilar', prefix: 'kullanicilar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 3, ad: 'Roller', prefix: 'roller', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  ...tanimlarSeedKayitlari().map((t, i) => ({
    id: 100 + i,
    ad: t.modulAdi,
    prefix: t.prefix,
    aktif: true,
    rolSayisi: 6,
    kayitTarihi: '',
    guncellemeTarihi: '',
  })),
  ...raporlarSeedKayitlari().map((r, i) => ({
    id: 200 + i,
    ad: r.modulAdi,
    prefix: r.prefix,
    aktif: true,
    rolSayisi: 6,
    kayitTarihi: '',
    guncellemeTarihi: '',
  })),
  ...paketServisiRaporlariSeedKayitlari().map((r, i) => ({
    id: 300 + i,
    ad: r.modulAdi,
    prefix: r.prefix,
    aktif: true,
    rolSayisi: 6,
    kayitTarihi: '',
    guncellemeTarihi: '',
  })),
  ...rezervasyonRaporlariSeedKayitlari().map((r, i) => ({
    id: 400 + i,
    ad: r.modulAdi,
    prefix: r.prefix,
    aktif: true,
    rolSayisi: 6,
    kayitTarihi: '',
    guncellemeTarihi: '',
  })),
  ...uygulamaAyarlarSeedKayitlari().map((r, i) => ({
    id: 500 + i,
    ad: r.modulAdi,
    prefix: r.prefix,
    aktif: true,
    rolSayisi: 6,
    kayitTarihi: '',
    guncellemeTarihi: '',
  })),
  { id: 4, ad: 'Ayarlar', prefix: 'ayarlar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 5, ad: 'Sekme Yonetimi', prefix: 'sekme_yonetimi', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 6, ad: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
];

const OFFLINE_YETKILER = [
  { kod: 'goruntuleme', etiket: 'Görüntüleme' },
  { kod: 'ekleme', etiket: 'Ekleme' },
  { kod: 'duzenleme', etiket: 'Düzenleme' },
  { kod: 'silme', etiket: 'Silme' },
  { kod: 'kullanici_yonetimi', etiket: 'Kullanıcı Yönetimi' },
] as const;

const OFFLINE_ROLLER = [
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tum sitelere tam erisim',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
    sistemRolu: true,
  },
  {
    kod: 'EDITOR',
    baslik: 'Editor',
    aciklama: 'Icerik duzenleme',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'],
    sistemRolu: true,
  },
];

/** Backend olmadan admin sayfalarının boş açılması için minimal yanıtlar */
export function offlineAdminYanit(path: string, method: string, body?: BodyInit | null): unknown {
  const m = method.toUpperCase();
  const p = path.split('?')[0];

  if (m !== 'GET') {
    if (p.includes('/kullanicilar')) {
      return offlineKullaniciYaz(body, m, p);
    }
    if (p.includes('/roller')) {
      return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER] };
    }
    if (p.includes('/sistem-ayarlari')) {
      if (m === 'PUT' && typeof body === 'string') {
        try {
          const form = JSON.parse(body) as SistemAyarlariForm;
          offlineSistemKaydet(form);
          return offlineSistemAyarlari(form);
        } catch {
          return offlineSistemAyarlari();
        }
      }
      return offlineSistemAyarlari();
    }
    if (p.includes('/moduller')) {
      return offlineModulYaz(body, m, p);
    }
    if (p.includes('/bayiler')) {
      return offlineBayiYaz(body, m, p);
    }
    if (p.includes('/firmalar')) {
      return offlineFirmaYaz(body, m, p);
    }
    if (p.includes('/subeler')) {
      return offlineSubeYaz(body, m, p);
    }
    if (p.includes('/paketler')) {
      return offlinePaketYaz(body, m, p);
    }
    if (p.includes('/lisanslar')) {
      return offlineLisansYaz(body, m, p);
    }
    if (p.includes('/loglar')) {
      return offlineLogYaz(body, m, p);
    }
    if (p.includes('/kullanici-ayarlari')) {
      return offlineKullaniciAyarlariYaz(p, m, body);
    }
    return { mesaj: 'Kayıt (offline mod)' };
  }

  if (p.includes('/moduller')) return offlineModulListe();
  if (p.includes('/bayiler')) return offlineBayiListe();
  if (p.includes('/firmalar')) return offlineFirmaListe();
  if (p.includes('/subeler')) return offlineSubeListe();
  if (p.includes('/paketler')) return offlinePaketListe();
  if (p.includes('/lisanslar')) return offlineLisansListe();

  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar/master')) return offlineMasterKullaniciListe();
  if (p.includes('/kullanicilar')) return { kullanicilar: [] };
  if (p.includes('/sayfalar') || p.endsWith('/menu')) return { sayfalar: [] };
  if (p.includes('/roller/yetkiler')) return { yetkiler: [] };
  if (p.includes('/roller')) {
    return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER] };
  }
  if (p.includes('/loglar')) return offlineLogListe();
  if (p.includes('/yedek/varsayilan-dosya-adi')) return { dosyaAdi: 'restorant-yedek.json' };
  if (p.includes('/yedek/gecmis')) return { kayitlar: [], sonKayit: null };
  if (p.includes('/sistem-ayarlari')) return offlineSistemAyarlari();
  if (p.includes('/kullanici-ayarlari/sekme')) return { ayarlar: offlineSekmeOku() };
  if (p.includes('/kullanici-ayarlari/kisayol')) return { harita: offlineKisayolOku() };
  if (p.includes('/bildirim')) return { bildirimler: [], okunmamisSayi: 0 };
  if (p.includes('/eklentiler')) return { eklentiler: [] };

  return {};
}

function offlineSistemOku(): Partial<SistemAyarlariForm> {
  try {
    const ham = localStorage.getItem(OFFLINE_SISTEM_ANAHTAR);
    if (ham) return JSON.parse(ham) as Partial<SistemAyarlariForm>;
  } catch {
    /* bozuk kayıt */
  }
  return {};
}

function offlineSistemKaydet(form: SistemAyarlariForm) {
  localStorage.setItem(OFFLINE_SISTEM_ANAHTAR, JSON.stringify(form));
}

function offlineKullaniciDepoAnahtari(temel: string) {
  return `${temel}_${offlineKullanici().id}`;
}

function offlineSekmeOku(): Record<string, unknown> {
  try {
    const ham = localStorage.getItem(offlineKullaniciDepoAnahtari(OFFLINE_SEKME_ANAHTAR));
    if (ham) return JSON.parse(ham) as Record<string, unknown>;
  } catch {
    /* bozuk kayıt */
  }
  return {};
}

function offlineSekmeKaydet(ayarlar: Record<string, unknown>) {
  localStorage.setItem(offlineKullaniciDepoAnahtari(OFFLINE_SEKME_ANAHTAR), JSON.stringify(ayarlar));
}

function offlineKisayolOku(): Record<string, unknown> {
  try {
    const ham = localStorage.getItem(offlineKullaniciDepoAnahtari(OFFLINE_KISAYOL_ANAHTAR));
    if (ham) return JSON.parse(ham) as Record<string, unknown>;
  } catch {
    /* bozuk kayıt */
  }
  return {};
}

function offlineKisayolKaydet(harita: Record<string, unknown>) {
  localStorage.setItem(offlineKullaniciDepoAnahtari(OFFLINE_KISAYOL_ANAHTAR), JSON.stringify(harita));
}

function offlineKullaniciAyarlariYaz(path: string, method: string, body?: BodyInit | null) {
  if (path.includes('/sekme')) {
    if (method === 'PUT' && typeof body === 'string') {
      try {
        const { ayarlar } = JSON.parse(body) as { ayarlar?: Record<string, unknown> };
        if (ayarlar && typeof ayarlar === 'object') {
          offlineSekmeKaydet(ayarlar);
          return { ayarlar };
        }
      } catch {
        /* geçersiz gövde */
      }
    }
    return { ayarlar: offlineSekmeOku() };
  }

  if (path.includes('/kisayol')) {
    if (method === 'PUT' && typeof body === 'string') {
      try {
        const { harita } = JSON.parse(body) as { harita?: Record<string, unknown> };
        if (harita && typeof harita === 'object') {
          offlineKisayolKaydet(harita);
          return { harita };
        }
      } catch {
        /* geçersiz gövde */
      }
    }
    return { harita: offlineKisayolOku() };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineSistemAyarlari(form?: Partial<SistemAyarlariForm>) {
  const sistem = form ?? offlineSistemOku();
  return {
    site: {
      id: '1',
      ad: 'Restorant',
      slug: 'restorant',
      domain: null,
      aktif: form?.siteAktif ?? (sistem as SistemAyarlariForm).siteAktif ?? true,
    },
    sistem,
    surum: '0.1.0-offline',
  };
}

function offlineModulVarsayilan(): OfflineModul[] {
  const simdi = new Date().toISOString();
  return VARSAYILAN_OFFLINE_MODULLER.map((m) => ({
    ...m,
    kayitTarihi: simdi,
    guncellemeTarihi: simdi,
  }));
}

function offlineModulOku(): OfflineModul[] {
  const varsayilan = offlineModulVarsayilan();
  try {
    const ham = localStorage.getItem(OFFLINE_MODUL_ANAHTAR);
    if (ham) {
      const kayitli = JSON.parse(ham) as OfflineModul[];
      const prefixler = new Set(kayitli.map((m) => m.prefix));
      const eksik = varsayilan.filter((m) => !prefixler.has(m.prefix));
      if (eksik.length > 0) {
        const birlesik = [...kayitli, ...eksik];
        offlineModulKaydet(birlesik);
        return birlesik;
      }
      return kayitli;
    }
  } catch {
    /* bozuk kayıt */
  }
  return varsayilan;
}

function offlineModulKaydet(liste: OfflineModul[]) {
  localStorage.setItem(OFFLINE_MODUL_ANAHTAR, JSON.stringify(liste));
}

function offlineModulListe() {
  const moduller = offlineModulOku();
  return {
    moduller,
    ozet: {
      toplam: moduller.length,
      aktif: moduller.filter((m) => m.aktif).length,
      pasif: moduller.filter((m) => !m.aktif).length,
    },
  };
}

function offlineModulYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineModulOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as { modulAdi?: string; prefix?: string; aktif?: boolean };
    const ad = girdi.modulAdi?.trim() ?? 'Yeni Modul';
    const prefix = girdi.prefix?.trim() ?? `modul_${liste.length + 1}`;
    const modul: OfflineModul = {
      id: Math.max(0, ...liste.map((m) => m.id)) + 1,
      ad,
      prefix,
      aktif: girdi.aktif !== false,
      rolSayisi: 6,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineModulKaydet([...liste, modul]);
    return { modul };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as { aktif?: boolean; modulAdi?: string; prefix?: string };
    const idx = liste.findIndex((m) => m.id === id);
    if (idx < 0) return { mesaj: 'Modul bulunamadi' };
    const guncel = {
      ...liste[idx],
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      ...(girdi.modulAdi ? { ad: girdi.modulAdi.trim() } : {}),
      ...(girdi.prefix ? { prefix: girdi.prefix.trim() } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineModulKaydet(yeni);
    return { modul: guncel };
  }

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const yeni = liste.filter((m) => m.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Modul bulunamadi' };
    offlineModulKaydet(yeni);
    return { mesaj: 'Modul silindi' };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineBayiOku(): OfflineBayi[] {
  try {
    const ham = localStorage.getItem(OFFLINE_BAYI_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineBayi[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      unvan: 'Guzel Teknoloji',
      ustId: null,
      ustUnvan: null,
      il: 'Istanbul',
      ilce: null,
      adres: null,
      telefon: null,
      gsm: null,
      eposta: 'info@guzelteknoloji.com',
      vergiDairesi: null,
      vergiNo: null,
      iskonto: null,
      aktif: true,
      firmaSayisi: 1,
      altBayiSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineBayiKaydet(liste: OfflineBayi[]) {
  localStorage.setItem(OFFLINE_BAYI_ANAHTAR, JSON.stringify(liste));
}

function offlineBayiListe() {
  const bayiler = offlineBayiOku();
  return {
    bayiler,
    ozet: {
      toplam: bayiler.length,
      aktif: bayiler.filter((b) => b.aktif).length,
      pasif: bayiler.filter((b) => !b.aktif).length,
      toplamFirma: bayiler.reduce((s, b) => s + b.firmaSayisi, 0),
      altBayi: bayiler.filter((b) => b.ustId != null).length,
    },
  };
}

function offlineBayiYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineBayiOku();
  const simdi = new Date().toISOString();

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const bayi = liste.find((b) => b.id === id);
    if (!bayi) return { mesaj: 'Bayi bulunamadi' };
    if (bayi.firmaSayisi > 0) return { mesaj: 'Firmalari olan bayi silinemez' };
    if (bayi.altBayiSayisi > 0) return { mesaj: 'Alt bayileri olan bayi silinemez' };
    offlineBayiKaydet(liste.filter((b) => b.id !== id));
    return { mesaj: 'Silindi' };
  }

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      unvan?: string;
      ustId?: number | null;
      il?: string;
      ilce?: string;
      adres?: string;
      eposta?: string;
      telefon?: string;
      gsm?: string;
      vergiDairesi?: string;
      vergiNo?: string;
      iskonto?: number | null;
    };
    const ust = girdi.ustId ? liste.find((b) => b.id === girdi.ustId) : null;
    const iskontoHam = girdi.iskonto;
    const iskonto =
      iskontoHam != null && !Number.isNaN(Number(iskontoHam)) ? Number(iskontoHam) : null;
    const bayi: OfflineBayi = {
      id: Math.max(0, ...liste.map((b) => b.id)) + 1,
      unvan: girdi.unvan?.trim() ?? 'Yeni Bayi',
      ustId: girdi.ustId ?? null,
      ustUnvan: ust?.unvan ?? null,
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      adres: girdi.adres?.trim() ?? null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      vergiDairesi: girdi.vergiDairesi?.trim() ?? null,
      vergiNo: girdi.vergiNo?.trim() ?? null,
      iskonto,
      aktif: true,
      firmaSayisi: 0,
      altBayiSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineBayiKaydet([...liste, bayi]);
    return { bayi };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineBayi> & { aktif?: boolean };
    const idx = liste.findIndex((b) => b.id === id);
    if (idx < 0) return { mesaj: 'Bayi bulunamadi' };
    const ust = girdi.ustId ? liste.find((b) => b.id === girdi.ustId) : liste[idx].ustId ? liste.find((b) => b.id === liste[idx].ustId) : null;
    const iskontoGuncel =
      girdi.iskonto !== undefined
        ? girdi.iskonto == null || Number.isNaN(Number(girdi.iskonto))
          ? null
          : Number(girdi.iskonto)
        : liste[idx].iskonto;
    const guncel: OfflineBayi = {
      ...liste[idx],
      ...(girdi.unvan ? { unvan: girdi.unvan.trim() } : {}),
      ...(girdi.ustId !== undefined ? { ustId: girdi.ustId, ustUnvan: ust?.unvan ?? null } : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.adres !== undefined ? { adres: girdi.adres } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...(girdi.vergiDairesi !== undefined ? { vergiDairesi: girdi.vergiDairesi } : {}),
      ...(girdi.vergiNo !== undefined ? { vergiNo: girdi.vergiNo } : {}),
      ...(girdi.iskonto !== undefined ? { iskonto: iskontoGuncel } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineBayiKaydet(yeni);
    return { bayi: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineFirmaOku(): OfflineFirma[] {
  try {
    const ham = localStorage.getItem(OFFLINE_FIRMA_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineFirma[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      bayiId: 1,
      bayiUnvan: 'Guzel Teknoloji',
      tabelaAdi: 'Demo Restoran',
      unvan: 'Demo Restoran Grubu',
      il: 'Istanbul',
      ilce: null,
      telefon: null,
      gsm: null,
      eposta: 'demo@restoran.local',
      vergiDairesi: 'Kadıköy',
      vergiNo: '1234567890',
      iskonto: 5,
      aktif: true,
      subeSayisi: 1,
      lisansDurum: 'aktif',
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineFirmaKaydet(liste: OfflineFirma[]) {
  localStorage.setItem(OFFLINE_FIRMA_ANAHTAR, JSON.stringify(liste));
}

function offlineFirmaListe() {
  return { firmalar: offlineFirmaOku() };
}

function offlineFirmaYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineFirmaOku();
  const bayiler = offlineBayiOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      bayiId?: number;
      unvan?: string;
      tabelaAdi?: string;
      il?: string;
      ilce?: string;
      eposta?: string;
      telefon?: string;
      gsm?: string;
      vergiDairesi?: string;
      vergiNo?: string;
      iskonto?: number | null;
      aktif?: boolean;
    };
    const bayi = bayiler.find((b) => b.id === girdi.bayiId);
    const firma: OfflineFirma = {
      id: Math.max(0, ...liste.map((f) => f.id)) + 1,
      bayiId: girdi.bayiId ?? 1,
      bayiUnvan: bayi?.unvan ?? 'Bayi',
      tabelaAdi: girdi.tabelaAdi?.trim() ?? null,
      unvan: girdi.unvan?.trim() ?? 'Yeni Firma',
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      vergiDairesi: girdi.vergiDairesi?.trim() ?? null,
      vergiNo: girdi.vergiNo?.trim() ?? null,
      iskonto: girdi.iskonto ?? null,
      aktif: girdi.aktif !== false,
      subeSayisi: 0,
      lisansDurum: 'yok',
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineFirmaKaydet([...liste, firma]);
    return { firma };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineFirma> & {
      bayiId?: number;
      aktif?: boolean;
      vergiDairesi?: string;
      vergiNo?: string;
      iskonto?: number | null;
    };
    const idx = liste.findIndex((f) => f.id === id);
    if (idx < 0) return { mesaj: 'Firma bulunamadi' };
    const bayi = girdi.bayiId ? bayiler.find((b) => b.id === girdi.bayiId) : null;
    const guncel: OfflineFirma = {
      ...liste[idx],
      ...(girdi.unvan ? { unvan: girdi.unvan.trim() } : {}),
      ...(girdi.tabelaAdi !== undefined ? { tabelaAdi: girdi.tabelaAdi?.trim() ?? null } : {}),
      ...(girdi.bayiId !== undefined
        ? { bayiId: girdi.bayiId, bayiUnvan: bayi?.unvan ?? liste[idx].bayiUnvan }
        : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...(girdi.vergiDairesi !== undefined ? { vergiDairesi: girdi.vergiDairesi?.trim() ?? null } : {}),
      ...(girdi.vergiNo !== undefined ? { vergiNo: girdi.vergiNo?.trim() ?? null } : {}),
      ...(girdi.iskonto !== undefined ? { iskonto: girdi.iskonto } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineFirmaKaydet(yeni);
    return { firma: guncel };
  }

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const yeni = liste.filter((f) => f.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Firma bulunamadi' };
    offlineFirmaKaydet(yeni);
    return { mesaj: 'Firma silindi' };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineSubeOku(): OfflineSube[] {
  try {
    const ham = localStorage.getItem(OFFLINE_SUBE_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineSube[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      firmaId: 1,
      firmaUnvan: 'Demo Restoran Grubu',
      firmaTabela: 'Demo Restoran',
      subeAdi: 'Merkez Sube',
      subeTipi: 'restoran',
      il: 'Istanbul',
      ilce: null,
      adres: null,
      telefon: null,
      gsm: null,
      eposta: null,
      vergiDairesi: null,
      vergiNo: null,
      iskonto: null,
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineSubeKaydet(liste: OfflineSube[]) {
  localStorage.setItem(OFFLINE_SUBE_ANAHTAR, JSON.stringify(liste));
}

function offlineSubeListe() {
  return { subeler: offlineSubeOku() };
}

function offlineSubeYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineSubeOku();
  const firmalar = offlineFirmaOku();
  const simdi = new Date().toISOString();

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    if (!liste.some((s) => s.id === id)) return { mesaj: 'Sube bulunamadi' };
    offlineSubeKaydet(liste.filter((s) => s.id !== id));
    return { mesaj: 'Silindi' };
  }

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      firmaId?: number;
      subeAdi?: string;
      subeTipi?: OfflineSube['subeTipi'];
      il?: string;
      ilce?: string;
      adres?: string;
      eposta?: string;
      telefon?: string;
      gsm?: string;
      vergiDairesi?: string;
      vergiNo?: string;
      iskonto?: number | null;
    };
    const firma = firmalar.find((f) => f.id === girdi.firmaId);
    const iskontoHam = girdi.iskonto;
    const iskonto =
      iskontoHam != null && !Number.isNaN(Number(iskontoHam)) ? Number(iskontoHam) : null;
    const sube: OfflineSube = {
      id: Math.max(0, ...liste.map((s) => s.id)) + 1,
      firmaId: girdi.firmaId ?? 1,
      firmaUnvan: firma?.unvan ?? 'Firma',
      firmaTabela: firma?.tabelaAdi ?? null,
      subeAdi: girdi.subeAdi?.trim() ?? 'Yeni Sube',
      subeTipi: girdi.subeTipi ?? 'restoran',
      il: girdi.il?.trim() ?? null,
      ilce: girdi.ilce?.trim() ?? null,
      adres: girdi.adres?.trim() ?? null,
      telefon: girdi.telefon?.trim() ?? null,
      gsm: girdi.gsm?.trim() ?? null,
      eposta: girdi.eposta?.trim() ?? null,
      vergiDairesi: girdi.vergiDairesi?.trim() ?? null,
      vergiNo: girdi.vergiNo?.trim() ?? null,
      iskonto,
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineSubeKaydet([...liste, sube]);
    return { sube };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineSube> & { firmaId?: number; aktif?: boolean };
    const idx = liste.findIndex((s) => s.id === id);
    if (idx < 0) return { mesaj: 'Sube bulunamadi' };
    const firma = girdi.firmaId ? firmalar.find((f) => f.id === girdi.firmaId) : null;
    const iskontoGuncel =
      girdi.iskonto !== undefined
        ? girdi.iskonto == null || Number.isNaN(Number(girdi.iskonto))
          ? null
          : Number(girdi.iskonto)
        : liste[idx].iskonto;
    const guncel: OfflineSube = {
      ...liste[idx],
      ...(girdi.subeAdi ? { subeAdi: girdi.subeAdi.trim() } : {}),
      ...(girdi.subeTipi ? { subeTipi: girdi.subeTipi } : {}),
      ...(girdi.firmaId !== undefined
        ? {
            firmaId: girdi.firmaId,
            firmaUnvan: firma?.unvan ?? liste[idx].firmaUnvan,
            firmaTabela: firma?.tabelaAdi ?? liste[idx].firmaTabela,
          }
        : {}),
      ...(girdi.il !== undefined ? { il: girdi.il } : {}),
      ...(girdi.ilce !== undefined ? { ilce: girdi.ilce } : {}),
      ...(girdi.adres !== undefined ? { adres: girdi.adres } : {}),
      ...(girdi.eposta !== undefined ? { eposta: girdi.eposta } : {}),
      ...(girdi.telefon !== undefined ? { telefon: girdi.telefon } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm } : {}),
      ...(girdi.vergiDairesi !== undefined ? { vergiDairesi: girdi.vergiDairesi } : {}),
      ...(girdi.vergiNo !== undefined ? { vergiNo: girdi.vergiNo } : {}),
      ...(girdi.iskonto !== undefined ? { iskonto: iskontoGuncel } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineSubeKaydet(yeni);
    return { sube: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlinePaketOku(): OfflinePaket[] {
  try {
    const ham = localStorage.getItem(OFFLINE_PAKET_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflinePaket[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  return [
    {
      id: 1,
      paketAdi: 'Temel Paket',
      subeSayisi: 5,
      personelSayisi: 20,
      masaSayisi: 100,
      fiyat: 0,
      paraBirimi: 'TRY',
      aktif: true,
      aktifLisansSayisi: 1,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlinePaketKaydet(liste: OfflinePaket[]) {
  localStorage.setItem(OFFLINE_PAKET_ANAHTAR, JSON.stringify(liste));
}

function offlinePaketListe() {
  return {
    paketler: offlinePaketOku().map((p) => ({
      ...p,
      paraBirimi: p.paraBirimi ?? 'TRY',
    })),
  };
}

function offlinePaketYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlinePaketOku();
  const simdi = new Date().toISOString();

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const paket = liste.find((p) => p.id === id);
    if (!paket) return { mesaj: 'Paket bulunamadi' };
    if (paket.aktifLisansSayisi > 0) return { mesaj: 'Lisansi olan paket silinemez' };
    offlinePaketKaydet(liste.filter((p) => p.id !== id));
    return { mesaj: 'Silindi' };
  }

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as Partial<OfflinePaket>;
    const paket: OfflinePaket = {
      id: Math.max(0, ...liste.map((p) => p.id)) + 1,
      paketAdi: girdi.paketAdi?.trim() ?? 'Yeni Paket',
      subeSayisi: girdi.subeSayisi ?? 1,
      personelSayisi: girdi.personelSayisi ?? 10,
      masaSayisi: girdi.masaSayisi ?? 50,
      fiyat: girdi.fiyat ?? 0,
      paraBirimi: girdi.paraBirimi ?? 'TRY',
      aktif: true,
      aktifLisansSayisi: 0,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlinePaketKaydet([...liste, paket]);
    return { paket };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflinePaket> & { aktif?: boolean };
    const idx = liste.findIndex((p) => p.id === id);
    if (idx < 0) return { mesaj: 'Paket bulunamadi' };
    const guncel: OfflinePaket = {
      ...liste[idx],
      ...(girdi.paketAdi ? { paketAdi: girdi.paketAdi.trim() } : {}),
      ...(girdi.subeSayisi !== undefined ? { subeSayisi: girdi.subeSayisi } : {}),
      ...(girdi.personelSayisi !== undefined ? { personelSayisi: girdi.personelSayisi } : {}),
      ...(girdi.masaSayisi !== undefined ? { masaSayisi: girdi.masaSayisi } : {}),
      ...(girdi.fiyat !== undefined ? { fiyat: girdi.fiyat } : {}),
      ...(girdi.paraBirimi !== undefined ? { paraBirimi: girdi.paraBirimi } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlinePaketKaydet(yeni);
    return { paket: guncel };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineLisansOku(): OfflineLisans[] {
  try {
    const ham = localStorage.getItem(OFFLINE_LISANS_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineLisans[];
  } catch {
    /* bozuk kayıt */
  }
  const simdi = new Date().toISOString();
  const bitis = new Date();
  bitis.setFullYear(bitis.getFullYear() + 1);
  return [
    {
      id: 1,
      firmaId: 1,
      firmaUnvan: 'Demo Restoran Grubu',
      firmaTabela: 'Demo Restoran',
      paketId: 1,
      paketAdi: 'Temel Paket',
      baslangicTarihi: simdi,
      bitisTarihi: bitis.toISOString(),
      durum: 'aktif',
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineLisansKaydet(liste: OfflineLisans[]) {
  localStorage.setItem(OFFLINE_LISANS_ANAHTAR, JSON.stringify(liste));
}

function offlineLisansListe() {
  return { lisanslar: offlineLisansOku() };
}

function offlineLisansYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineLisansOku();
  const firmalar = offlineFirmaOku();
  const paketler = offlinePaketOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      firmaId?: number;
      paketId?: number;
      baslangicTarihi?: string;
      bitisTarihi?: string | null;
    };
    const firma = firmalar.find((f) => f.id === girdi.firmaId);
    const paket = paketler.find((p) => p.id === girdi.paketId);
    const lisans: OfflineLisans = {
      id: Math.max(0, ...liste.map((l) => l.id)) + 1,
      firmaId: girdi.firmaId ?? 1,
      firmaUnvan: firma?.unvan ?? 'Firma',
      firmaTabela: firma?.tabelaAdi ?? null,
      paketId: girdi.paketId ?? 1,
      paketAdi: paket?.paketAdi ?? 'Paket',
      baslangicTarihi: girdi.baslangicTarihi ?? simdi,
      bitisTarihi: girdi.bitisTarihi ?? null,
      durum: 'aktif',
      aktif: true,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineLisansKaydet([...liste, lisans]);
    return { lisans };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as Partial<OfflineLisans> & { paketId?: number; aktif?: boolean };
    const idx = liste.findIndex((l) => l.id === id);
    if (idx < 0) return { mesaj: 'Lisans bulunamadi' };
    const paket = girdi.paketId ? paketler.find((p) => p.id === girdi.paketId) : null;
    const guncel: OfflineLisans = {
      ...liste[idx],
      ...(girdi.paketId !== undefined
        ? { paketId: girdi.paketId, paketAdi: paket?.paketAdi ?? liste[idx].paketAdi }
        : {}),
      ...(girdi.baslangicTarihi !== undefined ? { baslangicTarihi: girdi.baslangicTarihi } : {}),
      ...(girdi.bitisTarihi !== undefined ? { bitisTarihi: girdi.bitisTarihi } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif), durum: girdi.aktif ? 'aktif' : 'pasif' } : {}),
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineLisansKaydet(yeni);
    return { lisans: guncel };
  }

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    const yeni = liste.filter((l) => l.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Lisans bulunamadi' };
    offlineLisansKaydet(yeni);
    return { mesaj: 'Lisans silindi' };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineKullaniciVarsayilan(): OfflineMasterKullanici[] {
  const simdi = new Date().toISOString();
  const bayiler = offlineBayiOku();
  const firmalar = offlineFirmaOku();
  const subeler = offlineSubeOku();
  const bayi = bayiler[0];
  const firma = firmalar[0];
  const sube = subeler[0];
  return [
    {
      id: 1,
      ad: 'Sistem Admin',
      eposta: 'admin@restorant.local',
      gsm: null,
      rol: 'SUPER_ADMIN',
      kullaniciTipi: 'sube',
      bayiId: bayi?.id ?? 1,
      bayiUnvan: bayi?.unvan ?? 'Guzel Teknoloji',
      firmaId: firma?.id ?? 1,
      firmaUnvan: firma?.unvan ?? 'Demo Restoran Grubu',
      firmaTabela: firma?.tabelaAdi ?? 'Demo Restoran',
      subeId: sube?.id ?? 1,
      subeAdi: sube?.subeAdi ?? 'Merkez Sube',
      iskonto: 10,
      aktif: true,
      sonGirisTarihi: simdi,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
  ];
}

function offlineKullaniciOku(): OfflineMasterKullanici[] {
  try {
    const ham = localStorage.getItem(OFFLINE_KULLANICI_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineMasterKullanici[];
  } catch {
    /* bozuk kayıt */
  }
  return offlineKullaniciVarsayilan();
}

function offlineKullaniciKaydet(liste: OfflineMasterKullanici[]) {
  localStorage.setItem(OFFLINE_KULLANICI_ANAHTAR, JSON.stringify(liste));
}

function offlineKullaniciIliskileriDoldur(
  girdi: {
    bayiId?: number | null;
    firmaId?: number | null;
    subeId?: number | null;
    kullaniciTipi?: OfflineMasterKullanici['kullaniciTipi'];
  },
  mevcut?: Partial<OfflineMasterKullanici>
): Pick<
  OfflineMasterKullanici,
  'kullaniciTipi' | 'bayiId' | 'bayiUnvan' | 'firmaId' | 'firmaUnvan' | 'firmaTabela' | 'subeId' | 'subeAdi'
> {
  const bayiler = offlineBayiOku();
  const firmalar = offlineFirmaOku();
  const subeler = offlineSubeOku();

  const bayiId = girdi.bayiId !== undefined ? girdi.bayiId : (mevcut?.bayiId ?? null);
  const firmaId = girdi.firmaId !== undefined ? girdi.firmaId : (mevcut?.firmaId ?? null);
  const subeId = girdi.subeId !== undefined ? girdi.subeId : (mevcut?.subeId ?? null);

  const bayi = bayiId != null ? bayiler.find((b) => b.id === bayiId) : null;
  const firma = firmaId != null ? firmalar.find((f) => f.id === firmaId) : null;
  const sube = subeId != null ? subeler.find((s) => s.id === subeId) : null;

  let kullaniciTipi = girdi.kullaniciTipi ?? mevcut?.kullaniciTipi ?? 'merkez';
  if (subeId) kullaniciTipi = 'sube';
  else if (firmaId) kullaniciTipi = 'firma';
  else if (bayiId) kullaniciTipi = 'bayi';
  else kullaniciTipi = 'merkez';

  return {
    kullaniciTipi,
    bayiId,
    bayiUnvan: bayi?.unvan ?? null,
    firmaId,
    firmaUnvan: firma?.unvan ?? null,
    firmaTabela: firma?.tabelaAdi ?? null,
    subeId,
    subeAdi: sube?.subeAdi ?? null,
  };
}

function offlineKullaniciYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineKullaniciOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      ad?: string;
      email?: string;
      rol?: string;
      kullaniciTipi?: OfflineMasterKullanici['kullaniciTipi'];
      bayiId?: number | null;
      firmaId?: number | null;
      subeId?: number | null;
      gsm?: string;
      iskonto?: number | null;
      aktif?: boolean;
    };
    const eposta = girdi.email?.trim().toLowerCase() ?? '';
    if (!eposta || !girdi.ad?.trim() || !girdi.rol?.trim()) {
      return { mesaj: 'Zorunlu alanlar eksik' };
    }
    if (liste.some((k) => k.eposta.toLowerCase() === eposta)) {
      return { mesaj: 'Bu e-posta zaten kayitli' };
    }

    const iliskiler = offlineKullaniciIliskileriDoldur(girdi);
    const kullanici: OfflineMasterKullanici = {
      id: Math.max(0, ...liste.map((k) => k.id)) + 1,
      ad: girdi.ad.trim(),
      eposta,
      gsm: girdi.gsm?.trim() || null,
      rol: girdi.rol.trim(),
      ...iliskiler,
      iskonto: girdi.iskonto ?? null,
      aktif: girdi.aktif !== false,
      sonGirisTarihi: null,
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    };
    offlineKullaniciKaydet([...liste, kullanici]);
    return { kullanici };
  }

  if (method === 'PATCH' && typeof body === 'string') {
    const id = Number(path.split('/').pop());
    const girdi = JSON.parse(body) as {
      ad?: string;
      email?: string;
      rol?: string;
      kullaniciTipi?: OfflineMasterKullanici['kullaniciTipi'];
      bayiId?: number | null;
      firmaId?: number | null;
      subeId?: number | null;
      gsm?: string;
      iskonto?: number | null;
      aktif?: boolean;
    };
    const idx = liste.findIndex((k) => k.id === id);
    if (idx < 0) return { mesaj: 'Kullanici bulunamadi' };

    if (girdi.email) {
      const eposta = girdi.email.trim().toLowerCase();
      if (liste.some((k) => k.id !== id && k.eposta.toLowerCase() === eposta)) {
        return { mesaj: 'Bu e-posta zaten kayitli' };
      }
    }

    const mevcut = liste[idx];
    const iliskiler = offlineKullaniciIliskileriDoldur(girdi, mevcut);
    const guncel: OfflineMasterKullanici = {
      ...mevcut,
      ...(girdi.ad !== undefined ? { ad: girdi.ad.trim() } : {}),
      ...(girdi.email !== undefined ? { eposta: girdi.email.trim().toLowerCase() } : {}),
      ...(girdi.rol !== undefined ? { rol: girdi.rol.trim() } : {}),
      ...(girdi.gsm !== undefined ? { gsm: girdi.gsm?.trim() || null } : {}),
      ...(girdi.iskonto !== undefined ? { iskonto: girdi.iskonto } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      ...iliskiler,
      guncellemeTarihi: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineKullaniciKaydet(yeni);
    return { kullanici: guncel };
  }

  if (method === 'DELETE') {
    const id = Number(path.split('/').pop());
    if (id === 1) return { mesaj: 'Varsayilan admin silinemez' };
    const yeni = liste.filter((k) => k.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Kullanici bulunamadi' };
    offlineKullaniciKaydet(yeni);
    return { mesaj: 'Silindi' };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}

function offlineMasterKullaniciListe() {
  return { kullanicilar: offlineKullaniciOku() };
}

interface OfflineLogKayit {
  id: string;
  kullaniciId: string | null;
  mesaj: string;
  ipAdresi: string | null;
  kayitTarihi: string;
  kullaniciAd: string | null;
  kullaniciEmail: string | null;
}

function offlineLogOku(): OfflineLogKayit[] {
  try {
    const ham = localStorage.getItem(OFFLINE_LOG_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineLogKayit[];
  } catch {
    /* bozuk kayıt */
  }
  return [];
}

function offlineLogKaydetStorage(liste: OfflineLogKayit[]) {
  localStorage.setItem(OFFLINE_LOG_ANAHTAR, JSON.stringify(liste.slice(0, OFFLINE_LOG_LIMIT)));
}

function offlineLogListe() {
  const loglar = offlineLogOku();
  return { loglar, toplam: loglar.length };
}

function offlineLogYaz(body: BodyInit | null | undefined, method: string, path: string) {
  if (method === 'DELETE' && path.includes('/temizle')) {
    const gun = 90;
    const esik = Date.now() - gun * 86_400_000;
    const kalan = offlineLogOku().filter((l) => new Date(l.kayitTarihi).getTime() >= esik);
    offlineLogKaydetStorage(kalan);
    return { mesaj: 'Eski loglar temizlendi' };
  }

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as { mesaj?: string };
    const metin = girdi.mesaj?.trim();
    if (!metin) return { mesaj: 'Mesaj gerekli' };

    const kullanici = offlineKullanici();
    const kayit: OfflineLogKayit = {
      id: `offline-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kullaniciId: String(kullanici.id),
      mesaj: metin,
      ipAdresi: '127.0.0.1',
      kayitTarihi: new Date().toISOString(),
      kullaniciAd: kullanici.ad,
      kullaniciEmail: kullanici.email,
    };
    offlineLogKaydetStorage([kayit, ...offlineLogOku()]);
    return { mesaj: 'Kaydedildi' };
  }

  return { mesaj: 'Kayıt (offline mod)' };
}
