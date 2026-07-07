import { TANIMLAR_URUN_KATALOGU } from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';
import { urunTanimlariOku } from '@/admin/baslat-menusu/urunler-tanimlari/yardimci';

export interface FiyatListesiSatiri {
  id: string;
  kod: string;
  ad: string;
  grup: string;
  fiyat: number;
}

export function fiyatListesiVerisi(): FiyatListesiSatiri[] {
  const harita = new Map<string, FiyatListesiSatiri>();

  for (const u of urunTanimlariOku().urunler) {
    if (!u.ad.trim()) continue;
    harita.set(u.id, {
      id: u.id,
      kod: u.stokKodu || '—',
      ad: u.ad,
      grup: u.urunGrubu || 'Diğer',
      fiyat: u.kdvDahilFiyat,
    });
  }

  for (const u of TANIMLAR_URUN_KATALOGU) {
    if (!harita.has(u.id)) {
      harita.set(u.id, {
        id: u.id,
        kod: '—',
        ad: u.ad,
        grup: u.grup,
        fiyat: 0,
      });
    }
  }

  return [...harita.values()].sort((a, b) => {
    const g = a.grup.localeCompare(b.grup, 'tr');
    if (g !== 0) return g;
    return a.ad.localeCompare(b.ad, 'tr');
  });
}

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deger);
}

export function FiyatListesiOnizleme() {
  const satirlar = fiyatListesiVerisi();

  return (
    <div className="ap-master-excel-wrap ap-rapor-onizleme-tablo">
      <table className="ap-master-excel-tablo">
        <thead>
          <tr>
            <th>Kod</th>
            <th>Ürün</th>
            <th>Grup</th>
            <th className="ap-rapor-th-sayi">Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => (
            <tr key={s.id}>
              <td className="ap-master-excel-hucre ap-muted">{s.kod}</td>
              <td className="ap-master-excel-hucre">{s.ad}</td>
              <td className="ap-master-excel-hucre">{s.grup}</td>
              <td className="ap-master-excel-hucre ap-master-excel-hucre-sayi">{para(s.fiyat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
