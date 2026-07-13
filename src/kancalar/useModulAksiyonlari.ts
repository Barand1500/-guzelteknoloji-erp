import { useEffect, useMemo } from 'react';
import {
  useAdminAksiyon,
  type AksiyonDurumlari,
  type AksiyonHandlerlar,
  type AksiyonId,
} from '@/baglamlar/AdminAksiyonContext';
import { useAktifModulId } from '@/baglamlar/ModulKabukContext';
import { useSekmeKirli } from '@/kancalar/useSekmeKirli';

/** Modül aksiyon handler'ları içinde logMesajiAyarla('...') çağırmak için */
export function useAdminLogMesaji() {
  const { logMesajiAyarla } = useAdminAksiyon();
  return logMesajiAyarla;
}

function handlerAnahtarlari(handlers: AksiyonHandlerlar): (keyof AksiyonHandlerlar)[] {
  return (Object.keys(handlers) as (keyof AksiyonHandlerlar)[]).filter((key) => handlers[key] != null);
}

function durumAnahtarlari(durumlar: AksiyonDurumlari): AksiyonId[] {
  return (Object.keys(durumlar) as AksiyonId[]).filter((key) => durumlar[key] !== undefined);
}

export function useModulAksiyonlari(
  handlers: AksiyonHandlerlar,
  durumlar?: AksiyonDurumlari,
  kirli?: boolean
) {
  const modulId = useAktifModulId();
  const { registerHandlers, clearHandlers, setAksiyonDurumlari, clearAksiyonDurumlari } =
    useAdminAksiyon();

  useSekmeKirli(kirli);

  const handlerKeys = useMemo(
    () => handlerAnahtarlari(handlers),
    [
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
    ]
  );

  useEffect(() => {
    registerHandlers(modulId, handlers);
    return () => clearHandlers(modulId, handlerKeys);
  }, [
    modulId,
    registerHandlers,
    clearHandlers,
    handlerKeys,
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
    handlers.stokAra,
    handlers.stokFiyatAnaliz,
    handlers.stokEnvanterAnaliz,
    handlers.stokBirimListesi,
    handlers.stokFiyatDuzenle,
  ]);

  const durumKeys = useMemo(() => durumAnahtarlari(durumlar ?? {}), [
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

  useEffect(() => {
    const kayitliDurumlar = durumlar ?? {};
    setAksiyonDurumlari(modulId, kayitliDurumlar);
    return () => clearAksiyonDurumlari(modulId, durumKeys);
  }, [
    modulId,
    setAksiyonDurumlari,
    clearAksiyonDurumlari,
    durumKeys,
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
    durumlar?.stokAra,
    durumlar?.stokFiyatAnaliz,
    durumlar?.stokEnvanterAnaliz,
    durumlar?.stokBirimListesi,
    durumlar?.stokFiyatDuzenle,
  ]);
}
