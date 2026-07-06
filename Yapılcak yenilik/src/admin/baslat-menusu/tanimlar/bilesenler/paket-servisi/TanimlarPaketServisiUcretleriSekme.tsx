import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaketServisUcretTablo } from '@/admin/baslat-menusu/tanimlar/bilesenler/paket-servisi/PaketServisUcretTablo';
import { PAKET_SERVIS_VARSAYILAN_KURALLAR } from '@/admin/baslat-menusu/tanimlar/paket-servisi-ucretleri/varsayilanVeri';
import {
  bosPaketServisKurali,
  ucretDegeriGecerli,
  type PaketServisUcretAlan,
  type PaketServisUcretKurali,
  type PaketUcretTipi,
} from '@/admin/baslat-menusu/tanimlar/paket-servisi-ucretleri/tipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function sonrakiId(liste: PaketServisUcretKurali[]) {
  return liste.reduce((max, k) => Math.max(max, k.id), 0) + 1;
}

export function TanimlarPaketServisiUcretleriSekme({
  onKirliDegisti,
}: {
  onKirliDegisti?: (kirli: boolean) => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kurallar, setKurallar] = useState<PaketServisUcretKurali[]>(() =>
    PAKET_SERVIS_VARSAYILAN_KURALLAR.map((k) => ({ ...k }))
  );
  const [sonKayitli, setSonKayitli] = useState<PaketServisUcretKurali[]>(() =>
    PAKET_SERVIS_VARSAYILAN_KURALLAR.map((k) => ({ ...k }))
  );
  const [seciliId, setSeciliId] = useState<number | null>(1);

  const kirli = useMemo(() => JSON.stringify(kurallar) !== JSON.stringify(sonKayitli), [kurallar, sonKayitli]);

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const kuralDegistir = useCallback((id: number, alan: PaketServisUcretAlan, deger: string) => {
    setKurallar((onceki) => onceki.map((k) => (k.id === id ? { ...k, [alan]: deger } : k)));
  }, []);

  const ucretTipiDegistir = useCallback((id: number, tip: PaketUcretTipi) => {
    setKurallar((onceki) =>
      onceki.map((k) => {
        if (k.id !== id) return k;
        return { ...k, ucretTipi: tip };
      })
    );
  }, []);

  const yeniKural = useCallback(() => {
    const id = sonrakiId(kurallar);
    setKurallar((onceki) => [...onceki, bosPaketServisKurali(id)]);
    setSeciliId(id);
  }, [kurallar]);

  const kuralSil = useCallback(() => {
    if (seciliId == null) return;
    setKurallar((onceki) => {
      const yeni = onceki.filter((k) => k.id !== seciliId);
      setSeciliId(yeni.length === 0 ? null : yeni[0]?.id ?? null);
      return yeni;
    });
    basariBildir('Kural silindi.');
  }, [seciliId, basariBildir]);

  const kaydet = useCallback(() => {
    if (kurallar.length === 0) {
      hataBildir('En az bir paket servisi kuralı ekleyin');
      return;
    }

    for (const k of kurallar) {
      const limit = Number(k.tutaraKadar.replace(',', '.'));
      if (!k.tutaraKadar.trim() || Number.isNaN(limit) || limit < 0) {
        hataBildir('Tüm satırlarda geçerli bir tutar limiti girilmelidir');
        return;
      }
      if (!k.servisUrunu.trim()) {
        hataBildir('Tüm satırlarda servis ürün adı girilmelidir');
        return;
      }
      if (!ucretDegeriGecerli(k.ucretDegeri)) {
        hataBildir(`Geçersiz servis ücreti değeri: "${k.ucretDegeri}"`);
        return;
      }
    }

    const sirali = [...kurallar].sort(
      (a, b) => Number(a.tutaraKadar.replace(',', '.')) - Number(b.tutaraKadar.replace(',', '.'))
    );
    setKurallar(sirali);
    setSonKayitli(sirali.map((k) => ({ ...k })));
    basariBildir('Paket servisi ücretleri kaydedildi.');
  }, [kurallar, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniKural, sil: kuralSil },
    {
      kaydet: kirli,
      ekle: true,
      sil: seciliId != null,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  return (
    <div className="ap-tanimlar-paket-sekme">
      <p className="ap-muted mb-3 text-xs">
        Sipariş tutarına göre uygulanacak paket servisi kurallarını tanımlayın. Servis ürününü
        kendiniz yazın; ücret tipini <strong className="ap-heading">Tutar</strong> veya{' '}
        <strong className="ap-heading">Oran</strong> ile seçin.
      </p>

      <PaketServisUcretTablo
        kurallar={kurallar}
        seciliId={seciliId}
        onSatirSec={setSeciliId}
        onKuralDegistir={kuralDegistir}
        onUcretTipiDegistir={ucretTipiDegistir}
      />
    </div>
  );
}
