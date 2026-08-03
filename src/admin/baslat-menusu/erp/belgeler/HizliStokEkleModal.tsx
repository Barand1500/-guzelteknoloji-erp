import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
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
import { bosBirimForm, bosUrunForm } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { stokGirisiEkle } from '@/admin/baslat-menusu/erp/belgeler/api';
import type { BelgeYon } from '@/admin/baslat-menusu/erp/belgeler/tipler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface HizliStokEkleModalProps {
  acik: boolean;
  /** Hızlı girişte yazılan, katalogda bulunamayan metin */
  aranan: string;
  yon: BelgeYon;
  depoId: string | null;
  depoAdi: string;
  onKapat: () => void;
  /** Stok kartı açıldıktan sonra belgeye eklenecek ürün */
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
  onKapat,
  onEklendi,
}: HizliStokEkleModalProps) {
  const [urunKodu, setUrunKodu] = useState('');
  const [urunAdi, setUrunAdi] = useState('');
  const [birim, setBirim] = useState('ADET');
  const [alisFiyati, setAlisFiyati] = useState('');
  const [satisFiyati, setSatisFiyati] = useState('');
  const [kdv, setKdv] = useState('20');
  const [girisMiktar, setGirisMiktar] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');

  const birimler = useMemo(
    () => birimSecenekleri().map((b) => ({ value: b.deger, label: b.etiket })),
    []
  );
  const bosluklu = aranan.includes(' ');

  useEffect(() => {
    if (!acik) return;
    const temiz = aranan.trim();
    setUrunKodu(bosluklu ? '' : temiz.toLocaleUpperCase('tr'));
    setUrunAdi(temiz.toLocaleUpperCase('tr'));
    setBirim('ADET');
    setAlisFiyati('');
    setSatisFiyati('');
    setKdv('20');
    setGirisMiktar('');
    setHata('');
    setKaydediliyor(false);
  }, [acik, aranan, bosluklu]);

  const kaydet = useCallback(async () => {
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

  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  const kapat = useCallback(() => {
    if (!kaydediliyor) onKapat();
  }, [kaydediliyor, onKapat]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
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
  }, [acik, portalKok, kapat, kaydet]);

  if (!acik || !portalKok) return null;

  return createPortal(
    <div
      className="ap-sil-onay-modal ap-tanimlar-kayit-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Yeni Stok Kartı"
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" onClick={kapat} />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--tanim-kayit">
        <div className="ap-sil-onay-kart ap-tanimlar-kayit-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik="Yeni Stok Kartı" ikon={<StokIkon />} onKapat={kapat} />

          <div className="ap-tanimlar-modal-govde ap-tanimlar-modal-govde--tek">
            <div className="ap-tanimlar-modal-baglam" role="status">
              <span className="ap-tanimlar-modal-baglam-etiket">Bulunamadı</span>
              <span className="ap-tanimlar-modal-baglam-metin">
                «{aranan.trim() || '—'}» stoklarda kayıtlı değil. Kart açılıp belge satırına eklenir.
              </span>
            </div>

            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
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
                etiket={depoId ? `Açılış Miktarı — ${depoAdi || 'depo'}` : 'Açılış Miktarı'}
                deger={girisMiktar}
                kural="serbestMetin"
                inputMode="decimal"
                placeholder={depoId ? '0' : 'Depo seçili değil'}
                onChange={(v) => (depoId ? setGirisMiktar(ondalikFiltrele(v)) : undefined)}
              />

              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--3 fatura-hizli-stok-satir">
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

            {hata ? <p className="ap-tanimlar-modal-hata">{hata}</p> : null}
          </div>

          <div className="ap-tanimlar-modal-footer">
            <button
              type="button"
              className="ap-tanimlar-modal-iptal"
              onClick={kapat}
              disabled={kaydediliyor}
            >
              <span className="ap-tanimlar-modal-tus-metin">İptal</span>
              <span className="ap-tanimlar-modal-kisayol">(ESC)</span>
            </button>
            <button
              type="button"
              className="ap-tanimlar-modal-kaydet"
              onClick={() => void kaydet()}
              disabled={kaydediliyor || !urunKodu.trim() || !urunAdi.trim()}
            >
              <span className="ap-tanimlar-modal-tus-metin">
                {kaydediliyor ? 'Ekleniyor…' : 'Hızlı Ekle'}
              </span>
              <span className="ap-tanimlar-modal-kisayol">(ENTER)</span>
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
