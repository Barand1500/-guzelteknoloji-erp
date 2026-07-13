import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import { CariKayitlarOzeti } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariKayitlarOzeti';
import { CariKurulumSihirbazi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariKurulumSihirbazi';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/ortak/datagrid/datagrid.css';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useYetkiler } from '@/kancalar/useYetkiler';

type CariSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: '✨' },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: '📋' },
] as const;

export function CariSayfasi() {
  const { goruntulemeVar, eklemeVar } = useYetkiler();
  const gorunurSekmeler = useMemo(
    () => (eklemeVar ? MOD_SEKMELER : MOD_SEKMELER.filter((s) => s.id !== 'kurulum')),
    [eklemeVar]
  );
  const [mod, setMod] = useState<CariSayfaModu>('kayitlar');
  const [modYonu, setModYonu] = useState<'ileri' | 'geri'>('ileri');
  const [ilkYukleniyor, setIlkYukleniyor] = useState(true);
  const [ozetAnahtar, setOzetAnahtar] = useState(0);
  const { setRehberModulId } = useAdminAksiyon();

  useEffect(() => {
    if (mod === 'kurulum') {
      setRehberModulId('cari-kurulum');
    }
    return () => setRehberModulId(null);
  }, [mod, setRehberModulId]);

  useEffect(() => {
    void (async () => {
      try {
        const cariler = await carileriGetir();
        setMod(cariler.length === 0 && eklemeVar ? 'kurulum' : 'kayitlar');
      } finally {
        setIlkYukleniyor(false);
      }
    })();
  }, [eklemeVar]);

  const kurulumTamamlandi = useCallback(() => {
    setModYonu('ileri');
    setMod('kayitlar');
    setOzetAnahtar((k) => k + 1);
  }, []);

  const modDegistir = useCallback(
    (yeni: CariSayfaModu) => {
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

  if (!goruntulemeVar) {
    return (
      <YetkisizErisim aciklama="Cari kartları görmek için Görüntüleme yetkisi gerekir." />
    );
  }

  return (
    <AdminModulKabuk
      baslik="Cari Kartlar"
      aciklama="Müşteri ve tedarikçi cari kartlarını buradan oluşturur, düzenler ve yönetirsiniz."
      ustAksiyon={
        <TanimModCubugu
          sekmeler={gorunurSekmeler}
          aktif={mod}
          onDegistir={(id) => modDegistir(id as CariSayfaModu)}
          ariaLabel="Cari kartlar görünümü"
        />
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${ozetAnahtar}`}
        >
          {mod === 'kurulum' && eklemeVar ? (
            <CariKurulumSihirbazi
              onTamamlandi={kurulumTamamlandi}
              onIptal={() => modDegistir('kayitlar')}
            />
          ) : (
            <CariKayitlarOzeti />
          )}
        </div>
      </div>
    </AdminModulKabuk>
  );
}
