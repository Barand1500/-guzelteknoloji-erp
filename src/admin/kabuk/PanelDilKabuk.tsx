import { useEffect, type ReactNode } from 'react';
import { PanelDilProvider, usePanelDil } from '@/baglamlar/PanelDilContext';
import { sistemAyarlariGetir } from '@/admin/baslat-menusu/sistem/ayarlar/api';
import { sistemdenForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

function PanelDilSenkron({ children }: { children: ReactNode }) {
  const { dilAyarla, cevirileriAyarla } = usePanelDil();

  useEffect(() => {
    void (async () => {
      try {
        const veri = await sistemAyarlariGetir();
        const form = sistemdenForm(veri.site, veri.sistem);
        dilAyarla(form.panelDili);
        cevirileriAyarla(form.panelCeviriler);
      } catch {
        // varsayılan dil kullanılır
      }
    })();
  }, [dilAyarla, cevirileriAyarla]);

  return <>{children}</>;
}

export function PanelDilKabuk({ children }: { children: ReactNode }) {
  return (
    <PanelDilProvider>
      <PanelDilSenkron>{children}</PanelDilSenkron>
    </PanelDilProvider>
  );
}
