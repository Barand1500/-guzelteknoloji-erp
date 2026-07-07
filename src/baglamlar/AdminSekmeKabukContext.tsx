import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface AdminSekmeKabukContextType {
  sekmeId: string;
  kaydedilmediIsaretle: (sekmeId: string, kirli: boolean) => void;
}

const AdminSekmeKabukContext = createContext<AdminSekmeKabukContextType | null>(null);

export function AdminSekmeKabuk({
  sekmeId,
  kaydedilmediIsaretle,
  children,
}: {
  sekmeId: string;
  kaydedilmediIsaretle: (sekmeId: string, kirli: boolean) => void;
  children: ReactNode;
}) {
  const deger = useMemo(
    () => ({ sekmeId, kaydedilmediIsaretle }),
    [sekmeId, kaydedilmediIsaretle]
  );

  return (
    <AdminSekmeKabukContext.Provider value={deger}>
      {children}
    </AdminSekmeKabukContext.Provider>
  );
}

export function useAdminSekmeKabuk() {
  return useContext(AdminSekmeKabukContext);
}
