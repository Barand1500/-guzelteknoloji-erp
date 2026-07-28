import { useMemo } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { belgeDurumEtiketi, belgeTurEtiketi, type BelgeKayit } from './tipler';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface FaturaEskiBelgelerModalProps {
  acik: boolean;
  cari: AdminCari | null;
  belgeler: BelgeKayit[];
  aktifBelgeId: string | null;
  onKapat: () => void;
  onAc: (belge: BelgeKayit) => void;
}

export function FaturaEskiBelgelerModal({
  acik,
  cari,
  belgeler,
  aktifBelgeId,
  onKapat,
  onAc,
}: FaturaEskiBelgelerModalProps) {
  const liste = useMemo(() => {
    if (!cari) return [];
    return belgeler
      .filter((b) => b.cariId === cari.id && b.id !== aktifBelgeId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih));
  }, [belgeler, cari, aktifBelgeId]);

  if (!cari) return null;

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Eski Faturalar"
      altBaslik={`${cari.cariKodu} — ${cari.cariAdi || cari.unvan || ''}`}
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      footer={
        <SistemModalAksiyonlar>
          <div className="flex w-full items-center justify-end gap-2">
            <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={onKapat}>
              Kapat
            </button>
          </div>
        </SistemModalAksiyonlar>
      }
    >
      <div className="fatura-ekstre-tablo-wrap">
        {liste.length === 0 ? (
          <p className="fatura-bos">Bu cariye ait başka belge yok.</p>
        ) : (
          <table className="fatura-ekstre-tablo">
            <thead>
              <tr>
                <th>Tür</th>
                <th>Belge No</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>Toplam</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((b) => (
                <tr key={b.id}>
                  <td>{belgeTurEtiketi(b.tur)}</td>
                  <td>{b.belgeNo}</td>
                  <td>{b.tarih}</td>
                  <td>
                    <span className={`fatura-durum fatura-durum--${b.durum.toLowerCase()}`}>
                      {belgeDurumEtiketi(b.durum)}
                    </span>
                  </td>
                  <td className="fatura-sayi">{sayiFormatla(b.genelToplam)}</td>
                  <td>
                    <button
                      type="button"
                      className="fatura-btn fatura-btn--ghost"
                      onClick={() => {
                        onAc(b);
                        onKapat();
                      }}
                    >
                      Aç
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SistemModal>
  );
}
