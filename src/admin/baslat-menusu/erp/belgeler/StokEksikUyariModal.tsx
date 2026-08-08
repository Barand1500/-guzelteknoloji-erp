import { useEffect, useState } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { StokEksikSatir } from '@/admin/baslat-menusu/erp/belgeler/tipler';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';

export interface StokTamamlamaSatiri extends StokEksikSatir {
  /** Depoya girilecek miktar */
  eklenecek: number;
}

interface StokEksikUyariModalProps {
  acik: boolean;
  eksikler: StokEksikSatir[];
  depoAdi: string;
  islemde: boolean;
  onKapat: () => void;
  /** Girilen miktarlar depoya eklenip belge kaydedilir */
  onStokEkle: (satirlar: StokTamamlamaSatiri[]) => void;
  /** Stok eksiye düşecek şekilde kaydedilir */
  onEksiyeDevam: () => void;
}

function sayiOku(deger: string): number {
  const n = Number(deger.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function StokEksikUyariModal({
  acik,
  eksikler,
  depoAdi,
  islemde,
  onKapat,
  onStokEkle,
  onEksiyeDevam,
}: StokEksikUyariModalProps) {
  const [miktarlar, setMiktarlar] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!acik) return;
    const baslangic: Record<string, string> = {};
    for (const e of eksikler) baslangic[e.urunKodu] = String(e.eksik);
    setMiktarlar(baslangic);
  }, [acik, eksikler]);

  const stokEkle = () => {
    const satirlar: StokTamamlamaSatiri[] = [];
    for (const e of eksikler) {
      const eklenecek = sayiOku(miktarlar[e.urunKodu] ?? '');
      if (eklenecek > 0) satirlar.push({ ...e, eklenecek });
    }
    onStokEkle(satirlar);
  };

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Stok yetersiz"
      altBaslik={`${depoAdi || 'Seçili depo'} — çıkış miktarı bakiyeyi aşıyor`}
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      kapatmaDevreDisi={islemde}
      footer={
        <SistemModalAksiyonlar>
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              className="fatura-btn fatura-btn--ghost"
              onClick={onKapat}
              disabled={islemde}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="fatura-btn fatura-btn--ghost"
              onClick={onEksiyeDevam}
              disabled={islemde}
            >
              Eksiye Düşsün, Devam Et
            </button>
            <button
              type="button"
              className="fatura-btn fatura-btn--birincil"
              onClick={stokEkle}
              disabled={islemde}
            >
              {islemde ? 'Kaydediliyor…' : 'Stoğu Ekle ve Kaydet'}
            </button>
          </div>
        </SistemModalAksiyonlar>
      }
    >
      <div className="fatura-stok-uyari">
        <p className="fatura-stok-uyari-metin">
          Aşağıdaki ürünlerde depo bakiyesi yetmiyor. Eksik miktarı depoya girip kaydedebilir ya da stoğun eksiye
          düşmesine izin verip devam edebilirsiniz.
        </p>

        <div className="fatura-ekstre-tablo-wrap fatura-ekstre-tablo-wrap--kisa">
          <table className="fatura-ekstre-tablo">
            <thead>
              <tr>
                <th>Ürün</th>
                <th className="fatura-sayi">Mevcut</th>
                <th className="fatura-sayi">İstenen</th>
                <th className="fatura-sayi">Eksik</th>
                <th className="fatura-sayi">Eklenecek</th>
              </tr>
            </thead>
            <tbody>
              {eksikler.map((e) => (
                <tr key={e.urunKodu}>
                  <td>
                    <div className="fatura-stok-uyari-urun" title={[e.urunKodu, e.urunAdi].filter(Boolean).join(' — ')}>
                      <strong className="fatura-stok-uyari-kod">{e.urunKodu}</strong>
                      {e.urunAdi ? <span className="fatura-stok-uyari-ad">{e.urunAdi}</span> : null}
                    </div>
                  </td>
                  <td className="fatura-sayi">{sayiFormatla(e.mevcut)}</td>
                  <td className="fatura-sayi">{sayiFormatla(e.istenen)}</td>
                  <td className="fatura-sayi fatura-sayi--eksi">{sayiFormatla(e.eksik)}</td>
                  <td className="fatura-sayi">
                    <input
                      className="fatura-stok-uyari-girdi"
                      value={miktarlar[e.urunKodu] ?? ''}
                      onChange={(ev) =>
                        setMiktarlar((onceki) => ({ ...onceki, [e.urunKodu]: ev.target.value }))
                      }
                      inputMode="decimal"
                      disabled={islemde}
                    />
                    <span className="fatura-stok-uyari-birim">{e.birim}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SistemModal>
  );
}
