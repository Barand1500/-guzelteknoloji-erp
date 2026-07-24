import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];
const GUNLER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function ayHucreleri(yil: number, ay: number) {
  const ilkGun = new Date(yil, ay, 1).getDay();
  const baslangic = ilkGun === 0 ? 6 : ilkGun - 1;
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const oncekiAyGun = new Date(yil, ay, 0).getDate();
  const hucreler: { gun: number; ayOffset: -1 | 0 | 1; tarih: string }[] = [];

  for (let i = 0; i < baslangic; i++) {
    const gun = oncekiAyGun - baslangic + 1 + i;
    const d = new Date(yil, ay - 1, gun);
    hucreler.push({
      gun,
      ayOffset: -1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  for (let g = 1; g <= gunSayisi; g++) {
    hucreler.push({ gun: g, ayOffset: 0, tarih: tarihAnahtari(yil, ay, g) });
  }
  while (hucreler.length < 42) {
    const i = hucreler.length - (baslangic + gunSayisi);
    const g = i + 1;
    const d = new Date(yil, ay + 1, g);
    hucreler.push({
      gun: g,
      ayOffset: 1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  return hucreler;
}

function siralaAralik(a: string, b: string): { bas: string; bit: string } {
  return a <= b ? { bas: a, bit: b } : { bas: b, bit: a };
}

function aralikMetni(bas: string, bit: string): string {
  if (!bas) return 'Takvimde sürükleyerek gün seçin';
  const [y1, m1, g1] = bas.split('-').map(Number);
  const [y2, m2, g2] = bit.split('-').map(Number);
  if (bas === bit) return `${g1} ${AYLAR[m1! - 1]} ${y1}`;
  if (y1 === y2 && m1 === m2) return `${g1} – ${g2} ${AYLAR[m1! - 1]} ${y1}`;
  if (y1 === y2) return `${g1} ${AYLAR[m1! - 1]} – ${g2} ${AYLAR[m2! - 1]} ${y1}`;
  return `${g1} ${AYLAR[m1! - 1]} ${y1} – ${g2} ${AYLAR[m2! - 1]} ${y2}`;
}

function parseAy(tarih: string | undefined): { yil: number; ay: number } {
  if (tarih) {
    const [y, m] = tarih.split('-').map(Number);
    if (y && m) return { yil: y, ay: m - 1 };
  }
  const d = new Date();
  return { yil: d.getFullYear(), ay: d.getMonth() };
}

function tarihNoktadan(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY);
  const hucre = el?.closest('[data-ot-tarih]') as HTMLElement | null;
  return hucre?.dataset.otTarih ?? null;
}

/** Modal içi sürükle-seç tarih aralığı takvimi */
export function OtTarihAralikSecici({
  baslangic,
  bitis,
  onChange,
}: {
  baslangic: string;
  bitis: string;
  onChange: (baslangic: string, bitis: string) => void;
}) {
  const [gorunen, setGorunen] = useState(() => parseAy(baslangic || bitis));
  const gridRef = useRef<HTMLDivElement>(null);
  const surukleBasRef = useRef<string | null>(null);
  const surukleniyorRef = useRef(false);
  const [taslakBit, setTaslakBit] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (baslangic) setGorunen(parseAy(baslangic));
  }, [baslangic]);

  const hucreler = useMemo(() => ayHucreleri(gorunen.yil, gorunen.ay), [gorunen]);

  const basSirali = (() => {
    if (taslakBit && surukleBasRef.current) {
      return siralaAralik(surukleBasRef.current, taslakBit).bas;
    }
    return baslangic;
  })();
  const bitSirali = (() => {
    if (taslakBit && surukleBasRef.current) {
      return siralaAralik(surukleBasRef.current, taslakBit).bit;
    }
    return bitis || baslangic;
  })();

  function araliktaMi(tarih: string) {
    if (!basSirali) return false;
    return tarih >= basSirali && tarih <= (bitSirali || basSirali);
  }

  function basMi(tarih: string) {
    return Boolean(basSirali) && tarih === basSirali;
  }

  function bitMi(tarih: string) {
    const bit = bitSirali || basSirali;
    return Boolean(basSirali) && tarih === bit && basSirali !== bit;
  }

  function araligiUygula(basNokta: string, bitNokta: string) {
    const { bas, bit } = siralaAralik(basNokta, bitNokta);
    setTaslakBit(bitNokta);
    onChangeRef.current(bas, bit);
  }

  function pointerBasla(tarih: string, e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    surukleniyorRef.current = true;
    surukleBasRef.current = tarih;
    setTaslakBit(tarih);
    onChangeRef.current(tarih, tarih);
    gridRef.current?.setPointerCapture(e.pointerId);
  }

  function pointerHareket(e: ReactPointerEvent<HTMLDivElement>) {
    if (!surukleniyorRef.current || !surukleBasRef.current) return;
    const tarih = tarihNoktadan(e.clientX, e.clientY);
    if (!tarih) return;
    araligiUygula(surukleBasRef.current, tarih);
  }

  function pointerBitir(e: ReactPointerEvent<HTMLDivElement>) {
    if (!surukleniyorRef.current) return;
    const basNokta = surukleBasRef.current;
    const tarih = tarihNoktadan(e.clientX, e.clientY) ?? taslakBit ?? basNokta;
    if (basNokta && tarih) {
      const { bas, bit } = siralaAralik(basNokta, tarih);
      onChangeRef.current(bas, bit);
    }
    surukleniyorRef.current = false;
    surukleBasRef.current = null;
    setTaslakBit(null);
    if (gridRef.current?.hasPointerCapture(e.pointerId)) {
      gridRef.current.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div className="ot-rt-aralik">
      <div className="ot-rt-aralik-nav">
        <button
          type="button"
          className="ot-rt-nav-tus"
          aria-label="Önceki ay"
          onClick={() =>
            setGorunen((o) => {
              const d = new Date(o.yil, o.ay - 1, 1);
              return { yil: d.getFullYear(), ay: d.getMonth() };
            })
          }
        >
          ‹
        </button>
        <span className="ot-rt-aralik-baslik">
          {AYLAR[gorunen.ay]} {gorunen.yil}
        </span>
        <button
          type="button"
          className="ot-rt-nav-tus"
          aria-label="Sonraki ay"
          onClick={() =>
            setGorunen((o) => {
              const d = new Date(o.yil, o.ay + 1, 1);
              return { yil: d.getFullYear(), ay: d.getMonth() };
            })
          }
        >
          ›
        </button>
      </div>

      <div
        ref={gridRef}
        className="ot-rt-aralik-grid"
        role="grid"
        aria-label="Tarih aralığı seçici"
        onPointerMove={pointerHareket}
        onPointerUp={pointerBitir}
        onPointerCancel={pointerBitir}
      >
        {GUNLER.map((g) => (
          <div key={g} className="ot-rt-aralik-gun-baslik">
            {g}
          </div>
        ))}
        {hucreler.map((h) => {
          const secili = araliktaMi(h.tarih);
          const bas = basMi(h.tarih);
          const bit = bitMi(h.tarih);
          const tek = bas && (!bitSirali || basSirali === bitSirali);
          return (
            <div
              key={h.tarih}
              role="gridcell"
              data-ot-tarih={h.tarih}
              className={[
                'ot-rt-aralik-hucre',
                h.ayOffset !== 0 ? 'ot-rt-aralik-hucre--dis' : '',
                secili ? 'ot-rt-aralik-hucre--secili' : '',
                bas ? 'ot-rt-aralik-hucre--bas' : '',
                bit ? 'ot-rt-aralik-hucre--bit' : '',
                tek ? 'ot-rt-aralik-hucre--tek' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerDown={(e) => pointerBasla(h.tarih, e)}
            >
              {h.gun}
            </div>
          );
        })}
      </div>

      <p className="ot-rt-aralik-ozet" aria-live="polite">
        {aralikMetni(basSirali, bitSirali || basSirali)}
      </p>
    </div>
  );
}
