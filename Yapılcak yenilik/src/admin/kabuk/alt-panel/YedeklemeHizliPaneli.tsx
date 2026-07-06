import { useCallback, useEffect, useState } from 'react';
import { adminYedekApi, type YedekKaydi } from '@/admin/ortak/api/adminSistemApi';
import { AltPanel, AltPanelYukleniyor } from '@/admin/ortak/AltPanel';

interface YedeklemeHizliPaneliProps {
  acik: boolean;
  onKapat: () => void;
  onModulAc?: (modulId: string) => void;
}

function tarihFormat(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function YedeklemeHizliPaneli({ acik, onKapat, onModulAc }: YedeklemeHizliPaneliProps) {
  const [sonKayit, setSonKayit] = useState<YedekKaydi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [indiriliyor, setIndiriliyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tur: 'basari' | 'hata'; metin: string } | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const veri = await adminYedekApi.gecmis();
      setSonKayit(veri.sonKayit);
    } catch {
      setSonKayit(null);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (acik) {
      setMesaj(null);
      void yukle();
    }
  }, [acik, yukle]);

  async function hizliYedekle() {
    setIndiriliyor(true);
    setMesaj(null);
    try {
      await adminYedekApi.indir({ format: 'sql' });
      setMesaj({ tur: 'basari', metin: 'Yedek başarıyla indirildi.' });
      await yukle();
    } catch (err) {
      setMesaj({
        tur: 'hata',
        metin: err instanceof Error ? err.message : 'Yedekleme başarısız',
      });
    } finally {
      setIndiriliyor(false);
    }
  }

  return (
    <AltPanel acik={acik} onKapat={onKapat} baslik="Veri Yedekleme">
      {yukleniyor && <AltPanelYukleniyor />}
      {!yukleniyor && (
        <div className="space-y-3 p-1">
          <p className="ap-alt-panel-aciklama">
            Site verilerinizin SQL yedeğini hızlıca alabilirsiniz.
          </p>
          {sonKayit && (
            <div className="ap-alt-panel-kart">
              <p className="ap-alt-panel-kart-baslik">Son işlem</p>
              <p className="ap-alt-panel-kart-metin">
                {sonKayit.kullaniciAd} — {tarihFormat(sonKayit.olusturma)}
              </p>
              <p className="ap-alt-panel-kart-alt">{sonKayit.dosyaAdi}</p>
            </div>
          )}
          {mesaj && (
            <p className={mesaj.tur === 'basari' ? 'ap-alt-panel-basari' : 'ap-alt-panel-hata'}>
              {mesaj.metin}
            </p>
          )}
          <button
            type="button"
            className="ap-alt-panel-btn"
            disabled={indiriliyor}
            onClick={() => void hizliYedekle()}
          >
            {indiriliyor ? 'Yedekleniyor...' : 'Hızlı SQL yedek al'}
          </button>
          <button
            type="button"
            className="ap-alt-panel-btn-ikincil"
            onClick={() => {
              onModulAc?.('veri-yedekleme');
              onKapat();
            }}
          >
            Tam ekrana git
          </button>
        </div>
      )}
    </AltPanel>
  );
}
