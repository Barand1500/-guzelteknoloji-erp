import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';
import { birimSecenekleri, gecerliBirim } from '@/admin/baslat-menusu/datagrid/demo/birimVeri';
import type { UrunKaydi } from '@/admin/baslat-menusu/datagrid/demo/urunAramaYardimci';
import { birimOlustur, stokOlustur } from '@/admin/baslat-menusu/erp/stoklar/api';
import { StokKarti } from '@/admin/baslat-menusu/erp/stoklar/StokKarti';
import { bosBirimForm, bosUrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { stokGirisiEkle } from '@/admin/baslat-menusu/erp/belgeler/api';
import type { BelgeYon } from '@/admin/baslat-menusu/erp/belgeler/tipler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

export type HizliStokModalModu = 'soru' | 'form';
type FormAltMod = 'hizli' | 'detayli';

interface HizliStokEkleModalProps {
  acik: boolean;
  /** Hızlı girişte yazılan, katalogda bulunamayan metin */
  aranan: string;
  yon: BelgeYon;
  depoId: string | null;
  depoAdi: string;
  /** soru: onay; form: kart oluştur (varsayılan: soru) */
  baslangicModu?: HizliStokModalModu;
  onKapat: () => void;
  /** Stok kartı açıldıktan sonra alanlara yazılacak ürün */
  onEklendi: (urun: UrunKaydi) => void;
}

function StokIkon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M3.5 8.2 12 4l8.5 4.2v7.6L12 20l-8.5-4.2V8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M3.5 8.2 12 12.4l8.5-4.2M12 12.4V20" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** Ondalık alan: rakam, virgül/nokta — tek ayraç */
function ondalikFiltrele(ham: string): string {
  const temiz = ham.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  const [tam, ...kalan] = temiz.split('.');
  if (!kalan.length) return tam ?? '';
  return `${tam}.${kalan.join('').slice(0, 4)}`;
}

function sayiOku(deger: string): number {
  const n = Number(ondalikFiltrele(deger));
  return Number.isFinite(n) ? n : 0;
}

export function HizliStokEkleModal({
  acik,
  aranan,
  yon,
  depoId,
  depoAdi,
  baslangicModu = 'soru',
  onKapat,
  onEklendi,
}: HizliStokEkleModalProps) {
  const [modu, setModu] = useState<HizliStokModalModu>(baslangicModu);
  const [formAltMod, setFormAltMod] = useState<FormAltMod>('hizli');
  const [urunKodu, setUrunKodu] = useState('');
  const [urunAdi, setUrunAdi] = useState('');
  const [birim, setBirim] = useState('ADET');
  const [alisFiyati, setAlisFiyati] = useState('');
  const [satisFiyati, setSatisFiyati] = useState('');
  const [kdv, setKdv] = useState('20');
  const [girisMiktar, setGirisMiktar] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [detaySurum, setDetaySurum] = useState(0);
  const detayKaydetRef = useRef<(() => Promise<boolean | void | string>) | null>(null);
  const detayKirliRef = useRef(false);

  const birimler = useMemo(
    () => birimSecenekleri().map((b) => ({ value: b.deger, label: b.etiket })),
    []
  );
  const bosluklu = aranan.includes(' ');
  const arananEtiket = aranan.trim() || '—';

  useEffect(() => {
    if (!acik) return;
    const temiz = aranan.trim();
    setModu(baslangicModu);
    setFormAltMod('hizli');
    setUrunKodu(bosluklu ? '' : temiz.toLocaleUpperCase('tr'));
    setUrunAdi(temiz.toLocaleUpperCase('tr'));
    setBirim('ADET');
    setAlisFiyati('');
    setSatisFiyati('');
    setKdv('20');
    setGirisMiktar('');
    setHata('');
    setKaydediliyor(false);
    setDetaySurum(0);
    detayKirliRef.current = false;
  }, [acik, aranan, bosluklu, baslangicModu]);

  const kaydetHizli = useCallback(async () => {
    if (kaydediliyor) return;
    const kod = urunKodu.trim().toLocaleUpperCase('tr');
    const ad = urunAdi.trim();
    if (!kod || !ad) return;
    const secilenBirim = gecerliBirim(birim);
    const kdvOran = sayiOku(kdv);
    const alis = sayiOku(alisFiyati);
    const satis = sayiOku(satisFiyati);
    const miktar = sayiOku(girisMiktar);

    setKaydediliyor(true);
    setHata('');
    try {
      const urun = await stokOlustur({
        ...bosUrunForm,
        urunKodu: kod,
        urunAdi: ad,
        anaBirim: secilenBirim,
        varsayilanBirim: secilenBirim,
        aktif: true,
      });
      await birimOlustur({
        ...bosBirimForm,
        urunId: urun.id,
        birimAdi: secilenBirim,
        alisFiyati: alis,
        satisFiyati: satis,
        alisKdv: kdvOran,
        satisKdv: kdvOran,
      });
      if (miktar > 0 && depoId) {
        await stokGirisiEkle({
          urunKodu: kod,
          urunAdi: ad,
          depoId,
          miktar,
          birim: secilenBirim,
          aciklama: 'AÇILIŞ',
        });
      }
      onEklendi({
        sku: kod,
        ad,
        birim: secilenBirim,
        fiyat: yon === 'ALIS' ? alis : satis,
        envanter: miktar > 0 && depoId ? miktar : 0,
        kdv: kdvOran,
      });
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Stok kartı açılamadı');
      setKaydediliyor(false);
    }
  }, [
    kaydediliyor,
    urunKodu,
    urunAdi,
    birim,
    kdv,
    alisFiyati,
    satisFiyati,
    girisMiktar,
    depoId,
    yon,
    onEklendi,
  ]);

  const kaydetDetayli = useCallback(async () => {
    if (kaydediliyor) return;
    setKaydediliyor(true);
    setHata('');
    try {
      await detayKaydetRef.current?.();
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Stok kartı açılamadı');
      setKaydediliyor(false);
    }
  }, [kaydediliyor]);

  const kaydet = useCallback(async () => {
    if (formAltMod === 'detayli') {
      await kaydetDetayli();
      return;
    }
    await kaydetHizli();
  }, [formAltMod, kaydetDetayli, kaydetHizli]);

  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  const kapat = useCallback(() => {
    if (!kaydediliyor) onKapat();
  }, [kaydediliyor, onKapat]);

  const formaGec = useCallback(() => setModu('form'), []);

  const altModDegistir = useCallback((yeni: FormAltMod) => {
    setFormAltMod(yeni);
    setHata('');
    if (yeni === 'detayli') setDetaySurum((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!acik || !portalKok || modu !== 'form') return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
      if (formAltMod === 'detayli') return;
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const el = e.target as HTMLElement | null;
        if (el?.tagName === 'TEXTAREA') return;
        if (el?.closest('.ap-form-acilir-secim, .ap-form-arama-secim')) return;
        e.preventDefault();
        void kaydet();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, portalKok, kapat, kaydet, modu, formAltMod]);

  useEffect(() => {
    if (!acik || !portalKok || modu !== 'soru') return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formaGec();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, portalKok, kapat, formaGec, modu]);

  if (!acik || !portalKok) return null;

  if (modu === 'soru') {
    return createPortal(
      <div
        className="ap-sil-onay-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Stok kartı bulunamadı"
      >
        <div className="ap-sil-onay-arka" aria-hidden="true" onClick={kapat} />
        <DonenAccentCerceve className="ap-accent-donen-cerceve--sil">
          <div className="ap-sil-onay-kart ap-sil-onay-kart--sol-baslik">
            <ModalSolBaslik baslik="Stok kartı bulunamadı" ikon="!" onKapat={kapat} />
            <p className="ap-sil-onay-metin">
              <strong>«{arananEtiket}»</strong> için stok kartınız bulunamadı. Hızlı eklemek ister
              misiniz?
            </p>
            <div className="ap-sil-onay-aksiyonlar">
              <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={kapat}>
                <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
              </button>
              <button
                type="button"
                className="ap-sil-onay-tus ap-sil-onay-tus--onay"
                onClick={formaGec}
              >
                <ModalTusIcerik metin="Hızlı Ekle" kisayol="Enter" />
              </button>
            </div>
          </div>
        </DonenAccentCerceve>
      </div>,
      portalKok
    );
  }

  const detayli = formAltMod === 'detayli';

  return createPortal(
    <div
      className={`ap-sil-onay-modal ap-tanimlar-kayit-modal fatura-hizli-stok-modal${detayli ? ' fatura-hizli-stok-modal--detayli' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Hızlı Stok Kartı"
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" onClick={kapat} />
      <DonenAccentCerceve
        className={`ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--tanim-kayit${detayli ? ' fatura-hizli-stok-cerceve--detayli' : ''}`}
      >
        <div
          className={`ap-sil-onay-kart ap-tanimlar-kayit-kart ap-sil-onay-kart--sol-baslik fatura-hizli-stok-kart${detayli ? ' fatura-hizli-stok-kart--detayli' : ''}`}
        >
          <ModalSolBaslik
            baslik={detayli ? 'Detaylı Stok Kartı' : 'Hızlı Stok Kartı'}
            ikon={<StokIkon />}
            onKapat={kapat}
          />

          <div className="ap-tanimlar-modal-govde ap-tanimlar-modal-govde--tek fatura-hizli-stok-govde">
            <div className="fatura-hizli-stok-ust">
              <div className="fatura-hizli-stok-ozet" role="status">
                <span className="fatura-hizli-stok-ozet-etiket">Aranan</span>
                <strong className="fatura-hizli-stok-ozet-metin">{arananEtiket}</strong>
                <span className="fatura-hizli-stok-ozet-not">
                  Kart oluşunca alanlar doldurulur; satıra kendiniz eklersiniz.
                </span>
              </div>

              <div className="fatura-hizli-stok-mod-secim" role="tablist" aria-label="Kart tipi">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!detayli}
                  className={`fatura-hizli-stok-mod-tus${!detayli ? ' fatura-hizli-stok-mod-tus--aktif' : ''}`}
                  onClick={() => altModDegistir('hizli')}
                  disabled={kaydediliyor}
                >
                  Hızlı
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={detayli}
                  className={`fatura-hizli-stok-mod-tus${detayli ? ' fatura-hizli-stok-mod-tus--aktif' : ''}`}
                  onClick={() => altModDegistir('detayli')}
                  disabled={kaydediliyor}
                >
                  Detaylı
                </button>
              </div>
            </div>

            {!detayli ? (
              <div className="fatura-hizli-stok-grid">
                <TanimGirdi
                  etiket="Ürün Kodu"
                  deger={urunKodu}
                  kural="stokKod"
                  zorunlu
                  autoFocus
                  placeholder="S0001"
                  onChange={setUrunKodu}
                />
                <TanimGirdi
                  etiket="Ürün Adı"
                  deger={urunAdi}
                  kural="ad"
                  zorunlu
                  placeholder="Ürün adı"
                  onChange={setUrunAdi}
                />

                <label className="ap-tanimlar-secim-alan block">
                  <span className="ap-tanim-girdi-etiket">
                    Birim <span>*</span>
                  </span>
                  <FormAcilirSecim
                    value={birim}
                    onChange={setBirim}
                    secenekler={birimler}
                    aria-label="Birim"
                  />
                </label>
                <TanimGirdi
                  etiket={depoId ? `Açılış — ${depoAdi || 'depo'}` : 'Açılış Miktarı'}
                  deger={girisMiktar}
                  kural="serbestMetin"
                  inputMode="decimal"
                  placeholder={depoId ? '0' : 'Depo seçili değil'}
                  onChange={(v) => (depoId ? setGirisMiktar(ondalikFiltrele(v)) : undefined)}
                />

                <div className="fatura-hizli-stok-fiyatlar">
                  <TanimGirdi
                    etiket="Alış Fiyatı"
                    deger={alisFiyati}
                    kural="serbestMetin"
                    inputMode="decimal"
                    placeholder="0,00"
                    onChange={(v) => setAlisFiyati(ondalikFiltrele(v))}
                  />
                  <TanimGirdi
                    etiket="Satış Fiyatı"
                    deger={satisFiyati}
                    kural="serbestMetin"
                    inputMode="decimal"
                    placeholder="0,00"
                    onChange={(v) => setSatisFiyati(ondalikFiltrele(v))}
                  />
                  <TanimGirdi
                    etiket="KDV (%)"
                    deger={kdv}
                    kural="serbestMetin"
                    inputMode="decimal"
                    placeholder="20"
                    onChange={(v) => setKdv(ondalikFiltrele(v))}
                  />
                </div>
              </div>
            ) : (
              <div className="fatura-hizli-stok-detay ap-tanimlar-sayfa">
                <StokKarti
                  key={`detay-${detaySurum}`}
                  mod="yeni"
                  stokId={null}
                  gomulu
                  baslangicKod={urunKodu}
                  baslangicAd={urunAdi}
                  kaydetRef={detayKaydetRef}
                  onGeri={kapat}
                  onKirliDegistir={(k) => {
                    detayKirliRef.current = k;
                  }}
                  onKaydedildi={() => {
                    /* onYeniOlustu alanları doldurur */
                  }}
                  onYeniOlustu={(urun) => {
                    onEklendi(urun);
                  }}
                />
              </div>
            )}

            {hata ? <p className="ap-tanimlar-modal-hata">{hata}</p> : null}
          </div>

          <div className="ap-tanimlar-modal-footer">
            <button
              type="button"
              className="ap-tanimlar-modal-iptal"
              onClick={kapat}
              disabled={kaydediliyor}
            >
              <span className="ap-tanimlar-modal-tus-metin">Vazgeç</span>
              <span className="ap-tanimlar-modal-kisayol">(ESC)</span>
            </button>
            <button
              type="button"
              className="ap-tanimlar-modal-kaydet"
              onClick={() => void kaydet()}
              disabled={
                kaydediliyor ||
                (!detayli && (!urunKodu.trim() || !urunAdi.trim()))
              }
            >
              <span className="ap-tanimlar-modal-tus-metin">
                {kaydediliyor ? 'Kaydediliyor…' : 'Kartı Oluştur'}
              </span>
              {!detayli ? <span className="ap-tanimlar-modal-kisayol">(ENTER)</span> : null}
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
