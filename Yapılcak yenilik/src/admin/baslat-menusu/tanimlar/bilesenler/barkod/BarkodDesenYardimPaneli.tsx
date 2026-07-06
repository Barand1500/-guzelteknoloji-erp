import { BARKOD_ORNEK_DESENLER, BARKOD_SEMBOLLER } from '@/admin/baslat-menusu/tanimlar/barkod/barkodTipler';

interface BarkodDesenYardimPaneliProps {
  onOrnekSec: (desen: string) => void;
}

export function BarkodDesenYardimPaneli({ onOrnekSec }: BarkodDesenYardimPaneliProps) {
  return (
    <aside className="ap-tanimlar-barkod-yardim">
      <h4 className="ap-tanimlar-barkod-yardim-baslik">Desen Sözdizimi</h4>
      <p className="ap-tanimlar-barkod-yardim-giris">
        Tartılı ürünleri ayırt etmek için desenin başına sabit rakamlar yazın (ör.{' '}
        <code className="ap-tanimlar-barkod-kod">27</code>). Ardından aşağıdaki sembolleri kullanın.
      </p>

      <ul className="ap-tanimlar-barkod-sembol-liste">
        {BARKOD_SEMBOLLER.map((s) => (
          <li key={s.kod} className="ap-tanimlar-barkod-sembol-kart">
            <span className={`ap-tanimlar-barkod-chip ap-tanimlar-barkod-chip-${s.kod}`}>{s.kod}</span>
            <div>
              <strong>{s.baslik}</strong>
              <p>{s.aciklama}</p>
            </div>
          </li>
        ))}
        <li className="ap-tanimlar-barkod-sembol-kart">
          <span className="ap-tanimlar-barkod-chip ap-tanimlar-barkod-chip-sabit">27</span>
          <div>
            <strong>Sabit rakam</strong>
            <p>Tartılı barkodları diğerlerinden ayırmak için başa yazılır.</p>
          </div>
        </li>
      </ul>

      <h4 className="ap-tanimlar-barkod-yardim-baslik ap-tanimlar-barkod-yardim-baslik-ust">
        Örnekler
      </h4>
      <ul className="ap-tanimlar-barkod-ornek-liste">
        {BARKOD_ORNEK_DESENLER.map((o) => (
          <li key={o.desen}>
            <button type="button" className="ap-tanimlar-barkod-ornek-tus" onClick={() => onOrnekSec(o.desen)}>
              <code>{o.desen}</code>
              <span>{o.aciklama}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
