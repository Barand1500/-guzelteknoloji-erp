import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { MasterGorunumSegici, type MasterGorunum } from '@/admin/baslat-menusu/master/bilesenler/MasterGorunumSegici';
import { MasterSekmeCubugu } from '@/admin/baslat-menusu/master/bilesenler/MasterSekmeCubugu';
import { MasterKartUstAksiyonProvider } from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import { MasterSekmeIcerik } from '@/admin/baslat-menusu/master/bilesenler/MasterSekmeIcerik';
import { masterSekmeBul, type MasterSekmeId } from '@/admin/baslat-menusu/master/tipler';
import { masterRehberModulId } from '@/admin/veri/adminMasterRehberleri';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';

const AGAC_SEKMELER = new Set<MasterSekmeId>(['bayiler', 'firmalar', 'subeler', 'lisanslar']);

export function MasterSayfasi() {
  const [sekme, setSekme] = useState<MasterSekmeId>('bayiler');
  const [gorunum, setGorunum] = useState<MasterGorunum>('tablo');
  const [kartUstAksiyon, setKartUstAksiyon] = useState<ReactNode>(null);
  const { setRehberModulId } = useAdminAksiyon();
  const tanim = masterSekmeBul(sekme);
  const kartUstAksiyonAyarla = useCallback((node: ReactNode) => setKartUstAksiyon(node), []);

  useEffect(() => {
    setKartUstAksiyon(null);
  }, [sekme]);

  useEffect(() => {
    setRehberModulId(masterRehberModulId(sekme));
    return () => setRehberModulId(null);
  }, [sekme, setRehberModulId]);

  useEffect(() => {
    setGorunum('tablo');
  }, [sekme]);

  const ustAksiyon =
    AGAC_SEKMELER.has(sekme) || kartUstAksiyon ? (
      <div className="ap-panel-kart-ust-aksiyon">
        {AGAC_SEKMELER.has(sekme) && <MasterGorunumSegici gorunum={gorunum} onDegistir={setGorunum} />}
        {kartUstAksiyon}
      </div>
    ) : undefined;

  return (
    <AdminModulKabuk
      baslik="Master"
      aciklama="Organizasyon yönetimi — bayi, firma, şube, paket ve lisans"
      onizleGoster={false}
    >
      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <MasterSekmeCubugu aktif={sekme} onDegistir={setSekme} />
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti baslik={tanim.baslik} altBaslik={tanim.altBaslik} ustAksiyon={ustAksiyon}>
              <MasterKartUstAksiyonProvider onUstAksiyon={kartUstAksiyonAyarla}>
                <MasterSekmeIcerik sekme={sekme} gorunum={gorunum} />
              </MasterKartUstAksiyonProvider>
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
