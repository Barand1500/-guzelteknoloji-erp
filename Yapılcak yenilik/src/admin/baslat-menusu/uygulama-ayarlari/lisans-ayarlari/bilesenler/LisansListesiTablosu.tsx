import { urunAdiBul } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/varsayilanVeri';
import type { LisansKaydi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/tipler';

interface LisansListesiTablosuProps {
  lisanslar: LisansKaydi[];
  seciliId: string | null;
  onSatirSec: (id: string) => void;
  onYenile: (id: string) => void;
  onSil: (id: string) => void;
  yenileniyorId: string | null;
}

export function LisansListesiTablosu({
  lisanslar,
  seciliId,
  onSatirSec,
  onYenile,
  onSil,
  yenileniyorId,
}: LisansListesiTablosuProps) {
  return (
    <div className="ap-master-excel-wrap ap-lisans-liste-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Lisans</th>
              <th className="ap-lisans-th-islem" aria-label="Yenile" />
              <th className="ap-lisans-th-islem" aria-label="Sil" />
            </tr>
          </thead>
          <tbody>
            {lisanslar.length === 0 ? (
              <tr>
                <td colSpan={3} className="ap-master-excel-hucre ap-lisans-bos">
                  Henüz lisans eklenmedi. <strong>Lisans Ekle</strong> ile başlayın.
                </td>
              </tr>
            ) : (
              lisanslar.map((l) => (
                <tr
                  key={l.id}
                  className={seciliId === l.id ? 'ap-lisans-satir-secili' : undefined}
                  onClick={() => onSatirSec(l.id)}
                >
                  <td className="ap-master-excel-hucre ap-lisans-ad">{urunAdiBul(l.urun)}</td>
                  <td className="ap-master-excel-hucre ap-lisans-islem-hucre">
                    <button
                      type="button"
                      className="ap-lisans-islem-tus ap-lisans-islem-yenile"
                      title="Yenile"
                      disabled={yenileniyorId === l.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onYenile(l.id);
                      }}
                    >
                      {yenileniyorId === l.id ? '…' : '↻'}
                    </button>
                  </td>
                  <td className="ap-master-excel-hucre ap-lisans-islem-hucre">
                    <button
                      type="button"
                      className="ap-lisans-islem-tus ap-lisans-islem-sil"
                      title="Sil"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSil(l.id);
                      }}
                    >
                      ×
                    </button>
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
