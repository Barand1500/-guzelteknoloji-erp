import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import {
  CARI_KATEGORI_SECENEKLERI,
  MASA_GRUBU_SECENEKLERI,
} from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/varsayilanVeri';
import type { FiyatListeKayit, FiyatListeKurali } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

interface FiyatListeKurallariPanelProps {
  kurallar: FiyatListeKurali[];
  sablonAdlari: string[];
  onKuralDegistir: (id: string, alan: keyof FiyatListeKurali, deger: string) => void;
}

export function FiyatListeKurallariPanel({ kurallar, sablonAdlari, onKuralDegistir }: FiyatListeKurallariPanelProps) {
  const fiyatListesiSecenekleri = [
    { value: '', label: '— Seçin —' },
    ...sablonAdlari.map((ad) => ({ value: ad, label: ad })),
  ];

  return (
    <div className="ap-fiyat-kural-tablo-scroll">
      <table className="ap-fiyat-kural-tablo">
        <thead>
          <tr>
            <th>Cari Kategorisi</th>
            <th>Masa Grubu</th>
            <th>Fiyat Listesi</th>
          </tr>
        </thead>
        <tbody>
          {kurallar.length === 0 ? (
            <tr>
              <td colSpan={3} className="ap-fiyat-tablo-bos">
                Kural eklemek için aksiyon çubuğundan Yeni Ekle kullanın.
              </td>
            </tr>
          ) : (
            kurallar.map((kural) => (
              <tr key={kural.id}>
                <td>
                  <FormAcilirSecim
                    aria-label="Cari kategorisi"
                    value={kural.cariKategorisi}
                    onChange={(v) => onKuralDegistir(kural.id, 'cariKategorisi', v)}
                    secenekler={CARI_KATEGORI_SECENEKLERI}
                  />
                </td>
                <td>
                  <FormAcilirSecim
                    aria-label="Masa grubu"
                    value={kural.masaGrubu}
                    onChange={(v) => onKuralDegistir(kural.id, 'masaGrubu', v)}
                    secenekler={MASA_GRUBU_SECENEKLERI}
                  />
                </td>
                <td>
                  <FormAcilirSecim
                    aria-label="Fiyat listesi"
                    value={kural.fiyatListesi}
                    onChange={(v) => onKuralDegistir(kural.id, 'fiyatListesi', v)}
                    secenekler={fiyatListesiSecenekleri}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function sablonAdlariFromKayit(kayit: FiyatListeKayit): string[] {
  return kayit.sablonlar.filter((s) => s.aktif).map((s) => s.ad);
}
