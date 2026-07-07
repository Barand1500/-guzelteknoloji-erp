import type { SatisRaporSatiri } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

function tarihGoster(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function saatGoster(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

interface SatisDetayTablosuProps {
  satirlar: SatisRaporSatiri[];
}

export function SatisDetayTablosu({ satirlar }: SatisDetayTablosuProps) {
  return (
    <div className="ap-master-excel-wrap ap-satis-rapor-tablo ap-satis-rapor-yazdir-alan">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Masa</th>
              <th>Personel</th>
              <th>Ürün</th>
              <th className="ap-satis-rapor-th-sayi">Miktar</th>
              <th className="ap-satis-rapor-th-sayi">Fiyat</th>
              <th className="ap-satis-rapor-th-sayi">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.length === 0 ? (
              <tr>
                <td colSpan={8} className="ap-master-excel-hucre ap-satis-rapor-bos">
                  Seçilen kriterlere uygun satış bulunamadı.
                </td>
              </tr>
            ) : (
              satirlar.map((s) => (
                <tr key={s.id}>
                  <td className="ap-master-excel-hucre ap-satis-rapor-tarih">
                    {tarihGoster(s.tarihSaat)}
                  </td>
                  <td className="ap-master-excel-hucre ap-satis-rapor-saat">{saatGoster(s.tarihSaat)}</td>
                  <td className="ap-master-excel-hucre ap-satis-rapor-masa">{s.masa}</td>
                  <td className="ap-master-excel-hucre">{s.personel}</td>
                  <td className="ap-master-excel-hucre">{s.urun}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{s.miktar}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.fiyat)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-satis-rapor-tutar">
                    {para(s.tutar)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
