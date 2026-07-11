import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthKullanici, GirisFormu, KullaniciTercihleri } from '@/admin/ortak/tipler/admin';
import {
  benGetir,
  girisYap,
  authOfflineTemizle,
  profilGuncelle,
  tercihlerKaydet,
  tokenAl,
  tokenKaydet,
  tokenSil,
  type ProfilGuncelleForm,
} from '@/admin/ortak/api/authApi';
import { offlineOturumTemizle } from '@/admin/ortak/api/offlineKullaniciDepo';
import { offlinePanelDeposuTemizle } from '@/admin/ortak/api/offlinePanelDepo';
import { kullaniciAyarlariSunucudanYukle } from '@/admin/baslat-menusu/sistem/kullanici-ayarlari/api';
import {
  kisayolAyarlariTemizle,
} from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import { sekmeAyarlariTemizle } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';

interface AuthContextDeger {
  kullanici: AuthKullanici | null;
  yukleniyor: boolean;
  girisYap: (form: GirisFormu) => Promise<void>;
  cikisYap: () => void;
  profilKaydet: (form: ProfilGuncelleForm) => Promise<void>;
  hizliErisimKaydet: (ids: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextDeger | null>(null);

async function kullaniciAyarlariSenkronizeEt() {
  try {
    await kullaniciAyarlariSunucudanYukle();
  } catch {
    /* oturum acilisinda sessizce gec */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [kullanici, setKullanici] = useState<AuthKullanici | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (BACKEND_YOK) {
      const token = tokenAl();
      if (token === 'offline-token') {
        benGetir()
          .then(async (k) => {
            setKullanici(k);
            await kullaniciAyarlariSenkronizeEt();
          })
          .catch(() => {
            tokenSil();
            offlineOturumTemizle();
          })
          .finally(() => setYukleniyor(false));
        return;
      }
      setYukleniyor(false);
      return;
    }

    // Eski offline oturumunu temizle
    if (tokenAl() === 'offline-token') {
      tokenSil();
    }
    authOfflineTemizle();
    offlinePanelDeposuTemizle();

    const token = tokenAl();
    if (!token) {
      setYukleniyor(false);
      return;
    }

    benGetir()
      .then(async (k) => {
        setKullanici(k);
        await kullaniciAyarlariSenkronizeEt();
      })
      .catch(() => tokenSil())
      .finally(() => setYukleniyor(false));
  }, []);

  async function giris(form: GirisFormu) {
    const sonuc = await girisYap(form);
    authOfflineTemizle();
    offlinePanelDeposuTemizle();
    tokenKaydet(sonuc.token);
    setKullanici(sonuc.kullanici);
    await kullaniciAyarlariSenkronizeEt();
  }

  function cikis() {
    tokenSil();
    authOfflineTemizle();
    offlinePanelDeposuTemizle();
    offlineOturumTemizle();
    kisayolAyarlariTemizle();
    sekmeAyarlariTemizle();
    setKullanici(null);
  }

  async function profilKaydet(form: ProfilGuncelleForm) {
    const guncel = await profilGuncelle(form);
    setKullanici(guncel);
  }

  async function hizliErisimKaydet(ids: string[]) {
    const tercihler: KullaniciTercihleri = { dashboardHizliErisim: ids };
    const guncel = await tercihlerKaydet(tercihler);
    setKullanici(guncel);
  }

  return (
    <AuthContext.Provider
      value={{ kullanici, yukleniyor, girisYap: giris, cikisYap: cikis, profilKaydet, hizliErisimKaydet }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider icinde kullanilmali');
  return ctx;
}
