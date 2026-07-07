import { useCallback } from 'react';
import { adminIslemBildirimi } from '@/araclar/adminBildirimOlaylari';

/** Sayfa içi başarı/hata mesajlarını alt bildirim paneline yönlendirir */
export function useAdminSayfaBildirimi() {
  const basariBildir = useCallback((mesaj: string, baslik = 'İşlem tamamlandı') => {
    adminIslemBildirimi(mesaj, 'basari', baslik);
  }, []);

  const hataBildir = useCallback((mesaj: string, baslik = 'İşlem başarısız') => {
    adminIslemBildirimi(mesaj, 'hata', baslik);
  }, []);

  return { basariBildir, hataBildir };
}
