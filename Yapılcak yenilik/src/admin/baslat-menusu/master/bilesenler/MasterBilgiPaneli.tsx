import type { MasterSekmeTanim } from '@/admin/baslat-menusu/master/tipler';

const HIYERARSI = [
  { katman: 'Bayi', alt: 'Firma → Şube' },
  { katman: 'Paket', alt: 'Lisans → Firma' },
  { katman: 'Modül', alt: 'Panel modül tanımları' },
];

interface MasterBilgiPaneliProps {
  sekme: MasterSekmeTanim;
}

export function MasterBilgiPaneli({ sekme }: MasterBilgiPaneliProps) {
  return (
    <div className="mt-4 space-y-3">
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Seçili alan</span>
        <strong className="ap-heading mt-1 block text-sm">{sekme.ad}</strong>
        <p className="ap-muted mt-1 text-xs leading-relaxed">{sekme.baglam}</p>
      </div>

      <div className="ap-master-hiyerarsi">
        <p className="ap-muted mb-2 text-[10px] font-bold uppercase tracking-wide">Organizasyon</p>
        {HIYERARSI.map((h) => (
          <div key={h.katman} className="ap-master-hiyerarsi-satir">
            <span className="ap-heading text-xs font-semibold">{h.katman}</span>
            <span className="ap-muted text-[10px]">{h.alt}</span>
          </div>
        ))}
      </div>

      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Veri</span>
        <strong className="mt-1 block text-xs text-amber-400">● Örnek görünüm — API sonra</strong>
      </div>
    </div>
  );
}
