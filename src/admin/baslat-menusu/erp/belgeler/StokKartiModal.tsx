import { useMemo, useState } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { AdminStok } from '@/admin/baslat-menusu/erp/stoklar/tipler';
import { stokBakiyeleriGetir, stokHareketleriGetir } from '@/admin/baslat-menusu/erp/belgeler/api';
import { belgeTurEtiketi, type BelgeTur } from '@/admin/baslat-menusu/erp/belgeler/tipler';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

interface StokKartiModalProps {
  acik: boolean;
  stok: AdminStok | null;
  onKapat: () => void;
}

export function StokKartiModal({ acik, stok, onKapat }: StokKartiModalProps) {
  const [depoFiltre, setDepoFiltre] = useState('');

  const bakiyeler = useMemo(() => {
    if (!acik || !stok) return [];
    return stokBakiyeleriGetir().filter((b) => b.urunKodu === stok.urunKodu);
  }, [acik, stok]);

  const depolar = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of bakiyeler) map.set(b.depoId, b.depoKodu || b.depoId);
    return [...map.entries()];
  }, [bakiyeler]);

  const hareketler = useMemo(() => {
    if (!acik || !stok) return [];
    return stokHareketleriGetir(stok.urunKodu, depoFiltre || undefined);
  }, [acik, stok, depoFiltre]);

  const toplamBakiye = bakiyeler.reduce((t, b) => t + b.miktar, 0);

  if (!stok) return null;

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Stok Kartı"
      altBaslik={`${stok.urunKodu} — ${stok.urunAdi}`}
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      baslikId="stok-karti-baslik"
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
        <div className="fatura-ekstre-ust-satir">
          <div className="fatura-ekstre-ozet-kart fatura-ekstre-ozet-kart--bakiye">
            <span className="fatura-ekstre-ozet-etiket">Toplam bakiye</span>
            <strong>{sayiFormatla(toplamBakiye)}</strong>
          </div>
          <label className="fatura-ekstre-depo-filtre">
            <span>Depo filtresi</span>
            <select value={depoFiltre} onChange={(e) => setDepoFiltre(e.target.value)}>
              <option value="">Tüm depolar</option>
              {depolar.map(([id, kod]) => (
                <option key={id} value={id}>
                  {kod}
                </option>
              ))}
            </select>
          </label>
        </div>

        {bakiyeler.length > 0 ? (
          <div className="fatura-ekstre-tablo-wrap fatura-ekstre-tablo-wrap--kisa">
            <table className="fatura-ekstre-tablo">
              <thead>
                <tr>
                  <th>Depo</th>
                  <th>Bakiye</th>
                  <th>Birim</th>
                </tr>
              </thead>
              <tbody>
                {bakiyeler.map((b) => (
                  <tr key={b.depoId}>
                    <td>{b.depoKodu || b.depoId}</td>
                    <td className="fatura-sayi">{sayiFormatla(b.miktar)}</td>
                    <td>{b.birim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="fatura-ekstre-tablo-wrap">
          {hareketler.length === 0 ? (
            <div className="fatura-ekstre-bos">
              <p className="fatura-ekstre-bos-baslik">Henüz stok hareketi yok</p>
              <p className="fatura-ekstre-bos-metin">
                Belge onayından sonra giriş/çıkış hareketleri burada görünür.
              </p>
            </div>
          ) : (
            <table className="fatura-ekstre-tablo">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Belge</th>
                  <th>Tür</th>
                  <th>Depo</th>
                  <th>Miktar</th>
                </tr>
              </thead>
              <tbody>
                {hareketler.map((h) => (
                  <tr key={h.id}>
                    <td>{h.kayitTarihi.slice(0, 10)}</td>
                    <td>{h.belgeNo}</td>
                    <td>{belgeTurEtiketi(h.tur as BelgeTur)}</td>
                    <td>{h.depoKodu || h.depoId}</td>
                    <td className={`fatura-sayi${h.miktar < 0 ? ' fatura-sayi--eksi' : ' fatura-sayi--arti'}`}>
                      {h.miktar > 0 ? '+' : ''}
                      {sayiFormatla(h.miktar)} {h.birim}
                    </td>
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
