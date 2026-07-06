import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  FiyatListeKurallariPanel,
  sablonAdlariFromKayit,
} from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/bilesenler/FiyatListeKurallariPanel';
import { FiyatListeOtomasyonPanel } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/bilesenler/FiyatListeOtomasyonPanel';
import { FiyatListeleriIcerik } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/bilesenler/FiyatListeleriIcerik';
import {
  bosFiyatGuncellemeTaslak,
  bosFiyatListeKurali,
  bosFiyatOtomasyonKaydi,
  type FiyatGuncellemeTaslak,
  type FiyatListeAltGorunum,
  type FiyatListeKayit,
  type FiyatListeSekme,
} from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';
import {
  fiyatListeKaydiKaydet,
  fiyatListeKaydiOku,
  guncellemeKirli,
  kayitKirli,
  sonrakiSablonId,
} from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/yardimci';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

const SEKMELER: { id: FiyatListeSekme; etiket: string }[] = [
  { id: 'listeler', etiket: 'Fiyat Listeleri' },
  { id: 'kurallar', etiket: 'Fiyat Listesi Kuralları' },
  { id: 'otomasyon', etiket: 'Otomasyon' },
];

function kayitKopyala(k: FiyatListeKayit): FiyatListeKayit {
  return JSON.parse(JSON.stringify(k)) as FiyatListeKayit;
}

function seciliSablon(kayit: FiyatListeKayit, id: number | null) {
  if (id == null) return null;
  return kayit.sablonlar.find((s) => s.id === id) ?? null;
}

export function HappyHourFiyatListeleriSayfa() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<FiyatListeKayit>(() => fiyatListeKaydiOku());
  const [taslak, setTaslak] = useState<FiyatListeKayit>(() => kayitKopyala(fiyatListeKaydiOku()));
  const [sekme, setSekme] = useState<FiyatListeSekme>('listeler');
  const [altGorunum, setAltGorunum] = useState<FiyatListeAltGorunum>('liste');
  const [seciliId, setSeciliId] = useState<number | null>(() => fiyatListeKaydiOku().sablonlar[0]?.id ?? null);
  const [yeniEkleAcik, setYeniEkleAcik] = useState(false);
  const [yeniSablonAd, setYeniSablonAd] = useState('');
  const [guncelleTaslak, setGuncelleTaslak] = useState<FiyatGuncellemeTaslak | null>(null);
  const [guncelleBaslangic, setGuncelleBaslangic] = useState<FiyatGuncellemeTaslak | null>(null);
  const [uyari, setUyari] = useState<string | null>(null);

  const sablonAdlari = useMemo(() => sablonAdlariFromKayit(taslak), [taslak]);

  const guncelleKirli = useMemo(() => {
    if (altGorunum !== 'guncelle' || !guncelleTaslak || !guncelleBaslangic) return false;
    return guncellemeKirli(guncelleTaslak, guncelleBaslangic);
  }, [altGorunum, guncelleTaslak, guncelleBaslangic]);

  const kirli = useMemo(() => {
    if (altGorunum === 'guncelle') return guncelleKirli;
    return kayitKirli(kayit, taslak);
  }, [altGorunum, guncelleKirli, kayit, taslak]);

  const kirliEngelle = useCallback(() => {
    if (kirli) {
      setUyari('Değişiklik yapıldı, kaydedilmedi.');
      return true;
    }
    return false;
  }, [kirli]);

  const guncellePaneleKapat = useCallback(() => {
    if (kirliEngelle()) return;
    setAltGorunum('liste');
    setGuncelleTaslak(null);
    setGuncelleBaslangic(null);
    setUyari(null);
  }, [kirliEngelle]);

  const sekmeDegistir = useCallback(
    (yeniSekme: FiyatListeSekme) => {
      if (yeniSekme === sekme) return;
      if (kirliEngelle()) return;
      setSekme(yeniSekme);
      setAltGorunum('liste');
      setYeniEkleAcik(false);
      setYeniSablonAd('');
      setUyari(null);
    },
    [sekme, kirliEngelle]
  );

  const yeniSablonAc = useCallback(() => {
    if (sekme !== 'listeler') return;
    if (altGorunum === 'guncelle' && kirliEngelle()) return;
    setYeniEkleAcik(true);
    setYeniSablonAd('');
    setUyari(null);
  }, [sekme, altGorunum, kirliEngelle]);

  const yeniSablonEkle = useCallback(() => {
    const ad = yeniSablonAd.trim();
    if (ad.length < 2) {
      hataBildir('Şablon ismi en az 2 karakter olmalı.');
      return;
    }
    if (taslak.sablonlar.some((s) => s.ad.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'))) {
      hataBildir('Bu isimde bir şablon zaten var.');
      return;
    }
    const id = sonrakiSablonId(taslak.sablonlar);
    const yeniKayit: FiyatListeKayit = {
      ...taslak,
      sablonlar: [...taslak.sablonlar, { id, ad, aktif: true }],
      aktifSablonId: id,
    };
    fiyatListeKaydiKaydet(yeniKayit);
    setKayit(yeniKayit);
    setTaslak(kayitKopyala(yeniKayit));
    setSeciliId(id);
    setYeniEkleAcik(false);
    setYeniSablonAd('');
    basariBildir('Yeni fiyat listesi eklendi.');
  }, [yeniSablonAd, taslak, basariBildir, hataBildir]);

  const fiyatGuncelleAc = useCallback(() => {
    if (sekme !== 'listeler' || seciliId == null) {
      hataBildir('Fiyat güncellemek için listeden bir şablon seçin.');
      return;
    }
    const sablon = seciliSablon(taslak, seciliId);
    if (!sablon) {
      hataBildir('Seçili şablon bulunamadı.');
      return;
    }
    if (altGorunum === 'guncelle' && kirliEngelle()) return;
    const baslangic = bosFiyatGuncellemeTaslak(sablon.ad);
    setGuncelleTaslak(baslangic);
    setGuncelleBaslangic(baslangic);
    setYeniEkleAcik(false);
    setAltGorunum('guncelle');
    setUyari(null);
  }, [sekme, seciliId, taslak, altGorunum, kirliEngelle, hataBildir]);

  const satirSec = useCallback((id: number) => {
    setSeciliId(id);
    setUyari(null);
  }, []);

  const aktifDegistir = useCallback((id: number, aktif: boolean) => {
    setSeciliId(id);
    setTaslak((onceki) => {
      const sablonlar = onceki.sablonlar.map((s) => (s.id === id ? { ...s, aktif } : s));
      let aktifSablonId = onceki.aktifSablonId;
      if (aktif) {
        aktifSablonId = id;
      } else if (aktifSablonId === id) {
        const digerAktif = sablonlar.find((s) => s.aktif && s.id !== id);
        aktifSablonId = digerAktif?.id ?? null;
      }
      return { ...onceki, sablonlar, aktifSablonId };
    });
  }, []);

  const kuralEkle = useCallback(() => {
    const id = `kural-${Date.now()}`;
    setTaslak((onceki) => ({
      ...onceki,
      kurallar: [...onceki.kurallar, bosFiyatListeKurali(id)],
    }));
  }, []);

  const otomasyonEkle = useCallback(() => {
    const id = `oto-${Date.now()}`;
    setTaslak((onceki) => ({
      ...onceki,
      otomasyonlar: [...onceki.otomasyonlar, bosFiyatOtomasyonKaydi(id)],
    }));
  }, []);

  const ekle = useCallback(() => {
    if (sekme === 'listeler') {
      yeniSablonAc();
      return;
    }
    if (sekme === 'kurallar') {
      kuralEkle();
      return;
    }
    otomasyonEkle();
  }, [sekme, yeniSablonAc, kuralEkle, otomasyonEkle]);

  const kaydet = useCallback(() => {
    if (altGorunum === 'guncelle' && guncelleTaslak) {
      const oran = Number(guncelleTaslak.oran.replace(',', '.'));
      if (Number.isNaN(oran) || oran <= 0) {
        hataBildir('Geçerli bir oran girin.');
        return;
      }
      fiyatListeKaydiKaydet(taslak);
      setKayit(kayitKopyala(taslak));
      setAltGorunum('liste');
      setGuncelleTaslak(null);
      setGuncelleBaslangic(null);
      basariBildir(`${guncelleTaslak.sablonAd} fiyatları güncellendi.`);
      return;
    }

    fiyatListeKaydiKaydet(taslak);
    setKayit(kayitKopyala(taslak));
    basariBildir('Kaydedildi.');
  }, [altGorunum, guncelleTaslak, taslak, basariBildir, hataBildir]);

  const kuralDegistir = useCallback((id: string, alan: keyof (typeof taslak.kurallar)[0], deger: string) => {
    setTaslak((onceki) => ({
      ...onceki,
      kurallar: onceki.kurallar.map((k) => (k.id === id ? { ...k, [alan]: deger } : k)),
    }));
  }, []);

  const otomasyonDegistir = useCallback(
    (id: string, alan: keyof (typeof taslak.otomasyonlar)[0], deger: string) => {
      setTaslak((onceki) => ({
        ...onceki,
        otomasyonlar: onceki.otomasyonlar.map((o) => (o.id === id ? { ...o, [alan]: deger } : o)),
      }));
    },
    []
  );

  useModulAksiyonlari(
    { ekle, guncelle: fiyatGuncelleAc, kaydet },
    {
      ekle: sekme === 'listeler' ? altGorunum !== 'guncelle' : true,
      guncelle: sekme === 'listeler' && altGorunum === 'liste' && seciliId != null,
      kaydet:
        (sekme === 'listeler' && altGorunum === 'guncelle' && guncelleKirli) ||
        (sekme === 'listeler' && altGorunum === 'liste' && kayitKirli(kayit, taslak)) ||
        (sekme !== 'listeler' && kayitKirli(kayit, taslak)),
      sil: false,
      yayinla: false,
      onizle: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk
      baslik="Happy Hour / Fiyat Listeleri"
      aciklama="Fiyat şablonları, kurallar ve otomasyon tanımları"
      onizleGoster={false}
    >
      <AdminPanelKarti>
        {uyari && <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />}

        <section className="ap-fiyat-liste-modul" aria-label="Fiyat listeleri modülü">
          <h2 className="ap-tanimlar-hesap-pusula-baslik">Fiyat Listeleri</h2>

          <div className="ap-tanimlar-pusula-butonlar-yatay" role="tablist" aria-label="Fiyat listesi sekmeleri">
            {SEKMELER.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={sekme === s.id}
                className={`ap-eklenti-islem-btn ap-tanimlar-pusula-sekme-btn${sekme === s.id ? ' ap-tanimlar-pusula-sekme-btn-aktif' : ''}`}
                onClick={() => sekmeDegistir(s.id)}
              >
                {s.etiket}
              </button>
            ))}
          </div>

          <div className="ap-fiyat-liste-sekme-icerik">
            {sekme === 'listeler' && (
              <FiyatListeleriIcerik
                kayit={taslak}
                seciliId={seciliId}
                altGorunum={altGorunum}
                yeniEkleAcik={yeniEkleAcik}
                yeniSablonAd={yeniSablonAd}
                guncelleTaslak={guncelleTaslak}
                onSatirSec={satirSec}
                onYeniSablonAdDegistir={setYeniSablonAd}
                onYeniSablonEkle={yeniSablonEkle}
                onAktifDegistir={aktifDegistir}
                onGuncelleTaslakDegistir={setGuncelleTaslak}
                onAltGeri={guncellePaneleKapat}
              />
            )}

            {sekme === 'kurallar' && (
              <FiyatListeKurallariPanel
                kurallar={taslak.kurallar}
                sablonAdlari={sablonAdlari}
                onKuralDegistir={kuralDegistir}
              />
            )}

            {sekme === 'otomasyon' && (
              <FiyatListeOtomasyonPanel
                otomasyonlar={taslak.otomasyonlar}
                sablonAdlari={sablonAdlari}
                onKayitDegistir={otomasyonDegistir}
              />
            )}
          </div>
        </section>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
