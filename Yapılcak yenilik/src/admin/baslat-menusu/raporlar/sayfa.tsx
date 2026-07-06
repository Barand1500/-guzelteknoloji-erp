import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { RaporTarihPanel } from '@/admin/baslat-menusu/raporlar/bilesenler/RaporTarihPanel';
import { RaporYazdirPanel } from '@/admin/baslat-menusu/raporlar/bilesenler/RaporYazdirPanel';
import type { RaporGorunum, RaporKayit } from '@/admin/baslat-menusu/raporlar/tipler';
import { raporKaydiKaydet, raporKaydiOku, raporKayitEsit, saatAraligiHesapla } from '@/admin/baslat-menusu/raporlar/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

interface RaporSablonSayfaProps {
  modulId: string;
  baslik: string;
  aciklama?: string;
}

function kayitKopyala(k: RaporKayit): RaporKayit {
  return JSON.parse(JSON.stringify(k)) as RaporKayit;
}

export function RaporSablonSayfa({ modulId, baslik, aciklama }: RaporSablonSayfaProps) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [sonKayit, setSonKayit] = useState<RaporKayit>(() => raporKaydiOku(modulId));
  const [taslak, setTaslak] = useState<RaporKayit>(() => kayitKopyala(raporKaydiOku(modulId)));
  const [gorunum, setGorunum] = useState<RaporGorunum>('tarih');

  const kirli = useMemo(() => !raporKayitEsit(sonKayit, taslak), [sonKayit, taslak]);
  const yazdirAcik = gorunum === 'yazdir';

  const geri = useCallback(() => setGorunum('tarih'), []);

  const kaydet = useCallback(() => {
    if (gorunum === 'tarih') {
      if (saatAraligiHesapla(taslak) <= 0) {
        hataBildir('Geçerli bir tarih ve saat aralığı seçin.', 'Tarih');
        return;
      }
      logMesajiAyarla(
        logMesaj.yapti(
          baslik,
          `${taslak.baslangicTarih} ${taslak.baslangicSaat} – ${taslak.bitisTarih} ${taslak.bitisSaat} tarih aralığını seçip yazdırma adımına geçti`
        )
      );
      setGorunum('yazdir');
      return;
    }

    raporKaydiKaydet(modulId, taslak);
    setSonKayit(kayitKopyala(taslak));
    logMesajiAyarla(
      logMesaj.kaydetti(
        baslik,
        `${taslak.baslangicTarih} ${taslak.baslangicSaat} – ${taslak.bitisTarih} ${taslak.bitisSaat} tarih aralığı ve yazdırma ayarlarını`
      )
    );
    basariBildir(`${baslik} rapor ayarları kaydedildi.`, 'Kaydedildi');
  }, [gorunum, taslak, modulId, baslik, basariBildir, hataBildir, logMesajiAyarla]);

  useModulAksiyonlari(
    { kaydet },
    {
      kaydet: gorunum === 'tarih' || kirli,
      ekle: false,
      guncelle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <AdminPanelKarti>
        <div className="ap-rapor-sablon-modul">
          <div className="ap-tanimlar-yan-gecis">
            <div className={`ap-tanimlar-yan-gecis-izgara ${yazdirAcik ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
              <div className="ap-tanimlar-yan-gecis-panel">
                <RaporTarihPanel kayit={taslak} onKayitDegistir={setTaslak} />
              </div>
              <div className="ap-tanimlar-yan-gecis-panel">
                {yazdirAcik && <RaporYazdirPanel kayit={taslak} onKayitDegistir={setTaslak} onGeri={geri} />}
              </div>
            </div>
          </div>
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
