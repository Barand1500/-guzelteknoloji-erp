import { iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { CariKartPanel } from '@/admin/baslat-menusu/cari-tanimlari/bilesenler/CariKartPanel';
import { CariListePanel } from '@/admin/baslat-menusu/cari-tanimlari/bilesenler/CariListePanel';
import { SanalKlavye } from '@/admin/baslat-menusu/cari-tanimlari/bilesenler/SanalKlavye';
import {
  bosCariTanim,
  cariTanimEsit,
  cariTanimKopyala,
  type CariGorunum,
  type CariKayit,
  type CariTanim,
} from '@/admin/baslat-menusu/cari-tanimlari/tipler';
import {
  cariFiltreEslesir,
  cariKaydiKaydet,
  cariKaydiOku,
  sonrakiCariId,
} from '@/admin/baslat-menusu/cari-tanimlari/yardimci';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitliCariBul(kayit: CariKayit, id: number | null): CariTanim | null {
  if (id == null) return null;
  return kayit.cariler.find((c) => c.id === id) ?? null;
}

export function CariTanimlariSayfa() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<CariKayit>(() => cariKaydiOku());
  const [gorunum, setGorunum] = useState<CariGorunum>('liste');
  const [seciliId, setSeciliId] = useState<number | null>(() => cariKaydiOku().cariler[0]?.id ?? null);
  const [taslak, setTaslak] = useState<CariTanim | null>(null);
  const [yeniKayit, setYeniKayit] = useState(false);
  const [filtre, setFiltre] = useState('');
  const [pasifleriGizle, setPasifleriGizle] = useState(true);
  const [klavyeAcik, setKlavyeAcik] = useState(false);
  const [uyari, setUyari] = useState<string | null>(null);

  const kirli = useMemo(() => {
    if (gorunum !== 'kart' || !taslak) return false;
    if (yeniKayit) {
      const bos = bosCariTanim(taslak.id);
      return !cariTanimEsit(taslak, bos);
    }
    const kayitli = kayitliCariBul(kayit, seciliId);
    if (!kayitli) return true;
    return !cariTanimEsit(taslak, kayitli);
  }, [gorunum, taslak, yeniKayit, kayit, seciliId]);

  const filtrelenmisCariler = useMemo(() => {
    return kayit.cariler.filter((cari) => {
      if (pasifleriGizle && !cari.aktif) return false;
      return cariFiltreEslesir(cari, filtre);
    });
  }, [kayit.cariler, pasifleriGizle, filtre]);

  const listeGorunumuneDon = useCallback(() => {
    if (kirli) {
      setUyari('Değişiklik yapıldı, kaydedilmedi.');
      return;
    }
    setGorunum('liste');
    setTaslak(null);
    setYeniKayit(false);
    setUyari(null);
  }, [kirli]);

  const cariSec = useCallback(
    (id: number) => {
      if (gorunum === 'kart' && kirli) {
        setUyari('Değişiklik yapıldı, kaydedilmedi.');
        return;
      }
      setSeciliId(id);
      if (gorunum === 'kart') {
        const cari = kayitliCariBul(kayit, id);
        if (cari) {
          setTaslak(cariTanimKopyala(cari));
          setYeniKayit(false);
        }
      }
      setUyari(null);
    },
    [gorunum, kirli, kayit]
  );

  const kartAc = useCallback(
    (cari: CariTanim, yeni: boolean) => {
      setTaslak(cariTanimKopyala(cari));
      setYeniKayit(yeni);
      setSeciliId(yeni ? null : cari.id);
      setGorunum('kart');
      setKlavyeAcik(false);
      setUyari(null);
    },
    []
  );

  const yeniCari = useCallback(() => {
    if (gorunum === 'kart' && kirli) {
      setUyari('Değişiklik yapıldı, kaydedilmedi.');
      return;
    }
    const id = sonrakiCariId(kayit.cariler);
    kartAc(bosCariTanim(id), true);
  }, [gorunum, kirli, kayit.cariler, kartAc]);

  const duzenle = useCallback(() => {
    if (seciliId == null) {
      hataBildir('Düzenlemek için listeden bir cari seçin.');
      return;
    }
    const cari = kayitliCariBul(kayit, seciliId);
    if (!cari) {
      hataBildir('Seçili cari bulunamadı.');
      return;
    }
    kartAc(cari, false);
  }, [seciliId, kayit, kartAc, hataBildir]);

  const kaydet = useCallback(() => {
    if (!taslak || gorunum !== 'kart') {
      hataBildir('Kaydetmek için düzenleme ekranında olun.');
      return;
    }
    const ad = taslak.ad.trim();
    if (ad.length < 2) {
      hataBildir('Cari adı en az 2 karakter olmalı.');
      return;
    }

    if (taslak.iskontoOrani.trim()) {
      const iskonto = iskontoIfadesiHesapla(taslak.iskontoOrani);
      if (iskonto == null) {
        hataBildir('Geçerli bir iskonto girin (ör. 5 veya 20+20)');
        return;
      }
    }

    const kaydedilecek = { ...taslak, ad };

    if (yeniKayit) {
      const yeniKayitVeri: CariKayit = { cariler: [...kayit.cariler, kaydedilecek] };
      cariKaydiKaydet(yeniKayitVeri);
      setKayit(yeniKayitVeri);
      setSeciliId(kaydedilecek.id);
      setGorunum('liste');
      setTaslak(null);
      setYeniKayit(false);
      basariBildir('Cari eklendi.');
      return;
    }

    const yeniKayitVeri: CariKayit = {
      cariler: kayit.cariler.map((c) => (c.id === kaydedilecek.id ? kaydedilecek : c)),
    };
    cariKaydiKaydet(yeniKayitVeri);
    setKayit(yeniKayitVeri);
    setSeciliId(kaydedilecek.id);
    setGorunum('liste');
    setTaslak(null);
    setYeniKayit(false);
    basariBildir('Cari kaydedildi.');
  }, [taslak, gorunum, yeniKayit, kayit.cariler, basariBildir, hataBildir]);

  const sil = useCallback(() => {
    if (gorunum === 'kart') {
      hataBildir('Silme işlemi için önce listeye dönün.');
      return;
    }
    if (seciliId == null) {
      hataBildir('Silmek için listeden bir cari seçin.');
      return;
    }
    if (seciliId === 1) {
      hataBildir('Nihai Tüketici kaydı silinemez.');
      return;
    }
    const yeniCariler = kayit.cariler.filter((c) => c.id !== seciliId);
    const yeniKayitVeri: CariKayit = { cariler: yeniCariler };
    const yeniSecili = yeniCariler[0]?.id ?? null;
    cariKaydiKaydet(yeniKayitVeri);
    setKayit(yeniKayitVeri);
    setSeciliId(yeniSecili);
    basariBildir('Cari silindi.');
  }, [gorunum, seciliId, kayit.cariler, basariBildir, hataBildir]);

  const klavyeTus = useCallback((tus: string) => {
    setFiltre((onceki) => onceki + tus);
  }, []);

  const klavyeSil = useCallback(() => {
    setFiltre((onceki) => onceki.slice(0, -1));
  }, []);

  const klavyeTemizle = useCallback(() => {
    setFiltre('');
  }, []);

  useModulAksiyonlari(
    { ekle: yeniCari, guncelle: duzenle, sil, kaydet },
    {
      ekle: gorunum === 'liste',
      guncelle: gorunum === 'liste' && seciliId != null,
      sil: gorunum === 'liste' && seciliId != null && seciliId !== 1,
      kaydet: gorunum === 'kart',
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk baslik="Cari Tanımları" aciklama="Müşteri ve tedarikçi cari hesapları" onizleGoster={false}>
      <AdminPanelKarti>
        {uyari && <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />}

        <div className="ap-cari-tanim-sayfa">
          <div className="ap-tanimlar-yan-gecis">
            <div className={`ap-tanimlar-yan-gecis-izgara ${gorunum === 'kart' ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
              <div className="ap-tanimlar-yan-gecis-panel">
                <CariListePanel
                  cariler={filtrelenmisCariler}
                  seciliId={seciliId}
                  filtre={filtre}
                  pasifleriGizle={pasifleriGizle}
                  klavyeAcik={klavyeAcik}
                  onFiltreAlaniTikla={() => setKlavyeAcik(true)}
                  onFiltreDegistir={setFiltre}
                  onPasifleriGizleDegistir={setPasifleriGizle}
                  onSatirSec={cariSec}
                />
              </div>

              <div className="ap-tanimlar-yan-gecis-panel">
                {gorunum === 'kart' && taslak && (
                  <CariKartPanel
                    cari={taslak}
                    onCariDegistir={setTaslak}
                    onGeri={listeGorunumuneDon}
                    onGeciciIslem={(mesaj) => setUyari(mesaj)}
                  />
                )}
              </div>
            </div>
          </div>

          <SanalKlavye
            acik={klavyeAcik && gorunum === 'liste'}
            onKapat={() => setKlavyeAcik(false)}
            onTus={klavyeTus}
            onSil={klavyeSil}
            onTemizle={klavyeTemizle}
            onEnter={() => setKlavyeAcik(false)}
          />
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
