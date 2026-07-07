import type { TahsilatTaramaSatiri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';
import { tahsilatToplamlariHesapla } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(deger);
}

interface TahsilatTaramaTablosuProps {
  satirlar: TahsilatTaramaSatiri[];
}

export function TahsilatTaramaTablosu({ satirlar }: TahsilatTaramaTablosuProps) {
  const toplam = tahsilatToplamlariHesapla(satirlar);

  return (
    <div className="ap-master-excel-wrap ap-tahsilat-tarama-tablo ap-satis-rapor-yazdir-alan">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Personel</th>
              <th className="ap-satis-rapor-th-sayi">Toplam Teslim Edilen</th>
              <th className="ap-satis-rapor-th-sayi">Nakit Tahsilat</th>
              <th className="ap-satis-rapor-th-sayi">Kredi Tahsilat</th>
              <th className="ap-satis-rapor-th-sayi">Y.Çek Tahsilat</th>
              <th className="ap-satis-rapor-th-sayi">Toplam Tahsilat</th>
              <th className="ap-satis-rapor-th-sayi">Açık Hesap</th>
              <th className="ap-satis-rapor-th-sayi">Discount</th>
              <th className="ap-satis-rapor-th-sayi">Kalan</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.length === 0 ? (
              <tr>
                <td colSpan={9} className="ap-master-excel-hucre ap-satis-rapor-bos">
                  Seçilen dönem ve kriterlere uygun tahsilat kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              satirlar.map((s) => (
                <tr key={s.id}>
                  <td className="ap-master-excel-hucre ap-tahsilat-tarama-personel">{s.personel}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.toplamTeslimEdilen)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.nakitTahsilat)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.krediTahsilat)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.yCekTahsilat)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-satis-rapor-tutar">
                    {para(s.toplamTahsilat)}
                  </td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.acikHesap)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.discount)}</td>
                  <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.kalan)}</td>
                </tr>
              ))
            )}
          </tbody>
          {satirlar.length > 0 ? (
            <tfoot>
              <tr className="ap-tahsilat-tarama-toplam-satir">
                <td className="ap-master-excel-hucre ap-tahsilat-tarama-toplam-etiket">Toplam</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.toplamTeslimEdilen)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.nakitTahsilat)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.krediTahsilat)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.yCekTahsilat)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-satis-rapor-tutar">
                  {para(toplam.toplamTahsilat)}
                </td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.acikHesap)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.discount)}</td>
                <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(toplam.kalan)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
