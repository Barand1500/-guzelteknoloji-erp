import type { MarslanacakUrun } from '@/admin/baslat-menusu/marslanacak-urunler/tipler';
import { baziSeciliMi, tumuSeciliMi } from '@/admin/baslat-menusu/marslanacak-urunler/yardimci';

interface MarslanacakUrunTabloProps {
  urunler: MarslanacakUrun[];
  onUrunDegistir: (id: string, marslanmayacak: boolean) => void;
  onTumunuDegistir: (marslanmayacak: boolean) => void;
}

export function MarslanacakUrunTablo({ urunler, onUrunDegistir, onTumunuDegistir }: MarslanacakUrunTabloProps) {
  const tumuSecili = tumuSeciliMi(urunler);
  const baziSecili = baziSeciliMi(urunler);

  return (
    <div className="ap-marslanacak-tablo-scroll">
      <table className="ap-marslanacak-tablo">
        <thead>
          <tr>
            <th className="ap-marslanacak-check-col">
              <input
                type="checkbox"
                checked={tumuSecili}
                ref={(el) => {
                  if (el) el.indeterminate = baziSecili;
                }}
                onChange={(e) => onTumunuDegistir(e.target.checked)}
                aria-label="Tümünü seç"
              />
            </th>
            <th>Ürün</th>
            <th>Ürün Grubu</th>
          </tr>
        </thead>
        <tbody>
          {urunler.map((urun) => (
            <tr key={urun.id} className={urun.marslanmayacak ? 'ap-marslanacak-satir-secili' : ''}>
              <td className="ap-marslanacak-check-col">
                <input
                  type="checkbox"
                  checked={urun.marslanmayacak}
                  onChange={(e) => onUrunDegistir(urun.id, e.target.checked)}
                  aria-label={`${urun.ad} marşlanmayacak`}
                />
              </td>
              <td>{urun.ad}</td>
              <td className="ap-marslanacak-grup">${urun.grup}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
