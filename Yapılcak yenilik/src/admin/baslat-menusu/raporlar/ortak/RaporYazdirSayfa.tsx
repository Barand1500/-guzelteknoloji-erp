import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  RaporOnizlemeModal,
  RaporYazdirPanel,
} from '@/admin/baslat-menusu/raporlar/ortak/bilesenler/RaporYazdirPanel';
import type { RaporSablonTipi, RaporYazdirAyar } from '@/admin/baslat-menusu/raporlar/ortak/tipler';
import {
  ozelSablonEkle,
  raporYazdirAyarKaydet,
  raporYazdirAyarOku,
} from '@/admin/baslat-menusu/raporlar/ortak/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

interface RaporYazdirSayfaProps {
  raporTipi: RaporSablonTipi;
  baslik: string;
  aciklama: string;
  panelBaslik: string;
  panelAltBaslik: string;
  onizlemeBaslik: string;
  onizlemeAltBaslik: string;
  onizlemeIcerik: ReactNode;
  bilgiMetni: string;
}

export function RaporYazdirSayfa({
  raporTipi,
  baslik,
  aciklama,
  panelBaslik,
  panelAltBaslik,
  onizlemeBaslik,
  onizlemeAltBaslik,
  onizlemeIcerik,
  bilgiMetni,
}: RaporYazdirSayfaProps) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [ayar, setAyar] = useState<RaporYazdirAyar>(() => raporYazdirAyarOku(raporTipi));
  const [onizlemeAcik, setOnizlemeAcik] = useState(false);
  const [sablonYenile, setSablonYenile] = useState(0);

  const ayarGuncelle = useCallback(
    (yeni: RaporYazdirAyar) => {
      setAyar(yeni);
      raporYazdirAyarKaydet(raporTipi, yeni);
    },
    [raporTipi]
  );

  const yazdir = useCallback(() => {
    if (ayar.yazici === 'PDF Olarak Kaydet') {
      basariBildir(`PDF hazırlanıyor: ${ayar.sablon}`);
      window.print();
      return;
    }
    basariBildir(`${ayar.sablon} şablonu ${ayar.yazici} yazıcısına gönderildi.`);
    window.print();
  }, [ayar, basariBildir]);

  const yeniRapor = useCallback(() => {
    const ad = window.prompt('Yeni rapor şablon adı (.frx uzantısıyla):', 'YeniSablon.frx');
    if (!ad?.trim()) return;
    const dosya = ad.trim().endsWith('.frx') ? ad.trim() : `${ad.trim()}.frx`;
    ozelSablonEkle(raporTipi, dosya);
    ayarGuncelle({ ...ayar, sablon: dosya });
    setSablonYenile((n) => n + 1);
    basariBildir(`"${dosya}" şablonu eklendi.`);
  }, [raporTipi, ayar, ayarGuncelle, basariBildir]);

  const duzenle = useCallback(() => {
    hataBildir('Şablon düzenleyici bir sonraki sürümde eklenecek.');
  }, [hataBildir]);

  const onizlemeAc = useCallback(() => setOnizlemeAcik(true), []);
  const onizlemeKapat = useCallback(() => setOnizlemeAcik(false), []);

  useModulAksiyonlari(
    { kaydet: yazdir, guncelle: onizlemeAc },
    { kaydet: true, guncelle: true }
  );

  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <div className="ap-rapor-yazdir-sayfa">
        <p className="ap-rapor-yazdir-ozet ap-muted text-xs">{bilgiMetni}</p>

        <div className="ap-rapor-yazdir-layout">
          <AdminPanelKarti baslik={panelBaslik} altBaslik={panelAltBaslik}>
            <RaporYazdirPanel
              raporTipi={raporTipi}
              ayar={ayar}
              sablonYenile={sablonYenile}
              onAyarDegistir={ayarGuncelle}
              onYeniRapor={yeniRapor}
              onDuzenle={duzenle}
              onOnizleme={onizlemeAc}
              onTamam={yazdir}
            />
          </AdminPanelKarti>

          <AdminPanelKarti baslik="Hızlı önizleme" altBaslik="Yazdırmadan önce içeriği kontrol edin">
            <div className="ap-rapor-yazdir-mini-onizleme ap-scroll">{onizlemeIcerik}</div>
            <div className="ap-rapor-yazdir-mini-aksiyon">
              <button
                type="button"
                className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
                onClick={onizlemeAc}
              >
                Tam önizleme
              </button>
            </div>
          </AdminPanelKarti>
        </div>

        <RaporOnizlemeModal
          acik={onizlemeAcik}
          baslik={onizlemeBaslik}
          altBaslik={onizlemeAltBaslik}
          yazici={ayar.yazici}
          sablon={ayar.sablon}
          onKapat={onizlemeKapat}
          onYazdir={() => {
            onizlemeKapat();
            yazdir();
          }}
        >
          {onizlemeIcerik}
        </RaporOnizlemeModal>
      </div>
    </AdminModulKabuk>
  );
}
