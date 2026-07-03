import { createContext, useContext, type ReactNode } from 'react';

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
  return (
    <AdminSekmeKabukContext.Provider value={{ sekmeId, kaydedilmediIsaretle }}>
      {children}
    </AdminSekmeKabukContext.Provider>
  );
}

export function useAdminSekmeKabuk() {
  return useContext(AdminSekmeKabukContext);
}
