import { useEffect } from 'react';
import {
  useAdminAksiyon,
  type AksiyonDurumlari,
  type AksiyonHandlerlar,
} from '@/baglamlar/AdminAksiyonContext';
import { useAktifModulId } from '@/baglamlar/ModulKabukContext';
import { useSekmeKirli } from '@/kancalar/useSekmeKirli';

/** Modül aksiyon handler'ları içinde logMesajiAyarla('...') çağırmak için */
export function useAdminLogMesaji() {
  const { logMesajiAyarla } = useAdminAksiyon();
  return logMesajiAyarla;
}

export function useModulAksiyonlari(
  handlers: AksiyonHandlerlar,
  durumlar?: AksiyonDurumlari,
  kirli?: boolean
) {
  const modulId = useAktifModulId();
  const { registerHandlers, clearHandlers, setAksiyonDurumlari } = useAdminAksiyon();

  useSekmeKirli(kirli);

  useEffect(() => {
    registerHandlers(modulId, handlers);
    return () => clearHandlers(modulId);
  }, [
    modulId,
    registerHandlers,
    clearHandlers,
    handlers.kaydet,
    handlers.hizliKaydet,
    handlers.guncelle,
    handlers.ekle,
    handlers.altEkle,
    handlers.sil,
    handlers.onizle,
    handlers.yayinla,
    handlers.oncekiKayit,
    handlers.sonrakiKayit,
  ]);

  useEffect(() => {
    setAksiyonDurumlari(modulId, durumlar ?? {});
    return () => setAksiyonDurumlari(modulId, {});
  }, [
    modulId,
    setAksiyonDurumlari,
    durumlar?.kaydet,
    durumlar?.hizliKaydet,
    durumlar?.guncelle,
    durumlar?.ekle,
    durumlar?.altEkle,
    durumlar?.sil,
    durumlar?.onizle,
    durumlar?.yayinla,
    durumlar?.oncekiKayit,
    durumlar?.sonrakiKayit,
  ]);
}
