import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type AdminTema = 'koyu' | 'acik';

const STORAGE_KEY = 'gt_admin_tema';

interface AdminTemaContextDeger {
  tema: AdminTema;
  temaDegistir: () => void;
  koyuMu: boolean;
}

const AdminTemaContext = createContext<AdminTemaContextDeger | null>(null);

function temaOku(): AdminTema {
  try {
    const kayit = localStorage.getItem(STORAGE_KEY);
    return kayit === 'acik' ? 'acik' : 'koyu';
  } catch {
    return 'koyu';
  }
}

export function AdminTemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<AdminTema>(temaOku);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const temaDegistir = useCallback(() => {
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
