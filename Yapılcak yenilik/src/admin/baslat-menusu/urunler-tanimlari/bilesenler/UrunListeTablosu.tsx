import { formInputSinifi } from '@/formlar/FormAlani';
import type { UrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

interface UrunListeTablosuProps {
  urunler: UrunTanimi[];
  seciliId: string | null;
  onSec: (id: string) => void;
}

function fiyatGoster(fiyat: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(fiyat);
}

export function UrunListeTablosu({ urunler, seciliId, onSec }: UrunListeTablosuProps) {
  return (
    <div className="ap-master-excel-wrap ap-urun-tanim-liste-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Kod</th>
              <th>Ürün Adı</th>
              <th>Grup</th>
              <th>Tip</th>
              <th>KDV %</th>
              <th>Fiyat</th>
              <th>Sıra</th>
            </tr>
          </thead>
          <tbody>
            {urunler.map((u) => (
              <tr
                key={u.id}
                className={seciliId === u.id ? 'ap-master-excel-satir-secili' : ''}
                onClick={() => onSec(u.id)}
              >
                <td className="ap-master-excel-hucre">{u.stokKodu}</td>
                <td className="ap-master-excel-hucre">{u.ad}</td>
                <td className="ap-master-excel-hucre">{u.urunGrubu}</td>
                <td className="ap-master-excel-hucre">{u.urunTipi}</td>
                <td className="ap-master-excel-hucre">{u.kdvOrani}</td>
                <td className="ap-master-excel-hucre">{fiyatGoster(u.kdvDahilFiyat)}</td>
                <td className="ap-master-excel-hucre">{u.sira}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {urunler.length === 0 && (
        <p className="ap-muted py-8 text-center text-sm">Henüz ürün tanımı yok. Yeni ekleyerek başlayın.</p>
      )}
    </div>
  );
}

export function UrunGorunumSegici({
  gorunum,
  onDegistir,
}: {
  gorunum: 'form' | 'liste';
  onDegistir: (g: 'form' | 'liste') => void;
}) {
  return (
    <div className="ap-urun-tanim-gorunum-segici" role="group" aria-label="Görünüm">
      <button
        type="button"
        className={`ap-urun-tanim-gorunum-tus ${gorunum === 'form' ? 'ap-urun-tanim-gorunum-tus-aktif' : ''}`}
        onClick={() => onDegistir('form')}
      >
        Kart
      </button>
      <button
        type="button"
        className={`ap-urun-tanim-gorunum-tus ${gorunum === 'liste' ? 'ap-urun-tanim-gorunum-tus-aktif' : ''}`}
        onClick={() => onDegistir('liste')}
      >
        Liste
      </button>
    </div>
  );
}

export function UrunListeArama({
  deger,
  onDegistir,
}: {
  deger: string;
  onDegistir: (v: string) => void;
}) {
  return (
    <input
      type="search"
      className={`${formInputSinifi} ap-urun-tanim-liste-arama-genis`}
      placeholder="Tüm ürünlerde ara…"
      value={deger}
      onChange={(e) => onDegistir(e.target.value)}
      aria-label="Ürün ara"
    />
  );
}
