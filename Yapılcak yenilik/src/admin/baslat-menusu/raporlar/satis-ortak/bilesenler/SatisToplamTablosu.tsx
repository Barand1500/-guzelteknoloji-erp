import type { SatisToplamSatiri } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

interface SatisToplamTablosuProps {
  satirlar: SatisToplamSatiri[];
}

export function SatisToplamTablosu({ satirlar }: SatisToplamTablosuProps) {
  return (
    <div className="ap-master-excel-wrap ap-satis-rapor-tablo ap-satis-rapor-yazdir-alan">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Ürün Grubu</th>
              <th>Ürün</th>
              <th className="ap-satis-rapor-th-sayi">Miktar</th>
              <th className="ap-satis-rapor-th-sayi">Ort. Fiyat</th>
              <th className="ap-satis-rapor-th-sayi">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.length === 0 ? (
              <tr>
                <td colSpan={5} className="ap-master-excel-hucre ap-satis-rapor-bos">
                  Seçilen kriterlere uygun toplam bulunamadı.
                </td>
              </tr>
            ) : (
              satirlar.map((s) => (
                <tr key={s.id}>
                  <td className="ap-master-excel-hucre">{s.urunGrubu}</td>
                  <td className="ap-master-excel-hucre">{s.urun}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{s.miktar}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
                    {para(s.ortalamaFiyat)}
                  </td>
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
