import { useCallback, useEffect, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { firmalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import { KurulumSihirbazi } from '@/admin/baslat-menusu/tanimlar/bilesenler/KurulumSihirbazi';
import { TanimKayitlarOzeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitlarOzeti';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import './tanimlar.css';

type TanimSayfaModu = 'kurulum' | 'kayitlar';

export function TanimlarSayfasi() {
  const [mod, setMod] = useState<TanimSayfaModu>('kayitlar');
  const [ilkYukleniyor, setIlkYukleniyor] = useState(true);
  const [ozetAnahtar, setOzetAnahtar] = useState(0);
  const { setRehberModulId } = useAdminAksiyon();

  useEffect(() => {
    if (mod === 'kurulum') {
      setRehberModulId('tanimlar-kurulum');
    }
    return () => setRehberModulId(null);
  }, [mod, setRehberModulId]);

  useEffect(() => {
    void (async () => {
      try {
        const firmalar = await firmalariGetir();
        setMod(firmalar.length === 0 ? 'kurulum' : 'kayitlar');
      } finally {
        setIlkYukleniyor(false);
      }
    })();
  }, []);

  const kurulumTamamlandi = useCallback(() => {
    setMod('kayitlar');
    setOzetAnahtar((k) => k + 1);
  }, []);

  if (ilkYukleniyor) return <TanimYukleniyor />;

  return (
    <AdminModulKabuk
      baslik="Tanımlar"
      aciklama="Firma, şube, dönem, depo ve kasa kayıtlarını buradan oluşturur, düzenler ve hiyerarşik olarak yönetirsiniz."
      ustAksiyon={
        <div className="ap-tanimlar-mod-cubugu" role="tablist" aria-label="Tanımlar görünümü">
          <button
            type="button"
            role="tab"
            aria-selected={mod === 'kurulum'}
            className={`ap-tanimlar-mod-sekme ${mod === 'kurulum' ? 'ap-tanimlar-mod-sekme--aktif' : ''}`}
            onClick={() => setMod('kurulum')}
          >
            <span aria-hidden>✨</span>
            Kurulum Sihirbazı
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mod === 'kayitlar'}
            className={`ap-tanimlar-mod-sekme ${mod === 'kayitlar' ? 'ap-tanimlar-mod-sekme--aktif' : ''}`}
            onClick={() => setMod('kayitlar')}
          >
            <span aria-hidden>📋</span>
            Kayıtlar
          </button>
        </div>
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div className="ap-tanimlar-icerik" key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${ozetAnahtar}`}>
          {mod === 'kurulum' ? (
            <KurulumSihirbazi
              onTamamlandi={kurulumTamamlandi}
              onIptal={() => setMod('kayitlar')}
            />
          ) : (
            <TanimKayitlarOzeti />
          )}
        </div>
      </div>
    </AdminModulKabuk>
  );
}
