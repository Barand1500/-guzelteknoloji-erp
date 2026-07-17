/** Offline modda kullanıcı kayıtları — Kullanıcılar ekranı ile giriş aynı depoyu kullanır */



export interface OfflineKullaniciKayit {

  id: string;

  kullaniciKodu: string;

  ad: string;

  sifre: string;

  rol: string;

  aktif: boolean;

  firmaId: string;

  donemId: string;

  subeId: string;

  depoId: string;

  kasaId: string;

  oturumYetkileri: Array<{ firmaId: string; donemId: string }>;

  pin: string;

  olusturma: string;

  guncelleme: string;

}



const OFFLINE_KULLANICI_ANAHTAR = 'erp-offline-kullanicilar';

const OFFLINE_OTURUM_ANAHTAR = 'gt_offline_oturum_kodu';



/** backend/prisma/seed.ts ile aynı varsayılan admin şifresi */

export const OFFLINE_VARSAYILAN_ADMIN_SIFRE = 'eRc241016!';



function simdiIso() {

  return new Date().toISOString();

}



function varsayilanAdmin(): OfflineKullaniciKayit {

  const simdi = simdiIso();

  return {

    id: '1',

    kullaniciKodu: 'ADMIN',

    ad: 'ERCAN GUZEL',

    sifre: OFFLINE_VARSAYILAN_ADMIN_SIFRE,

    rol: 'YONETICI',

    aktif: true,

    firmaId: '1',

    donemId: '1',

    subeId: '1',

    depoId: '1',

    kasaId: '1',

    oturumYetkileri: [{ firmaId: '1', donemId: '1' }],

    pin: '2410',

    olusturma: simdi,

    guncelleme: simdi,

  };

}



function kayitNormalize(ham: unknown): OfflineKullaniciKayit | null {

  if (!ham || typeof ham !== 'object') return null;

  const o = ham as Record<string, unknown>;

  const kullaniciKodu = String(o.kullaniciKodu ?? o.email ?? '')

    .trim()

    .toUpperCase();

  const ad = String(o.ad ?? '').trim();

  if (!kullaniciKodu || !ad) return null;

  const firmaId = String(o.firmaId ?? '1');
  const donemId = String(o.donemId ?? '1');
  const hamYetkiler = Array.isArray(o.oturumYetkileri) ? o.oturumYetkileri : [];
  const oturumYetkileri = hamYetkiler
    .filter((y): y is Record<string, unknown> => Boolean(y && typeof y === 'object'))
    .map((y) => ({
      firmaId: String(y.firmaId ?? ''),
      donemId: String(y.donemId ?? ''),
    }))
    .filter((y) => y.firmaId && y.donemId);

  return {

    id: String(o.id ?? ''),

    kullaniciKodu,

    ad,

    sifre: typeof o.sifre === 'string' && o.sifre.length > 0 ? o.sifre : OFFLINE_VARSAYILAN_ADMIN_SIFRE,

    rol: String(o.rol ?? 'EDITOR'),

    aktif: o.aktif !== false,

    firmaId,

    donemId,

    subeId: String(o.subeId ?? '1'),

    depoId: String(o.depoId ?? '1'),

    kasaId: String(o.kasaId ?? '1'),

    oturumYetkileri:
      oturumYetkileri.length > 0
        ? oturumYetkileri
        : firmaId && donemId
          ? [{ firmaId, donemId }]
          : [],

    pin: String(o.pin ?? ''),

    olusturma: String(o.olusturma ?? simdiIso()),

    guncelleme: String(o.guncelleme ?? simdiIso()),

  };

}



/** API yanıtı — şifre gönderilmez */

export function offlineKullaniciPanelYanit(k: OfflineKullaniciKayit) {

  return {

    id: k.id,

    kullaniciKodu: k.kullaniciKodu,

    ad: k.ad,

    rol: k.rol,

    aktif: k.aktif,

    firmaId: k.firmaId,

    donemId: k.donemId,

    subeId: k.subeId,

    depoId: k.depoId,

    kasaId: k.kasaId,

    oturumYetkileri: k.oturumYetkileri,

    pin: k.pin,

    olusturma: k.olusturma,

    guncelleme: k.guncelleme,

  };

}



export function offlineKullanicilariOku(): OfflineKullaniciKayit[] {

  try {

    const ham = localStorage.getItem(OFFLINE_KULLANICI_ANAHTAR);

    if (ham) {

      const dizi = JSON.parse(ham) as unknown;

      if (Array.isArray(dizi)) {

        const liste = dizi.map(kayitNormalize).filter((k): k is OfflineKullaniciKayit => k !== null);

        if (liste.length > 0) return liste;

      }

    }

  } catch {

    /* bozuk kayıt */

  }

  const varsayilan = [varsayilanAdmin()];

  offlineKullanicilariKaydet(varsayilan);

  return varsayilan;

}



export function offlineKullanicilariKaydet(liste: OfflineKullaniciKayit[]) {

  localStorage.setItem(OFFLINE_KULLANICI_ANAHTAR, JSON.stringify(liste));

}



export function offlineAktifKullaniciKodlari(): string[] {

  return offlineKullanicilariOku()

    .filter((k) => k.aktif)

    .map((k) => k.kullaniciKodu)

    .sort((a, b) => a.localeCompare(b, 'tr'));

}



export function offlineGirisDogrula(kullaniciKodu: string, sifre: string): OfflineKullaniciKayit | null {

  const kod = kullaniciKodu.trim().toUpperCase();

  const kayit = offlineKullanicilariOku().find((k) => k.kullaniciKodu === kod);

  if (!kayit || !kayit.aktif) return null;

  if (kayit.sifre !== sifre) return null;

  return kayit;

}



export function offlineOturumKaydet(kullaniciKodu: string) {

  sessionStorage.setItem(OFFLINE_OTURUM_ANAHTAR, kullaniciKodu.trim().toUpperCase());

}



export function offlineOturumOku(): string | null {

  try {

    return sessionStorage.getItem(OFFLINE_OTURUM_ANAHTAR);

  } catch {

    return null;

  }

}



export function offlineOturumTemizle() {

  try {

    sessionStorage.removeItem(OFFLINE_OTURUM_ANAHTAR);

  } catch {

    /* storage yok */

  }

}

