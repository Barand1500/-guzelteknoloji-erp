import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminBildirimleriGetir,
  adminBildirimleriTumunuOkundu,
  type AdminBildirim,
} from '@/admin/ortak/api/bildirimApi';
import { useAdminUyariBildirim } from '@/baglamlar/AdminUyariBildirimContext';
import { AltPanel, AltPanelBos, AltPanelOge, AltPanelYukleniyor } from '@/admin/ortak/AltPanel';
import { ADMIN_BILDIRIM_YENILE, adminBildirimleriYenile } from '@/araclar/adminBildirimOlaylari';

interface BildirimPaneliProps {
  acik: boolean;
  onKapat: () => void;
  onGuncelle?: () => void;
}

function islemSinifi(tur: string) {
  if (tur === 'hata') return 'ap-alt-panel-hata-oge';
  if (tur === 'basari') return 'ap-alt-panel-basari-oge';
  return '';
}

export function BildirimPaneli({ acik, onKapat, onGuncelle }: BildirimPaneliProps) {
  const navigate = useNavigate();
  const { uyariBildirimleri, islemBildirimleri, tumPanelBildirimleriniTemizle } =
    useAdminUyariBildirim();
  const [bildirimler, setBildirimler] = useState<AdminBildirim[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [islemMesaji, setIslemMesaji] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const veri = await adminBildirimleriGetir();
      setBildirimler(veri.bildirimler);
    } catch {
      setBildirimler([]);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (acik) {
      setIslemMesaji(null);
      void yukle();
    }
  }, [acik, yukle]);

  async function tumunuOkundu() {
    try {
      await adminBildirimleriTumunuOkundu();
      setBildirimler([]);
      tumPanelBildirimleriniTemizle();
      onGuncelle?.();
      adminBildirimleriYenile();
    } catch {
      setIslemMesaji('İşlem başarısız oldu.');
    }
  }

  const toplamBos =
    !yukleniyor &&
    bildirimler.length === 0 &&
    uyariBildirimleri.length === 0 &&
    islemBildirimleri.length === 0;

  function tikla(b: AdminBildirim) {
    if (b.link) navigate(b.link);
    onKapat();
  }

  return (
    <AltPanel
      acik={acik}
      onKapat={onKapat}
      baslik="Bildirimler"
      ustAksiyon={
        <button type="button" className="ap-alt-panel-link" onClick={() => void tumunuOkundu()}>
          Tümünü okundu işaretle
        </button>
      }
    >
      {islemMesaji && <p className="ap-alt-panel-hata px-1 pb-2">{islemMesaji}</p>}
      {yukleniyor && <AltPanelYukleniyor />}
      {islemBildirimleri.map((b) => (
        <AltPanelOge
          key={b.id}
          baslik={b.baslik}
          alt={b.mesaj}
          zaman={b.olusturma}
          okunmamis={b.tur !== 'bilgi'}
          sinif={islemSinifi(b.tur)}
        />
      ))}
      {uyariBildirimleri.map((u) => (
        <AltPanelOge
          key={`uyari-${u.id}`}
          baslik={u.baslik}
          alt={u.mesaj}
          zaman={u.olusturma}
          okunmamis
          sinif="ap-alt-panel-uyari"
        />
      ))}
      {bildirimler.map((b) => (
        <AltPanelOge
          key={b.id}
          baslik={b.baslik}
          alt={b.mesaj}
          zaman={b.olusturma}
          okunmamis={!b.okundu}
          onClick={() => tikla(b)}
        />
      ))}
      {toplamBos && <AltPanelBos mesaj="Henüz bildirim yok." />}
    </AltPanel>
  );
}

export function useBildirimSayaci(pollingMs = 60_000) {
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);
  const { uyariSayisi, islemBildirimSayisi } = useAdminUyariBildirim();

  const yenile = useCallback(async () => {
    try {
      const veri = await adminBildirimleriGetir();
      setOkunmamisSayi(veri.okunmamisSayi);
    } catch {
      setOkunmamisSayi(0);
    }
  }, []);

  useEffect(() => {
    void yenile();
    const timer = setInterval(() => void yenile(), pollingMs);
    function dinle() {
      void yenile();
    }
    window.addEventListener(ADMIN_BILDIRIM_YENILE, dinle);
    return () => {
      clearInterval(timer);
      window.removeEventListener(ADMIN_BILDIRIM_YENILE, dinle);
    };
  }, [yenile, pollingMs]);

  return {
    okunmamisSayi: okunmamisSayi + uyariSayisi + islemBildirimSayisi,
    yenile,
  };
}
