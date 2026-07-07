import type { KolaySaatSecimi, KolayTarihSecimi, RaporKayit } from '@/admin/baslat-menusu/raporlar/tipler';
import { varsayilanRaporKayit } from '@/admin/baslat-menusu/raporlar/varsayilanVeri';

function depolamaAnahtari(modulId: string) {
  return `restorant-rapor-${modulId}`;
}

function isoTarih(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function tarihTrGoster(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, g] = iso.split('-');
  return `${g}.${m}.${y}`;
}

export function kolayTarihUygula(tip: KolayTarihSecimi): Pick<RaporKayit, 'baslangicTarih' | 'bitisTarih'> {
  const bugun = new Date();
  bugun.setHours(12, 0, 0, 0);

  switch (tip) {
    case 'bugun':
      return { baslangicTarih: isoTarih(bugun), bitisTarih: isoTarih(bugun) };
    case 'dun-bugun': {
      const dun = new Date(bugun);
      dun.setDate(dun.getDate() - 1);
      return { baslangicTarih: isoTarih(dun), bitisTarih: isoTarih(bugun) };
    }
    case 'buhafta': {
      const bas = new Date(bugun);
      const gun = bas.getDay();
      const fark = gun === 0 ? 6 : gun - 1;
      bas.setDate(bas.getDate() - fark);
      return { baslangicTarih: isoTarih(bas), bitisTarih: isoTarih(bugun) };
    }
    case 'buay': {
      const bas = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
      return { baslangicTarih: isoTarih(bas), bitisTarih: isoTarih(bugun) };
    }
  }
}

export function kolaySaatUygula(tip: KolaySaatSecimi): Pick<RaporKayit, 'baslangicSaat' | 'bitisSaat'> {
  switch (tip) {
    case 'mesai':
      return { baslangicSaat: '08:00', bitisSaat: '18:00' };
    case 'ogle':
      return { baslangicSaat: '11:00', bitisSaat: '15:00' };
    default:
      return { baslangicSaat: '00:00', bitisSaat: '23:59' };
  }
}

export function saatAraligiHesapla(kayit: Pick<RaporKayit, 'baslangicTarih' | 'bitisTarih' | 'baslangicSaat' | 'bitisSaat'>): number {
  const bas = new Date(`${kayit.baslangicTarih}T${kayit.baslangicSaat}:00`);
  const bit = new Date(`${kayit.bitisTarih}T${kayit.bitisSaat}:00`);
  if (Number.isNaN(bas.getTime()) || Number.isNaN(bit.getTime()) || bit <= bas) return 0;
  return (bit.getTime() - bas.getTime()) / (1000 * 60 * 60);
}

export function saatAraligiMetni(saat: number): string {
  const gosterim = saat.toFixed(2).replace('.', ',');
  return `${gosterim} saatlik bir aralık seçtiniz.`;
}

export function raporKaydiOku(modulId: string): RaporKayit {
  try {
    const ham = localStorage.getItem(depolamaAnahtari(modulId));
    if (!ham) return varsayilanRaporKayit();
    return { ...varsayilanRaporKayit(), ...(JSON.parse(ham) as Partial<RaporKayit>) };
  } catch {
    return varsayilanRaporKayit();
  }
}

export function raporKaydiKaydet(modulId: string, kayit: RaporKayit) {
  localStorage.setItem(depolamaAnahtari(modulId), JSON.stringify(kayit));
}

export function raporKayitEsit(a: RaporKayit, b: RaporKayit): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
