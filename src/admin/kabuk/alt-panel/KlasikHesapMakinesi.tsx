import { useCallback, useEffect, useRef, useState } from 'react';
import { sayiGoster } from './hesapMakinesiYardimci';

type Islem = '+' | '-' | '*' | '/';

function opSembol(op: Islem): string {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op];
}

function metindenSayi(metin: string): number {
  const temiz = metin.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (!temiz || temiz === '-' || temiz === '.') return 0;
  const n = Number(temiz);
  return Number.isFinite(n) ? n : 0;
}

function sayiyiGirdiye(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const [tam, ond = ''] = String(n).split('.');
  const formatliTam = Number(tam).toLocaleString('tr-TR');
  return ond ? `${formatliTam},${ond.padEnd(2, '0').replace(/0+$/, '') || '0'}` : formatliTam;
}

function islemUygula(a: number, b: number, op: Islem): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? 0 : a / b;
    default:
      return b;
  }
}

function KopyalaBtn({ deger, etiket }: { deger: string; etiket: string }) {
  const [basarili, setBasarili] = useState(false);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(deger);
      setBasarili(true);
      setTimeout(() => setBasarili(false), 1400);
    } catch {
      /* pano reddedildi */
    }
  };

  return (
    <button
      type="button"
      className={`ap-hesap-kopyala${basarili ? ' ap-hesap-kopyala--ok' : ''}`}
      onClick={() => void kopyala()}
      title={`${etiket} kopyala`}
      aria-label={`${etiket} kopyala`}
    >
      {basarili ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="1.5" />
          <path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

interface KlasikHesapMakinesiProps {
  aktif: boolean;
}

export function KlasikHesapMakinesi({ aktif }: KlasikHesapMakinesiProps) {
  const girdiRef = useRef<HTMLInputElement>(null);
  const [girdi, setGirdi] = useState('0');
  const [ustCizgi, setUstCizgi] = useState('');
  const [biriktirici, setBiriktirici] = useState<number | null>(null);
  const [bekleyenOp, setBekleyenOp] = useState<Islem | null>(null);
  const [yeniGiris, setYeniGiris] = useState(true);
  const [sonuc, setSonuc] = useState<number | null>(null);

  useEffect(() => {
    if (aktif) girdiRef.current?.focus();
  }, [aktif]);

  const girdiGuncelle = useCallback((yeni: string) => {
    setGirdi(yeni);
    setYeniGiris(false);
    setSonuc(null);
  }, []);

  const rakamEkle = useCallback(
    (rakam: string) => {
      setGirdi((onceki) => {
        const yeni = yeniGiris || onceki === '0' ? rakam : onceki + rakam;
        setYeniGiris(false);
        setSonuc(null);
        return yeni;
      });
    },
    [yeniGiris]
  );

  const virgulEkle = useCallback(() => {
    setGirdi((onceki) => {
      if (yeniGiris) {
        setYeniGiris(false);
        setSonuc(null);
        return '0,';
      }
      if (onceki.includes(',')) return onceki;
      setSonuc(null);
      return `${onceki},`;
    });
  }, [yeniGiris]);

  const islemSec = useCallback(
    (op: Islem) => {
      const mevcut = metindenSayi(girdi);
      let yeniBiriktirici = biriktirici;

      if (biriktirici !== null && bekleyenOp && !yeniGiris) {
        const ara = islemUygula(biriktirici, mevcut, bekleyenOp);
        yeniBiriktirici = ara;
        setGirdi(sayiyiGirdiye(ara));
      } else if (biriktirici === null) {
        yeniBiriktirici = mevcut;
      }

      setBiriktirici(yeniBiriktirici);
      setBekleyenOp(op);
      setUstCizgi(`${sayiGoster(yeniBiriktirici ?? mevcut)} ${opSembol(op)}`);
      setYeniGiris(true);
      setSonuc(null);
    },
    [girdi, biriktirici, bekleyenOp, yeniGiris]
  );

  const esittir = useCallback(() => {
    if (biriktirici === null || !bekleyenOp) {
      const tek = metindenSayi(girdi);
      setSonuc(tek);
      setGirdi(sayiyiGirdiye(tek));
      return;
    }
    const hesap = islemUygula(biriktirici, metindenSayi(girdi), bekleyenOp);
    setSonuc(hesap);
    setGirdi(sayiyiGirdiye(hesap));
    setUstCizgi(`${sayiGoster(biriktirici)} ${opSembol(bekleyenOp)} ${girdi} =`);
    setBiriktirici(null);
    setBekleyenOp(null);
    setYeniGiris(true);
  }, [biriktirici, bekleyenOp, girdi]);

  const temizle = () => {
    setGirdi('0');
    setUstCizgi('');
    setBiriktirici(null);
    setBekleyenOp(null);
    setYeniGiris(true);
    setSonuc(null);
  };

  const girisTemizle = () => {
    setGirdi('0');
    setYeniGiris(true);
    setSonuc(null);
  };

  const geriAl = () => {
    setGirdi((onceki) => {
      const yeni = onceki.length <= 1 ? '0' : onceki.slice(0, -1);
      setYeniGiris(false);
      setSonuc(null);
      return yeni;
    });
  };

  const isaretDegistir = () => {
    setGirdi((onceki) => {
      if (onceki.startsWith('-')) return onceki.slice(1) || '0';
      if (onceki === '0') return onceki;
      setYeniGiris(false);
      setSonuc(null);
      return `-${onceki}`;
    });
  };

  const yuzde = () => {
    const n = metindenSayi(girdi) / 100;
    setGirdi(sayiyiGirdiye(n));
    setYeniGiris(true);
    setSonuc(n);
  };

  const tusBas = (etiket: string, onClick: () => void, sinif = '', span = 1) => (
    <button
      key={etiket}
      type="button"
      className={`ap-klasik-hesap-tus ${sinif}`.trim()}
      style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
      onClick={onClick}
    >
      {etiket}
    </button>
  );

  const klavyeIsle = useCallback(
    (e: React.KeyboardEvent) => {
      const hedef = e.target as HTMLElement;
      if (hedef.tagName === 'INPUT' && hedef !== girdiRef.current) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        rakamEkle(e.key);
        return;
      }
      if (e.key === ',' || e.key === '.') {
        e.preventDefault();
        virgulEkle();
        return;
      }
      if (e.key === '+') {
        e.preventDefault();
        islemSec('+');
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        islemSec('-');
        return;
      }
      if (e.key === '*') {
        e.preventDefault();
        islemSec('*');
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        islemSec('/');
        return;
      }
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        esittir();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        geriAl();
        return;
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        girisTemizle();
      }
    },
    [rakamEkle, virgulEkle, islemSec, esittir, geriAl, girisTemizle]
  );

  const gosterilenSonuc = sonuc;
  const kopyaDeger =
    gosterilenSonuc !== null
      ? String(gosterilenSonuc).replace('.', ',')
      : '';

  return (
    <div className="ap-klasik-hesap" onKeyDown={klavyeIsle}>
      <div className="ap-klasik-hesap-ekran">
        {ustCizgi && <div className="ap-klasik-hesap-ust">{ustCizgi}</div>}
        <input
          ref={girdiRef}
          type="text"
          inputMode="decimal"
          className="ap-klasik-hesap-girdi"
          value={girdi}
          onChange={(e) => girdiGuncelle(e.target.value)}
          onKeyDown={klavyeIsle}
          aria-label="Hesap Makinesi Girişi"
        />
      </div>

      {gosterilenSonuc !== null && (
        <div className="ap-klasik-hesap-sonuc">
          <div className="ap-klasik-hesap-sonuc-metin">
            <span className="ap-klasik-hesap-sonuc-etiket">Sonuç</span>
            <span className="ap-klasik-hesap-sonuc-deger">{sayiGoster(gosterilenSonuc)}</span>
          </div>
          <KopyalaBtn deger={kopyaDeger} etiket="Sonuç" />
        </div>
      )}

      <div className="ap-klasik-hesap-tuslar">
        {tusBas('C', temizle, 'ap-klasik-hesap-tus-fn')}
        {tusBas('CE', girisTemizle, 'ap-klasik-hesap-tus-fn')}
        {tusBas('⌫', geriAl, 'ap-klasik-hesap-tus-fn')}
        {tusBas('%', yuzde, 'ap-klasik-hesap-tus-fn')}

        {tusBas('7', () => rakamEkle('7'))}
        {tusBas('8', () => rakamEkle('8'))}
        {tusBas('9', () => rakamEkle('9'))}
        {tusBas('÷', () => islemSec('/'), 'ap-klasik-hesap-tus-op')}

        {tusBas('4', () => rakamEkle('4'))}
        {tusBas('5', () => rakamEkle('5'))}
        {tusBas('6', () => rakamEkle('6'))}
        {tusBas('×', () => islemSec('*'), 'ap-klasik-hesap-tus-op')}

        {tusBas('1', () => rakamEkle('1'))}
        {tusBas('2', () => rakamEkle('2'))}
        {tusBas('3', () => rakamEkle('3'))}
        {tusBas('−', () => islemSec('-'), 'ap-klasik-hesap-tus-op')}

        {tusBas('±', isaretDegistir, 'ap-klasik-hesap-tus-fn')}
        {tusBas('0', () => rakamEkle('0'))}
        {tusBas(',', virgulEkle)}
        {tusBas('+', () => islemSec('+'), 'ap-klasik-hesap-tus-op')}

        {tusBas('=', esittir, 'ap-klasik-hesap-tus-esit', 4)}
      </div>

      <p className="ap-klasik-hesap-ipucu">Klavye İle Yazın veya Tuşlara Tıklayın · Enter = · ESC Kapatır</p>
    </div>
  );
}
