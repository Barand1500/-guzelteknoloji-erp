import type { ResmiTatilGirdi } from './resmiTatiller';

const API_KOKU = 'https://date.nager.at/api/v4/Holidays';

interface NagerTatil {
  date: string;
  name: string;
  countryCode: string;
  nationalHoliday: boolean;
  holidayTypes: string[];
}

export interface ResmiTatilApiSonucu {
  tatiller: ResmiTatilGirdi[];
  basarisizYillar: number[];
}

function tatilBilgisi(apiAdi: string): { adi: string; grup: string; renk: string } {
  const ad = apiAdi.toLocaleLowerCase('en');

  if (ad.includes('eid al-fitr')) {
    return { adi: 'Ramazan Bayramı', grup: 'ramazan-bayrami', renk: '#16a34a' };
  }
  if (ad.includes('eid al-adha')) {
    return { adi: 'Kurban Bayramı', grup: 'kurban-bayrami', renk: '#0891b2' };
  }

  const bilinenler: Record<string, { adi: string; grup: string; renk: string }> = {
    "new year's day": { adi: 'Yılbaşı', grup: 'yilbasi', renk: '#e11d48' },
    "national independence & children's day": {
      adi: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
      grup: '23-nisan',
      renk: '#2563eb',
    },
    'labour day': {
      adi: 'Emek ve Dayanışma Günü',
      grup: '1-mayis',
      renk: '#ea580c',
    },
    'atatürk commemoration & youth day': {
      adi: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı",
      grup: '19-mayis',
      renk: '#16a34a',
    },
    'democracy and national unity day': {
      adi: '15 Temmuz Demokrasi ve Millî Birlik Günü',
      grup: '15-temmuz',
      renk: '#ca8a04',
    },
    'victory day': {
      adi: '30 Ağustos Zafer Bayramı',
      grup: '30-agustos',
      renk: '#7c3aed',
    },
    'republic day': {
      adi: '29 Ekim Cumhuriyet Bayramı',
      grup: '29-ekim',
      renk: '#e11d48',
    },
  };

  return (
    bilinenler[ad] ?? {
      adi: apiAdi,
      grup: apiAdi
        .toLocaleLowerCase('tr')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      renk: '#2563eb',
    }
  );
}

function ertesiGunMu(onceki: string, sonraki: string): boolean {
  const [y, m, d] = onceki.split('-').map(Number);
  const tarih = new Date(y!, m! - 1, d!);
  tarih.setDate(tarih.getDate() + 1);
  const yy = tarih.getFullYear();
  const mm = String(tarih.getMonth() + 1).padStart(2, '0');
  const gg = String(tarih.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${gg}` === sonraki;
}

function gunleriAraligaCevir(yil: number, gelenler: NagerTatil[]): ResmiTatilGirdi[] {
  const sirali = gelenler
    .filter((t) => t.countryCode === 'TR' && t.nationalHoliday && /^\d{4}-\d{2}-\d{2}$/.test(t.date))
    .map((t) => ({ ...t, bilgi: tatilBilgisi(t.name) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sonuc: ResmiTatilGirdi[] = [];
  for (const tatil of sirali) {
    const onceki = sonuc.at(-1);
    const ayniGrup =
      onceki?.id === `api-tr-${yil}-${tatil.bilgi.grup}` &&
      ertesiGunMu(onceki.bitis, tatil.date);

    if (ayniGrup && onceki) {
      onceki.bitis = tatil.date;
      continue;
    }

    sonuc.push({
      id: `api-tr-${yil}-${tatil.bilgi.grup}`,
      adi: tatil.bilgi.adi,
      baslangic: tatil.date,
      bitis: tatil.date,
      renk: tatil.bilgi.renk,
      aktif: true,
    });
  }
  return sonuc;
}

async function yilTatilleriniGetir(yil: number): Promise<ResmiTatilGirdi[]> {
  const yanit = await fetch(`${API_KOKU}/TR/${yil}`, {
    headers: { Accept: 'application/json' },
  });
  if (!yanit.ok) throw new Error(`${yil} yılı alınamadı (${yanit.status})`);

  const veri = (await yanit.json()) as unknown;
  if (!Array.isArray(veri)) throw new Error(`${yil} yılı için geçersiz API yanıtı`);
  return gunleriAraligaCevir(yil, veri as NagerTatil[]);
}

export async function turkiyeResmiTatilleriniGetir(
  baslangicYili: number,
  bitisYili: number
): Promise<ResmiTatilApiSonucu> {
  const bas = Math.min(baslangicYili, bitisYili);
  const bit = Math.max(baslangicYili, bitisYili);
  if (bas < 2026 || bit > 2029) {
    throw new Error('Yıl aralığı 2026 – 2029 arasında olmalıdır.');
  }

  const yillar = Array.from({ length: bit - bas + 1 }, (_, i) => bas + i);
  const yanitlar = await Promise.allSettled(yillar.map((yil) => yilTatilleriniGetir(yil)));
  const tatiller: ResmiTatilGirdi[] = [];
  const basarisizYillar: number[] = [];

  yanitlar.forEach((yanit, i) => {
    if (yanit.status === 'fulfilled') tatiller.push(...yanit.value);
    else basarisizYillar.push(yillar[i]!);
  });

  return { tatiller, basarisizYillar };
}
