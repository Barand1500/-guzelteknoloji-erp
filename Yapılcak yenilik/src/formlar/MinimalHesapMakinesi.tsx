import { useCallback, useEffect, useState } from 'react';

type Islem = '+' | '-' | '*' | '/' | null;

function sayiyaCevir(metin: string): number {
  const n = Number(metin.replace(',', '.').replace(/[^\d.+-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function gosterimdenSayi(metin: string): string {
  const temiz = metin.trim().replace(',', '.');
  if (!temiz || temiz === '-' || temiz === '.') return '';
  const n = Number(temiz);
  if (!Number.isFinite(n)) return metin;
  return String(n).replace('.', ',');
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

interface MinimalHesapMakinesiProps {
  baslangicDeger: string;
  onUygula: (deger: string) => void;
}

export function MinimalHesapMakinesi({ baslangicDeger, onUygula }: MinimalHesapMakinesiProps) {
  const [ekran, setEkran] = useState(baslangicDeger || '0');
  const [onceki, setOnceki] = useState<number | null>(null);
  const [islem, setIslem] = useState<Islem>(null);
  const [yeniGiris, setYeniGiris] = useState(true);
  const [bellek, setBellek] = useState(0);

  useEffect(() => {
    setEkran(baslangicDeger || '0');
    setOnceki(null);
    setIslem(null);
    setYeniGiris(true);
  }, [baslangicDeger]);

  const rakamEkle = useCallback(
    (rakam: string) => {
      setEkran((m) => {
        if (yeniGiris || m === '0') {
          setYeniGiris(false);
          return rakam;
        }
        return m + rakam;
      });
    },
    [yeniGiris]
  );

  const virgulEkle = useCallback(() => {
    setEkran((m) => {
      if (yeniGiris) {
        setYeniGiris(false);
        return '0,';
      }
      if (m.includes(',')) return m;
      return `${m},`;
    });
  }, [yeniGiris]);

  const islemSec = useCallback(
    (op: Islem) => {
      const mevcut = sayiyaCevir(ekran);
      if (onceki != null && islem && !yeniGiris) {
        const sonuc = islemUygula(onceki, mevcut, islem);
        setEkran(gosterimdenSayi(String(sonuc)) || '0');
        setOnceki(sonuc);
      } else {
        setOnceki(mevcut);
      }
      setIslem(op);
      setYeniGiris(true);
    },
    [ekran, onceki, islem, yeniGiris]
  );

  const esittir = useCallback(() => {
    if (onceki == null || !islem) return;
    const sonuc = islemUygula(onceki, sayiyaCevir(ekran), islem);
    setEkran(gosterimdenSayi(String(sonuc)) || '0');
    setOnceki(null);
    setIslem(null);
    setYeniGiris(true);
  }, [ekran, onceki, islem]);

  const temizle = () => {
    setEkran('0');
    setOnceki(null);
    setIslem(null);
    setYeniGiris(true);
  };

  const girisTemizle = () => {
    setEkran('0');
    setYeniGiris(true);
  };

  const geriAl = () => {
    setEkran((m) => (m.length <= 1 ? '0' : m.slice(0, -1)));
    setYeniGiris(false);
  };

  const isaretDegistir = () => {
    setEkran((m) => {
      if (m.startsWith('-')) return m.slice(1) || '0';
      return m === '0' ? m : `-${m}`;
    });
    setYeniGiris(false);
  };

  const yuzde = () => {
    const n = sayiyaCevir(ekran) / 100;
    setEkran(gosterimdenSayi(String(n)) || '0');
    setYeniGiris(true);
  };

  const ters = () => {
    const n = sayiyaCevir(ekran);
    if (n === 0) return;
    setEkran(gosterimdenSayi(String(1 / n)) || '0');
    setYeniGiris(true);
  };

  const kok = () => {
    const n = sayiyaCevir(ekran);
    if (n < 0) return;
    setEkran(gosterimdenSayi(String(Math.sqrt(n))) || '0');
    setYeniGiris(true);
  };

  const uygula = () => onUygula(gosterimdenSayi(ekran) || ekran);

  const tus = (etiket: string, onClick: () => void, sinif = '', span = 1) => (
    <button
      key={etiket}
      type="button"
      className={`ap-mini-hesap-tus ${sinif}`.trim()}
      style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
      onClick={onClick}
    >
      {etiket}
    </button>
  );

  return (
    <div className="ap-mini-hesap-icerik">
      <div className="ap-mini-hesap-ekran">{ekran}</div>
      <div className="ap-mini-hesap-tuslar">
        {tus('OK', uygula, 'ap-mini-hesap-tus-tamam')}
        {tus('Back', geriAl, 'ap-mini-hesap-tus-fn', 2)}
        {tus('CE', girisTemizle, 'ap-mini-hesap-tus-fn', 2)}
        {tus('C', temizle, 'ap-mini-hesap-tus-fn')}

        {tus('MC', () => setBellek(0), 'ap-mini-hesap-tus-bellek')}
        {tus('7', () => rakamEkle('7'), 'ap-mini-hesap-tus-rakam')}
        {tus('8', () => rakamEkle('8'), 'ap-mini-hesap-tus-rakam')}
        {tus('9', () => rakamEkle('9'), 'ap-mini-hesap-tus-rakam')}
        {tus('/', () => islemSec('/'), 'ap-mini-hesap-tus-op')}
        {tus('sqrt', kok, 'ap-mini-hesap-tus-op ap-mini-hesap-tus-kucuk')}

        {tus('MR', () => setEkran(gosterimdenSayi(String(bellek)) || '0'), 'ap-mini-hesap-tus-bellek')}
        {tus('4', () => rakamEkle('4'), 'ap-mini-hesap-tus-rakam')}
        {tus('5', () => rakamEkle('5'), 'ap-mini-hesap-tus-rakam')}
        {tus('6', () => rakamEkle('6'), 'ap-mini-hesap-tus-rakam')}
        {tus('*', () => islemSec('*'), 'ap-mini-hesap-tus-op')}
        {tus('%', yuzde, 'ap-mini-hesap-tus-op')}

        {tus('MS', () => setBellek(sayiyaCevir(ekran)), 'ap-mini-hesap-tus-bellek')}
        {tus('1', () => rakamEkle('1'), 'ap-mini-hesap-tus-rakam')}
        {tus('2', () => rakamEkle('2'), 'ap-mini-hesap-tus-rakam')}
        {tus('3', () => rakamEkle('3'), 'ap-mini-hesap-tus-rakam')}
        {tus('-', () => islemSec('-'), 'ap-mini-hesap-tus-op')}
        {tus('1/x', ters, 'ap-mini-hesap-tus-op ap-mini-hesap-tus-kucuk')}

        {tus('M+', () => setBellek((b) => b + sayiyaCevir(ekran)), 'ap-mini-hesap-tus-bellek')}
        {tus('0', () => rakamEkle('0'), 'ap-mini-hesap-tus-rakam')}
        {tus('+/-', isaretDegistir, 'ap-mini-hesap-tus-rakam ap-mini-hesap-tus-kucuk')}
        {tus(',', virgulEkle, 'ap-mini-hesap-tus-rakam')}
        {tus('+', () => islemSec('+'), 'ap-mini-hesap-tus-op')}
        {tus('=', esittir, 'ap-mini-hesap-tus-op ap-mini-hesap-tus-esit')}
      </div>
    </div>
  );
}
