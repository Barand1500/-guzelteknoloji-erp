import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DatagridSagTikMenu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { DgSecimUstKutu } from '@/admin/ortak/datagrid/DgSecimUstKutu';
import '@/admin/ortak/datagrid/datagrid.css';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { cariSil, cariGuncelle, carileriGetir } from './api';
import { CariKart } from './bilesenler/CariKart';
import { cariAramaKriteriVarMi, carileriFiltrele } from './cariFiltre';
import { CARI_KOLON_GENISLIK_SURUMU, cariKolonlari } from './cariKolonlari';
import { caridenForm, cariSatirEtiketi } from './cariYardimci';
import type { AdminCari, CariKartModu } from './tipler';

type Gorunum = 'liste' | 'kart';

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

export function CariSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { goruntulemeVar, eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('cari');
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [kartModu, setKartModu] = useState<CariKartModu>('yeni');
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreMetni, setFiltreMetni] = useState('');
  const [uygulananFiltreMetni, setUygulananFiltreMetni] = useState('');
  const [aramaGosterildi, setAramaGosterildi] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aktifCariId, setAktifCariId] = useState<string | null>(null);
  const [silme, setSilme] = useState<AdminCari | null>(null);
  const [kartKirli, setKartKirli] = useState(false);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const sayfaRef = useRef<HTMLDivElement>(null);
  const kaydetRef = useRef<(() => Promise<void>) | null>(null);

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
    () => carileriFiltrele(kayitlar, uygulananFiltreMetni),
    [kayitlar, uygulananFiltreMetni]
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

  const listeyeDon = useCallback(() => {
    if (kartKirli) {
      const onay = window.confirm(
        'Kaydedilmemiş değişiklikler var. Yine de listeye dönmek istiyor musunuz?'
      );
      if (!onay) return;
    }
    setGorunum('liste');
    setAktifCariId(null);
    setKartKirli(false);
    void yukle();
  }, [kartKirli, yukle]);

  const cariyeGit = useCallback(
    (hedef: AdminCari) => {
      if (kartKirli) {
        const onay = window.confirm(
          'Kaydedilmemiş değişiklikler var. Yine de diğer cariye geçmek istiyor musunuz?'
        );
        if (!onay) return;
      }
      setSeciliIdler([hedef.id]);
      setAktifCariId(hedef.id);
      setKartModu(duzenlemeVar ? 'duzenle' : 'incele');
      setKartKirli(false);
      setGorunum('kart');
    },
    [duzenlemeVar, kartKirli]
  );

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

  const kaydet = useCallback(async () => {
    if (!kaydetRef.current) {
      hataBildir('Kayıt formu henüz hazır değil.');
      throw new Error('Kayıt formu henüz hazır değil.');
    }
    await kaydetRef.current();
  }, [hataBildir]);

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
    if (!cariAramaKriteriVarMi(filtreMetni)) {
      hataBildir('Aramak için cari kodu veya adı girin.');
      return;
    }
    setUygulananFiltreMetni(filtreMetni);
    setSeciliIdler([]);
    setAramaGosterildi(true);
  }, [filtreMetni, hataBildir]);

  const kartFormu = gorunum === 'kart' && kartModu !== 'incele';
  const cariSecili = Boolean(baglamCariId);

  useModulAksiyonlari(
    {
      kaydet: kartFormu ? () => kaydet() : undefined,
      ekle: eklemeVar ? yeniAc : undefined,
      guncelle: duzenlemeVar ? () => duzenleAc() : undefined,
      sil: silmeVar ? silAksiyon : undefined,
    },
    {
      kaydet: kartFormu && (kartModu === 'yeni' ? eklemeVar : duzenlemeVar),
      ekle: eklemeVar,
      guncelle: duzenlemeVar && cariSecili && gorunum === 'liste',
      sil: silmeVar && cariSecili && gorunum === 'liste',
    },
    kartFormu ? kartKirli : false
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
    gorunum === 'kart' && kartModu === 'yeni'
      ? 'Yeni Cari Kart Ekleme'
      : gorunum === 'kart' && kartModu === 'duzenle'
        ? 'Cari Kart Düzenleme'
        : gorunum === 'kart' && kartModu === 'incele'
          ? 'Cari Kart İnceleme'
          : 'Cari Kartlar';

  const modulAciklama =
    gorunum === 'liste' ? 'Cari kartlarını listeleyin, arayın ve yönetin.' : undefined;

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
            <CariListelemeTus onGit={listeyeDon} />
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
        ) : gorunum === 'liste' && aramaGosterildi && !yukleniyor ? (
          <div className="dg-modul-ust-araclar">
            <DgSecimUstKutu
              sayi={seciliIdler.length}
              durumTuslari={duzenlemeVar}
              onAktif={() => void topluDurumAyarla(true)}
              onPasif={() => void topluDurumAyarla(false)}
              onDisaAktar={() => gridApiRef.current?.csvIndir(true)}
              onTemizle={() => {
                gridApiRef.current?.secimAyarla([]);
                setSeciliIdler([]);
              }}
            />
            <div className="dg-ikon-grup dg-modul-ust-ikonlar">
              <button
                type="button"
                className="dg-tus dg-tus-ikon"
                title="Sütun görünürlüğü"
                onClick={(e) => gridApiRef.current?.sutunMenuToggle(e.currentTarget)}
              >
                <DgIkon ad="sutun" />
              </button>
              <button
                type="button"
                className="dg-tus dg-tus-ikon"
                title="CSV indir"
                onClick={() => gridApiRef.current?.csvIndir()}
              >
                <DgIkon ad="indir" />
              </button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="ap-tanimlar-sayfa">
        {gorunum === 'kart' ? (
          <CariKart
            mod={kartModu}
            cariId={aktifCariId}
            onKaydedildi={listeyeDon}
            kaydetRef={kaydetRef}
            onKirliDegistir={setKartKirli}
          />
        ) : (
          <div className="dg-urun-slayt-kabuk">
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
                  satirSilMetniAl={cariSatirEtiketi}
                  onDegeriYay={(kolonId, deger, gorunenler) => {
                    const hedefIdler = new Set(gorunenler.map((s) => s.id));
                    const kolon = kolonlar.find((k) => k.id === kolonId);
                    if (!kolon?.degerYaz) return;
                    satirlarDegistir(
                      kayitlar.map((s) =>
                        hedefIdler.has(s.id) ? kolon.degerYaz!(s, deger) : s
                      )
                    );
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
                      onSatirSil={silmeVar ? (s) => setSilme(s) : undefined}
                      onSatirDuzenle={duzenlemeVar ? (s) => duzenleAc(s.id) : undefined}
                      onSecimDegistir={setSeciliIdler}
                      onSatirlarDegistir={satirlarDegistir}
                      formulMenuGoster={false}
                      ustSolAraclarGoster={false}
                      ustSagAraclarGoster={false}
                      ustAracGoster={false}
                      topluBarGoster={false}
                    />
                  </div>
                )}
              </div>
            </div>
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
    </AdminModulKabuk>
  );
}
