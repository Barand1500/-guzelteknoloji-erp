import { useEffect, useState } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { DonemSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DonemSekme';
import { DepoSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DepoSekme';
import { FirmaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/FirmaSekme';
import { KasaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/KasaSekme';
import { SubeSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/SubeSekme';
import { TanimSekmeCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSekmeCubugu';
import { SEKME_BASLIK, type TanimSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';

export function TanimlarSayfasi() {
  const [sekme, setSekme] = useState<TanimSekmeId>('firma');
  const { setRehberModulId } = useAdminAksiyon();

  useEffect(() => {
    setRehberModulId(`tanimlar-${sekme}`);
    return () => setRehberModulId(null);
  }, [sekme, setRehberModulId]);

  return (
    <AdminModulKabuk
      baslik="Tanımlar"
      aciklama="Firma, şube, depo, kasa ve dönem tanımları"
    >
      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <TanimSekmeCubugu aktif={sekme} onDegistir={setSekme} />
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti baslik={SEKME_BASLIK[sekme]}>
              {sekme === 'firma' && <FirmaSekme />}
              {sekme === 'sube' && <SubeSekme />}
              {sekme === 'depo' && <DepoSekme />}
              {sekme === 'kasa' && <KasaSekme />}
              {sekme === 'donem' && <DonemSekme />}
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
