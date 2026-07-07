import { adminModulleri } from '@/admin/veri/adminMenuYapisi';
import { SAG_TIK_OGE_TANIMLARI } from '@/admin/baslat-menusu/sistem/ayarlar/veri-sag-tik';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import type { SagTikOgeId } from '@/admin/ortak/tipler/sagTikPaneli';

interface SagTikPaneliYonetimSekmeProps {
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
}

export function SagTikPaneliYonetimSekme({ form, onChange }: SagTikPaneliYonetimSekmeProps) {
  const panel = form.sagTikPaneli;

  function panelGuncelle(parcalar: Partial<typeof panel>) {
    onChange({ ...form, sagTikPaneli: { ...panel, ...parcalar } });
  }

  function ogeToggle(id: SagTikOgeId, aktif: boolean) {
    panelGuncelle({
      ogeler: panel.ogeler.map((o) => (o.id === id ? { ...o, aktif } : o)),
    });
  }

  function ogeYukari(id: SagTikOgeId) {
    const idx = panel.ogeler.findIndex((o) => o.id === id);
    if (idx <= 0) return;
    const yeni = [...panel.ogeler];
    [yeni[idx - 1], yeni[idx]] = [yeni[idx], yeni[idx - 1]];
    panelGuncelle({ ogeler: yeni });
  }

  function ogeAsagi(id: SagTikOgeId) {
    const idx = panel.ogeler.findIndex((o) => o.id === id);
    if (idx < 0 || idx >= panel.ogeler.length - 1) return;
    const yeni = [...panel.ogeler];
    [yeni[idx + 1], yeni[idx]] = [yeni[idx], yeni[idx + 1]];
    panelGuncelle({ ogeler: yeni });
  }

  function modulToggle(modulId: string) {
    const varMi = panel.modulIdler.includes(modulId);
    panelGuncelle({
      modulIdler: varMi
        ? panel.modulIdler.filter((id) => id !== modulId)
        : [...panel.modulIdler, modulId],
    });
  }

  return (
    <div className="ap-sag-tik-yonetim space-y-6">
      <DurumAnahtari
        etiket="Sağ tık menüsü"
        aciklama="Admin panelde herhangi bir yere sağ tıklayınca özel menü açılır."
        acik={panel.aktif}
        onChange={(aktif) => panelGuncelle({ aktif })}
        ikon="🖱️"
        renk="mavi"
      />

      <section>
        <h3 className="ap-heading mb-1 text-sm font-semibold">Menü öğeleri</h3>
        <p className="ap-muted mb-3 text-xs">Hangi maddeler görünsün ve sıralaması nasıl olsun.</p>
        <ul className="ap-sag-tik-oge-liste">
          {panel.ogeler.map((oge, idx) => {
            const tanim = SAG_TIK_OGE_TANIMLARI.find((t) => t.id === oge.id);
            if (!tanim) return null;
            return (
              <li key={oge.id} className={`ap-sag-tik-oge-satir ${tanim.ayirici ? 'ap-sag-tik-oge-ayirici' : ''}`}>
                <label className="ap-sag-tik-oge-etiket">
                  <input
                    type="checkbox"
                    checked={oge.aktif}
                    onChange={(e) => ogeToggle(oge.id, e.target.checked)}
                  />
                  <span className="ap-sag-tik-oge-ikon">{tanim.ikon}</span>
                  <span>
                    <strong>{tanim.etiket}</strong>
                    <small>{tanim.aciklama}</small>
                  </span>
                </label>
                <div className="ap-sag-tik-oge-sira">
                  <button type="button" disabled={idx === 0} onClick={() => ogeYukari(oge.id)} aria-label="Yukarı">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === panel.ogeler.length - 1}
                    onClick={() => ogeAsagi(oge.id)}
                    aria-label="Aşağı"
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="ap-heading mb-1 text-sm font-semibold">Modüller alt menüsü</h3>
        <p className="ap-muted mb-3 text-xs">“Modüller” maddesinde hangi modüller listelensin.</p>
        <div className="ap-sag-tik-modul-grid">
          {adminModulleri.map((modul) => (
            <label key={modul.id} className="ap-sag-tik-modul-sec">
              <input
                type="checkbox"
                checked={panel.modulIdler.includes(modul.id)}
                onChange={() => modulToggle(modul.id)}
              />
              <span>{modul.ikon}</span>
              <span>{modul.baslik}</span>
            </label>
          ))}
        </div>
      </section>

      <p className="ap-muted text-xs leading-relaxed">
        Değişikliklerin uygulanması için alttaki <strong>Kaydet</strong> butonuna basın. Shift + sağ tık tarayıcı
        menüsünü açmaya devam eder.
      </p>
    </div>
  );
}
