import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ADMIN_ISLEM_BILDIRIMI,
  type AdminIslemBildirimDetay,
  type AdminIslemBildirimTur,
} from '@/araclar/adminBildirimOlaylari';

export interface AdminUyariBildirim {
  id: string;
  baslik: string;
  mesaj: string;
  olusturma: string;
  tur?: 'uyari';
}

export interface AdminIslemBildirim {
  id: string;
  baslik: string;
  mesaj: string;
  olusturma: string;
  tur: AdminIslemBildirimTur;
}

interface AdminUyariBildirimContextType {
  uyariBildirimleri: AdminUyariBildirim[];
  islemBildirimleri: AdminIslemBildirim[];
  uyariSayisi: number;
  islemBildirimSayisi: number;
  uyariAyarla: (anahtar: string, bildirim: { baslik: string; mesaj: string } | null) => void;
  islemBildirimiEkle: (baslik: string, mesaj: string, tur?: AdminIslemBildirimTur) => void;
  tumPanelBildirimleriniTemizle: () => void;
}

const AdminUyariBildirimContext = createContext<AdminUyariBildirimContextType | null>(null);

const MAX_ISLEM_BILDIRIM = 40;

export function AdminUyariBildirimProvider({ children }: { children: ReactNode }) {
  const [uyarilar, setUyarilar] = useState<Record<string, AdminUyariBildirim>>({});
  const [islemBildirimleri, setIslemBildirimleri] = useState<AdminIslemBildirim[]>([]);

  const islemBildirimiEkle = useCallback(
    (baslik: string, mesaj: string, tur: AdminIslemBildirimTur = 'basari') => {
      setIslemBildirimleri((onceki) =>
        [
          {
            id: crypto.randomUUID(),
            baslik,
            mesaj,
            tur,
            olusturma: new Date().toISOString(),
          },
          ...onceki,
        ].slice(0, MAX_ISLEM_BILDIRIM)
      );
    },
    []
  );

  useEffect(() => {
    function dinle(e: Event) {
      const detay = (e as CustomEvent<AdminIslemBildirimDetay>).detail;
      if (!detay?.mesaj) return;
      islemBildirimiEkle(detay.baslik, detay.mesaj, detay.tur);
    }
    window.addEventListener(ADMIN_ISLEM_BILDIRIMI, dinle);
    return () => window.removeEventListener(ADMIN_ISLEM_BILDIRIMI, dinle);
  }, [islemBildirimiEkle]);

  const uyariAyarla = useCallback(
    (anahtar: string, bildirim: { baslik: string; mesaj: string } | null) => {
      setUyarilar((onceki) => {
        if (!bildirim) {
          if (!(anahtar in onceki)) return onceki;
          const { [anahtar]: _, ...kalan } = onceki;
          return kalan;
        }
        const mevcut = onceki[anahtar];
        if (mevcut && mevcut.baslik === bildirim.baslik && mevcut.mesaj === bildirim.mesaj) {
          return onceki;
        }
        return {
          ...onceki,
          [anahtar]: {
            id: anahtar,
            baslik: bildirim.baslik,
            mesaj: bildirim.mesaj,
            olusturma: new Date().toISOString(),
            tur: 'uyari',
          },
        };
      });
    },
    []
  );

  const tumPanelBildirimleriniTemizle = useCallback(() => {
    setUyarilar({});
    setIslemBildirimleri([]);
  }, []);

  const uyariBildirimleri = useMemo(
    () =>
      Object.values(uyarilar).sort(
        (a, b) => new Date(b.olusturma).getTime() - new Date(a.olusturma).getTime()
      ),
    [uyarilar]
  );

  const deger = useMemo(
    () => ({
      uyariBildirimleri,
      islemBildirimleri,
      uyariSayisi: uyariBildirimleri.length,
      islemBildirimSayisi: islemBildirimleri.length,
      uyariAyarla,
      islemBildirimiEkle,
      tumPanelBildirimleriniTemizle,
    }),
    [
      uyariBildirimleri,
      islemBildirimleri,
      uyariAyarla,
      islemBildirimiEkle,
      tumPanelBildirimleriniTemizle,
    ]
  );

  return (
    <AdminUyariBildirimContext.Provider value={deger}>{children}</AdminUyariBildirimContext.Provider>
  );
}

export function useAdminUyariBildirim() {
  const ctx = useContext(AdminUyariBildirimContext);
  if (!ctx) {
    return {
      uyariBildirimleri: [] as AdminUyariBildirim[],
      islemBildirimleri: [] as AdminIslemBildirim[],
      uyariSayisi: 0,
      islemBildirimSayisi: 0,
      uyariAyarla: () => {},
      islemBildirimiEkle: () => {},
      tumPanelBildirimleriniTemizle: () => {},
    };
  }
  return ctx;
}

/** Kaydedilmemiş değişiklik uyarısını bildirim paneline yazar */
export function useKaydedilmemisBildirim(
  aktif: boolean,
  mesaj: string,
  baslik: string,
  anahtar: string
) {
  const { uyariAyarla } = useAdminUyariBildirim();

  useEffect(() => {
    if (aktif) {
      uyariAyarla(anahtar, { baslik, mesaj });
    } else {
      uyariAyarla(anahtar, null);
    }
    return () => uyariAyarla(anahtar, null);
  }, [aktif, mesaj, baslik, anahtar, uyariAyarla]);
}
