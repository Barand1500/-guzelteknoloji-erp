import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { SatisDetayTablosu } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SatisDetayTablosu';
import { SatisRaporAltCubuk } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SatisRaporAltCubuk';
import { SatisRaporFiltreleri } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SatisRaporFiltreleri';
import { SatisToplamTablosu } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SatisToplamTablosu';
import { SubeDepartmanModal } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SubeDepartmanModal';
import {
  bosSatisFiltre,
  satisMiktarTutarToplam,
  satisToplamlariHesapla,
  type SatisRaporFiltre,
} from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';
import { csvIndir, satislariFiltrele, satisVerisiYenile } from '@/admin/baslat-menusu/raporlar/satis-ortak/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export type SatisRaporModu = 'detay' | 'toplam';

interface SatisRaporKabukProps {
  mod: SatisRaporModu;
  baslik: string;
  aciklama: string;
  panelBaslik: string;
}

function subeEtiketi(filtre: SatisRaporFiltre) {
  const parcalar: string[] = [];
  if (filtre.sube) parcalar.push(filtre.sube);
  if (filtre.departman) parcalar.push(filtre.departman);
  return parcalar.join(' · ');
}

export function SatisRaporKabuk({ mod, baslik, aciklama, panelBaslik }: SatisRaporKabukProps) {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kaynak] = useState(() => satisVerisiYenile());
  const [taslakFiltre, setTaslakFiltre] = useState<SatisRaporFiltre>(() => bosSatisFiltre());
  const [aktifFiltre, setAktifFiltre] = useState<SatisRaporFiltre>(() => bosSatisFiltre());
  const [filtreleniyor, setFiltreleniyor] = useState(false);
  const [subeModalAcik, setSubeModalAcik] = useState(false);
  const [modalFiltre, setModalFiltre] = useState<SatisRaporFiltre>(() => bosSatisFiltre());

  const detaySatirlar = useMemo(
    () => satislariFiltrele(kaynak, aktifFiltre),
    [kaynak, aktifFiltre]
  );

  const toplamSatirlar = useMemo(() => satisToplamlariHesapla(detaySatirlar), [detaySatirlar]);

  const gorunenSatirlar = mod === 'detay' ? detaySatirlar : toplamSatirlar;
  const toplamlar = useMemo(
    () => satisMiktarTutarToplam(gorunenSatirlar),
    [gorunenSatirlar]
  );

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
    if (gorunenSatirlar.length === 0) return;

    if (mod === 'detay') {
      csvIndir(
        'satis-raporu.csv',
        ['Tarih', 'Saat', 'Masa', 'Personel', 'Ürün', 'Miktar', 'Fiyat', 'Tutar'],
        detaySatirlar.map((s) => {
          const d = new Date(s.tarihSaat);
          const tarih = new Intl.DateTimeFormat('tr-TR').format(d);
          const saat = new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(d);
          return [
            tarih,
            saat,
            s.masa,
            s.personel,
            s.urun,
            String(s.miktar),
            String(s.fiyat),
            String(s.tutar),
          ];
        })
      );
    } else {
      csvIndir(
        'satis-toplamlari.csv',
        ['Ürün Grubu', 'Ürün', 'Miktar', 'Ort. Fiyat', 'Tutar'],
        toplamSatirlar.map((s) => [
          s.urunGrubu,
          s.urun,
          String(s.miktar),
          String(s.ortalamaFiyat),
          String(s.tutar),
        ])
      );
    }
    basariBildir('Excel dosyası indirildi.');
  }, [mod, gorunenSatirlar.length, detaySatirlar, toplamSatirlar, basariBildir]);

  const subeModalAc = useCallback(() => {
    setModalFiltre({ ...taslakFiltre });
    setSubeModalAcik(true);
  }, [taslakFiltre]);

  const subeUygula = useCallback(() => {
    const yeni = {
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
    { kaydet: gorunenSatirlar.length > 0, guncelle: true },
    kirli
  );

  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <div className="ap-satis-rapor-sayfa">
        <SatisRaporFiltreleri
          filtre={taslakFiltre}
          onChange={setTaslakFiltre}
          onFiltrele={filtrele}
          filtreleniyor={filtreleniyor}
        />

        <AdminPanelKarti baslik={panelBaslik} altBaslik={`${gorunenSatirlar.length} kayıt`}>
          {mod === 'detay' ? (
            <SatisDetayTablosu satirlar={detaySatirlar} />
          ) : (
            <SatisToplamTablosu satirlar={toplamSatirlar} />
          )}

          <SatisRaporAltCubuk
            miktarToplam={toplamlar.miktar}
            tutarToplam={toplamlar.tutar}
            subeEtiket={subeEtiketi(aktifFiltre)}
            onSubeDepartman={subeModalAc}
            onExcel={excel}
            excelAktif={gorunenSatirlar.length > 0}
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
