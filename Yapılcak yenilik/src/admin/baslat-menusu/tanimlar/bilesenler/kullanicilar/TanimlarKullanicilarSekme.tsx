import { useCallback, useEffect, useMemo, useState } from 'react';
import { TanimlarKullaniciExcelTablo } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullaniciExcelTablo';
import { TanimlarKullaniciUrunYetkiPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullaniciUrunYetkiPanel';
import { TanimlarKullaniciSubeDepartmanPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullaniciSubeDepartmanPanel';
import { TanimlarKullaniciYetkilerPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarKullaniciYetkilerPanel';
import { TanimlarUyariSeridi } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarUyariSeridi';
import { TANIMLAR_KULLANICI_VARSAYILAN } from '@/admin/baslat-menusu/tanimlar/kullanicilar/varsayilanVeri';
import { urunYetkiKaydiBul } from '@/admin/baslat-menusu/tanimlar/kullanicilar/varsayilanUrunYetkileri';
import { subeDepartmanKaydiBul } from '@/admin/baslat-menusu/tanimlar/kullanicilar/varsayilanSubeDepartman';
import {
  bosUrunYetkiKaydi,
  urunYetkiKopyala,
  type TanimlarUrunYetkiKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import {
  subeDepartmanKopyala,
  type TanimlarSubeDepartmanKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/subeDepartmanTipler';
import {
  TANIMLAR_VARSAYILAN_YETKILER,
  yetkiKaydiKopyala,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/varsayilanYetkiler';
import type { TanimlarKullanici, TanimlarKullaniciAlan } from '@/admin/baslat-menusu/tanimlar/kullanicilar/tipler';
import { bosYetkiKaydi, yetkileriKopyala, type TanimlarKullaniciYetkiKaydi } from '@/admin/baslat-menusu/tanimlar/kullanicilar/yetkiTanimlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type Gorunum = 'liste' | 'yetkiler' | 'sube-departman' | 'urun-yetki';

function sonrakiId(liste: TanimlarKullanici[]) {
  return liste.reduce((max, k) => Math.max(max, k.id), 0) + 1;
}

function hucreDeger(k: TanimlarKullanici, alan: TanimlarKullaniciAlan): string {
  return k[alan];
}

function adminKullanicisiMi(k: TanimlarKullanici) {
  return k.kullaniciAdi.trim().toLowerCase() === 'admin';
}

function yetkiHaritasiBaslat(): Record<number, TanimlarKullaniciYetkiKaydi> {
  const harita: Record<number, TanimlarKullaniciYetkiKaydi> = {};
  for (const k of TANIMLAR_KULLANICI_VARSAYILAN) {
    harita[k.id] = yetkiKaydiKopyala(TANIMLAR_VARSAYILAN_YETKILER[k.id] ?? bosYetkiKaydi());
  }
  return harita;
}

function subeDepartmanHaritasiBaslat(): Record<number, TanimlarSubeDepartmanKaydi> {
  const harita: Record<number, TanimlarSubeDepartmanKaydi> = {};
  for (const k of TANIMLAR_KULLANICI_VARSAYILAN) {
    harita[k.id] = subeDepartmanKaydiBul(k.id);
  }
  return harita;
}

function urunYetkiHaritasiBaslat(): Record<number, TanimlarUrunYetkiKaydi> {
  const harita: Record<number, TanimlarUrunYetkiKaydi> = {};
  for (const k of TANIMLAR_KULLANICI_VARSAYILAN) {
    harita[k.id] = urunYetkiKaydiBul(k.id);
  }
  return harita;
}

function kullaniciAnlikDurumOlustur(
  kullanicilar: TanimlarKullanici[],
  yetkiHaritasi: Record<number, TanimlarKullaniciYetkiKaydi>,
  subeDepartmanHaritasi: Record<number, TanimlarSubeDepartmanKaydi>,
  urunYetkiHaritasi: Record<number, TanimlarUrunYetkiKaydi>
) {
  return JSON.stringify({ kullanicilar, yetkiHaritasi, subeDepartmanHaritasi, urunYetkiHaritasi });
}

export function TanimlarKullanicilarSekme({ onKirliDegisti }: { onKirliDegisti?: (kirli: boolean) => void }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [kullanicilar, setKullanicilar] = useState<TanimlarKullanici[]>(() =>
    TANIMLAR_KULLANICI_VARSAYILAN.map((k) => ({ ...k }))
  );
  const [yetkiHaritasi, setYetkiHaritasi] = useState<Record<number, TanimlarKullaniciYetkiKaydi>>(yetkiHaritasiBaslat);
  const [subeDepartmanHaritasi, setSubeDepartmanHaritasi] =
    useState<Record<number, TanimlarSubeDepartmanKaydi>>(subeDepartmanHaritasiBaslat);
  const [urunYetkiHaritasi, setUrunYetkiHaritasi] =
    useState<Record<number, TanimlarUrunYetkiKaydi>>(urunYetkiHaritasiBaslat);
  const [yetkiKullaniciId, setYetkiKullaniciId] = useState<number | null>(null);
  const [subeKullaniciId, setSubeKullaniciId] = useState<number | null>(null);
  const [urunKullaniciId, setUrunKullaniciId] = useState<number | null>(null);
  const [taslakYetki, setTaslakYetki] = useState<TanimlarKullaniciYetkiKaydi | null>(null);
  const [taslakSubeDepartman, setTaslakSubeDepartman] = useState<TanimlarSubeDepartmanKaydi | null>(null);
  const [taslakUrunYetki, setTaslakUrunYetki] = useState<TanimlarUrunYetkiKaydi | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(1);
  const [aktifHucre, setAktifHucre] = useState<{ id: number; alan: TanimlarKullaniciAlan } | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [uyariMesaji, setUyariMesaji] = useState<string | null>(null);
  const [yetkiPano, setYetkiPano] = useState<Record<string, boolean> | null>(null);
  const [urunPano, setUrunPano] = useState<TanimlarUrunYetkiKaydi | null>(null);
  const [sonKayitAnahtar, setSonKayitAnahtar] = useState(() =>
    kullaniciAnlikDurumOlustur(
      TANIMLAR_KULLANICI_VARSAYILAN.map((k) => ({ ...k })),
      yetkiHaritasiBaslat(),
      subeDepartmanHaritasiBaslat(),
      urunYetkiHaritasiBaslat()
    )
  );

  const yetkiKullanici = useMemo(
    () => (yetkiKullaniciId != null ? kullanicilar.find((k) => k.id === yetkiKullaniciId) ?? null : null),
    [yetkiKullaniciId, kullanicilar]
  );

  const subeKullanici = useMemo(
    () => (subeKullaniciId != null ? kullanicilar.find((k) => k.id === subeKullaniciId) ?? null : null),
    [subeKullaniciId, kullanicilar]
  );

  const urunKullanici = useMemo(
    () => (urunKullaniciId != null ? kullanicilar.find((k) => k.id === urunKullaniciId) ?? null : null),
    [urunKullaniciId, kullanicilar]
  );

  const hucreIptal = useCallback(() => {
    setAktifHucre(null);
    setHucreTaslak('');
  }, []);

  const listeGorunumuneDon = useCallback(() => {
    setGorunum('liste');
    setYetkiKullaniciId(null);
    setSubeKullaniciId(null);
    setUrunKullaniciId(null);
    setTaslakYetki(null);
    setTaslakSubeDepartman(null);
    setTaslakUrunYetki(null);
  }, []);

  const hucreBaslat = useCallback((k: TanimlarKullanici, alan: TanimlarKullaniciAlan) => {
    setAktifHucre({ id: k.id, alan });
    setHucreTaslak(hucreDeger(k, alan));
  }, []);

  const hucreBitir = useCallback(() => {
    if (!aktifHucre) return;
    const { id, alan } = aktifHucre;
    const ham = hucreTaslak.trim();
    const mevcut = kullanicilar.find((k) => k.id === id);
    if (!mevcut) {
      hucreIptal();
      return;
    }

    if (alan === 'kullaniciAdi' && ham.length < 2) {
      hataBildir('Kullanıcı adı en az 2 karakter olmalı');
      return;
    }

    if (hucreDeger(mevcut, alan) === ham || (alan === 'fiyatListesi' && mevcut.fiyatListesi === hucreTaslak)) {
      hucreIptal();
      return;
    }

    setKullanicilar((onceki) =>
      onceki.map((k) => (k.id === id ? { ...k, [alan]: alan === 'fiyatListesi' ? hucreTaslak : ham } : k))
    );
    hucreIptal();
  }, [aktifHucre, hucreTaslak, kullanicilar, hucreIptal, hataBildir]);

  const yeniKullanici = useCallback(() => {
    const id = sonrakiId(kullanicilar);
    const yeni: TanimlarKullanici = {
      id,
      kullaniciAdi: '',
      fiyatListesi: '',
      sifre: '',
      iskontoOrani: '',
      iskontoTutari: '',
      kasaPortu: '',
    };
    setKullanicilar((onceki) => [...onceki, yeni]);
    setYetkiHaritasi((onceki) => ({ ...onceki, [id]: bosYetkiKaydi() }));
    setSubeDepartmanHaritasi((onceki) => ({
      ...onceki,
      [id]: subeDepartmanKaydiBul(id),
    }));
    setUrunYetkiHaritasi((onceki) => ({ ...onceki, [id]: bosUrunYetkiKaydi() }));
    setSeciliId(id);
    hucreIptal();
  }, [kullanicilar, hucreIptal]);

  const kullaniciSil = useCallback(() => {
    if (seciliId == null) return;
    const k = kullanicilar.find((u) => u.id === seciliId);
    if (!k) return;
    if (!confirm(`"${k.kullaniciAdi || 'Kullanıcı'}" kaydını silmek istediğinize emin misiniz?`)) return;
    setKullanicilar((onceki) => onceki.filter((u) => u.id !== seciliId));
    setYetkiHaritasi((onceki) => {
      const { [seciliId]: _, ...kalan } = onceki;
      return kalan;
    });
    setSubeDepartmanHaritasi((onceki) => {
      const { [seciliId]: _, ...kalan } = onceki;
      return kalan;
    });
    setUrunYetkiHaritasi((onceki) => {
      const { [seciliId]: _, ...kalan } = onceki;
      return kalan;
    });
    setSeciliId(null);
    hucreIptal();
    basariBildir('Kullanıcı silindi.');
  }, [seciliId, kullanicilar, hucreIptal, basariBildir]);

  const kirli = useMemo(() => {
    if (aktifHucre) return true;
    if (gorunum === 'yetkiler' && taslakYetki && yetkiKullaniciId != null) {
      const mevcut = yetkiHaritasi[yetkiKullaniciId];
      return JSON.stringify(mevcut) !== JSON.stringify(taslakYetki);
    }
    if (gorunum === 'sube-departman' && taslakSubeDepartman && subeKullaniciId != null) {
      const mevcut = subeDepartmanHaritasi[subeKullaniciId];
      return JSON.stringify(mevcut) !== JSON.stringify(taslakSubeDepartman);
    }
    if (gorunum === 'urun-yetki' && taslakUrunYetki && urunKullaniciId != null) {
      const mevcut = urunYetkiHaritasi[urunKullaniciId];
      return JSON.stringify(mevcut) !== JSON.stringify(taslakUrunYetki);
    }
    return (
      kullaniciAnlikDurumOlustur(kullanicilar, yetkiHaritasi, subeDepartmanHaritasi, urunYetkiHaritasi) !==
      sonKayitAnahtar
    );
  }, [
    aktifHucre,
    gorunum,
    taslakYetki,
    yetkiKullaniciId,
    yetkiHaritasi,
    taslakSubeDepartman,
    subeKullaniciId,
    subeDepartmanHaritasi,
    taslakUrunYetki,
    urunKullaniciId,
    urunYetkiHaritasi,
    kullanicilar,
    sonKayitAnahtar,
  ]);

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const kaydet = useCallback(() => {
    let guncelYetki = yetkiHaritasi;
    let guncelSube = subeDepartmanHaritasi;
    let guncelUrun = urunYetkiHaritasi;

    if (gorunum === 'yetkiler' && yetkiKullaniciId != null && taslakYetki) {
      guncelYetki = {
        ...yetkiHaritasi,
        [yetkiKullaniciId]: yetkiKaydiKopyala(taslakYetki),
      };
      setYetkiHaritasi(guncelYetki);
    }
    if (gorunum === 'sube-departman' && subeKullaniciId != null && taslakSubeDepartman) {
      guncelSube = {
        ...subeDepartmanHaritasi,
        [subeKullaniciId]: subeDepartmanKopyala(taslakSubeDepartman),
      };
      setSubeDepartmanHaritasi(guncelSube);
    }
    if (gorunum === 'urun-yetki' && urunKullaniciId != null && taslakUrunYetki) {
      guncelUrun = {
        ...urunYetkiHaritasi,
        [urunKullaniciId]: urunYetkiKopyala(taslakUrunYetki),
      };
      setUrunYetkiHaritasi(guncelUrun);
    }

    const bosAd = kullanicilar.find((k) => !k.kullaniciAdi.trim());
    if (bosAd) {
      hataBildir('Tüm kullanıcıların adı dolu olmalı');
      return;
    }
    basariBildir('Kullanıcılar kaydedildi.');
    setSonKayitAnahtar(kullaniciAnlikDurumOlustur(kullanicilar, guncelYetki, guncelSube, guncelUrun));
  }, [
    gorunum,
    yetkiKullaniciId,
    taslakYetki,
    subeKullaniciId,
    taslakSubeDepartman,
    urunKullaniciId,
    taslakUrunYetki,
    kullanicilar,
    yetkiHaritasi,
    subeDepartmanHaritasi,
    urunYetkiHaritasi,
    basariBildir,
    hataBildir,
  ]);

  const yetkilerAc = useCallback(
    (k: TanimlarKullanici) => {
      if (gorunum === 'yetkiler' && yetkiKullaniciId === k.id) {
        listeGorunumuneDon();
        return;
      }
      if (adminKullanicisiMi(k)) {
        setUyariMesaji('Admin kullanıcısının yetkileri kısıtlanamaz.');
        return;
      }
      const mevcut = yetkiHaritasi[k.id] ?? bosYetkiKaydi();
      setYetkiKullaniciId(k.id);
      setTaslakYetki(yetkiKaydiKopyala(mevcut));
      setGorunum('yetkiler');
      hucreIptal();
    },
    [gorunum, yetkiKullaniciId, yetkiHaritasi, listeGorunumuneDon, hucreIptal]
  );

  const subeDepartmanAc = useCallback(
    (k: TanimlarKullanici) => {
      if (gorunum === 'sube-departman' && subeKullaniciId === k.id) {
        listeGorunumuneDon();
        return;
      }
      const mevcut = subeDepartmanHaritasi[k.id] ?? subeDepartmanKaydiBul(k.id);
      setSubeKullaniciId(k.id);
      setTaslakSubeDepartman(subeDepartmanKopyala(mevcut));
      setGorunum('sube-departman');
      hucreIptal();
    },
    [gorunum, subeKullaniciId, subeDepartmanHaritasi, listeGorunumuneDon, hucreIptal]
  );

  const urunYetkiAc = useCallback(
    (k: TanimlarKullanici) => {
      if (gorunum === 'urun-yetki' && urunKullaniciId === k.id) {
        listeGorunumuneDon();
        return;
      }
      const mevcut = urunYetkiHaritasi[k.id] ?? urunYetkiKaydiBul(k.id);
      setUrunKullaniciId(k.id);
      setTaslakUrunYetki(urunYetkiKopyala(mevcut));
      setGorunum('urun-yetki');
      hucreIptal();
    },
    [gorunum, urunKullaniciId, urunYetkiHaritasi, listeGorunumuneDon, hucreIptal]
  );

  const subeDepartmanAta = useCallback(() => {
    if (!taslakSubeDepartman || subeKullaniciId == null) return;
    if (taslakSubeDepartman.atanmis) return;
    const sube = taslakSubeDepartman.subeNo.trim();
    const dep = taslakSubeDepartman.departmanNo.trim();
    if (!sube || !dep) {
      hataBildir('Şube No ve Departman No zorunludur');
      return;
    }
    const yeni: TanimlarSubeDepartmanKaydi = {
      subeNo: sube,
      departmanNo: dep,
      atanmis: true,
    };
    setTaslakSubeDepartman(yeni);
    setSubeDepartmanHaritasi((onceki) => ({
      ...onceki,
      [subeKullaniciId]: subeDepartmanKopyala(yeni),
    }));
    basariBildir('Departman ataması tamamlandı.');
  }, [taslakSubeDepartman, subeKullaniciId, hataBildir, basariBildir]);

  const personeldenYetkiKopyala = useCallback(
    (kaynakId: number) => {
      const kaynak = yetkiHaritasi[kaynakId];
      if (!kaynak) return;
      setYetkiPano(yetkileriKopyala(kaynak.yetkiler));
      basariBildir('Yetkiler kopyalandı. Yapıştır ile uygulayın.');
    },
    [yetkiHaritasi, basariBildir]
  );

  const yetkiYapistir = useCallback(() => {
    if (!taslakYetki || !yetkiPano) return;
    setTaslakYetki({ yetkiler: yetkileriKopyala(yetkiPano) });
    basariBildir('Yetkiler yapıştırıldı.');
  }, [taslakYetki, yetkiPano, basariBildir]);

  const personeldenUrunKopyala = useCallback(
    (kaynakId: number) => {
      const kaynak = urunYetkiHaritasi[kaynakId];
      if (!kaynak) return;
      setUrunPano(urunYetkiKopyala(kaynak));
      basariBildir('Ürün listesi kopyalandı. Yapıştır ile uygulayın.');
    },
    [urunYetkiHaritasi, basariBildir]
  );

  const urunYapistir = useCallback(() => {
    if (!taslakUrunYetki || !urunPano) return;
    setTaslakUrunYetki(urunYetkiKopyala(urunPano));
    basariBildir('Ürün yetkileri yapıştırıldı.');
  }, [taslakUrunYetki, urunPano, basariBildir]);

  useModulAksiyonlari(
    gorunum === 'liste'
      ? { kaydet, ekle: yeniKullanici, sil: kullaniciSil }
      : { kaydet },
    {
      kaydet: kirli,
      ekle: gorunum === 'liste',
      sil: gorunum === 'liste' && seciliId != null,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <div className="ap-tanimlar-kullanici-sekme">
      {uyariMesaji && <TanimlarUyariSeridi mesaj={uyariMesaji} onKapat={() => setUyariMesaji(null)} />}

      <div className="ap-tanimlar-yan-gecis">
        <div className={`ap-tanimlar-yan-gecis-izgara ${gorunum !== 'liste' ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
          <div className="ap-tanimlar-yan-gecis-panel">
            <p className="ap-muted mb-3 text-xs">
              Satır seçmek için tıklayın; metin alanlarını çift tıklayarak düzenleyin. Alt çubuktan{' '}
              <strong className="ap-heading">Kaydet</strong> ile değişiklikleri onaylayın.
            </p>

            <TanimlarKullaniciExcelTablo
              kullanicilar={kullanicilar}
              seciliId={seciliId}
              aktifHucre={aktifHucre}
              hucreTaslak={hucreTaslak}
              onSatirSec={setSeciliId}
              onHucreBaslat={hucreBaslat}
              onHucreTaslak={setHucreTaslak}
              onHucreBitir={hucreBitir}
              onYetkiler={yetkilerAc}
              onSubeDepartman={subeDepartmanAc}
              onUrunYetkilendir={urunYetkiAc}
            />
          </div>

          <div className="ap-tanimlar-yan-gecis-panel">
            {gorunum === 'yetkiler' && yetkiKullanici && taslakYetki && (
              <TanimlarKullaniciYetkilerPanel
                kullanici={yetkiKullanici}
                digerKullanicilar={kullanicilar.filter((k) => k.id !== yetkiKullanici.id)}
                kayit={taslakYetki}
                panoDolu={yetkiPano != null}
                onKayitDegistir={setTaslakYetki}
                onPersoneldenKopyala={personeldenYetkiKopyala}
                onYetkiYapistir={yetkiYapistir}
                onGeri={listeGorunumuneDon}
              />
            )}

            {gorunum === 'sube-departman' && subeKullanici && taslakSubeDepartman && (
              <TanimlarKullaniciSubeDepartmanPanel
                kullanici={subeKullanici}
                kayit={taslakSubeDepartman}
                onKayitDegistir={setTaslakSubeDepartman}
                onAta={subeDepartmanAta}
                onGeri={listeGorunumuneDon}
              />
            )}

            {gorunum === 'urun-yetki' && urunKullanici && taslakUrunYetki && (
              <TanimlarKullaniciUrunYetkiPanel
                kullanici={urunKullanici}
                digerKullanicilar={kullanicilar.filter((k) => k.id !== urunKullanici.id)}
                kayit={taslakUrunYetki}
                panoDolu={urunPano != null}
                onKayitDegistir={setTaslakUrunYetki}
                onPersoneldenKopyala={personeldenUrunKopyala}
                onYapistir={urunYapistir}
                onGeri={listeGorunumuneDon}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
