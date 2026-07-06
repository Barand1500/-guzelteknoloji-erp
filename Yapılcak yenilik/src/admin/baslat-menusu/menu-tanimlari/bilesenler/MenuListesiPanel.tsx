import type { MenuTanim } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

interface MenuListesiPanelProps {
  menuler: MenuTanim[];
  seciliId: number | null;
  yeniVurgu: boolean;
  onSec: (id: number) => void;
}

export function MenuListesiPanel({ menuler, seciliId, yeniVurgu, onSec }: MenuListesiPanelProps) {
  return (
    <aside className="ap-menu-tanim-sol" aria-label="Menü listesi">
      <div className="ap-menu-tanim-sol-baslik">Menü Listesi</div>
      <ul className="ap-menu-tanim-liste" role="listbox">
        {yeniVurgu ? (
          <li className="ap-menu-tanim-satir ap-menu-tanim-satir-secili" role="option" aria-selected>
            <span className="ap-menu-tanim-satir-ad ap-muted">[Yeni menü]</span>
          </li>
        ) : null}
        {menuler.map((m) => {
          const secili = !yeniVurgu && seciliId === m.id;
          return (
            <li key={m.id}>
              <button
                type="button"
                role="option"
                aria-selected={secili}
                className={`ap-menu-tanim-satir${secili ? ' ap-menu-tanim-satir-secili' : ''}`}
                onClick={() => onSec(m.id)}
              >
                <span className="ap-menu-tanim-satir-ad">{m.ad || `Menü #${m.id}`}</span>
                {!m.aktif ? <span className="ap-menu-tanim-satir-pasif">Pasif</span> : null}
              </button>
            </li>
          );
        })}
        {menuler.length === 0 && !yeniVurgu ? (
          <li className="ap-menu-tanim-liste-bos ap-muted">Henüz menü yok. Aksiyon çubuğundan Yeni ile ekleyin.</li>
        ) : null}
      </ul>
    </aside>
  );
}
