import { useEffect, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { DonemSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DonemSekme';
import { DepoSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DepoSekme';
import { FirmaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/FirmaSekme';
import { KasaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/KasaSekme';
import { SubeSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/SubeSekme';
import { TanimSekmeCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSekmeCubugu';
import { SEKME_ALT, SEKME_BASLIK, type TanimSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import './tanimlar.css';

function SekmeIcerik({ sekme }: { sekme: TanimSekmeId }) {
  switch (sekme) {
    case 'firma':
      return <FirmaSekme />;
    case 'sube':
      return <SubeSekme />;
    case 'depo':
      return <DepoSekme />;
    case 'kasa':
      return <KasaSekme />;
    case 'donem':
      return <DonemSekme />;
  }
}

export function TanimlarSayfasi() {
  const [sekme, setSekme] = useState<TanimSekmeId>('firma');
  const { setRehberModulId } = useAdminAksiyon();

  useEffect(() => {
    setRehberModulId(`tanimlar-${sekme}`);
    return () => setRehberModulId(null);
  }, [sekme, setRehberModulId]);

  return (
    <AdminModulKabuk baslik="Tanımlar">
      <div className="ap-tanimlar-sayfa">
        <header className="ap-tanimlar-ust">
          <TanimSekmeCubugu aktif={sekme} onDegistir={setSekme} />
          <div className="ap-tanimlar-ust-metin" key={sekme}>
            <h2 className="ap-tanimlar-ust-baslik">{SEKME_BASLIK[sekme]}</h2>
            <p className="ap-tanimlar-ust-aciklama">{SEKME_ALT[sekme]}</p>
          </div>
        </header>

        <div className="ap-tanimlar-icerik" key={sekme}>
          <SekmeIcerik sekme={sekme} />
        </div>
      </div>
    </AdminModulKabuk>
  );
}
