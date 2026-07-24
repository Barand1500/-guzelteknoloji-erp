import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { OtAcilirSecim } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtAcilirSecim';
import {
  KUR_TIPLERI,
  type KurTipi,
  type ParaBirimi,
  type ParaBirimiGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

const BOS: ParaBirimiGirdi = {
  adi: '',
  kisaAdi: '',
  sembol: '',
  kurTipi: 'efektif-satis',
  kur: 0,
  otoGuncelleme: false,
  apiUrl: '',
  aktif: true,
};

interface ParaBirimiModalProps {
  acik: boolean;
  kayit: ParaBirimi | null;
  onKapat: () => void;
  onKaydet: (girdi: ParaBirimiGirdi) => string | null;
}

function PasifGoz({ title }: { title: string }) {
  return (
    <span className="ot-pb-kur-goz" title={title} aria-hidden>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path
          d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9.8 7-.3.9-1.1 2.2-2.4 3.5M6.1 6.1C4.3 7.5 3.2 9.2 2.2 12c.8 2.5 4.8 7 9.8 7 1.4 0 2.7-.3 3.9-.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function ParaBirimiModal({ acik, kayit, onKapat, onKaydet }: ParaBirimiModalProps) {
  const baslikId = useId();
  const [form, setForm] = useState<ParaBirimiGirdi>(BOS);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    setHata('');
    if (kayit) {
      setForm({
        adi: kayit.adi,
        kisaAdi: kayit.kisaAdi,
        sembol: kayit.sembol,
        kurTipi: kayit.kurTipi,
        kur: kayit.kur,
        otoGuncelleme: kayit.otoGuncelleme,
        apiUrl: kayit.apiUrl,
        aktif: true,
      });
    } else {
      setForm({ ...BOS });
    }
  }, [acik, kayit]);

  const baslik = kayit ? 'Para Birimi Düzenle' : 'Para Birimi Ekle';
  const apiAktif = form.apiUrl.trim().length > 0;

  const kurTipiSecenekleri = useMemo(
    () => KUR_TIPLERI.map((k) => ({ value: k.value, label: k.label })),
    []
  );

  function alan<K extends keyof ParaBirimiGirdi>(key: K, deger: ParaBirimiGirdi[K]) {
    setForm((onceki) => {
      const sonraki = { ...onceki, [key]: deger };
      if (key === 'apiUrl' && String(deger).trim().length > 0) {
        sonraki.otoGuncelleme = true;
      }
      return sonraki;
    });
  }

  function kaydet(e: FormEvent) {
    e.preventDefault();
    const sonuc = onKaydet({
      ...form,
      aktif: true,
      otoGuncelleme: apiAktif ? true : form.otoGuncelleme,
    });
    if (sonuc) {
      setHata(sonuc);
      return;
    }
    onKapat();
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={baslik}
      baslikId={baslikId}
      genislik="lg"
      disariTiklaKapat={false}
      footer={
        <SistemModalAksiyonlar>
          <div className="flex justify-end gap-2">
            <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={onKapat}>
              Kapat
            </button>
            <button type="submit" form="ot-pb-form" className="ot-btn-kaydet">
              Kaydet
            </button>
          </div>
        </SistemModalAksiyonlar>
      }
    >
      <form id="ot-pb-form" className="ot-pb-form" onSubmit={kaydet}>
        {hata ? <p className="ot-form-hata">{hata}</p> : null}

        <div className="ot-pb-grid-3">
          <Alan etiket="Adı" zorunlu>
            <input
              className="ot-pb-girdi"
              value={form.adi}
              onChange={(e) => alan('adi', e.target.value)}
              required
            />
          </Alan>
          <Alan etiket="Kısa Adı" zorunlu>
            <input
              className="ot-pb-girdi"
              value={form.kisaAdi}
              onChange={(e) => alan('kisaAdi', e.target.value.toUpperCase())}
              maxLength={8}
              required
            />
          </Alan>
          <Alan etiket="Sembol" zorunlu>
            <input
              className="ot-pb-girdi"
              value={form.sembol}
              onChange={(e) => alan('sembol', e.target.value)}
              maxLength={4}
              required
            />
          </Alan>
        </div>

        <div className="ot-pb-grid-3">
          <Alan etiket="Kur Tipi" zorunlu>
            <OtAcilirSecim
              value={form.kurTipi}
              onChange={(v) => alan('kurTipi', v as KurTipi)}
              secenekler={kurTipiSecenekleri}
              aria-label="Kur Tipi"
              className="ot-pb-acilir w-full"
            />
          </Alan>
          <Alan
            etiket="Oto Güncelleme"
            etiketEk={apiAktif ? <PasifGoz title="API Url girildiği için otomatik güncelleme aktif" /> : null}
            ortala
          >
            <div className={`ot-pb-check-wrap${apiAktif ? ' ot-pb-check-wrap-pasif' : ''}`}>
              <input
                type="checkbox"
                className="ot-pb-check-input"
                checked={apiAktif ? true : form.otoGuncelleme}
                onChange={(e) => alan('otoGuncelleme', e.target.checked)}
                disabled={apiAktif}
                aria-label="Oto Güncelleme"
              />
            </div>
          </Alan>
          <Alan
            etiket="Kur"
            zorunlu={!apiAktif}
            etiketEk={apiAktif ? <PasifGoz title="API Url girildiği için kur pasif" /> : null}
          >
            <input
              className={`ot-pb-girdi${apiAktif ? ' ot-pb-girdi-pasif' : ''}`}
              type="number"
              step="any"
              min={0}
              value={Number.isFinite(form.kur) ? form.kur : 0}
              onChange={(e) => alan('kur', Number(e.target.value))}
              disabled={apiAktif}
              required={!apiAktif}
              readOnly={apiAktif}
            />
          </Alan>
        </div>

        <Alan etiket="Api Url">
          <input
            className="ot-pb-girdi"
            value={form.apiUrl}
            onChange={(e) => alan('apiUrl', e.target.value)}
            placeholder="https://"
          />
        </Alan>
      </form>
    </SistemModal>
  );
}

function Alan({
  etiket,
  zorunlu,
  etiketEk,
  ortala,
  children,
}: {
  etiket: string;
  zorunlu?: boolean;
  etiketEk?: ReactNode;
  ortala?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`ot-alan${ortala ? ' ot-alan-orta' : ''}`}>
      <div className="ot-alan-etiket-satir">
        <span className="ot-alan-etiket">
          {etiket}
          {zorunlu ? <span className="ot-zorunlu"> *</span> : null}
        </span>
        {etiketEk}
      </div>
      {children}
    </div>
  );
}
