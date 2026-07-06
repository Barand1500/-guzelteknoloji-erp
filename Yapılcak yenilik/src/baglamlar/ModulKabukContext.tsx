import { createContext, useContext, type ReactNode } from 'react';

const ModulKabukContext = createContext<string>('dashboard');

export function ModulKabuk({ modulId, children }: { modulId: string; children: ReactNode }) {
  return <ModulKabukContext.Provider value={modulId}>{children}</ModulKabukContext.Provider>;
}

export function useAktifModulId() {
  return useContext(ModulKabukContext);
}
