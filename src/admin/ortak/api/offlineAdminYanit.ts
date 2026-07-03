import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { offlineKullanici } from '@/admin/ortak/api/authApi';

const OFFLINE_SISTEM_ANAHTAR = 'erp-offline-sistem-ayarlari';
const OFFLINE_MODUL_ANAHTAR = 'erp-offline-moduller';
const OFFLINE_KULLANICI_ANAHTAR = 'erp-offline-kullanicilar';
const OFFLINE_LOG_ANAHTAR = 'erp-offline-loglar';
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

interface OfflinePanelKullanici {
  id: string;
  email: string;
  ad: string;
  rol: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
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

const VARSAYILAN_OFFLINE_MODULLER: OfflineModul[] = [
  { id: 1, ad: 'Kullanicilar', prefix: 'kullanicilar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 2, ad: 'Roller', prefix: 'roller', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 3, ad: 'Ayarlar', prefix: 'ayarlar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 4, ad: 'Sekme Yonetimi', prefix: 'sekme_yonetimi', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 5, ad: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 6, ad: 'Loglar', prefix: 'loglar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 7, ad: 'Veri Yedekleme', prefix: 'veri_yedekleme', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
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
    kod: 'YONETICI',
    baslik: 'Yonetici',
    aciklama: 'Firma yoneticisi — tam ERP erisimi',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
    sistemRolu: true,
  },
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tam panel erisimi',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'],
    sistemRolu: true,
  },
  {
    kod: 'EDITOR',
    baslik: 'Editor',
    aciklama: 'Duzenleme yetkisi',
    yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'],
    sistemRolu: true,
  },
];

/** Backend olmadan panel sayfalarinin calismasi icin minimal yanitlar */
export function offlineAdminYanit(path: string, method: string, body?: BodyInit | null): unknown {
  const m = method.toUpperCase();
  const p = path.split('?')[0];

  if (m !== 'GET') {
    if (p.includes('/kullanicilar')) return offlineKullaniciYaz(body, m, p);
    if (p.includes('/roller')) return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER] };
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
    if (p.includes('/moduller')) return offlineModulYaz(body, m, p);
    if (p.includes('/loglar')) return offlineLogYaz(body, m, p);
    return { mesaj: 'Kayit (offline mod)' };
  }

  if (p.includes('/moduller')) return offlineModulListe();
  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar')) return { kullanicilar: offlineKullaniciOku() };
  if (p.includes('/sayfalar') || p.endsWith('/menu')) return { sayfalar: [] };
  if (p.includes('/roller/yetkiler')) return { yetkiler: [...OFFLINE_YETKILER] };
  if (p.includes('/roller')) return { roller: OFFLINE_ROLLER, yetkiler: [...OFFLINE_YETKILER], moduller: offlineModulOku() };
  if (p.includes('/loglar')) return offlineLogListe();
  if (p.includes('/yedek/varsayilan-dosya-adi')) return { dosyaAdi: 'erp-yedek.json' };
  if (p.includes('/yedek/gecmis')) return { kayitlar: [], sonKayit: null };
  if (p.includes('/sistem-ayarlari')) return offlineSistemAyarlari();
  if (p.includes('/bildirim')) return { bildirimler: [], okunmamisSayi: 0 };
  if (p.includes('/eklentiler')) return { eklentiler: [] };

  return {};
}

function offlineSistemOku(): Partial<SistemAyarlariForm> {
  try {
    const ham = localStorage.getItem(OFFLINE_SISTEM_ANAHTAR);
    if (ham) return JSON.parse(ham) as Partial<SistemAyarlariForm>;
  } catch {
    /* bozuk kayit */
  }
  return {};
}

function offlineSistemKaydet(form: SistemAyarlariForm) {
  localStorage.setItem(OFFLINE_SISTEM_ANAHTAR, JSON.stringify(form));
}

function offlineSistemAyarlari(form?: Partial<SistemAyarlariForm>) {
  const sistem = form ?? offlineSistemOku();
  return {
    site: {
      id: '1',
      ad: 'ERP',
      slug: 'erp',
      domain: null,
      aktif: form?.siteAktif ?? (sistem as SistemAyarlariForm).siteAktif ?? true,
    },
    sistem,
    surum: '0.1.0-offline',
  };
}

function offlineModulVarsayilan(): OfflineModul[] {
  const simdi = new Date().toISOString();
  return VARSAYILAN_OFFLINE_MODULLER.map((modul) => ({
    ...modul,
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
      const prefixler = new Set(kayitli.map((modul) => modul.prefix));
      const eksik = varsayilan.filter((modul) => !prefixler.has(modul.prefix));
      if (eksik.length > 0) {
        const birlesik = [...kayitli, ...eksik];
        offlineModulKaydet(birlesik);
        return birlesik;
      }
      return kayitli;
    }
  } catch {
    /* bozuk kayit */
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
    const modul: OfflineModul = {
      id: Math.max(0, ...liste.map((m) => m.id)) + 1,
      ad: girdi.modulAdi?.trim() ?? 'Yeni Modul',
      prefix: girdi.prefix?.trim() ?? `modul_${liste.length + 1}`,
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

  return { mesaj: 'Kayit (offline mod)' };
}

function offlineKullaniciVarsayilan(): OfflinePanelKullanici[] {
  const simdi = new Date().toISOString();
  const oturum = offlineKullanici();
  return [
    {
      id: String(oturum.id),
      email: oturum.email,
      ad: oturum.ad,
      rol: oturum.rol,
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
}

function offlineKullaniciOku(): OfflinePanelKullanici[] {
  try {
    const ham = localStorage.getItem(OFFLINE_KULLANICI_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflinePanelKullanici[];
  } catch {
    /* bozuk kayit */
  }
  return offlineKullaniciVarsayilan();
}

function offlineKullaniciKaydet(liste: OfflinePanelKullanici[]) {
  localStorage.setItem(OFFLINE_KULLANICI_ANAHTAR, JSON.stringify(liste));
}

function offlineKullaniciYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineKullaniciOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as { ad?: string; email?: string; rol?: string; aktif?: boolean };
    const email = girdi.email?.trim().toLowerCase() ?? '';
    if (!email || !girdi.ad?.trim() || !girdi.rol?.trim()) {
      return { mesaj: 'Zorunlu alanlar eksik' };
    }
    if (liste.some((k) => k.email.toLowerCase() === email)) {
      return { mesaj: 'Bu e-posta zaten kayitli' };
    }
    const kullanici: OfflinePanelKullanici = {
      id: String(Math.max(0, ...liste.map((k) => Number(k.id) || 0)) + 1),
      ad: girdi.ad.trim(),
      email,
      rol: girdi.rol.trim(),
      aktif: girdi.aktif !== false,
      olusturma: simdi,
      guncelleme: simdi,
    };
    offlineKullaniciKaydet([...liste, kullanici]);
    return { kullanici };
  }

  if ((method === 'PUT' || method === 'PATCH') && typeof body === 'string') {
    const id = path.split('/').pop() ?? '';
    const girdi = JSON.parse(body) as { ad?: string; email?: string; rol?: string; aktif?: boolean };
    const idx = liste.findIndex((k) => k.id === id);
    if (idx < 0) return { mesaj: 'Kullanici bulunamadi' };

    if (girdi.email) {
      const email = girdi.email.trim().toLowerCase();
      if (liste.some((k) => k.id !== id && k.email.toLowerCase() === email)) {
        return { mesaj: 'Bu e-posta zaten kayitli' };
      }
    }

    const guncel: OfflinePanelKullanici = {
      ...liste[idx],
      ...(girdi.ad !== undefined ? { ad: girdi.ad.trim() } : {}),
      ...(girdi.email !== undefined ? { email: girdi.email.trim().toLowerCase() } : {}),
      ...(girdi.rol !== undefined ? { rol: girdi.rol.trim() } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      guncelleme: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineKullaniciKaydet(yeni);
    return { kullanici: guncel };
  }

  if (method === 'DELETE') {
    const id = path.split('/').pop() ?? '';
    if (id === '1') return { mesaj: 'Varsayilan admin silinemez' };
    const yeni = liste.filter((k) => k.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Kullanici bulunamadi' };
    offlineKullaniciKaydet(yeni);
    return { mesaj: 'Silindi' };
  }

  return { mesaj: 'Kayit (offline mod)' };
}

function offlineLogOku(): OfflineLogKayit[] {
  try {
    const ham = localStorage.getItem(OFFLINE_LOG_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineLogKayit[];
  } catch {
    /* bozuk kayit */
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

  return { mesaj: 'Kayit (offline mod)' };
}
