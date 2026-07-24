import { useCallback, useRef, useState } from 'react';
import {
  BANKA_KART_SEKMELERI,
  type BankaKartSekmeId,
} from '@/admin/baslat-menusu/ozel-tanimlar/katalog';
import { useOtIcSekmeKlavye } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/otKlavye';
import type { OzelBanka } from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankalar';
import { BankalarListeSayfasi } from './BankalarListe';
import { KartTipleriListeSayfasi } from './KartTipleriListe';
import { KartMarkalariListeSayfasi } from './KartMarkalariListe';
import { BinKayitlariListeSayfasi } from './BinKayitlariListe';

export function BankalarKartlarSayfasi() {
  const [sekme, setSekme] = useState<BankaKartSekmeId>('bankalar');
  const [hesapBanka, setHesapBanka] = useState<OzelBanka | null>(null);
  const kokRef = useRef<HTMLDivElement>(null);

  const sekmeSec = useCallback((id: BankaKartSekmeId) => {
    if (id === 'bankalar' && hesapBanka) {
      setHesapBanka(null);
      return;
    }
    setHesapBanka(null);
    setSekme(id);
  }, [hesapBanka]);

  useOtIcSekmeKlavye({
    kokRef,
    sekmeler: BANKA_KART_SEKMELERI,
    aktif: sekme,
    onSec: sekmeSec,
    etkin: !hesapBanka,
  });

  return (
    <div className="ot-bk-hub" ref={kokRef}>
      <nav className="ot-bk-sekmeler" aria-label="Bankalar ve Kartlar">
        <div className="ot-bk-sekme-liste">
          {BANKA_KART_SEKMELERI.map((s) => {
            const aktif = s.id === sekme && !hesapBanka;
            const bankaAktif = s.id === 'bankalar' && Boolean(hesapBanka);
            return (
              <button
                key={s.id}
                type="button"
                className={`ot-bk-sekme${aktif || bankaAktif ? ' ot-bk-sekme-aktif' : ''}`}
                onClick={() => sekmeSec(s.id)}
                aria-current={aktif || bankaAktif ? 'page' : undefined}
              >
                {s.baslik}
              </button>
            );
          })}
        </div>
        {hesapBanka ? (
          <button
            type="button"
            className="ot-bk-geri ot-bk-sekme-ekle"
            onClick={() => setHesapBanka(null)}
          >
            ← Bankalara Geri Dön
          </button>
        ) : null}
      </nav>

      <div className="ot-bk-icerik">
        {sekme === 'bankalar' ? (
          <BankalarListeSayfasi hesapBanka={hesapBanka} onHesapBanka={setHesapBanka} />
        ) : null}
        {sekme === 'kart-tipleri' ? <KartTipleriListeSayfasi /> : null}
        {sekme === 'kart-markalari' ? <KartMarkalariListeSayfasi /> : null}
        {sekme === 'bin-kayitlari' ? <BinKayitlariListeSayfasi /> : null}
      </div>
    </div>
  );
}
