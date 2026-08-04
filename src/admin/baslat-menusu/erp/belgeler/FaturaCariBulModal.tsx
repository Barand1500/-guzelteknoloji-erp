import { useMemo, useState } from 'react';
import { SistemModal } from '@/admin/ortak/SistemModal';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface FaturaCariBulModalProps {
  acik: boolean;
  cariler: AdminCari[];
  onKapat: () => void;
  onSec: (cariId: string) => void;
}

export function FaturaCariBulModal({ acik, cariler, onKapat, onSec }: FaturaCariBulModalProps) {
  const [arama, setArama] = useState('');

  const sonuclar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return cariler.slice(0, 50);
    return cariler
      .filter((c) => {
        const metin = `${c.cariKodu} ${c.cariAdi} ${c.unvan} ${c.vergiNo}`.toLocaleLowerCase('tr');
        return metin.includes(q);
      })
      .slice(0, 50);
  }, [arama, cariler]);

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Cari Bul"
      altBaslik="Kod, unvan veya vergi no ile arayın"
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
    >
      <div className="fatura-cari-bul">
        <input
          type="search"
          className="fatura-cari-bul-ara"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Cari kodu, unvan, vergi no…"
          autoFocus
        />
        <div className="fatura-cari-bul-liste">
          {sonuclar.length === 0 ? (
            <p className="fatura-bos">Eşleşen cari bulunamadı.</p>
          ) : (
            <ul>
              {sonuclar.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="fatura-cari-bul-oge"
                    onClick={() => {
                      onSec(c.id);
                      setArama('');
                      onKapat();
                    }}
                  >
                    <span className="fatura-cari-bul-kod">{c.cariKodu}</span>
                    <span className="fatura-cari-bul-unvan">{c.cariAdi || c.unvan || '—'}</span>
                    {c.vergiNo ? <span className="fatura-cari-bul-vkn">VKN {c.vergiNo}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SistemModal>
  );
}
