import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { EKLENTI_KATALOGU } from '@/admin/baslat-menusu/sistem/ayarlar/veri-eklentiKatalogu';
import type { EklentiDurum } from '@/admin/ortak/tipler/eklenti';
import { offlineKullanici } from '@/admin/ortak/api/authApi';
import {
  offlineKullaniciPanelYanit,
  offlineKullanicilariKaydet,
  offlineKullanicilariOku,
  type OfflineKullaniciKayit,
} from '@/admin/ortak/api/offlineKullaniciDepo';
import { offlineTanimlarGetir, offlineTanimlarYaz } from '@/admin/ortak/api/offlineTanimlar';
import {
  offlineDatagridDemoGetir,
  offlineDatagridDemoKaydet,
} from '@/admin/ortak/api/offlineDatagridDemo';
import {
  offlineCarilerGetir,
  offlineCarilerYaz,
} from '@/admin/baslat-menusu/erp/cari/offlineCariler';
import {
  offlineUrunYonetimiGetir,
  offlineUrunYonetimiYaz,
} from '@/admin/baslat-menusu/erp/urun-yonetimi/offlineUrunYonetimi';

const OFFLINE_SISTEM_ANAHTAR = 'erp-offline-sistem-ayarlari';
const OFFLINE_MODUL_ANAHTAR = 'erp-offline-moduller';
const OFFLINE_LOG_ANAHTAR = 'erp-offline-loglar';
const OFFLINE_EKLENTI_ANAHTAR = 'erp-offline-eklenti-kurulum';
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
  { id: 8, ad: 'Tanimlar', prefix: 'tanimlar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 9, ad: 'Cari Kartlar', prefix: 'cari', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 13, ad: 'Stoklar', prefix: 'stoklar', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
  { id: 14, ad: 'Banka Anlasmalari', prefix: 'banka_anlasmalari', aktif: true, rolSayisi: 6, kayitTarihi: '', guncellemeTarihi: '' },
];

const OFFLINE_YETKILER = [
  { kod: 'goruntuleme', etiket: 'Görüntüleme' },
  { kod: 'ekleme', etiket: 'Ekleme' },
  { kod: 'duzenleme', etiket: 'Düzenleme' },
  { kod: 'silme', etiket: 'Silme' },
  { kod: 'kullanici_yonetimi', etiket: 'Kullanıcı Yönetimi' },
] as const;

function offlineModulYetkileri(yetkiler: string[]) {
  const modulYetkileri: Record<string, string[]> = {};
  for (const m of VARSAYILAN_OFFLINE_MODULLER) {
    modulYetkileri[m.prefix] = [...yetkiler];
  }
  return modulYetkileri;
}

const OFFLINE_ROLLER = [
  {
    kod: 'YONETICI',
    baslik: 'Yönetici',
    aciklama: 'Firma yöneticisi — tam ERP erişimi',
    modulYetkileri: offlineModulYetkileri([
      'goruntuleme',
      'ekleme',
      'duzenleme',
      'silme',
      'kullanici_yonetimi',
    ]),
    sistemRolu: true,
  },
  {
    kod: 'SUPER_ADMIN',
    baslik: 'Super Admin',
    aciklama: 'Tam panel erişimi',
    modulYetkileri: offlineModulYetkileri([
      'goruntuleme',
      'ekleme',
      'duzenleme',
      'silme',
      'kullanici_yonetimi',
    ]),
    sistemRolu: true,
  },
  {
    kod: 'EDITOR',
    baslik: 'Editör',
    aciklama: 'Düzenleme yetkisi',
    modulYetkileri: offlineModulYetkileri(['goruntuleme', 'ekleme', 'duzenleme']),
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
    if (p.includes('/tanimlar')) return offlineTanimlarYaz(p, m, body);
    if (p.includes('/cariler')) return offlineCarilerYaz(p, m, body);
    if (p.includes('/urun-yonetimi')) return offlineUrunYonetimiYaz(p, m, body);
    if (p.includes('/datagrid-demo')) return offlineDatagridDemoKaydet(body);
    if (p.includes('/eklentiler')) return offlineEklentiYaz(m, p);
    return { mesaj: 'Kayit (offline mod)' };
  }

  if (p.includes('/moduller')) return offlineModulListe();
  if (p.includes('/kullanicilar/siteler')) return { siteler: [] };
  if (p.includes('/kullanicilar')) return { kullanicilar: offlineKullanicilariOku().map(offlineKullaniciPanelYanit) };
  if (p.includes('/sayfalar') || p.endsWith('/menu')) return { sayfalar: [] };
  if (p.includes('/roller/yetkiler')) return { yetkiler: [...OFFLINE_YETKILER] };
  if (p.includes('/roller')) {
    return {
      roller: OFFLINE_ROLLER,
      yetkiler: [...OFFLINE_YETKILER],
      moduller: offlineModulOku().map((m) => ({
        id: m.prefix.replace(/_/g, '-'),
        ad: m.ad,
        prefix: m.prefix,
      })),
    };
  }
  if (p.includes('/loglar')) return offlineLogListe();
  if (p.includes('/yedek/varsayilan-dosya-adi')) return { dosyaAdi: 'erp-yedek.json' };
  if (p.includes('/yedek/gecmis')) return { kayitlar: [], sonKayit: null };
  if (p.includes('/sistem-ayarlari')) return offlineSistemAyarlari();
  if (p.includes('/bildirim')) return { bildirimler: [], okunmamisSayi: 0 };
  if (p.includes('/eklentiler')) return offlineEklentiListe();
  if (p.includes('/tanimlar')) return offlineTanimlarGetir(p);
  if (p.includes('/cariler')) return offlineCarilerGetir(p);
  if (p.includes('/urun-yonetimi')) return offlineUrunYonetimiGetir(p);
  if (p.includes('/datagrid-demo')) return offlineDatagridDemoGetir();

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

function offlineKullaniciYaz(body: BodyInit | null | undefined, method: string, path: string) {
  const liste = offlineKullanicilariOku();
  const simdi = new Date().toISOString();

  if (method === 'POST' && typeof body === 'string') {
    const girdi = JSON.parse(body) as {
      ad?: string;
      kullaniciKodu?: string;
      email?: string;
      sifre?: string;
      rol?: string;
      aktif?: boolean;
      firmaId?: number | string;
      donemId?: number | string | null;
      subeId?: number | string | null;
      depoId?: number | string | null;
      kasaId?: number | string | null;
      oturumYetkileri?: Array<{ firmaId: number | string; donemId: number | string }>;
      pin?: string | null;
    };
    const kullaniciKodu = String(girdi.kullaniciKodu ?? girdi.email ?? '')
      .trim()
      .toUpperCase();
    const sifre = String(girdi.sifre ?? '').trim();
    if (!kullaniciKodu || !girdi.ad?.trim() || !sifre || !girdi.rol?.trim()) {
      return { mesaj: 'Zorunlu alanlar eksik' };
    }
    if (liste.some((k) => k.kullaniciKodu === kullaniciKodu)) {
      return { mesaj: 'Bu kullanıcı kodu zaten kayıtlı' };
    }
    const kullanici: OfflineKullaniciKayit = {
      id: String(Math.max(0, ...liste.map((k) => Number(k.id) || 0)) + 1),
      ad: girdi.ad.trim(),
      kullaniciKodu,
      sifre,
      rol: girdi.rol.trim(),
      aktif: girdi.aktif !== false,
      firmaId: girdi.firmaId != null ? String(girdi.firmaId) : '1',
      donemId: girdi.donemId != null && girdi.donemId !== '' ? String(girdi.donemId) : '',
      subeId: girdi.subeId != null && girdi.subeId !== '' ? String(girdi.subeId) : '',
      depoId: girdi.depoId != null && girdi.depoId !== '' ? String(girdi.depoId) : '',
      kasaId: girdi.kasaId != null && girdi.kasaId !== '' ? String(girdi.kasaId) : '',
      oturumYetkileri: (girdi.oturumYetkileri ?? []).map((y) => ({
        firmaId: String(y.firmaId),
        donemId: String(y.donemId),
      })),
      pin: girdi.pin != null ? String(girdi.pin) : '',
      olusturma: simdi,
      guncelleme: simdi,
    };
    offlineKullanicilariKaydet([...liste, kullanici]);
    return { kullanici: offlineKullaniciPanelYanit(kullanici) };
  }

  if ((method === 'PUT' || method === 'PATCH') && typeof body === 'string') {
    const id = path.split('/').pop() ?? '';
    const girdi = JSON.parse(body) as {
      ad?: string;
      kullaniciKodu?: string;
      email?: string;
      sifre?: string;
      rol?: string;
      aktif?: boolean;
      firmaId?: number | string;
      donemId?: number | string | null;
      subeId?: number | string | null;
      depoId?: number | string | null;
      kasaId?: number | string | null;
      oturumYetkileri?: Array<{ firmaId: number | string; donemId: number | string }>;
      pin?: string | null;
    };
    const idx = liste.findIndex((k) => k.id === id);
    if (idx < 0) return { mesaj: 'Kullanici bulunamadi' };

    const yeniKod = girdi.kullaniciKodu ?? girdi.email;
    if (yeniKod) {
      const kod = yeniKod.trim().toUpperCase();
      if (liste.some((k) => k.id !== id && k.kullaniciKodu === kod)) {
        return { mesaj: 'Bu kullanıcı kodu zaten kayıtlı' };
      }
    }

    const guncel: OfflineKullaniciKayit = {
      ...liste[idx],
      ...(girdi.ad !== undefined ? { ad: girdi.ad.trim() } : {}),
      ...(yeniKod !== undefined ? { kullaniciKodu: yeniKod.trim().toUpperCase() } : {}),
      ...(girdi.sifre?.trim() ? { sifre: girdi.sifre.trim() } : {}),
      ...(girdi.rol !== undefined ? { rol: girdi.rol.trim() } : {}),
      ...('aktif' in girdi ? { aktif: Boolean(girdi.aktif) } : {}),
      ...('firmaId' in girdi && girdi.firmaId != null ? { firmaId: String(girdi.firmaId) } : {}),
      ...('donemId' in girdi ? { donemId: girdi.donemId != null && girdi.donemId !== '' ? String(girdi.donemId) : '' } : {}),
      ...('subeId' in girdi ? { subeId: girdi.subeId != null && girdi.subeId !== '' ? String(girdi.subeId) : '' } : {}),
      ...('depoId' in girdi ? { depoId: girdi.depoId != null && girdi.depoId !== '' ? String(girdi.depoId) : '' } : {}),
      ...('kasaId' in girdi ? { kasaId: girdi.kasaId != null && girdi.kasaId !== '' ? String(girdi.kasaId) : '' } : {}),
      ...('oturumYetkileri' in girdi
        ? {
            oturumYetkileri: (girdi.oturumYetkileri ?? []).map((y) => ({
              firmaId: String(y.firmaId),
              donemId: String(y.donemId),
            })),
          }
        : {}),
      ...('pin' in girdi ? { pin: girdi.pin != null ? String(girdi.pin) : '' } : {}),
      guncelleme: simdi,
    };
    const yeni = [...liste];
    yeni[idx] = guncel;
    offlineKullanicilariKaydet(yeni);
    return { kullanici: offlineKullaniciPanelYanit(guncel) };
  }

  if (method === 'DELETE') {
    const id = path.split('/').pop() ?? '';
    if (id === '1') return { mesaj: 'Varsayilan admin silinemez' };
    const yeni = liste.filter((k) => k.id !== id);
    if (yeni.length === liste.length) return { mesaj: 'Kullanici bulunamadi' };
    offlineKullanicilariKaydet(yeni);
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
      kullaniciEmail: kullanici.kullaniciKodu ?? kullanici.email ?? null,
    };
    offlineLogKaydetStorage([kayit, ...offlineLogOku()]);
    return { mesaj: 'Kaydedildi' };
  }

  return { mesaj: 'Kayit (offline mod)' };
}

type OfflineEklentiKurulum = Record<string, EklentiDurum>;

function offlineEklentiKurulumOku(): OfflineEklentiKurulum {
  try {
    const raw = localStorage.getItem(OFFLINE_EKLENTI_ANAHTAR);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OfflineEklentiKurulum;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function offlineEklentiKurulumKaydet(kurulum: OfflineEklentiKurulum): void {
  localStorage.setItem(OFFLINE_EKLENTI_ANAHTAR, JSON.stringify(kurulum));
}

function offlineEklentiListe() {
  const kurulum = offlineEklentiKurulumOku();
  const eklentiler = EKLENTI_KATALOGU.map((e) => {
    const durum = kurulum[e.kod];
    return {
      ...e,
      kurulu: !!durum,
      durum: durum ?? undefined,
      kaynak: 'katalog' as const,
    };
  });
  return { eklentiler };
}

function offlineEklentiYaz(method: string, path: string): { mesaj: string } {
  const kodMatch = path.match(/\/eklentiler\/([^/]+)/);
  const kod = kodMatch?.[1] ? decodeURIComponent(kodMatch[1]) : null;
  if (!kod) return { mesaj: 'Eklenti kodu gerekli' };

  const kart = EKLENTI_KATALOGU.find((e) => e.kod === kod);
  if (!kart) return { mesaj: 'Eklenti bulunamadi' };

  const kurulum = offlineEklentiKurulumOku();
  const mevcut = kurulum[kod];

  if (method === 'DELETE') {
    delete kurulum[kod];
    offlineEklentiKurulumKaydet(kurulum);
    return { mesaj: 'Kaldirildi' };
  }

  if (path.endsWith('/kur') && method === 'POST') {
    kurulum[kod] = 'kurulu';
    offlineEklentiKurulumKaydet(kurulum);
    return { mesaj: 'Kuruldu' };
  }

  if (path.endsWith('/aktif') && method === 'PATCH') {
    if (!mevcut) {
      return { mesaj: 'Eklenti kurulu degil' };
    }
    kurulum[kod] = 'aktif';
    offlineEklentiKurulumKaydet(kurulum);
    return { mesaj: 'Aktif edildi' };
  }

  if (path.endsWith('/pasif') && method === 'PATCH') {
    if (mevcut !== 'aktif') {
      return { mesaj: 'Eklenti aktif degil' };
    }
    kurulum[kod] = 'pasif';
    offlineEklentiKurulumKaydet(kurulum);
    return { mesaj: 'Pasif edildi' };
  }

  return { mesaj: 'Kayit (offline mod)' };
}
