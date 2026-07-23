import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { adminIslemBildirimi } from '@/araclar/adminBildirimOlaylari';

export type AksiyonId =
  | 'kaydet'
  | 'hizliKaydet'
  | 'guncelle'
  | 'ekle'
  | 'altEkle'
  | 'sil'
  | 'onizle'
  | 'yayinla'
  | 'oncekiKayit'
  | 'sonrakiKayit'
  | 'stokAra'
  | 'stokFiyatAnaliz'
  | 'stokEnvanterAnaliz'
  | 'stokBirimListesi'
  | 'stokFiyatDuzenle';

export interface AksiyonHandlerlar {
  kaydet?: () => Promise<void> | void;
  hizliKaydet?: () => Promise<void> | void;
  guncelle?: () => Promise<void> | void;
  ekle?: () => void;
  altEkle?: () => void;
  sil?: () => Promise<void> | void;
  onizle?: () => void;
  yayinla?: () => Promise<void> | void;
  oncekiKayit?: () => void;
  sonrakiKayit?: () => void;
  stokAra?: () => void;
  stokFiyatAnaliz?: () => void;
  stokEnvanterAnaliz?: () => void;
  stokBirimListesi?: () => void;
  stokFiyatDuzenle?: () => void;
}

export type AksiyonDurumlari = Partial<Record<AksiyonId, boolean>>;
export type AksiyonEtiketleri = Partial<Record<AksiyonId, string>>;

export interface AksiyonGeriBildirim {
  aksiyonId: AksiyonId;
  mesaj: string;
  tur: 'basari' | 'hata';
}

const AKSİYON_BASARI: Partial<Record<AksiyonId, string>> = {
  kaydet: 'Kaydedildi',
  hizliKaydet: 'Siteye eklendi',
  guncelle: 'Güncellendi',
  ekle: 'Eklendi',
  sil: 'Silindi',
  yayinla: 'Yayınlandı',
  onizle: 'Önizleme açıldı',
};

interface ModulAksiyonKaydi {
  handlers: AksiyonHandlerlar;
  durumlar: AksiyonDurumlari;
  etiketler: AksiyonEtiketleri;
}

interface AdminAksiyonContextType {
  focusModulId: string;
  setFocusModulId: (id: string) => void;
  /** Modul ici rehber anahtari (or. sekme bazli yardim) */
  rehberModulId: string | null;
  setRehberModulId: (id: string | null) => void;
  registerHandlers: (modulId: string, handlers: AksiyonHandlerlar) => void;
  clearHandlers: (modulId: string, keys?: (keyof AksiyonHandlerlar)[]) => void;
  setAksiyonDurumlari: (modulId: string, durumlar: AksiyonDurumlari) => void;
  clearAksiyonDurumlari: (modulId: string, keys?: AksiyonId[]) => void;
  setAksiyonEtiketleri: (modulId: string, etiketler: AksiyonEtiketleri) => void;
  clearAksiyonEtiketleri: (modulId: string, keys?: AksiyonId[]) => void;
  aksiyonDurumlari: AksiyonDurumlari;
  aksiyonEtiketleri: AksiyonEtiketleri;
  aksiyonGeriBildirim: AksiyonGeriBildirim | null;
  aksiyonGeriBildirimiGoster: (
    aksiyonId: AksiyonId,
    mesaj?: string,
    tur?: 'basari' | 'hata'
  ) => void;
  aksiyonCalistir: (id: string) => Promise<void>;
  aksiyonCalistirModul: (modulId: string, id: string) => Promise<boolean>;
  modulAksiyonVarMi: (modulId: string, id: AksiyonId) => boolean;
  /** Modül işlemi sonrası loga yazılacak özel açıklama (aksiyon handler içinde çağrılır) */
  logMesajiAyarla: (mesaj: string) => void;
  logMesajiAl: () => string | null;
}

const AdminAksiyonContext = createContext<AdminAksiyonContextType | null>(null);

export function AdminAksiyonProvider({ children }: { children: ReactNode }) {
  const kayitlarRef = useRef<Map<string, ModulAksiyonKaydi>>(new Map());
  const logMesajiRef = useRef<string | null>(null);
  const [focusModulId, setFocusModulId] = useState('dashboard');
  const [rehberModulId, setRehberModulId] = useState<string | null>(null);
  const [aksiyonDurumlari, setAksiyonDurumlariState] = useState<AksiyonDurumlari>({});
  const [aksiyonEtiketleri, setAksiyonEtiketleriState] = useState<AksiyonEtiketleri>({});
  const [aksiyonGeriBildirim, setAksiyonGeriBildirim] = useState<AksiyonGeriBildirim | null>(null);
  const geriBildirimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const kayit = kayitlarRef.current.get(focusModulId);
    setAksiyonDurumlariState(kayit?.durumlar ?? {});
    setAksiyonEtiketleriState(kayit?.etiketler ?? {});
  }, [focusModulId]);

  const aksiyonGeriBildirimiGoster = useCallback(
    (aksiyonId: AksiyonId, mesaj?: string, tur: 'basari' | 'hata' = 'basari') => {
      if (geriBildirimTimerRef.current) {
        clearTimeout(geriBildirimTimerRef.current);
        geriBildirimTimerRef.current = null;
      }

      const varsayilan =
        tur === 'basari' ? AKSİYON_BASARI[aksiyonId] : 'İşlem başarısız';
      setAksiyonGeriBildirim({
        aksiyonId,
        mesaj: mesaj ?? varsayilan ?? 'Tamamlandı',
        tur,
      });
      geriBildirimTimerRef.current = setTimeout(
        () => setAksiyonGeriBildirim(null),
        tur === 'basari' ? 1500 : 2500
      );
    },
    []
  );

  const logMesajiAyarla = useCallback((mesaj: string) => {
    logMesajiRef.current = mesaj.trim() || null;
  }, []);

  const logMesajiAl = useCallback(() => {
    const mesaj = logMesajiRef.current;
    logMesajiRef.current = null;
    return mesaj;
  }, []);

  const bosKayit = (): ModulAksiyonKaydi => ({
    handlers: {},
    durumlar: {},
    etiketler: {},
  });

  const registerHandlers = useCallback((modulId: string, handlers: AksiyonHandlerlar) => {
    const mevcut = kayitlarRef.current.get(modulId) ?? bosKayit();
    kayitlarRef.current.set(modulId, {
      ...mevcut,
      handlers: { ...mevcut.handlers, ...handlers },
    });
  }, []);

  const clearHandlers = useCallback((modulId: string, keys?: (keyof AksiyonHandlerlar)[]) => {
    const mevcut = kayitlarRef.current.get(modulId);
    if (!mevcut) return;
    if (!keys?.length) {
      kayitlarRef.current.set(modulId, { ...mevcut, handlers: {} });
      return;
    }
    const handlers = { ...mevcut.handlers };
    for (const key of keys) delete handlers[key];
    kayitlarRef.current.set(modulId, { ...mevcut, handlers });
  }, []);

  const setAksiyonDurumlari = useCallback(
    (modulId: string, durumlar: AksiyonDurumlari) => {
      const mevcut = kayitlarRef.current.get(modulId) ?? bosKayit();
      const birlesik = { ...mevcut.durumlar, ...durumlar };
      kayitlarRef.current.set(modulId, { ...mevcut, durumlar: birlesik });
      setAksiyonDurumlariState((onceki) => {
        if (modulId !== focusModulId) return onceki;
        return birlesik;
      });
    },
    [focusModulId]
  );

  const clearAksiyonDurumlari = useCallback(
    (modulId: string, keys?: AksiyonId[]) => {
      const mevcut = kayitlarRef.current.get(modulId);
      if (!mevcut) return;
      if (!keys?.length) {
        kayitlarRef.current.set(modulId, { ...mevcut, durumlar: {} });
      } else {
        const durumlar = { ...mevcut.durumlar };
        for (const key of keys) delete durumlar[key];
        kayitlarRef.current.set(modulId, { ...mevcut, durumlar });
      }
      setAksiyonDurumlariState((onceki) => {
        if (modulId !== focusModulId) return onceki;
        return kayitlarRef.current.get(modulId)?.durumlar ?? {};
      });
    },
    [focusModulId]
  );

  const setAksiyonEtiketleri = useCallback(
    (modulId: string, etiketler: AksiyonEtiketleri) => {
      const mevcut = kayitlarRef.current.get(modulId) ?? bosKayit();
      const birlesik = { ...(mevcut.etiketler ?? {}), ...etiketler };
      kayitlarRef.current.set(modulId, {
        handlers: mevcut.handlers ?? {},
        durumlar: mevcut.durumlar ?? {},
        etiketler: birlesik,
      });
      setAksiyonEtiketleriState((onceki) => {
        if (modulId !== focusModulId) return onceki;
        return birlesik;
      });
    },
    [focusModulId]
  );

  const clearAksiyonEtiketleri = useCallback(
    (modulId: string, keys?: AksiyonId[]) => {
      const mevcut = kayitlarRef.current.get(modulId);
      if (!mevcut) return;
      if (!keys?.length) {
        kayitlarRef.current.set(modulId, {
          handlers: mevcut.handlers ?? {},
          durumlar: mevcut.durumlar ?? {},
          etiketler: {},
        });
      } else {
        const etiketler = { ...(mevcut.etiketler ?? {}) };
        for (const key of keys) delete etiketler[key];
        kayitlarRef.current.set(modulId, {
          handlers: mevcut.handlers ?? {},
          durumlar: mevcut.durumlar ?? {},
          etiketler,
        });
      }
      setAksiyonEtiketleriState((onceki) => {
        if (modulId !== focusModulId) return onceki;
        return kayitlarRef.current.get(modulId)?.etiketler ?? {};
      });
    },
    [focusModulId]
  );

  const aksiyonCalistirIc = useCallback(
    async (modulId: string, id: string, bildirimGoster = true): Promise<boolean> => {
      const handlers = kayitlarRef.current.get(modulId)?.handlers ?? {};
      const aksiyonId = id as AksiyonId;

      try {
        if (id === 'kaydet' && handlers.kaydet) await handlers.kaydet();
        else if (id === 'hizliKaydet' && handlers.hizliKaydet) await handlers.hizliKaydet();
        else if (id === 'guncelle' && handlers.guncelle) await handlers.guncelle();
        else if (id === 'ekle' && handlers.ekle) handlers.ekle();
        else if (id === 'altEkle' && handlers.altEkle) handlers.altEkle();
        else if (id === 'sil' && handlers.sil) await handlers.sil();
        else if (id === 'onizle' && handlers.onizle) handlers.onizle();
        else if (id === 'yayinla' && handlers.yayinla) await handlers.yayinla();
        else if (id === 'oncekiKayit' && handlers.oncekiKayit) handlers.oncekiKayit();
        else if (id === 'sonrakiKayit' && handlers.sonrakiKayit) handlers.sonrakiKayit();
        else if (id === 'stokAra' && handlers.stokAra) handlers.stokAra();
        else if (id === 'stokFiyatAnaliz' && handlers.stokFiyatAnaliz) handlers.stokFiyatAnaliz();
        else if (id === 'stokEnvanterAnaliz' && handlers.stokEnvanterAnaliz) handlers.stokEnvanterAnaliz();
        else if (id === 'stokBirimListesi' && handlers.stokBirimListesi) handlers.stokBirimListesi();
        else if (id === 'stokFiyatDuzenle' && handlers.stokFiyatDuzenle) handlers.stokFiyatDuzenle();
        else return false;

        if (bildirimGoster && AKSİYON_BASARI[aksiyonId]) {
          aksiyonGeriBildirimiGoster(aksiyonId);
        }
        return true;
      } catch {
        if (bildirimGoster) {
          aksiyonGeriBildirimiGoster(aksiyonId, 'İşlem başarısız', 'hata');
          adminIslemBildirimi('İşlem başarısız', 'hata');
        }
        return false;
      }
    },
    [aksiyonGeriBildirimiGoster]
  );

  const aksiyonCalistir = useCallback(
    async (id: string) => {
      await aksiyonCalistirIc(focusModulId, id, true);
    },
    [focusModulId, aksiyonCalistirIc]
  );

  const aksiyonCalistirModul = useCallback(
    async (modulId: string, id: string) => aksiyonCalistirIc(modulId, id, modulId === focusModulId),
    [focusModulId, aksiyonCalistirIc]
  );

  const modulAksiyonVarMi = useCallback((modulId: string, id: AksiyonId) => {
    const handlers = kayitlarRef.current.get(modulId)?.handlers ?? {};
    return Boolean(handlers[id]);
  }, []);

  return (
    <AdminAksiyonContext.Provider
      value={{
        focusModulId,
        setFocusModulId,
        rehberModulId,
        setRehberModulId,
        registerHandlers,
        clearHandlers,
        setAksiyonDurumlari,
        clearAksiyonDurumlari,
        setAksiyonEtiketleri,
        clearAksiyonEtiketleri,
        aksiyonDurumlari,
        aksiyonEtiketleri,
        aksiyonGeriBildirim,
        aksiyonGeriBildirimiGoster,
        aksiyonCalistir,
        aksiyonCalistirModul,
        modulAksiyonVarMi,
        logMesajiAyarla,
        logMesajiAl,
      }}
    >
      {children}
    </AdminAksiyonContext.Provider>
  );
}

export function useAdminAksiyon() {
  const ctx = useContext(AdminAksiyonContext);
  if (!ctx) throw new Error('useAdminAksiyon AdminAksiyonProvider icinde kullanilmali');
  return ctx;
}
