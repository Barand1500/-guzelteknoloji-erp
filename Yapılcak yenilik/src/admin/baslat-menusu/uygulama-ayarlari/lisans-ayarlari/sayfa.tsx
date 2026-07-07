import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { LisansFormPanel } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/bilesenler/LisansFormPanel';
import { LisansListesiTablosu } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/bilesenler/LisansListesiTablosu';
import type { LisansKaydi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/tipler';
import { urunAdiBul } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/varsayilanVeri';
import {
  bosLisansFormu,
  lisansFormGecerli,
  lisansKaydiKopyala,
  lisansListesiKaydet,
  lisansListesiOku,
} from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type Gorunum = 'liste' | 'form';

export function LisansAyarlariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [lisanslar, setLisanslar] = useState<LisansKaydi[]>(() => lisansListesiOku());
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [taslak, setTaslak] = useState<LisansKaydi>(() => bosLisansFormu());
  const [formOrijinal, setFormOrijinal] = useState<LisansKaydi | null>(null);
  const [duzenleme, setDuzenleme] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [yenileniyorId, setYenileniyorId] = useState<string | null>(null);

  const listeGorunumuneDon = useCallback(() => {
    setGorunum('liste');
    setDuzenleme(false);
    setFormOrijinal(null);
    setTaslak(bosLisansFormu());
  }, []);

  const lisansEkle = useCallback(() => {
    const bos = bosLisansFormu();
    setTaslak(bos);
    setFormOrijinal(bosLisansFormu());
    setDuzenleme(false);
    setGorunum('form');
  }, []);

  const lisansDuzenle = useCallback(
    (id: string) => {
      const bulunan = lisanslar.find((l) => l.id === id);
      if (!bulunan) return;
      const kopya = lisansKaydiKopyala(bulunan);
      setTaslak(kopya);
      setFormOrijinal(lisansKaydiKopyala(bulunan));
      setDuzenleme(true);
      setGorunum('form');
    },
    [lisanslar]
  );

  const lisansKaydet = useCallback(() => {
    if (!lisansFormGecerli(taslak)) {
      hataBildir('Ürün, kullanıcı adı ve lisans anahtarı zorunludur.');
      return;
    }

    setKaydediliyor(true);
    window.setTimeout(() => {
      const yeniListe = duzenleme
        ? lisanslar.map((l) => (l.id === taslak.id ? { ...taslak } : l))
        : [...lisanslar, { ...taslak }];

      setLisanslar(yeniListe);
      lisansListesiKaydet(yeniListe);
      setKaydediliyor(false);
      basariBildir(duzenleme ? 'Lisans güncellendi.' : 'Yeni lisans eklendi.');
      listeGorunumuneDon();
    }, 220);
  }, [taslak, duzenleme, lisanslar, basariBildir, hataBildir, listeGorunumuneDon]);

  const lisansSil = useCallback(
    (id: string) => {
      const hedef = lisanslar.find((l) => l.id === id);
      if (!hedef) return;
      const yeniListe = lisanslar.filter((l) => l.id !== id);
      setLisanslar(yeniListe);
      lisansListesiKaydet(yeniListe);
      if (seciliId === id) setSeciliId(null);
      basariBildir(`${urunAdiBul(hedef.urun)} lisansı silindi.`);
    },
    [lisanslar, seciliId, basariBildir]
  );

  const lisansYenile = useCallback(
    (id: string) => {
      const hedef = lisanslar.find((l) => l.id === id);
      if (!hedef) return;

      setYenileniyorId(id);
      window.setTimeout(() => {
        setYenileniyorId(null);
        basariBildir(`${urunAdiBul(hedef.urun)} lisansı sunucudan yenilendi.`, 'Yenilendi');
      }, 650);
    },
    [lisanslar, basariBildir]
  );

  const satirSec = useCallback(
    (id: string) => {
      setSeciliId(id);
      lisansDuzenle(id);
    },
    [lisansDuzenle]
  );

  const formAcik = gorunum === 'form';

  const kirli = useMemo(() => {
    if (!formAcik || !formOrijinal) return false;
    return JSON.stringify(taslak) !== JSON.stringify(formOrijinal);
  }, [formAcik, formOrijinal, taslak]);

  useModulAksiyonlari(
    formAcik ? { kaydet: lisansKaydet } : { ekle: lisansEkle },
    {
      kaydet: formAcik && lisansFormGecerli(taslak) && !kaydediliyor,
      ekle: !formAcik,
      guncelle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  const panelBaslik = useMemo(
    () => (formAcik ? (duzenleme ? 'Lisans Düzenle' : 'Lisans Ekle') : 'Lisans Listesi'),
    [formAcik, duzenleme]
  );

  return (
    <AdminModulKabuk
      baslik="Lisans Ayarları"
      aciklama="Ürün lisanslarını listeleyin, ekleyin ve güncelleyin"
      onizleGoster={false}
    >
      <AdminPanelKarti baslik={panelBaslik}>
        <div className="ap-lisans-modul">
          <div className="ap-tanimlar-yan-gecis">
            <div className={`ap-tanimlar-yan-gecis-izgara ${formAcik ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
              <div className="ap-tanimlar-yan-gecis-panel">
                <p className="ap-muted mb-3 text-xs">
                  Satıra tıklayarak düzenleyebilirsiniz. Yenile ikonu lisansı sunucudan günceller.
                </p>

                <LisansListesiTablosu
                  lisanslar={lisanslar}
                  seciliId={seciliId}
                  onSatirSec={satirSec}
                  onYenile={lisansYenile}
                  onSil={lisansSil}
                  yenileniyorId={yenileniyorId}
                />

                <footer className="ap-lisans-liste-alt">
                  <button type="button" className="ap-tanimlar-tablo-btn" onClick={lisansEkle}>
                    Lisans Ekle
                  </button>
                </footer>
              </div>

              <div className="ap-tanimlar-yan-gecis-panel">
                {formAcik && (
                  <LisansFormPanel
                    kayit={taslak}
                    duzenleme={duzenleme}
                    onKayitDegistir={setTaslak}
                    onGeri={listeGorunumuneDon}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
