import type { AksiyonButonu } from '@/admin/ortak/tipler/admin';
import { GorevCubuguTray } from './GorevCubuguTray';
import { SaatTakvimWidget } from '../alt-panel/SaatTakvimWidget';
import { modulRehberBul } from '@/admin/veri/adminModulRehberleri';
import { BildirimPaneli, useBildirimSayaci } from '../alt-panel/BildirimPaneli';
import { LogPaneli } from '../alt-panel/LogPaneli';
import { YedeklemeHizliPaneli } from '../alt-panel/YedeklemeHizliPaneli';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { kisayolAyarlariOku } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import { useState } from 'react';

interface AltAksiyonCubuguProps {
  aksiyonlar: AksiyonButonu[];
  onAksiyon?: (id: string) => void;
  onModulAc?: (modulId: string) => void;
  focusModulId?: string;
  onRehberAc?: () => void;
}

type AcikPanel = 'bildirim' | 'log' | 'yedek' | null;

export function AltAksiyonCubugu({
  aksiyonlar,
  onAksiyon,
  onModulAc,
  focusModulId = 'dashboard',
  onRehberAc,
}: AltAksiyonCubuguProps) {
  const { rehberModulId } = useAdminAksiyon();
  const rehber = modulRehberBul(rehberModulId ?? focusModulId);
  const rehberKisayolu = kisayolAyarlariOku().rehber;
  const [acikPanel, setAcikPanel] = useState<AcikPanel>(null);
  const { okunmamisSayi, yenile } = useBildirimSayaci();
  const { aksiyonGeriBildirim } = useAdminAksiyon();

  function panelAc(panel: AcikPanel) {
    setAcikPanel((onceki) => (onceki === panel ? null : panel));
    if (panel === 'bildirim') void yenile();
  }

  return (
    <footer className="ap-footer ap-gorev-cubugu flex h-12 shrink-0 items-center gap-2 border-t px-3" data-ap-kesif="aksiyon-cubugu">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {aksiyonlar.map((aksiyon) => {
          const geriBildirim =
            aksiyonGeriBildirim?.aksiyonId === aksiyon.id ? aksiyonGeriBildirim : null;
          const etiket = geriBildirim?.mesaj ?? aksiyon.etiket;

          return (
            <button
              key={aksiyon.id}
              type="button"
              disabled={!aksiyon.aktif && !geriBildirim}
              onClick={() => onAksiyon?.(aksiyon.id)}
              className={`ap-aksiyon-btn shrink-0 rounded px-4 py-1.5 text-sm font-medium transition ${
                geriBildirim?.tur === 'basari'
                  ? 'ap-aksiyon-basari'
                  : geriBildirim?.tur === 'hata'
                    ? 'ap-aksiyon-hata'
                    : !aksiyon.aktif
                      ? 'ap-aksiyon-pasif cursor-not-allowed opacity-40'
                      : aksiyon.birincil
                        ? 'ap-aksiyon-birincil'
                        : 'ap-aksiyon-aktif'
              }`}
            >
              {etiket}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-l border-[var(--ap-border)] pl-3">
        <button
          type="button"
          onClick={onRehberAc}
          className="ap-rehber-cubuk-btn"
          title={`${rehber.baslik} — Rehber (${rehberKisayolu})`}
          aria-label="Sayfa rehberini aç"
        >
          ?
        </button>
        <GorevCubuguTray
          logAcik={acikPanel === 'log'}
          yedekAcik={acikPanel === 'yedek'}
          onLogToggle={() => panelAc('log')}
          onYedekToggle={() => panelAc('yedek')}
        />
        <button
          type="button"
          className={`ap-tray-bildirim-btn relative ${acikPanel === 'bildirim' ? 'ap-tray-ikon-aktif' : ''}`}
          title="Bildirimler"
          aria-label="Bildirimler"
          onClick={() => panelAc('bildirim')}
          data-ap-kesif="bildirim-tray"
        >
          🔔
          {okunmamisSayi > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {okunmamisSayi > 9 ? '9+' : okunmamisSayi}
            </span>
          )}
        </button>
        <BildirimPaneli
          acik={acikPanel === 'bildirim'}
          onKapat={() => setAcikPanel(null)}
          onGuncelle={yenile}
        />
        <LogPaneli
          acik={acikPanel === 'log'}
          onKapat={() => setAcikPanel(null)}
          onModulAc={onModulAc}
        />
        <YedeklemeHizliPaneli
          acik={acikPanel === 'yedek'}
          onKapat={() => setAcikPanel(null)}
          onModulAc={onModulAc}
        />
        <SaatTakvimWidget />
      </div>
    </footer>
  );
}
