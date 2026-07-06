import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { useSekmeKirli } from '@/kancalar/useSekmeKirli';
import { TanimlarGenelSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGenelSekme';
import { TanimlarSekmeIcerik } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarSekmeIcerik';
import { TanimlarSekmeCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarSekmeCubugu';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { UYARI_KAYDEDILMEDI } from '@/admin/baslat-menusu/tanimlar/genel/veri';
import { tanimlarSekmeBul, type TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';

const KIRLI_TAKIP_SEKMELER: TanimlarSekmeId[] = [
  'genel',
  'diger',
  'sms-ayarlari',
  'kullanicilar',
  'masa-gruplari',
  'barkod',
  'paket-servisi-ucretleri',
  'restoran-durumu',
];

export function TanimlarSayfasi() {
  const [sekme, setSekme] = useState<TanimlarSekmeId>('genel');
  const [kirliSekmeler, setKirliSekmeler] = useState<Partial<Record<TanimlarSekmeId, boolean>>>({});
  const [sekmeUyari, setSekmeUyari] = useState<string | null>(null);
  const aktifSekme = tanimlarSekmeBul(sekme);

  const sekmeKirliMi = useCallback(
    (id: TanimlarSekmeId) => Boolean(kirliSekmeler[id]),
    [kirliSekmeler]
  );

  const onSekmeKirliDegisti = useCallback((id: TanimlarSekmeId, kirli: boolean) => {
    setKirliSekmeler((onceki) => ({ ...onceki, [id]: kirli }));
  }, []);

  const ustSekmeKirli = useMemo(() => Object.values(kirliSekmeler).some(Boolean), [kirliSekmeler]);
  useSekmeKirli(ustSekmeKirli);

  const sekmeDegistir = useCallback(
    (yeni: TanimlarSekmeId) => {
      if (yeni !== sekme && KIRLI_TAKIP_SEKMELER.includes(sekme) && sekmeKirliMi(sekme)) {
        setSekmeUyari(UYARI_KAYDEDILMEDI);
        return;
      }
      setSekmeUyari(null);
      setSekme(yeni);
    },
    [sekme, sekmeKirliMi]
  );

  return (
    <AdminModulKabuk
      baslik="Tanımlar"
      aciklama="Restoran kullanıcıları, masa grupları, barkod ve operasyon ayarları"
      onizleGoster={false}
    >
      <div className="ap-sistem-yonetimi">
        <div className="ap-sistem-layout">
          <aside className="ap-sistem-sol">
            <TanimlarSekmeCubugu aktif={sekme} onDegistir={sekmeDegistir} />
          </aside>

          <div className="ap-sistem-icerik">
            <AdminPanelKarti baslik={aktifSekme.ad} altBaslik={aktifSekme.altBaslik}>
              <TanimlarGeciciUyari mesaj={sekmeUyari} onTemizle={() => setSekmeUyari(null)} />

              {sekme === 'genel' ? (
                <TanimlarGenelSekme onKirliDegisti={(kirli) => onSekmeKirliDegisti('genel', kirli)} />
              ) : (
                <TanimlarSekmeIcerik
                  sekme={sekme}
                  onKirliDegisti={
                    KIRLI_TAKIP_SEKMELER.includes(sekme)
                      ? (kirli) => onSekmeKirliDegisti(sekme, kirli)
                      : undefined
                  }
                />
              )}
            </AdminPanelKarti>
          </div>
        </div>
      </div>
    </AdminModulKabuk>
  );
}
