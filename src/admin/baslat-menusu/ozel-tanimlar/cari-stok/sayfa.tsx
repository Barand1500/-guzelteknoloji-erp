import { useCallback, useRef, useState } from 'react';
import {
  CARI_STOK_SEKMELERI,
  type CariStokSekmeId,
} from '@/admin/baslat-menusu/ozel-tanimlar/katalog';
import { useOtIcSekmeKlavye } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/otKlavye';
import { CariTipleriListeSayfasi } from './CariTipleriListe';
import { StokTipleriListeSayfasi } from './StokTipleriListe';
import { OlcuBirimleriListeSayfasi } from './OlcuBirimleriListe';

export function CariStokHubSayfasi() {
  const [sekme, setSekme] = useState<CariStokSekmeId>('cari-tipleri');
  const kokRef = useRef<HTMLDivElement>(null);

  const sekmeSec = useCallback((id: CariStokSekmeId) => {
    setSekme(id);
  }, []);

  useOtIcSekmeKlavye({
    kokRef,
    sekmeler: CARI_STOK_SEKMELERI,
    aktif: sekme,
    onSec: sekmeSec,
  });

  return (
    <div className="ot-bk-hub" ref={kokRef}>
      <nav className="ot-bk-sekmeler" aria-label="Cari ve Stok">
        <div className="ot-bk-sekme-liste">
          {CARI_STOK_SEKMELERI.map((s) => {
            const aktif = s.id === sekme;
            return (
              <button
                key={s.id}
                type="button"
                className={`ot-bk-sekme${aktif ? ' ot-bk-sekme-aktif' : ''}`}
                onClick={() => sekmeSec(s.id)}
                aria-current={aktif ? 'page' : undefined}
              >
                {s.baslik}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="ot-bk-icerik">
        {sekme === 'cari-tipleri' ? <CariTipleriListeSayfasi /> : null}
        {sekme === 'stok-tipleri' ? <StokTipleriListeSayfasi /> : null}
        {sekme === 'olcu-birimler' ? <OlcuBirimleriListeSayfasi /> : null}
      </div>
    </div>
  );
}
