import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { PsSatisRaporFiltreleri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/bilesenler/PsSatisRaporFiltreleri';
import { PsSatisToplamTablosu } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-toplamlari/bilesenler/PsSatisToplamTablosu';
import {
  bosPsSatisFiltre,
  psSatisMiktarToplamToplam,
  psSatisToplamlariHesapla,
  type PsSatisRaporFiltre,
} from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/tipler';
import {
  psSatislariFiltrele,
  psSatisVerisiYenile,
} from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/yardimci';
import { SatisRaporAltCubuk } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SatisRaporAltCubuk';
import { SubeDepartmanModal } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SubeDepartmanModal';
import type { SatisRaporFiltre } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';
import { csvIndir } from '@/admin/baslat-menusu/raporlar/satis-ortak/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function subeEtiketi(filtre: PsSatisRaporFiltre) {
  const parcalar: string[] = [];
  if (filtre.sube) parcalar.push(filtre.sube);
  if (filtre.departman) parcalar.push(filtre.departman);
  return parcalar.join(' · ');
}

function modalFiltreDonustur(filtre: PsSatisRaporFiltre): SatisRaporFiltre {
  return { ...filtre, urunGrubu: '' };
}

export function PsSatisToplamlariKabuk() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kaynak] = useState(() => psSatisVerisiYenile());
  const [taslakFiltre, setTaslakFiltre] = useState<PsSatisRaporFiltre>(() => bosPsSatisFiltre());
  const [aktifFiltre, setAktifFiltre] = useState<PsSatisRaporFiltre>(() => bosPsSatisFiltre());
  const [filtreleniyor, setFiltreleniyor] = useState(false);
  const [subeModalAcik, setSubeModalAcik] = useState(false);
  const [modalFiltre, setModalFiltre] = useState<SatisRaporFiltre>(() => modalFiltreDonustur(bosPsSatisFiltre()));

  const detaySatirlar = useMemo(
    () => psSatislariFiltrele(kaynak, aktifFiltre),
    [kaynak, aktifFiltre]
  );

  const satirlar = useMemo(() => psSatisToplamlariHesapla(detaySatirlar), [detaySatirlar]);

  const toplamlar = useMemo(() => {
    const ozet = psSatisMiktarToplamToplam(detaySatirlar);
    return { miktar: ozet.miktar, tutar: ozet.toplam };
  }, [detaySatirlar]);

  const filtrele = useCallback(() => {
    setFiltreleniyor(true);
    window.setTimeout(() => {
      setAktifFiltre({ ...taslakFiltre });
      setFiltreleniyor(false);
      basariBildir('Rapor filtrelendi.');
    }, 180);
  }, [taslakFiltre, basariBildir]);

  const yazdir = useCallback(() => {
    window.print();
  }, []);

  const excel = useCallback(() => {
    if (satirlar.length === 0) return;

    csvIndir(
      'paket-satis-toplamlari.csv',
      ['Ürün', 'Tutar', 'Toplam Satış'],
      satirlar.map((s) => [s.urun, String(s.tutar), String(s.miktar)])
    );
    basariBildir('Excel dosyası indirildi.');
  }, [satirlar, basariBildir]);

  const subeModalAc = useCallback(() => {
    setModalFiltre(modalFiltreDonustur(taslakFiltre));
    setSubeModalAcik(true);
  }, [taslakFiltre]);

  const subeUygula = useCallback(() => {
    const yeni: PsSatisRaporFiltre = {
      ...taslakFiltre,
      sube: modalFiltre.sube,
      departman: modalFiltre.departman,
    };
    setTaslakFiltre(yeni);
    setAktifFiltre(yeni);
    setSubeModalAcik(false);
    basariBildir('Şube / departman filtresi uygulandı.');
  }, [taslakFiltre, modalFiltre, basariBildir]);

  const kirli = useMemo(
    () => JSON.stringify(taslakFiltre) !== JSON.stringify(aktifFiltre),
    [taslakFiltre, aktifFiltre]
  );

  useModulAksiyonlari(
    { kaydet: excel, guncelle: yazdir },
    { kaydet: satirlar.length > 0, guncelle: true },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Satış Toplamları"
      aciklama="Paket servisi satışlarını ürün bazında toplam tutar ve adet olarak özetleyin"
      onizleGoster={false}
    >
      <div className="ap-satis-rapor-sayfa ap-ps-satis-rapor-sayfa">
        <PsSatisRaporFiltreleri
          filtre={taslakFiltre}
          onChange={setTaslakFiltre}
          onFiltrele={filtrele}
          filtreleniyor={filtreleniyor}
        />

        <AdminPanelKarti baslik="Toplam Satışlar" altBaslik={`${satirlar.length} ürün`}>
          <PsSatisToplamTablosu
            satirlar={satirlar}
            tutarToplam={toplamlar.tutar}
            toplamSatis={toplamlar.miktar}
          />

          <SatisRaporAltCubuk
            miktarToplam={toplamlar.miktar}
            tutarToplam={toplamlar.tutar}
            subeEtiket={subeEtiketi(aktifFiltre)}
            onSubeDepartman={subeModalAc}
            onExcel={excel}
            excelAktif={satirlar.length > 0}
            miktarEtiket="Toplam Satış"
            ozetTutarOnce
          />
        </AdminPanelKarti>
      </div>

      <SubeDepartmanModal
        acik={subeModalAcik}
        filtre={modalFiltre}
        onChange={setModalFiltre}
        onKapat={() => setSubeModalAcik(false)}
        onUygula={subeUygula}
      />
    </AdminModulKabuk>
  );
}
