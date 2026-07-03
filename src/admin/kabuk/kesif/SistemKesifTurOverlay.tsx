import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KesifOkYonu, SistemKesifAdim, SistemKesifTur } from '@/admin/ortak/tipler/sistemKesif';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface KartKonum {
  top: number;
  left: number;
  okYonu: KesifOkYonu;
}

interface SistemKesifTurOverlayProps {
  tur: SistemKesifTur;
  onModulAc: (modulId: string) => void;
  onMenuAc: () => void;
  onMenuKapat: () => void;
  onBitir: () => void;
}

const KART_GENISLIK = 400;
const KART_TAHMIN_YUKSEK = 280;
const PAD = 12;

function bekle(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gorunurMu(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 8 && r.height > 8;
}

function hedefAra(ad: string, modulId?: string): Element | null {
  const seciciler: string[] = [];

  if (modulId) {
    seciciler.push(`[data-ap-kesif-modul="${modulId}"][data-ap-kesif-aktif="true"] [data-ap-kesif="${ad}"]`);
    seciciler.push(`[data-ap-kesif-modul="${modulId}"][data-ap-kesif-aktif="true"]`);
    seciciler.push(`[data-ap-kesif-modul="${modulId}"] [data-ap-kesif="${ad}"]`);
    seciciler.push(`[data-ap-kesif-modul="${modulId}"]`);
  }
  seciciler.push(`[data-ap-kesif-aktif="true"] [data-ap-kesif="${ad}"]`);
  seciciler.push(`[data-ap-kesif="${ad}"]`);

  for (const sel of seciciler) {
    const el = document.querySelector(sel);
    if (el && gorunurMu(el)) return el;
  }
  return null;
}

async function hedefBekle(adim: SistemKesifAdim): Promise<Element | null> {
  const hedefler = [adim.hedef, ...(adim.hedefYedek ?? [])].filter(Boolean) as string[];
  const deneme = adim.modulId ? 40 : 25;

  for (let i = 0; i < deneme; i += 1) {
    for (const ad of hedefler) {
      const el = hedefAra(ad, adim.modulId);
      if (el) return el;
    }
    await bekle(80);
  }
  return null;
}

async function modulPanelBekle(modulId: string) {
  for (let i = 0; i < 40; i += 1) {
    const panel =
      document.querySelector(`[data-ap-kesif-modul="${modulId}"][data-ap-kesif-aktif="true"]`) ??
      document.querySelector(`[data-ap-kesif-modul="${modulId}"]`);
    if (panel && gorunurMu(panel)) return;
    await bekle(80);
  }
}

function hedefRect(el: Element, padding: number): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  };
}

function kartKonumuHesapla(hedef: Rect | null, tercih: KesifOkYonu = 'alt'): KartKonum {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;

  if (!hedef) {
    return {
      top: Math.max(margin, vh / 2 - KART_TAHMIN_YUKSEK / 2),
      left: Math.max(margin, vw / 2 - KART_GENISLIK / 2),
      okYonu: 'alt',
    };
  }

  const adaylar: { yon: KesifOkYonu; top: number; left: number; skor: number }[] = [
    {
      yon: 'alt',
      top: hedef.top + hedef.height + margin,
      left: hedef.left + hedef.width / 2 - KART_GENISLIK / 2,
      skor: tercih === 'alt' ? 0 : 1,
    },
    {
      yon: 'ust',
      top: hedef.top - KART_TAHMIN_YUKSEK - margin,
      left: hedef.left + hedef.width / 2 - KART_GENISLIK / 2,
      skor: tercih === 'ust' ? 0 : 1,
    },
    {
      yon: 'sag',
      top: hedef.top + hedef.height / 2 - KART_TAHMIN_YUKSEK / 2,
      left: hedef.left + hedef.width + margin,
      skor: tercih === 'sag' ? 0 : 1,
    },
    {
      yon: 'sol',
      top: hedef.top + hedef.height / 2 - KART_TAHMIN_YUKSEK / 2,
      left: hedef.left - KART_GENISLIK - margin,
      skor: tercih === 'sol' ? 0 : 1,
    },
  ];

  adaylar.sort((a, b) => a.skor - b.skor);

  for (const aday of adaylar) {
    const top = Math.max(margin, Math.min(aday.top, vh - KART_TAHMIN_YUKSEK - margin));
    const left = Math.max(margin, Math.min(aday.left, vw - KART_GENISLIK - margin));
    return { top, left, okYonu: aday.yon };
  }

  return {
    top: Math.max(margin, vh / 2 - KART_TAHMIN_YUKSEK / 2),
    left: Math.max(margin, vw / 2 - KART_GENISLIK / 2),
    okYonu: tercih,
  };
}

export function SistemKesifTurOverlay({
  tur,
  onModulAc,
  onMenuAc,
  onMenuKapat,
  onBitir,
}: SistemKesifTurOverlayProps) {
  const [adimIdx, setAdimIdx] = useState(0);
  const [hazir, setHazir] = useState(false);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const [kart, setKart] = useState<KartKonum | null>(null);

  const onModulAcRef = useRef(onModulAc);
  const onMenuAcRef = useRef(onMenuAc);
  const onMenuKapatRef = useRef(onMenuKapat);
  onModulAcRef.current = onModulAc;
  onMenuAcRef.current = onMenuAc;
  onMenuKapatRef.current = onMenuKapat;

  const adim = tur.adimlar[adimIdx];
  const sonAdim = adimIdx >= tur.adimlar.length - 1;
  const ilkAdim = adimIdx === 0;

  useLayoutEffect(() => {
    let iptal = false;

    async function adimiHazirla() {
      setHazir(false);
      const mevcutAdim = tur.adimlar[adimIdx];

      if (mevcutAdim.menuKapat) onMenuKapatRef.current();

      if (mevcutAdim.modulId) {
        onModulAcRef.current(mevcutAdim.modulId);
        await bekle(80);
        if (iptal) return;
        await modulPanelBekle(mevcutAdim.modulId);
        if (iptal) return;
        await bekle(mevcutAdim.hedef ? 200 : 100);
      }

      if (iptal) return;

      if (mevcutAdim.menuAc) {
        onMenuAcRef.current();
        await bekle(350);
      }

      if (iptal) return;

      const padding = mevcutAdim.padding ?? PAD;
      const hedefler = [mevcutAdim.hedef, ...(mevcutAdim.hedefYedek ?? [])].filter(Boolean);

      if (hedefler.length === 0) {
        setSpotlight(null);
        setKart(kartKonumuHesapla(null));
        setHazir(true);
        return;
      }

      const el = await hedefBekle(mevcutAdim);
      if (iptal) return;

      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await bekle(150);
        if (iptal) return;
        const rect = hedefRect(el, padding);
        setSpotlight(rect);
        setKart(kartKonumuHesapla(rect, mevcutAdim.okYonu));
      } else {
        setSpotlight(null);
        setKart(kartKonumuHesapla(null));
      }
      setHazir(true);
    }

    void adimiHazirla();
    return () => {
      iptal = true;
    };
  }, [adimIdx, tur.id]);

  useEffect(() => {
    function yenidenOlc() {
      const hedefler = [adim.hedef, ...(adim.hedefYedek ?? [])].filter(Boolean) as string[];
      let el: Element | null = null;
      for (const ad of hedefler) {
        el = hedefAra(ad, adim.modulId);
        if (el) break;
      }
      if (!el) return;
      const rect = hedefRect(el, adim.padding ?? PAD);
      setSpotlight(rect);
      setKart(kartKonumuHesapla(rect, adim.okYonu));
    }

    window.addEventListener('resize', yenidenOlc);
    window.addEventListener('scroll', yenidenOlc, true);
    return () => {
      window.removeEventListener('resize', yenidenOlc);
      window.removeEventListener('scroll', yenidenOlc, true);
    };
  }, [adim]);

  useEffect(() => {
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBitir();
      }
    }
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [onBitir]);

  function ileri() {
    if (sonAdim) onBitir();
    else setAdimIdx((i) => i + 1);
  }

  function geri() {
    if (!ilkAdim) setAdimIdx((i) => i - 1);
  }

  return (
    <div className="ap-kesif-tur" role="presentation">
      <div className="ap-kesif-tur-backdrop" />

      {spotlight && hazir && (
        <div
          className="ap-kesif-spotlight"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}

      {hazir && kart && (
        <div
          className="ap-kesif-kart"
          style={{ top: kart.top, left: kart.left, width: KART_GENISLIK }}
          data-ok={kart.okYonu}
        >
          <div className="ap-kesif-kart-ust">
            <span className="ap-kesif-kart-rozet">{tur.ikon}</span>
            <span className="ap-kesif-kart-sira">
              Adım {adimIdx + 1} / {tur.adimlar.length}
            </span>
          </div>
          <h3 className="ap-kesif-kart-baslik">{adim.baslik}</h3>
          <p className="ap-kesif-kart-metin">{adim.aciklama}</p>

          {adim.ipuclari && adim.ipuclari.length > 0 && (
            <ul className="ap-kesif-ipucu-liste">
              {adim.ipuclari.map((ipucu) => (
                <li key={ipucu}>{ipucu}</li>
              ))}
            </ul>
          )}

          <div className="ap-kesif-kart-ilerleme">
            {tur.adimlar.map((_, i) => (
              <span key={i} className={`ap-kesif-nokta ${i === adimIdx ? 'ap-kesif-nokta-aktif' : ''}`} />
            ))}
          </div>

          <div className="ap-kesif-kart-alt">
            <button type="button" className="ap-kesif-atla" onClick={onBitir}>
              Turu Kapat
            </button>
            <div className="ap-kesif-nav">
              {!ilkAdim && (
                <button type="button" className="ap-kesif-geri" onClick={geri}>
                  ← Geri
                </button>
              )}
              <button type="button" className="ap-kesif-ileri" onClick={ileri}>
                {sonAdim ? 'Bitir ✓' : 'İleri →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hazir && (
        <div className="ap-kesif-yukleniyor">
          <span className="ap-kesif-yukleniyor-nokta" />
          {adim.modulId ? 'Modül açılıyor…' : 'Hazırlanıyor…'}
        </div>
      )}
    </div>
  );
}
