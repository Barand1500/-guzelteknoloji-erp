import { raporSablonlari } from '@/admin/baslat-menusu/raporlar/ortak/tipler';
import { ozelSablonlarOku } from '@/admin/baslat-menusu/raporlar/ortak/yardimci';

export interface OzelRaporSatiri {
  id: string;
  ad: string;
  dosya: string;
  kategori: string;
  aciklama: string;
  sonGuncelleme: string;
  ozel: boolean;
}

const SABLON_META: Record<string, { kategori: string; aciklama: string }> = {
  'Default.frx': {
    kategori: 'Genel',
    aciklama: 'Standart özel rapor şablonu',
  },
  'GunSonuOzel.frx': {
    kategori: 'Gün Sonu',
    aciklama: 'Kasa kapanışı ve günlük ciro özeti',
  },
  'PersonelSatis.frx': {
    kategori: 'Personel',
    aciklama: 'Garson bazında satış ve tahsilat',
  },
  'UrunGrupAnaliz.frx': {
    kategori: 'Ürün',
    aciklama: 'Ürün grubu satış dağılımı ve karşılaştırma',
  },
  'MasaPerformans.frx': {
    kategori: 'Masa',
    aciklama: 'Masa dönüş hızı ve ortalama hesap tutarı',
  },
};

function meta(dosya: string) {
  return (
    SABLON_META[dosya] ?? {
      kategori: 'Özel',
      aciklama: 'Kullanıcı tanımlı rapor şablonu',
    }
  );
}

export function ozelRaporListesi(): OzelRaporSatiri[] {
  const varsayilan = raporSablonlari('ozel-raporlar');
  const eklenen = ozelSablonlarOku('ozel-raporlar');
  const tumDosyalar = [...varsayilan.map((s) => s.dosya), ...eklenen.filter((d) => !varsayilan.some((v) => v.dosya === d))];

  return tumDosyalar.map((dosya, i) => {
    const sablon = varsayilan.find((s) => s.dosya === dosya);
    const { kategori, aciklama } = meta(dosya);
    const ozel = !sablon;
    return {
      id: `or-${i}`,
      ad: sablon?.ad ?? dosya.replace(/\.frx$/i, ''),
      dosya,
      kategori,
      aciklama,
      sonGuncelleme: ozel ? 'Az önce eklendi' : '15.06.2026',
      ozel,
    };
  });
}

export function OzelRaporOnizleme() {
  const satirlar = ozelRaporListesi();

  return (
    <div className="ap-master-excel-wrap ap-rapor-onizleme-tablo">
      <table className="ap-master-excel-tablo">
        <thead>
          <tr>
            <th>Rapor</th>
            <th>Şablon</th>
            <th>Kategori</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => (
            <tr key={s.id}>
              <td className="ap-master-excel-hucre ap-ozel-rapor-ad">
                {s.ad}
                {s.ozel && <span className="ap-ozel-rapor-etiket">Yeni</span>}
              </td>
              <td className="ap-master-excel-hucre ap-muted">{s.dosya}</td>
              <td className="ap-master-excel-hucre">{s.kategori}</td>
              <td className="ap-master-excel-hucre ap-ozel-rapor-aciklama">{s.aciklama}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
