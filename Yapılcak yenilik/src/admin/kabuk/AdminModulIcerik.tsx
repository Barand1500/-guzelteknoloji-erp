import { LoglarSayfasi } from '@/admin/gizli-moduller/loglar/sayfa';
import { VeriYedeklemeSayfasi } from '@/admin/gizli-moduller/veri-yedekleme/sayfa';
import { MasterSayfasi } from '@/admin/baslat-menusu/master/sayfa';
import { SistemAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/ayarlar/sayfa';
import { KullanicilarSayfasi } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/sayfa';
import { RollerSayfasi } from '@/admin/baslat-menusu/musteri-ajans/roller/sayfa';
import { SekmeYonetimiSayfasi } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/sayfa';
import { KisayolAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/sayfa';
import { TanimlarBosSayfa } from '@/admin/baslat-menusu/tanimlar/TanimlarBosSayfa';
import { TanimlarSayfasi } from '@/admin/baslat-menusu/tanimlar/sayfa';
import { UrunlerTanimlariSayfasi } from '@/admin/baslat-menusu/urunler-tanimlari/sayfa';
import { TarilacakUrunlerSayfasi } from '@/admin/baslat-menusu/tarilacak-urunler/sayfa';
import { YaziciTanimlariSayfasi } from '@/admin/baslat-menusu/yazici-tanimlari/sayfa';
import { FavorilerSayfasi } from '@/admin/baslat-menusu/favoriler/sayfa';
import { OdemeGruplariSayfasi } from '@/admin/baslat-menusu/odeme-gruplari/sayfa';
import { UrunEslestirSayfasi } from '@/admin/baslat-menusu/urun-eslestir/sayfa';
import { MenuTanimlariSayfa } from '@/admin/baslat-menusu/menu-tanimlari/sayfa';
import { CariTanimlariSayfa } from '@/admin/baslat-menusu/cari-tanimlari/sayfa';
import { HappyHourFiyatListeleriSayfa } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/sayfa';
import { EFaturaAyarlariSayfa } from '@/admin/baslat-menusu/e-fatura-ayarlari/sayfa';
import { MarslanacakUrunlerSayfa } from '@/admin/baslat-menusu/marslanacak-urunler/sayfa';
import { tanimlarModulBul } from '@/admin/baslat-menusu/tanimlar/tanimlarModulleri';
import { raporlarModulBul } from '@/admin/baslat-menusu/raporlar/raporlarModulleri';
import { paketServisiRaporlariModulBul } from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiRaporlariModulleri';
import { paketServisiSablonMu } from '@/admin/baslat-menusu/paket-servisi-raporlari/paketServisiSablonModulleri';
import { rezervasyonRaporlariModulBul } from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonRaporlariModulleri';
import { rezervasyonSablonMu } from '@/admin/baslat-menusu/rezervasyon-raporlari/rezervasyonSablonModulleri';
import { uygulamaAyarlarModulBul } from '@/admin/baslat-menusu/uygulama-ayarlari/uygulamaAyarlarModulleri';
import { AyarlarBosSayfa } from '@/admin/baslat-menusu/uygulama-ayarlari/AyarlarBosSayfa';
import { ArctosDbAyarlariSayfasi } from '@/admin/baslat-menusu/uygulama-ayarlari/arctos-db-ayarlari/sayfa';
import { FirmaDonemSecimiSayfasi } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/sayfa';
import { LisansAyarlariSayfasi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/sayfa';
import { WebApiAyarlariSayfasi } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/sayfa';
import { raporSablonMu } from '@/admin/baslat-menusu/raporlar/raporSablonModulleri';
import { RaporSablonSayfa } from '@/admin/baslat-menusu/raporlar/sayfa';
import { RaporlarBosSayfa } from '@/admin/baslat-menusu/raporlar/RaporlarBosSayfa';
import { AktifMasalarSayfasi } from '@/admin/baslat-menusu/raporlar/aktif-masalar/sayfa';
import { FiyatListesiSayfasi } from '@/admin/baslat-menusu/raporlar/fiyat-listesi/sayfa';
import { AcikHesapListesiSayfasi } from '@/admin/baslat-menusu/raporlar/acik-hesap-listesi/sayfa';
import { SatisRaporuSayfasi } from '@/admin/baslat-menusu/raporlar/satis-raporu/sayfa';
import { SatisToplamlariSayfasi } from '@/admin/baslat-menusu/raporlar/satis-toplamlari/sayfa';
import { OzelRaporlarSayfasi } from '@/admin/baslat-menusu/raporlar/ozel-raporlar/sayfa';
import { PsEskiTahsilatTaramaSayfasi } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/sayfa';
import { PsSatisToplamlariSayfasi } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-toplamlari/sayfa';
import { PsSatisRaporuSayfasi } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/sayfa';
import { ModulKabuk } from '@/baglamlar/ModulKabukContext';

interface AdminModulIcerikProps {
  modulId: string;
  onModulAc: (modulId: string) => void;
}

export function AdminModulIcerik({ modulId, onModulAc }: AdminModulIcerikProps) {
  return (
    <ModulKabuk modulId={modulId}>
      <AdminModulGovde modulId={modulId} onModulAc={onModulAc} />
    </ModulKabuk>
  );
}

function AdminModulGovde({ modulId }: AdminModulIcerikProps) {
  if (modulId === 'urunler-tanimlari') {
    return <UrunlerTanimlariSayfasi />;
  }
  if (modulId === 'yazici-tanimlari') {
    return <YaziciTanimlariSayfasi />;
  }
  if (modulId === 'tarilacak-urunler') {
    return <TarilacakUrunlerSayfasi />;
  }
  if (modulId === 'favoriler') {
    return <FavorilerSayfasi />;
  }
  if (modulId === 'odeme-gruplari') {
    return <OdemeGruplariSayfasi />;
  }
  if (modulId === 'urun-eslestir') {
    return <UrunEslestirSayfasi />;
  }

  const tanimModul = tanimlarModulBul(modulId);
  if (tanimModul) {
    if (modulId === 'tanimlar') {
      return <TanimlarSayfasi />;
    }
    if (modulId === 'menu-tanimlari') {
      return <MenuTanimlariSayfa />;
    }
    if (modulId === 'cari-tanimlari') {
      return <CariTanimlariSayfa />;
    }
    if (modulId === 'happy-hour-fiyat-listeleri') {
      return <HappyHourFiyatListeleriSayfa />;
    }
    if (modulId === 'e-fatura-ayarlari') {
      return <EFaturaAyarlariSayfa />;
    }
    if (modulId === 'marslanacak-urunler') {
      return <MarslanacakUrunlerSayfa />;
    }
    return <TanimlarBosSayfa baslik={tanimModul.baslik} aciklama={tanimModul.aciklama} />;
  }

  const raporModul = raporlarModulBul(modulId);
  if (raporModul) {
    if (raporSablonMu(modulId)) {
      return <RaporSablonSayfa modulId={modulId} baslik={raporModul.baslik} aciklama={raporModul.aciklama} />;
    }
    if (modulId === 'aktif-masalar') {
      return <AktifMasalarSayfasi />;
    }
    if (modulId === 'fiyat-listesi') {
      return <FiyatListesiSayfasi />;
    }
    if (modulId === 'acik-hesap-listesi') {
      return <AcikHesapListesiSayfasi />;
    }
    if (modulId === 'satis-raporu') {
      return <SatisRaporuSayfasi />;
    }
    if (modulId === 'satis-toplamlari') {
      return <SatisToplamlariSayfasi />;
    }
    if (modulId === 'ozel-raporlar') {
      return <OzelRaporlarSayfasi />;
    }
    return <RaporlarBosSayfa baslik={raporModul.baslik} aciklama={raporModul.aciklama} />;
  }

  const paketModul = paketServisiRaporlariModulBul(modulId);
  if (paketModul) {
    if (paketServisiSablonMu(modulId)) {
      return (
        <RaporSablonSayfa modulId={modulId} baslik={paketModul.baslik} aciklama={paketModul.aciklama} />
      );
    }
    if (modulId === 'ps-eski-tahsilat-tarama') {
      return <PsEskiTahsilatTaramaSayfasi />;
    }
    if (modulId === 'ps-satis-raporu') {
      return <PsSatisRaporuSayfasi />;
    }
    if (modulId === 'ps-satis-toplamlari') {
      return <PsSatisToplamlariSayfasi />;
    }
    return <RaporlarBosSayfa baslik={paketModul.baslik} aciklama={paketModul.aciklama} />;
  }

  const rezervasyonModul = rezervasyonRaporlariModulBul(modulId);
  if (rezervasyonModul) {
    if (rezervasyonSablonMu(modulId)) {
      return (
        <RaporSablonSayfa
          modulId={modulId}
          baslik={rezervasyonModul.baslik}
          aciklama={rezervasyonModul.aciklama}
        />
      );
    }
    return <RaporlarBosSayfa baslik={rezervasyonModul.baslik} aciklama={rezervasyonModul.aciklama} />;
  }

  const uygulamaAyarModul = uygulamaAyarlarModulBul(modulId);
  if (uygulamaAyarModul) {
    if (modulId === 'arctos-db-ayarlari') {
      return <ArctosDbAyarlariSayfasi />;
    }
    if (modulId === 'firma-donem-secimi') {
      return <FirmaDonemSecimiSayfasi />;
    }
    if (modulId === 'lisans-ayarlari') {
      return <LisansAyarlariSayfasi />;
    }
    if (modulId === 'web-api-ayarlari') {
      return <WebApiAyarlariSayfasi />;
    }
    return <AyarlarBosSayfa baslik={uygulamaAyarModul.baslik} aciklama={uygulamaAyarModul.aciklama} />;
  }

  switch (modulId) {
    case 'loglar':
      return <LoglarSayfasi />;
    case 'veri-yedekleme':
      return <VeriYedeklemeSayfasi />;
    case 'master':
      return <MasterSayfasi />;
    case 'ayarlar':
      return <SistemAyarlariSayfasi />;
    case 'kullanicilar':
      return <KullanicilarSayfasi />;
    case 'roller':
      return <RollerSayfasi />;
    case 'sekme-yonetimi':
      return <SekmeYonetimiSayfasi />;
    case 'kisayol-ayarlari':
      return <KisayolAyarlariSayfasi />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🚧</p>
          <h1 className="ap-heading mt-4 text-xl font-bold">{modulId}</h1>
          <p className="ap-muted mt-2 text-sm">Bu modül bu projede tanımlı değil.</p>
        </div>
      );
  }
}
