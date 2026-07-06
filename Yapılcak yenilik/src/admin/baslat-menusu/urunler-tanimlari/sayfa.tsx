import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { UYARI_KAYDEDILMEDI } from '@/admin/baslat-menusu/tanimlar/genel/veri';
import { UrunGorunumSegici, UrunListeArama, UrunListeTablosu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/UrunListeTablosu';
import { UrunKayitFormu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/UrunKayitFormu';
import { UrunListesiPanel } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/UrunListesiPanel';
import { UrunTanimYapilandirma } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/UrunTanimYapilandirma';
import {
  bosUrunTanimi,
  urunTanimiKopyala,
  urunTanimlariEsit,
  type UrunGorunum,
  type UrunTanimi,
  type UrunTanimlariKayit,
} from '@/admin/baslat-menusu/urunler-tanimlari/tipler';
import { sonrakiStokKodu, urunTanimlariKaydet, urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function yeniUrunId() {
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function kayittaGuncelle(kayit: UrunTanimlariKayit, urun: UrunTanimi): UrunTanimlariKayit {
  const varMi = kayit.urunler.some((u) => u.id === urun.id);
  return {
    urunler: varMi
      ? kayit.urunler.map((u) => (u.id === urun.id ? urun : u))
      : [...kayit.urunler, urun],
  };
}

export function UrunlerTanimlariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<UrunTanimlariKayit>(() => urunTanimlariOku());
  const [seciliId, setSeciliId] = useState<string | null>(() => urunTanimlariOku().urunler[0]?.id ?? null);
  const [taslak, setTaslak] = useState<UrunTanimi | null>(() => {
    const ilk = urunTanimlariOku().urunler[0];
    return ilk ? urunTanimiKopyala(ilk) : null;
  });
  const [sonKayitli, setSonKayitli] = useState<UrunTanimi | null>(() => {
    const ilk = urunTanimlariOku().urunler[0];
    return ilk ? urunTanimiKopyala(ilk) : null;
  });
  const [gorunum, setGorunum] = useState<UrunGorunum>('form');
  const [listeArama, setListeArama] = useState('');
  const [uyari, setUyari] = useState<string | null>(null);

  const kirli = useMemo(() => {
    if (!taslak || !sonKayitli) return false;
    return !urunTanimlariEsit(taslak, sonKayitli);
  }, [taslak, sonKayitli]);

  const seciliIndex = useMemo(
    () => (seciliId ? kayit.urunler.findIndex((u) => u.id === seciliId) : -1),
    [kayit.urunler, seciliId]
  );

  const filtreliUrunler = useMemo(() => {
    const q = listeArama.trim().toLocaleLowerCase('tr');
    if (!q) return kayit.urunler;
    return kayit.urunler.filter(
      (u) =>
        u.ad.toLocaleLowerCase('tr').includes(q) ||
        u.stokKodu.toLocaleLowerCase('tr').includes(q) ||
        u.urunGrubu.toLocaleLowerCase('tr').includes(q)
    );
  }, [kayit.urunler, listeArama]);

  const urunSec = useCallback(
    (id: string, zorla = false) => {
      if (!zorla && kirli && id !== seciliId) {
        setUyari(UYARI_KAYDEDILMEDI);
        return;
      }
      const urun = kayit.urunler.find((u) => u.id === id);
      if (!urun) return;
      setSeciliId(id);
      const kopya = urunTanimiKopyala(urun);
      setTaslak(kopya);
      setSonKayitli(urunTanimiKopyala(urun));
      setUyari(null);
    },
    [kirli, seciliId, kayit.urunler]
  );

  const mevcutKaydet = useCallback(() => {
    if (!taslak) return false;
    if (!taslak.ad.trim()) {
      hataBildir('Ürün adı zorunludur.');
      return false;
    }
    const guncel = kayittaGuncelle(kayit, taslak);
    setKayit(guncel);
    urunTanimlariKaydet(guncel);
    const kayitli = urunTanimiKopyala(taslak);
    setSonKayitli(kayitli);
    setUyari(null);
    return true;
  }, [taslak, kayit, hataBildir]);

  const yeniBaslat = useCallback(() => {
    if (kirli) {
      setUyari(UYARI_KAYDEDILMEDI);
      return;
    }
    const id = yeniUrunId();
    const sira = kayit.urunler.reduce((max, u) => Math.max(max, u.sira), 0) + 1;
    const yeni = bosUrunTanimi(id, sira);
    yeni.stokKodu = sonrakiStokKodu(kayit.urunler);
    setSeciliId(id);
    setTaslak(yeni);
    setSonKayitli(urunTanimiKopyala(yeni));
    setGorunum('form');
    setUyari(null);
  }, [kirli, kayit.urunler]);

  const kaydet = useCallback(() => {
    if (mevcutKaydet()) basariBildir('Ürün kaydedildi.');
  }, [mevcutKaydet, basariBildir]);

  const sil = useCallback(() => {
    if (!seciliId) {
      hataBildir('Silmek için bir ürün seçin.');
      return;
    }
    if (!confirm('Seçili ürünü silmek istediğinize emin misiniz?')) return;
    const yeniUrunler = kayit.urunler.filter((u) => u.id !== seciliId);
    const yeniKayit = { urunler: yeniUrunler };
    setKayit(yeniKayit);
    urunTanimlariKaydet(yeniKayit);
    const sonraki = yeniUrunler[0] ?? null;
    if (sonraki) {
      setSeciliId(sonraki.id);
      setTaslak(urunTanimiKopyala(sonraki));
      setSonKayitli(urunTanimiKopyala(sonraki));
    } else {
      setSeciliId(null);
      setTaslak(null);
      setSonKayitli(null);
    }
    basariBildir('Ürün silindi.');
  }, [seciliId, kayit.urunler, hataBildir, basariBildir]);

  const oncekiKayit = useCallback(() => {
    if (seciliIndex <= 0) return;
    urunSec(kayit.urunler[seciliIndex - 1].id);
  }, [seciliIndex, kayit.urunler, urunSec]);

  const sonrakiKayit = useCallback(() => {
    if (seciliIndex < 0 || seciliIndex >= kayit.urunler.length - 1) return;
    urunSec(kayit.urunler[seciliIndex + 1].id);
  }, [seciliIndex, kayit.urunler, urunSec]);

  const gorunumDegistir = useCallback(
    (hedef: UrunGorunum) => {
      if (hedef === gorunum) return;
      if (kirli) {
        setUyari(UYARI_KAYDEDILMEDI);
        return;
      }
      setGorunum(hedef);
      setUyari(null);
    },
    [gorunum, kirli]
  );

  useModulAksiyonlari(
    {
      kaydet,
      ekle: yeniBaslat,
      sil,
      guncelle: () => gorunumDegistir(gorunum === 'form' ? 'liste' : 'form'),
      oncekiKayit,
      sonrakiKayit,
    },
    {
      kaydet: Boolean(taslak),
      ekle: true,
      sil: Boolean(seciliId && kayit.urunler.some((u) => u.id === seciliId)),
      guncelle: true,
      oncekiKayit: seciliIndex > 0,
      sonrakiKayit: seciliIndex >= 0 && seciliIndex < kayit.urunler.length - 1,
    },
    kirli
  );

  useEffect(() => {
    if (taslak || kayit.urunler.length === 0) return;
    const ilk = kayit.urunler[0];
    setSeciliId(ilk.id);
    setTaslak(urunTanimiKopyala(ilk));
    setSonKayitli(urunTanimiKopyala(ilk));
  }, [taslak, kayit.urunler]);

  return (
    <AdminModulKabuk
      baslik="Ürünler Tanımları"
      aciklama="Ürün kartları, fiyat, vergi ve seçenek tanımları"
      onizleGoster={false}
      ustAksiyon={<UrunGorunumSegici gorunum={gorunum} onDegistir={gorunumDegistir} />}
    >
      <div className="ap-urun-yonetimi">
        <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />

        {gorunum === 'liste' ? (
          <AdminPanelKarti
            baslik="Ürün Listesi"
            altBaslik="Satıra tıklayarak düzenlemeye geçin"
          >
            <div className="mb-3">
              <UrunListeArama deger={listeArama} onDegistir={setListeArama} />
            </div>
            <UrunListeTablosu
              urunler={filtreliUrunler}
              seciliId={seciliId}
              onSec={(id) => {
                urunSec(id, true);
                setGorunum('form');
              }}
            />
          </AdminPanelKarti>
        ) : (
          <div className="ap-urun-split ap-urun-tanim-duzen">
            <UrunListesiPanel urunler={kayit.urunler} seciliId={seciliId} onSec={urunSec} />

            <div className="ap-urun-tanim-icerik min-w-0">
              {!taslak ? (
                <div className="ap-urun-tanim-bos">
                  <p className="ap-heading text-sm font-medium">Henüz ürün yok</p>
                  <p className="ap-muted mt-1 text-sm">
                    Alt çubuktan <strong>Yeni</strong> ile ilk ürünü oluşturun.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ap-urun-tanim-kart-wrap">
                    <UrunKayitFormu urun={taslak} onDegistir={setTaslak} kirli={kirli} />
                  </div>
                  <UrunTanimYapilandirma urun={taslak} onDegistir={setTaslak} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminModulKabuk>
  );
}
