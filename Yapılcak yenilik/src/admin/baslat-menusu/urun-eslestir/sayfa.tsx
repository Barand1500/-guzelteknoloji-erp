import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  UrunEslestirArama,
  bosUrunEslestirFiltre,
  type UrunEslestirFiltre,
} from '@/admin/baslat-menusu/urun-eslestir/bilesenler/UrunEslestirArama';
import { UrunEslestirPanel } from '@/admin/baslat-menusu/urun-eslestir/bilesenler/UrunEslestirPanel';
import { UrunEslestirTablo } from '@/admin/baslat-menusu/urun-eslestir/bilesenler/UrunEslestirTablo';
import {
  eslestirmeDolu,
  urunEslestirKayitKopyala,
  urunEslestirKayitlariEsit,
  type PlatformEslestirme,
} from '@/admin/baslat-menusu/urun-eslestir/tipler';
import { urunEslestirListesi } from '@/admin/baslat-menusu/urun-eslestir/urunKaynagi';
import {
  platformEslestirmeAl,
  platformEslestirmeGuncelle,
  urunEslestirKaydiKaydet,
  urunEslestirKaydiOku,
} from '@/admin/baslat-menusu/urun-eslestir/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

export function UrunEslestirSayfasi() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const urunler = useMemo(() => urunEslestirListesi(), []);

  const [kayit, setKayit] = useState(() => urunEslestirKaydiOku());
  const [sonKayitli, setSonKayitli] = useState(() => urunEslestirKaydiOku());
  const [filtre, setFiltre] = useState<UrunEslestirFiltre>(bosUrunEslestirFiltre);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [panelAcik, setPanelAcik] = useState(false);

  const aktifPlatform = filtre.platform === 'Tümü' ? 'Getir' : filtre.platform;

  const kirli = useMemo(() => !urunEslestirKayitlariEsit(kayit, sonKayitli), [kayit, sonKayitli]);

  const filtreliUrunler = useMemo(() => {
    const q = filtre.stokAdi.trim().toLocaleLowerCase('tr');
    return urunler.filter((u) => {
      if (q && !u.ad.toLocaleLowerCase('tr').includes(q) && !u.stokKodu.includes(q)) {
        return false;
      }
      const es = platformEslestirmeAl(kayit, u.id, aktifPlatform);
      const dolu = eslestirmeDolu(es);
      if (filtre.eslestirme === 'eslesmis' && !dolu) return false;
      if (filtre.eslestirme === 'eslesmemis' && dolu) return false;
      return true;
    });
  }, [urunler, filtre, kayit, aktifPlatform]);

  const seciliUrun = useMemo(
    () => urunler.find((u) => u.id === seciliId) ?? null,
    [urunler, seciliId]
  );

  const seciliEslestirme = useMemo(() => {
    if (!seciliId) return null;
    return platformEslestirmeAl(kayit, seciliId, aktifPlatform);
  }, [kayit, seciliId, aktifPlatform]);

  const eslesmisSayisi = useMemo(() => {
    return urunler.filter((u) => eslestirmeDolu(platformEslestirmeAl(kayit, u.id, aktifPlatform))).length;
  }, [urunler, kayit, aktifPlatform]);

  const urunSec = useCallback((id: string) => {
    setSeciliId(id);
  }, []);

  const panelAc = useCallback(() => {
    if (!seciliId) return;
    setPanelAcik(true);
  }, [seciliId]);

  const panelKapat = useCallback(() => {
    setPanelAcik(false);
  }, []);

  const eslestirmeGuncelle = useCallback(
    (eslestirme: PlatformEslestirme) => {
      if (!seciliId) return;
      setKayit((k) => platformEslestirmeGuncelle(k, seciliId, aktifPlatform, eslestirme));
    },
    [seciliId, aktifPlatform]
  );

  const filtreTemizle = useCallback(() => {
    setFiltre(bosUrunEslestirFiltre());
  }, []);

  const kaydet = useCallback(() => {
    urunEslestirKaydiKaydet(kayit);
    setSonKayitli(urunEslestirKayitKopyala(kayit));
    basariBildir('Ürün eşleştirmeleri kaydedildi.');
  }, [kayit, basariBildir]);

  useModulAksiyonlari(
    { kaydet, guncelle: panelAc },
    {
      kaydet: kirli || Object.keys(kayit.harita).length >= 0,
      guncelle: Boolean(seciliId),
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Ürün Eşleştir"
      aciklama="İç ürünlerinizi Getir, Yemeksepeti, Trendyol gibi platformlardaki karşılıklarıyla eşleştirin"
      onizleGoster={false}
    >
      <div className="ap-urun-eslestir-sayfa">
        <div
          className={`ap-urun-eslestir-split ${panelAcik && seciliUrun ? 'ap-urun-eslestir-split--panel-acik' : ''}`}
        >
          <div className="ap-urun-eslestir-sol min-w-0">
            <AdminPanelKarti
              baslik="Stok Arama"
              altBaslik={
                kirli
                  ? 'Kaydedilmemiş değişiklikler var — alt çubuktan Kaydet'
                  : `${aktifPlatform}: ${eslesmisSayisi} / ${urunler.length} ürün eşleşmiş`
              }
            >
              <p className="ap-urun-eslestir-ozet ap-muted text-xs">
                Platform siparişlerinde gelen ürün adlarını, restoran stok kartlarınızla eşleştirirsiniz.
                Önce platform seçin, ürünü listeden seçin, sağ panelden karşılığını girin.
              </p>

              <UrunEslestirArama
                filtre={filtre}
                onFiltreDegistir={setFiltre}
                onTemizle={filtreTemizle}
                onEslestir={panelAc}
                eslestirAktif={Boolean(seciliId)}
              />

              <UrunEslestirTablo
                urunler={filtreliUrunler}
                kayit={kayit}
                platform={filtre.platform}
                seciliId={seciliId}
                onSec={(id) => {
                  urunSec(id);
                  setPanelAcik(true);
                }}
              />
            </AdminPanelKarti>
          </div>

          {panelAcik && seciliUrun && seciliEslestirme && (
            <UrunEslestirPanel
              urun={seciliUrun}
              platform={aktifPlatform}
              eslestirme={seciliEslestirme}
              onDegistir={eslestirmeGuncelle}
              onKapat={panelKapat}
            />
          )}
        </div>
      </div>
    </AdminModulKabuk>
  );
}
