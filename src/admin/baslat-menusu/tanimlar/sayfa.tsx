import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { firmalariGetir } from '@/admin/baslat-menusu/tanimlar/api';
import { KurulumSihirbazi } from '@/admin/baslat-menusu/tanimlar/bilesenler/KurulumSihirbazi';
import { KayitlarSayfasi } from '@/admin/baslat-menusu/tanimlar/kayitlar/KayitlarSayfasi';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimModIkon } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModIkon';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import './tanimlar.css';

type TanimSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: <TanimModIkon ad="kurulum" /> },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: <TanimModIkon ad="kayitlar" /> },
] as const;

export function TanimlarSayfasi() {
  const { goruntulemeVar, eklemeVar } = useYetkiler('tanimlar');
  const gorunurSekmeler = useMemo(
    () => (eklemeVar ? MOD_SEKMELER : MOD_SEKMELER.filter((s) => s.id !== 'kurulum')),
    [eklemeVar]
  );
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
        setMod(firmalar.length === 0 && eklemeVar ? 'kurulum' : 'kayitlar');
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

  const modCubugu =
    gorunurSekmeler.length > 1 ? (
      <TanimModCubugu
        sekmeler={gorunurSekmeler}
        aktif={mod}
        onDegistir={(id) => modDegistir(id as TanimSayfaModu)}
        ariaLabel="Tanımlar görünümü"
        kompakt
      />
    ) : null;

  if (ilkYukleniyor) return <TanimYukleniyor />;

  if (!goruntulemeVar) {
    return (
      <YetkisizErisim aciklama="Tanım kayıtlarını görmek için Görüntüleme yetkisi gerekir." />
    );
  }

  return (
    <AdminModulKabuk>
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${ozetAnahtar}`}
        >
          {mod === 'kurulum' && eklemeVar ? (
            <div className="ap-tanimlar-kurulum-kabuk">
              {modCubugu ? (
                <div className="ap-tanimlar-ust-bar ap-tanimlar-ust-bar--kurulum">
                  <div className="ap-tanimlar-ust-bar-satir">
                    <div className="ap-tanimlar-ust-bar-sag">{modCubugu}</div>
                  </div>
                </div>
              ) : null}
              <KurulumSihirbazi
                onTamamlandi={kurulumTamamlandi}
                onIptal={() => modDegistir('kayitlar')}
              />
            </div>
          ) : (
            <KayitlarSayfasi ustSolAksiyon={modCubugu} />
          )}
        </div>
      </div>
    </AdminModulKabuk>
  );
}
