export interface AcikHesapSatiri {
  id: string;
  cariAd: string;
  telefon: string;
  sonIslem: string;
  borc: number;
  alacak: number;
  bakiye: number;
}

export const ORNEK_ACIK_HESAPLAR: AcikHesapSatiri[] = [
  {
    id: 'ah-1',
    cariAd: 'ABC Catering Ltd.',
    telefon: '0532 111 22 33',
    sonIslem: '2026-03-20T14:30:00',
    borc: 4850,
    alacak: 2000,
    bakiye: 2850,
  },
  {
    id: 'ah-2',
    cariAd: 'Mehmet Yılmaz',
    telefon: '0544 555 66 77',
    sonIslem: '2026-03-21T19:15:00',
    borc: 620,
    alacak: 0,
    bakiye: 620,
  },
  {
    id: 'ah-3',
    cariAd: 'Trendyol Kurumsal',
    telefon: '—',
    sonIslem: '2026-03-19T11:00:00',
    borc: 12400,
    alacak: 8000,
    bakiye: 4400,
  },
  {
    id: 'ah-4',
    cariAd: 'Okul Kantini — Atatürk İO',
    telefon: '0212 444 55 66',
    sonIslem: '2026-03-18T09:45:00',
    borc: 2100,
    alacak: 2100,
    bakiye: 0,
  },
  {
    id: 'ah-5',
    cariAd: 'Ayşe Demir',
    telefon: '0505 987 65 43',
    sonIslem: '2026-03-22T12:20:00',
    borc: 340,
    alacak: 0,
    bakiye: 340,
  },
];

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deger);
}

function tarih(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function AcikHesapOnizleme() {
  const satirlar = ORNEK_ACIK_HESAPLAR.filter((s) => s.bakiye > 0);
  const toplam = satirlar.reduce((t, s) => t + s.bakiye, 0);

  return (
    <div className="ap-master-excel-wrap ap-rapor-onizleme-tablo">
      <table className="ap-master-excel-tablo">
        <thead>
          <tr>
            <th>Cari</th>
            <th>Telefon</th>
            <th>Son İşlem</th>
            <th className="ap-rapor-th-sayi">Borç</th>
            <th className="ap-rapor-th-sayi">Alacak</th>
            <th className="ap-rapor-th-sayi">Bakiye</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => (
            <tr key={s.id}>
              <td className="ap-master-excel-hucre">{s.cariAd}</td>
              <td className="ap-master-excel-hucre ap-muted">{s.telefon}</td>
              <td className="ap-master-excel-hucre ap-rapor-tarih">{tarih(s.sonIslem)}</td>
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.borc)}</td>
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.alacak)}</td>
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-rapor-vurgu">{para(s.bakiye)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="ap-rapor-toplam-satir">
            <td colSpan={5} className="ap-master-excel-hucre">
              <strong>Toplam açık bakiye</strong>
            </td>
            <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
              <strong>{para(toplam)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
