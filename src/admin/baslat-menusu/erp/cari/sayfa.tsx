import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DatagridSagTikMenu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import '@/admin/ortak/datagrid/datagrid.css';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { cariSil, cariGuncelle, carileriGetir } from './api';
import { CariKart } from './bilesenler/CariKart';
import { CariHareketSayfasi } from './CariHareketSayfasi';
import { CariGelismisArama } from './CariGelismisArama';
import {
  bosCariGelismisFiltre,
  cariAramaKriteriVarMi,
  carileriFiltrele,
  gelismisFiltreAktifMi,
  type CariGelismisFiltre,
} from './cariFiltre';
import { CARI_KOLON_GENISLIK_SURUMU, cariKolonlari } from './cariKolonlari';
import { caridenForm, cariSatirEtiketi } from './cariYardimci';
import type { AdminCari, CariKartModu } from './tipler';
import { CariEkstreModal } from '@/admin/baslat-menusu/erp/belgeler/CariEkstreModal';
import { cariBaslatOkuVeTemizle, CARI_BASLAT_OLAY } from './cariBaslat';
import { belgeBaslatYaz } from '@/admin/baslat-menusu/erp/belgeler/belgeBaslat';
import { yonIcinVarsayilanBelgeNevi } from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

type Gorunum = 'liste' | 'kart' | 'hareket';

function CariGezinOk({
  yon,
  hedef,
  disabled,
  onGit,
}: {
  yon: 'geri' | 'ileri';
  hedef: AdminCari | null;
  disabled?: boolean;
  onGit: () => void;
}) {
  const etiket = hedef ? cariSatirEtiketi(hedef) : yon === 'geri' ? 'Önceki cari yok' : 'Sonraki cari yok';
  return (
    <button
      type="button"
      className={`cari-listeye-don-ikon${yon === 'ileri' ? ' cari-listeye-don-ikon--ileri' : ''}`}
      onClick={onGit}
      disabled={disabled || !hedef}
      title={etiket}
      aria-label={hedef ? `${yon === 'geri' ? 'Önceki' : 'Sonraki'}: ${etiket}` : etiket}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function CariListelemeTus({ onGit }: { onGit: () => void }) {
  return (
    <button
      type="button"
      className="cari-listeye-don-ikon cari-listeye-don-ikon--liste"
      onClick={onGit}
      title="Listeleme"
      aria-label="Cari kartlar listesine dön"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
        <path
          d="M8 6h12M8 12h12M8 18h12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M4 6h.01M4 12h.01M4 18h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function FlatUyariIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M12 3.8 21.2 20.2H2.8L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function CariSayfasi({ onModulAc }: { onModulAc?: (modulId: string) => void } = {}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { goruntulemeVar, eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('cari');
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [kartModu, setKartModu] = useState<CariKartModu>('yeni');
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [bilgiYonetAcik, setBilgiYonetAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreMetni, setFiltreMetni] = useState('');
  const [uygulananFiltreMetni, setUygulananFiltreMetni] = useState('');
  const [gelismisFiltre, setGelismisFiltre] = useState<CariGelismisFiltre>(bosCariGelismisFiltre());
  const [gelismisTaslak, setGelismisTaslak] = useState<CariGelismisFiltre>(bosCariGelismisFiltre());
  const [gelismisAcik, setGelismisAcik] = useState(false);
  const [aramaGosterildi, setAramaGosterildi] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aktifCariId, setAktifCariId] = useState<string | null>(null);
  const [silme, setSilme] = useState<AdminCari | null>(null);
  const [ekstreCari, setEkstreCari] = useState<AdminCari | null>(null);
  const [kartKirli, setKartKirli] = useState(false);
  const [kirliOnay, setKirliOnay] = useState<
    null | { tip: 'liste' } | { tip: 'cari'; hedef: AdminCari }
  >(null);
  const [kirliKaydediliyor, setKirliKaydediliyor] = useState(false);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);
  const kaydetRef = useRef<(() => Promise<boolean | void | string>) | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await carileriGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Cariler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const filtrelenmis = useMemo(
    () => carileriFiltrele(kayitlar, uygulananFiltreMetni, gelismisFiltre),
    [kayitlar, uygulananFiltreMetni, gelismisFiltre]
  );

  /** Datagrid’deki sıraya göre kart gezinmesi (uçlarda döngü) */
  const gezinmeListesi = useMemo(
    () => (aramaGosterildi && filtrelenmis.length > 0 ? filtrelenmis : kayitlar),
    [aramaGosterildi, filtrelenmis, kayitlar]
  );

  const gezinmeIdx = useMemo(() => {
    if (!aktifCariId) return -1;
    const id = String(aktifCariId);
    return gezinmeListesi.findIndex((c) => String(c.id) === id);
  }, [aktifCariId, gezinmeListesi]);

  const oncekiCari = useMemo(() => {
    const n = gezinmeListesi.length;
    if (n === 0) return null;
    if (n === 1) {
      /* Tek kayıt varken yine o kayıt (yeni formdan geçiş için) */
      return gezinmeIdx === 0 ? null : gezinmeListesi[0] ?? null;
    }
    if (gezinmeIdx < 0) return gezinmeListesi[n - 1] ?? null; /* yeni → son kayıt */
    return gezinmeListesi[(gezinmeIdx - 1 + n) % n] ?? null;
  }, [gezinmeIdx, gezinmeListesi]);

  const sonrakiCari = useMemo(() => {
    const n = gezinmeListesi.length;
    if (n === 0) return null;
    if (n === 1) {
      return gezinmeIdx === 0 ? null : gezinmeListesi[0] ?? null;
    }
    if (gezinmeIdx < 0) return gezinmeListesi[0] ?? null; /* yeni → ilk kayıt */
    return gezinmeListesi[(gezinmeIdx + 1) % n] ?? null;
  }, [gezinmeIdx, gezinmeListesi]);

  const tekSeciliId = seciliIdler.length === 1 ? seciliIdler[0] : null;
  const baglamCariId = tekSeciliId ?? aktifCariId;

  const listeyeDonUygula = useCallback(() => {
    setGorunum('liste');
    setAktifCariId(null);
    setKartKirli(false);
    setKirliOnay(null);
    void yukle();
  }, [yukle]);

  const listeyeDon = useCallback(
    (secenek?: { kayitSonrasi?: boolean }) => {
      if (!secenek?.kayitSonrasi && kartKirli) {
        setKirliOnay({ tip: 'liste' });
        return;
      }
      listeyeDonUygula();
    },
    [kartKirli, listeyeDonUygula]
  );

  const cariyeGitUygula = useCallback(
    (hedef: AdminCari) => {
      setSeciliIdler([hedef.id]);
      setAktifCariId(hedef.id);
      setKartModu(duzenlemeVar ? 'duzenle' : 'incele');
      setKartKirli(false);
      setKirliOnay(null);
      setGorunum('kart');
    },
    [duzenlemeVar]
  );

  const cariyeGit = useCallback(
    (hedef: AdminCari) => {
      if (kartKirli) {
        setKirliOnay({ tip: 'cari', hedef });
        return;
      }
      cariyeGitUygula(hedef);
    },
    [kartKirli, cariyeGitUygula]
  );

  const hareketAc = useCallback((satirId?: string) => {
    const hedefId = satirId ?? baglamCariId;
    if (!hedefId) {
      hataBildir('Hareketleri görmek için bir cari satırı seçin.');
      return;
    }
    setSeciliIdler([hedefId]);
    setAktifCariId(hedefId);
    setGorunum('hareket');
  }, [baglamCariId, hataBildir]);

  const yeniAc = useCallback(() => {
    if (!eklemeVar) return;
    setKartModu('yeni');
    setAktifCariId(null);
    setGorunum('kart');
  }, [eklemeVar]);

  const duzenleAc = useCallback(
    (satirId?: string) => {
      const hedefId = satirId ?? baglamCariId;
      if (!duzenlemeVar) return;
      if (!hedefId) {
        hataBildir('Düzenlemek için bir cari satırı seçin.');
        return;
      }
      setSeciliIdler([hedefId]);
      setKartModu('duzenle');
      setAktifCariId(hedefId);
      setGorunum('kart');
    },
    [baglamCariId, duzenlemeVar, hataBildir]
  );

  useEffect(() => {
    const uygula = () => {
      const baslat = cariBaslatOkuVeTemizle();
      if (!baslat?.cariId) return;
      if (baslat.duzenle) {
        duzenleAc(baslat.cariId);
        return;
      }
      const hedef = kayitlar.find((k) => k.id === baslat.cariId);
      if (hedef) cariyeGitUygula(hedef);
    };
    uygula();
    window.addEventListener(CARI_BASLAT_OLAY, uygula);
    return () => window.removeEventListener(CARI_BASLAT_OLAY, uygula);
  }, [duzenleAc, cariyeGitUygula, kayitlar]);

  const kaydet = useCallback(async () => {
    if (!kaydetRef.current) {
      hataBildir('Kayıt formu henüz hazır değil.');
      throw new Error('Kayıt formu henüz hazır değil.');
    }
    return await kaydetRef.current();
  }, [hataBildir]);

  const kirliKaydetmedenDevam = useCallback(() => {
    if (!kirliOnay) return;
    if (kirliOnay.tip === 'liste') {
      listeyeDonUygula();
      return;
    }
    cariyeGitUygula(kirliOnay.hedef);
  }, [kirliOnay, listeyeDonUygula, cariyeGitUygula]);

  const kirliKaydetVeDevam = useCallback(async () => {
    if (!kirliOnay || kirliKaydediliyor) return;
    setKirliKaydediliyor(true);
    try {
      const sonuc = await kaydet();
      if (sonuc === false) return;
      if (kirliOnay.tip === 'liste') {
        listeyeDonUygula();
        return;
      }
      cariyeGitUygula(kirliOnay.hedef);
    } catch {
      /* kaydet zaten hata bildirir */
    } finally {
      setKirliKaydediliyor(false);
    }
  }, [kirliOnay, kirliKaydediliyor, kaydet, listeyeDonUygula, cariyeGitUygula]);

  const silAksiyon = useCallback(() => {
    if (!silmeVar) return;
    const hedefId = baglamCariId;
    if (!hedefId) {
      hataBildir('Silmek için bir cari satırı seçin.');
      return;
    }
    const kayit = kayitlar.find((k) => k.id === hedefId);
    if (!kayit) {
      hataBildir('Seçili cari bulunamadı.');
      return;
    }
    setSilme(kayit);
  }, [baglamCariId, hataBildir, kayitlar, silmeVar]);

  const hizliAraUygula = useCallback(() => {
    const taslakGelismis = gelismisAcik ? gelismisTaslak : gelismisFiltre;
    if (!cariAramaKriteriVarMi(filtreMetni, taslakGelismis)) {
      hataBildir('Aramak için cari kodu/adı veya gelişmiş filtre girin.');
      return;
    }
    if (gelismisAcik) {
      setGelismisFiltre(gelismisTaslak);
      setGelismisAcik(false);
    }
    setUygulananFiltreMetni(filtreMetni);
    setSeciliIdler([]);
    setAramaGosterildi(true);
  }, [filtreMetni, gelismisAcik, gelismisFiltre, gelismisTaslak, hataBildir]);

  const gelismisAraAc = useCallback(() => {
    setGelismisTaslak(gelismisFiltre);
    setGelismisAcik(true);
  }, [gelismisFiltre]);

  const gelismisUygula = useCallback(() => {
    setGelismisFiltre(gelismisTaslak);
    setGelismisAcik(false);
    setUygulananFiltreMetni(filtreMetni);
    setSeciliIdler([]);
    setAramaGosterildi(true);
  }, [filtreMetni, gelismisTaslak]);

  const aktifHareketCari = useMemo(
    () => (aktifCariId ? kayitlar.find((k) => k.id === aktifCariId) ?? null : null),
    [aktifCariId, kayitlar]
  );
  const kartFormu = gorunum === 'kart' && kartModu !== 'incele';
  const cariSecili = Boolean(baglamCariId);
  const hareketSayfasi = gorunum === 'hareket';

  const harekettenBelgeEkle = useCallback(() => {
    if (!eklemeVar) return;
    const cari = aktifHareketCari;
    if (!cari) {
      hataBildir('Belge eklemek için bir cari seçin.');
      return;
    }
    if (!onModulAc) {
      hataBildir('Belgeler modülü açılamadı.');
      return;
    }
    const nevi = yonIcinVarsayilanBelgeNevi('SATIS');
    belgeBaslatYaz({ cariId: cari.id, yeni: true, belgeNeviId: nevi.id });
    onModulAc('belgeler');
    void yukle();
  }, [aktifHareketCari, eklemeVar, hataBildir, onModulAc, yukle]);

  useModulAksiyonlari(
    {
      kaydet: kartFormu ? () => kaydet() : undefined,
      ekle: eklemeVar ? (hareketSayfasi ? harekettenBelgeEkle : yeniAc) : undefined,
      guncelle: duzenlemeVar ? () => duzenleAc() : undefined,
      sil: silmeVar ? silAksiyon : undefined,
      belgeAlanYonet: hareketSayfasi ? () => setBilgiYonetAcik(true) : undefined,
    },
    {
      kaydet: kartFormu && (kartModu === 'yeni' ? eklemeVar : duzenlemeVar),
      ekle: eklemeVar,
      guncelle: duzenlemeVar && cariSecili && (gorunum === 'liste' || gorunum === 'hareket'),
      sil: silmeVar && cariSecili && gorunum === 'liste',
      belgeAlanYonet: hareketSayfasi,
    },
    kartFormu ? kartKirli : false,
    {
      ekle: hareketSayfasi ? 'Belge Ekle' : undefined,
      belgeAlanYonet: 'Bilgi Düzenle',
    }
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await cariSil(silme.id);
      basariBildir('Cari silindi.');
      setSilme(null);
      setSeciliIdler((idler) => idler.filter((id) => id !== silme.id));
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  const satirlarDegistir = useCallback(
    (yeni: AdminCari[]) => {
      const oncekiMap = new Map(kayitlar.map((k) => [k.id, k]));
      setKayitlar(yeni);

      void (async () => {
        for (const satir of yeni) {
          const eski = oncekiMap.get(satir.id);
          if (!eski || eski.aktif === satir.aktif) continue;
          try {
            await cariGuncelle(satir.id, { ...caridenForm(satir), aktif: satir.aktif });
          } catch (e) {
            hataBildir(e instanceof Error ? e.message : 'Durum güncellenemedi');
            await yukle();
            return;
          }
        }
      })();
    },
    [hataBildir, kayitlar, yukle]
  );

  const topluDurumAyarla = useCallback(
    async (aktif: boolean) => {
      if (!duzenlemeVar) {
        hataBildir('Durum değiştirme yetkiniz yok.');
        return;
      }
      if (seciliIdler.length === 0) {
        hataBildir('Durum değiştirmek için en az bir cari seçin.');
        return;
      }
      try {
        await Promise.all(
          seciliIdler.map(async (id) => {
            const c = kayitlar.find((k) => k.id === id);
            if (!c) return;
            await cariGuncelle(id, { ...caridenForm(c), aktif });
          })
        );
        basariBildir(
          aktif
            ? `${seciliIdler.length} cari aktif yapıldı.`
            : `${seciliIdler.length} cari pasif yapıldı.`
        );
        gridApiRef.current?.secimAyarla([]);
        setSeciliIdler([]);
        await yukle();
      } catch (e) {
        hataBildir(e instanceof Error ? e.message : 'Durum güncellenemedi');
      }
    },
    [basariBildir, duzenlemeVar, hataBildir, kayitlar, seciliIdler, yukle]
  );

  const kolonlar = useMemo(() => cariKolonlari(), []);

  const modulBaslik =
    gorunum === 'hareket'
      ? ''
      : gorunum === 'kart' && kartModu === 'yeni'
        ? 'Yeni Cari Kart Ekleme'
        : gorunum === 'kart' && kartModu === 'duzenle'
          ? 'Cari Kart Düzenleme'
          : gorunum === 'kart' && kartModu === 'incele'
            ? 'Cari Kart İnceleme'
            : 'Cari Kartlar';

  const modulAciklama =
    gorunum === 'liste'
      ? 'Cari kartlarını listeleyin, arayın ve yönetin. Çift tıklayınca hareketler açılır.'
      : undefined;

  if (!goruntulemeVar) {
    return (
      <YetkisizErisim aciklama="Cari kartları görmek için Görüntüleme yetkisi gerekir." />
    );
  }

  return (
    <AdminModulKabuk
      baslik={modulBaslik}
      aciklama={modulAciklama}
      ustAksiyon={
        gorunum === 'kart' ? (
          <div className="cari-kart-gezin-grup" aria-label="Kart gezinme">
            <CariListelemeTus onGit={() => listeyeDon()} />
            <CariGezinOk
              yon="geri"
              hedef={oncekiCari}
              onGit={() => oncekiCari && cariyeGit(oncekiCari)}
            />
            <CariGezinOk
              yon="ileri"
              hedef={sonrakiCari}
              onGit={() => sonrakiCari && cariyeGit(sonrakiCari)}
            />
          </div>
        ) : null
      }
    >
      <div className="ap-tanimlar-sayfa">
        {gorunum === 'hareket' && aktifHareketCari ? (
          <CariHareketSayfasi
            cari={aktifHareketCari}
            onGeri={() => {
              setBilgiYonetAcik(false);
              listeyeDon({ kayitSonrasi: true });
            }}
            onModulAc={onModulAc}
            onYenile={yukle}
            bilgiYonetAcik={bilgiYonetAcik}
            onBilgiYonetAcikDegistir={setBilgiYonetAcik}
          />
        ) : gorunum === 'kart' ? (
          <CariKart
            mod={kartModu}
            cariId={aktifCariId}
            onKaydedildi={() => listeyeDon({ kayitSonrasi: true })}
            kaydetRef={kaydetRef}
            onKirliDegistir={setKartKirli}
          />
        ) : (
          <div className={`dg-urun-slayt-kabuk${gelismisAcik ? ' dg-urun-slayt-kabuk--arama' : ''}`}>
            <div className="dg-urun-slayt-tablo">
              <div ref={sayfaRef} className="dg-demo-sayfa dg-demo-sag-tik-alan">
                <DatagridSagTikMenu
                  konteynerRef={sayfaRef}
                  kolonlar={kolonlar}
                  satirlar={filtrelenmis}
                  seciliSatirSayisi={seciliIdler.length}
                  gridApiRef={gridApiRef}
                  menuEtiketi="Cari kartlar menüsü"
                  satirEkleGoster={false}
                  satirCogaltGoster={false}
                  onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                  onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                  seciliSilGoster={false}
                  dahiliSilmeOnay={false}
                  satirSilMetniAl={cariSatirEtiketi}
                  onAktifYap={duzenlemeVar ? () => void topluDurumAyarla(true) : undefined}
                  onPasifYap={duzenlemeVar ? () => void topluDurumAyarla(false) : undefined}
                  onSecimiTemizle={() => {
                    gridApiRef.current?.secimAyarla([]);
                    setSeciliIdler([]);
                  }}
                  onBilgi={basariBildir}
                />

                <form
                  className="stoklar-liste-ara-cubugu"
                  onSubmit={(e) => {
                    e.preventDefault();
                    hizliAraUygula();
                  }}
                >
                  <div className="stoklar-liste-hizli-ara">
                    <label className="stoklar-liste-hizli-ara-alan">
                      <span>Ara</span>
                      <input
                        type="search"
                        value={filtreMetni}
                        onChange={(e) => setFiltreMetni(e.target.value)}
                        placeholder="Cari kodu veya adı…"
                        aria-label="Cari ara"
                      />
                    </label>
                  </div>
                  <button type="submit" className="stoklar-hizli-ara-tus">
                    Ara
                  </button>
                  <button
                    type="button"
                    className={`stoklar-gelismis-ara-tus${gelismisFiltreAktifMi(gelismisFiltre) ? ' stoklar-gelismis-ara-tus--aktif' : ''}`}
                    onClick={gelismisAraAc}
                  >
                    Gelişmiş Ara
                    {gelismisFiltreAktifMi(gelismisFiltre) ? (
                      <span className="stoklar-gelismis-ara-tus-nokta" aria-hidden />
                    ) : null}
                  </button>
                </form>

                {!aramaGosterildi ? (
                  <div className="stoklar-liste-bekleme">
                    <p className="stoklar-liste-bekleme-baslik">Cari arayın</p>
                    <p className="stoklar-liste-bekleme-metin">
                      Listeyi görmek için cari kodu veya adı yazıp Ara&apos;ya basın. Kayıt
                      bulunamazsa boş liste açılır; aksiyon çubuğundan Yeni ile ekleyebilirsiniz.
                    </p>
                  </div>
                ) : yukleniyor ? (
                  <TanimYukleniyor />
                ) : (
                  <div className="stoklar-tablo-alan">
                    <DataGrid
                      key={`cari_kayitlar_v${CARI_KOLON_GENISLIK_SURUMU}`}
                      tabloBaslik=""
                      tabloAltBaslik="Arama sonuçları"
                      yukleniyor={false}
                      gridApiRef={gridApiRef}
                      kolonlar={kolonlar}
                      satirlar={filtrelenmis}
                      depolamaAnahtari={`cari_kayitlar_v${CARI_KOLON_GENISLIK_SURUMU}`}
                      bosMesaj="Aramanızla eşleşen cari bulunamadı. Yeni ile cari kart ekleyebilirsiniz."
                      satirSinifAdi={(s) => (!s.aktif ? 'dg-satir--pasif' : undefined)}
                      onSatirTikla={(s) => gridApiRef.current?.secimAyarla([s.id])}
                      onSatirCiftTikla={(s) => hareketAc(s.id)}
                      onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                      onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                      satirIslemEkleri={(s) => (
                        <button
                          type="button"
                          className="dg-islem-tus"
                          title="Cari ekstre"
                          aria-label="Cari ekstre"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEkstreCari(s);
                          }}
                        >
                          <span className="dg-islem-ekstre-ikon" aria-hidden>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <rect x="3.5" y="2.5" width="9" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.25" />
                              <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                            </svg>
                          </span>
                        </button>
                      )}
                      onSecimDegistir={setSeciliIdler}
                      onSatirlarDegistir={satirlarDegistir}
                      formulMenuGoster
                      ustSolAraclarGoster={false}
                      ustSagAraclarGoster={false}
                      ustAracGoster={false}
                      topluBarGoster={false}
                    />
                  </div>
                )}
              </div>
            </div>

            <CariGelismisArama
              acik={gelismisAcik}
              filtre={gelismisTaslak}
              onFiltreDegistir={setGelismisTaslak}
              onUygula={gelismisUygula}
              onKapat={() => setGelismisAcik(false)}
              sonucSayisi={carileriFiltrele(kayitlar, filtreMetni, gelismisTaslak).length}
            />
          </div>
        )}
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu cari kartı silmek istiyor musunuz?"
        hedefMetin={silme ? cariSatirEtiketi(silme) : ''}
        ariaLabel="Cari silme onayı"
      />
      <SistemModal
        acik={!!kirliOnay}
        onKapat={() => {
          if (!kirliKaydediliyor) setKirliOnay(null);
        }}
        onEnter={() => void kirliKaydetVeDevam()}
        baslik="Kaydedilmemiş değişiklikler"
        altBaslik={
          kirliOnay?.tip === 'cari'
            ? 'Bu cari kartında kaydedilmemiş değişiklikler var. Diğer cariye geçmeden önce nasıl devam edilsin?'
            : 'Bu cari kartında kaydedilmemiş değişiklikler var. Listeye dönmeden önce nasıl devam edilsin?'
        }
        ikon={<FlatUyariIkon />}
        ikonFlat
        ustCizgi={false}
        kapatEtiket="✕ ESC"
        onEscape={kirliKaydetmedenDevam}
        genislik="sm"
        kapatmaDevreDisi={kirliKaydediliyor}
        footer={
          <SistemModalAksiyonlar>
            <button
              type="button"
              className="fatura-btn fatura-btn--ikincil cari-kirli-modal-tus"
              onClick={kirliKaydetmedenDevam}
              disabled={kirliKaydediliyor}
            >
              <ModalTusIcerik
                metin={kirliOnay?.tip === 'cari' ? 'Kaydetmeden Geç' : 'Kaydetmeden Dön'}
                kisayol="Esc"
              />
            </button>
            <button
              type="button"
              className="fatura-btn fatura-btn--birincil cari-kirli-modal-tus"
              onClick={() => void kirliKaydetVeDevam()}
              disabled={kirliKaydediliyor}
            >
              <ModalTusIcerik
                metin={
                  kirliKaydediliyor
                    ? 'Kaydediliyor…'
                    : kirliOnay?.tip === 'cari'
                      ? 'Kaydet ve Geç'
                      : 'Kaydet ve Dön'
                }
                kisayol={kirliKaydediliyor ? undefined : 'Enter'}
              />
            </button>
          </SistemModalAksiyonlar>
        }
      >
        <p className="ap-muted text-sm leading-relaxed">
          Kaydet seçeneği değişiklikleri kaydeder. Kaydetmeden devam ederseniz yaptığınız değişiklikler
          kaybolur.
        </p>
      </SistemModal>
      <CariEkstreModal acik={!!ekstreCari} cari={ekstreCari} onKapat={() => setEkstreCari(null)} />
    </AdminModulKabuk>
  );
}
