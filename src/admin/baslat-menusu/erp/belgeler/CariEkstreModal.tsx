import { useMemo } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariBakiyeAl, cariHareketleriGetir } from '@/admin/baslat-menusu/erp/belgeler/api';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface CariEkstreModalProps {
  acik: boolean;
  cari: AdminCari | null;
  onKapat: () => void;
}

export function CariEkstreModal({ acik, cari, onKapat }: CariEkstreModalProps) {
  const hareketler = useMemo(() => {
    if (!acik || !cari) return [];
    return cariHareketleriGetir(cari.cariKodu);
  }, [acik, cari]);

  const bakiye = useMemo(() => {
    if (!cari) return { borc: 0, alacak: 0, bakiye: 0 };
    return cariBakiyeAl(cari.cariKodu);
  }, [cari, hareketler]);

  if (!cari) return null;

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Cari Ekstre"
      altBaslik={`${cari.cariKodu} — ${cari.cariAdi || cari.unvan || ''}`}
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      baslikId="cari-ekstre-baslik"
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
      <div className="fatura-ekstre-govde">
        <div className="fatura-ekstre-ozet-kartlar">
          <div className="fatura-ekstre-ozet-kart fatura-ekstre-ozet-kart--borc">
            <span className="fatura-ekstre-ozet-etiket">Borç</span>
            <strong>{sayiFormatla(bakiye.borc)}</strong>
          </div>
          <div className="fatura-ekstre-ozet-kart fatura-ekstre-ozet-kart--alacak">
            <span className="fatura-ekstre-ozet-etiket">Alacak</span>
            <strong>{sayiFormatla(bakiye.alacak)}</strong>
          </div>
          <div className="fatura-ekstre-ozet-kart fatura-ekstre-ozet-kart--bakiye">
            <span className="fatura-ekstre-ozet-etiket">Bakiye (B−A)</span>
            <strong>{sayiFormatla(bakiye.bakiye)}</strong>
          </div>
        </div>

        <div className="fatura-ekstre-tablo-wrap">
          {hareketler.length === 0 ? (
            <div className="fatura-ekstre-bos">
              <p className="fatura-ekstre-bos-baslik">Henüz hareket yok</p>
              <p className="fatura-ekstre-bos-metin">
                Fatura onayladığınızda veya ödeme kaydettiğinizde hareketler burada listelenir.
              </p>
            </div>
          ) : (
            <table className="fatura-ekstre-tablo">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                  <th>Borç</th>
                  <th>Alacak</th>
                </tr>
              </thead>
              <tbody>
                {hareketler.map((h) => (
                  <tr key={h.id}>
                    <td>{h.kayitTarihi.slice(0, 10)}</td>
                    <td>{h.aciklama}</td>
                    <td className="fatura-sayi">{h.borc ? sayiFormatla(h.borc) : '—'}</td>
                    <td className="fatura-sayi">{h.alacak ? sayiFormatla(h.alacak) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SistemModal>
  );
}
