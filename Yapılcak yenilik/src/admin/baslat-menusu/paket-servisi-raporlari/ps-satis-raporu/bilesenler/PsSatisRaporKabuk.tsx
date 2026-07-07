import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { PsSatisDetayTablosu } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/bilesenler/PsSatisDetayTablosu';
import { PsSatisRaporFiltreleri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/bilesenler/PsSatisRaporFiltreleri';
import {
  bosPsSatisFiltre,
  psSatisMiktarToplamToplam,
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

export function PsSatisRaporKabuk() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kaynak] = useState(() => psSatisVerisiYenile());
  const [taslakFiltre, setTaslakFiltre] = useState<PsSatisRaporFiltre>(() => bosPsSatisFiltre());
  const [aktifFiltre, setAktifFiltre] = useState<PsSatisRaporFiltre>(() => bosPsSatisFiltre());
  const [filtreleniyor, setFiltreleniyor] = useState(false);
  const [subeModalAcik, setSubeModalAcik] = useState(false);
  const [modalFiltre, setModalFiltre] = useState<SatisRaporFiltre>(() => modalFiltreDonustur(bosPsSatisFiltre()));

  const satirlar = useMemo(
    () => psSatislariFiltrele(kaynak, aktifFiltre),
    [kaynak, aktifFiltre]
  );

  const toplamlar = useMemo(() => psSatisMiktarToplamToplam(satirlar), [satirlar]);

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
      'paket-satis-raporu.csv',
      [
        'Tarih',
        'Saat',
        'Müşteri Adı',
        'Siparişi Alan',
        'Ürün',
        'Miktar',
        'Fiyat',
        'Telefon',
        'Teslim Eden',
        'Toplam',
      ],
      satirlar.map((s) => {
        const d = new Date(s.tarihSaat);
        const tarih = new Intl.DateTimeFormat('tr-TR').format(d);
        const saat = new Intl.DateTimeFormat('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
        return [
          tarih,
          saat,
          s.musteriAdi,
          s.siparisiAlan,
          s.urun,
          String(s.miktar),
          String(s.fiyat),
          s.telefon,
          s.teslimEden,
          String(s.toplam),
        ];
      })
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
      baslik="Satış Raporu"
      aciklama="Paket servisi satış hareketlerini tarih ve ürün kriterlerine göre listeleyin"
      onizleGoster={false}
    >
      <div className="ap-satis-rapor-sayfa ap-ps-satis-rapor-sayfa">
        <PsSatisRaporFiltreleri
          filtre={taslakFiltre}
          onChange={setTaslakFiltre}
          onFiltrele={filtrele}
          filtreleniyor={filtreleniyor}
        />

        <AdminPanelKarti baslik="Satışlar" altBaslik={`${satirlar.length} kayıt`}>
          <PsSatisDetayTablosu satirlar={satirlar} />

          <SatisRaporAltCubuk
            miktarToplam={toplamlar.miktar}
            tutarToplam={toplamlar.toplam}
            subeEtiket={subeEtiketi(aktifFiltre)}
            onSubeDepartman={subeModalAc}
            onExcel={excel}
            excelAktif={satirlar.length > 0}
            tutarEtiket="Toplam"
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
