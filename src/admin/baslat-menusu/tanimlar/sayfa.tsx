import { useCallback, useEffect, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { firmalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import { KurulumSihirbazi } from '@/admin/baslat-menusu/tanimlar/bilesenler/KurulumSihirbazi';
import { TanimKayitlarOzeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitlarOzeti';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import './tanimlar.css';

type TanimSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: '✨' },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: '📋' },
] as const;

export function TanimlarSayfasi() {
  const [mod, setMod] = useState<TanimSayfaModu>('kayitlar');
  const [modYonu, setModYonu] = useState<'ileri' | 'geri'>('ileri');
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
    setModYonu('ileri');
    setMod('kayitlar');
    setOzetAnahtar((k) => k + 1);
  }, []);

  const modDegistir = useCallback(
    (yeni: TanimSayfaModu) => {
      if (yeni === mod) return;
      const eskiIdx = MOD_SEKMELER.findIndex((s) => s.id === mod);
      const yeniIdx = MOD_SEKMELER.findIndex((s) => s.id === yeni);
      if (eskiIdx >= 0 && yeniIdx >= 0) {
        setModYonu(yeniIdx > eskiIdx ? 'ileri' : 'geri');
      }
      setMod(yeni);
    },
    [mod]
  );

  if (ilkYukleniyor) return <TanimYukleniyor />;

  return (
    <AdminModulKabuk
      baslik="Tanımlar"
      aciklama="Firma, şube, dönem, depo ve kasa kayıtlarını buradan oluşturur, düzenler ve hiyerarşik olarak yönetirsiniz."
      ustAksiyon={
        <TanimModCubugu
          sekmeler={MOD_SEKMELER}
          aktif={mod}
          onDegistir={(id) => modDegistir(id as TanimSayfaModu)}
          ariaLabel="Tanımlar görünümü"
        />
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${ozetAnahtar}`}
        >
          {mod === 'kurulum' ? (
            <KurulumSihirbazi
              onTamamlandi={kurulumTamamlandi}
              onIptal={() => modDegistir('kayitlar')}
            />
          ) : (
            <TanimKayitlarOzeti />
          )}
        </div>
      </div>
    </AdminModulKabuk>
  );
}
