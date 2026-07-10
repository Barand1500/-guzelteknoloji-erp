import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { siteVarsayilanAyarlarOku } from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';

export type AdminTema = 'koyu' | 'acik';

const STORAGE_KEY = 'gt_admin_tema';
const TEMA_SECILDI_ANAHTAR = 'gt_admin_tema_secildi';

interface AdminTemaContextDeger {
  tema: AdminTema;
  temaDegistir: () => void;
  koyuMu: boolean;
}

const AdminTemaContext = createContext<AdminTemaContextDeger | null>(null);

function temaOku(): AdminTema {
  try {
    const kullaniciSecimi = localStorage.getItem(TEMA_SECILDI_ANAHTAR) === '1';
    const kayit = localStorage.getItem(STORAGE_KEY);
    if (kullaniciSecimi && kayit === 'acik') return 'acik';
    if (kullaniciSecimi && kayit === 'koyu') return 'koyu';
    return siteVarsayilanAyarlarOku().panelTema;
  } catch {
    return 'koyu';
  }
}

export function AdminTemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<AdminTema>(temaOku);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  useEffect(() => {
    function guncelle() {
      if (localStorage.getItem(TEMA_SECILDI_ANAHTAR) === '1') return;
      setTema(siteVarsayilanAyarlarOku().panelTema);
    }
    window.addEventListener('ap-varsayilan-ayarlar-guncellendi', guncelle);
    return () => window.removeEventListener('ap-varsayilan-ayarlar-guncellendi', guncelle);
  }, []);

  const temaDegistir = useCallback(() => {
    localStorage.setItem(TEMA_SECILDI_ANAHTAR, '1');
    setTema((t) => (t === 'koyu' ? 'acik' : 'koyu'));
  }, []);

  return (
    <AdminTemaContext.Provider value={{ tema, temaDegistir, koyuMu: tema === 'koyu' }}>
      {children}
    </AdminTemaContext.Provider>
  );
}

export function useAdminTema() {
  const ctx = useContext(AdminTemaContext);
  if (!ctx) throw new Error('useAdminTema AdminTemaProvider icinde kullanilmali');
  return ctx;
}
