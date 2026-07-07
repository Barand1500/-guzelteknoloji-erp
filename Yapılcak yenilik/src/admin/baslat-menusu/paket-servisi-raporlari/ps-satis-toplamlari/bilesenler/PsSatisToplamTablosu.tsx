import type { PsSatisToplamSatiri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/tipler';

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

interface PsSatisToplamTablosuProps {
  satirlar: PsSatisToplamSatiri[];
  tutarToplam: number;
  toplamSatis: number;
}

export function PsSatisToplamTablosu({ satirlar, tutarToplam, toplamSatis }: PsSatisToplamTablosuProps) {
  return (
    <div className="ap-master-excel-wrap ap-satis-rapor-tablo ap-ps-satis-toplam-tablo ap-satis-rapor-yazdir-alan">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Ürün</th>
              <th className="ap-satis-rapor-th-sayi">Tutar</th>
              <th className="ap-satis-rapor-th-sayi">Toplam Satış</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.length === 0 ? (
              <tr>
                <td colSpan={3} className="ap-master-excel-hucre ap-satis-rapor-bos">
                  Seçilen kriterlere uygun toplam bulunamadı.
                </td>
              </tr>
            ) : (
              satirlar.map((s) => (
                <tr key={s.id}>
                  <td className="ap-master-excel-hucre">{s.urun}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-satis-rapor-tutar">
                    {para(s.tutar)}
                  </td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{s.miktar}</td>
                </tr>
              ))
            )}
          </tbody>
          {satirlar.length > 0 ? (
            <tfoot>
              <tr className="ap-ps-satis-toplam-ozet-satir">
                <td className="ap-master-excel-hucre" />
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-satis-rapor-tutar">
                  <span className="ap-ps-satis-toplam-ozet-kutu">{para(tutarToplam)}</span>
                </td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
                  <span className="ap-ps-satis-toplam-ozet-kutu">{toplamSatis}</span>
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
