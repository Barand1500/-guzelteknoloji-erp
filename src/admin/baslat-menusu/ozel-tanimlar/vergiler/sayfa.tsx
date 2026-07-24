import { useCallback, useRef, useState } from 'react';
import { VERGI_SEKMELERI, type VergiSekmeId } from '@/admin/baslat-menusu/ozel-tanimlar/katalog';
import { useOtIcSekmeKlavye } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/otKlavye';
import { VergilerListeSayfasi } from './VergilerListe';
import { VergiTurleriListeSayfasi } from './VergiTurleriListe';
import { VergiDaireleriListeSayfasi } from './VergiDaireleriListe';

export function VergilerHubSayfasi() {
  const [sekme, setSekme] = useState<VergiSekmeId>('vergiler');
  const kokRef = useRef<HTMLDivElement>(null);

  const sekmeSec = useCallback((id: VergiSekmeId) => {
    setSekme(id);
  }, []);

  useOtIcSekmeKlavye({
    kokRef,
    sekmeler: VERGI_SEKMELERI,
    aktif: sekme,
    onSec: sekmeSec,
  });

  return (
    <div className="ot-bk-hub" ref={kokRef}>
      <nav className="ot-bk-sekmeler" aria-label="Vergiler">
        {VERGI_SEKMELERI.map((s) => {
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
      </nav>

      <div className="ot-bk-icerik">
        {sekme === 'vergiler' ? <VergilerListeSayfasi /> : null}
        {sekme === 'vergi-turleri' ? <VergiTurleriListeSayfasi /> : null}
        {sekme === 'vergi-daireleri' ? <VergiDaireleriListeSayfasi /> : null}
      </div>
    </div>
  );
}
