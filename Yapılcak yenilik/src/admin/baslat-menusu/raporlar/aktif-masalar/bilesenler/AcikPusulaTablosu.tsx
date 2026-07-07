import { useMemo } from 'react';
import type { AcikPusulaSatiri, AktifMasalarGruplama } from '@/admin/baslat-menusu/raporlar/aktif-masalar/tipler';
import { acikPusulaToplamlar } from '@/admin/baslat-menusu/raporlar/aktif-masalar/tipler';

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

function zamanGoster(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function grupAnahtari(s: AcikPusulaSatiri, gruplama: AktifMasalarGruplama) {
  if (gruplama === 'masa') return s.masaNo;
  if (gruplama === 'garson') return s.siparisAlan;
  if (gruplama === 'urun') return s.urun;
  return '';
}

function grupBaslik(gruplama: AktifMasalarGruplama, anahtar: string) {
  if (gruplama === 'masa') return `Masa ${anahtar}`;
  if (gruplama === 'garson') return anahtar;
  if (gruplama === 'urun') return anahtar;
  return anahtar;
}

interface AcikPusulaTablosuProps {
  satirlar: AcikPusulaSatiri[];
  gruplama: AktifMasalarGruplama;
}

export function AcikPusulaTablosu({ satirlar, gruplama }: AcikPusulaTablosuProps) {
  const gruplu = useMemo(() => {
    if (gruplama === 'yok') return null;
    const harita = new Map<string, AcikPusulaSatiri[]>();
    for (const s of satirlar) {
      const k = grupAnahtari(s, gruplama);
      const liste = harita.get(k) ?? [];
      liste.push(s);
      harita.set(k, liste);
    }
    return [...harita.entries()].sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [satirlar, gruplama]);

  const toplamlar = useMemo(() => acikPusulaToplamlar(satirlar), [satirlar]);

  const satirRender = (s: AcikPusulaSatiri) => (
    <tr key={s.id}>
      <td className="ap-master-excel-hucre ap-aktif-masalar-zaman">{zamanGoster(s.alinmaZamani)}</td>
      <td className="ap-master-excel-hucre">{s.siparisAlan}</td>
      <td className="ap-master-excel-hucre ap-aktif-masalar-masa">{s.masaNo}</td>
      <td className="ap-master-excel-hucre">{s.urun}</td>
      <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{s.miktar}</td>
      <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.fiyat)}</td>
      <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-aktif-masalar-tutar">{para(s.tutar)}</td>
    </tr>
  );

  return (
    <div className="ap-master-excel-wrap ap-aktif-masalar-tablo ap-aktif-masalar-yazdir-alan">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Siparişin Alınma Zamanı</th>
              <th>Siparişi Alan</th>
              <th>Masa No</th>
              <th>Ürün</th>
              <th className="ap-aktif-masalar-th-sayi">Miktar</th>
              <th className="ap-aktif-masalar-th-sayi">Fiyat</th>
              <th className="ap-aktif-masalar-th-sayi">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {gruplama === 'yok' || !gruplu
              ? satirlar.map(satirRender)
              : gruplu.flatMap(([anahtar, liste]) => {
                  const altToplam = acikPusulaToplamlar(liste);
                  return [
                    <tr key={`g-${anahtar}`} className="ap-aktif-masalar-grup-baslik">
                      <td colSpan={4} className="ap-master-excel-hucre">
                        <strong>{grupBaslik(gruplama, anahtar)}</strong>
                        <span className="ap-muted text-xs"> · {liste.length} kalem</span>
                      </td>
                      <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{altToplam.miktar}</td>
                      <td className="ap-master-excel-hucre" />
                      <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
                        {para(altToplam.tutar)}
                      </td>
                    </tr>,
                    ...liste.map(satirRender),
                  ];
                })}
          </tbody>
          <tfoot>
            <tr className="ap-aktif-masalar-toplam-satir">
              <td colSpan={4} className="ap-master-excel-hucre">
                <strong>Genel Toplam</strong>
                <span className="ap-muted text-xs"> · {satirlar.length} açık kalem</span>
              </td>
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
                <strong>{toplamlar.miktar}</strong>
              </td>
              <td className="ap-master-excel-hucre" />
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">
                <strong>{para(toplamlar.tutar)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {satirlar.length === 0 && (
        <p className="ap-muted py-10 text-center text-sm">Şu anda açık pusula bulunmuyor.</p>
      )}
    </div>
  );
}
