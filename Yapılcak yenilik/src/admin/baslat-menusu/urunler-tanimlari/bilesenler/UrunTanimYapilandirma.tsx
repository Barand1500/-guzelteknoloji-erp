import { useEffect, useState } from 'react';
import { AdminSekmeler } from '@/admin/ortak/AdminFormBilesenleri';
import { UrunSecenekPanel, UrunSecimPanel } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/UrunSecimPanelleri';
import type { UrunSecimSatiri, UrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

type YapilandirmaSekme = 'seviye1' | 'seviye2' | 'secenekler';

interface UrunTanimYapilandirmaProps {
  urun: UrunTanimi;
  onDegistir: (urun: UrunTanimi) => void;
}

function seviye1HazirMi(seviye1: UrunSecimSatiri[]) {
  return seviye1.some((s) => s.secim.trim().length > 0);
}

export function UrunTanimYapilandirma({ urun, onDegistir }: UrunTanimYapilandirmaProps) {
  const [sekme, setSekme] = useState<YapilandirmaSekme>('secenekler');

  const seviye1Hazir = seviye1HazirMi(urun.seviye1);
  const seviye1Sayisi = urun.seviye1.length;
  const seviye2Sayisi = urun.seviye2.length;
  const secenekSayisi = urun.secenekler.length;

  useEffect(() => {
    if (sekme === 'seviye2' && !seviye1Hazir) {
      setSekme('seviye1');
    }
  }, [sekme, seviye1Hazir]);

  const seviye1Degistir = (seviye1: UrunSecimSatiri[]) => {
    const hazir = seviye1HazirMi(seviye1);
    if (!hazir && urun.seviye2.length > 0) {
      onDegistir({ ...urun, seviye1, seviye2: [] });
      return;
    }
    onDegistir({ ...urun, seviye1 });
  };

  return (
    <section className="ap-urun-yapilandirma">
      <header className="ap-urun-yapilandirma-baslik">
        <div>
          <h2 className="ap-heading text-sm font-semibold">Menü Yapılandırması</h2>
          <p className="ap-muted text-xs">
            Önce 1. seviye seçimleri tanımlayın; ardından 2. seviye ve seçeneklere geçin
          </p>
        </div>
        <AdminSekmeler
          sekmeler={[
            { id: 'seviye1', etiket: `1. Seviye${seviye1Sayisi ? ` (${seviye1Sayisi})` : ''}` },
            {
              id: 'seviye2',
              etiket: `2. Seviye${seviye2Sayisi ? ` (${seviye2Sayisi})` : ''}`,
              pasif: !seviye1Hazir,
              pasifAciklama: '2. seviye için önce en az bir 1. seviye seçimi tanımlayın',
            },
            { id: 'secenekler', etiket: `Seçenekler${secenekSayisi ? ` (${secenekSayisi})` : ''}` },
          ]}
          aktif={sekme}
          onDegistir={setSekme}
        />
      </header>

      <div className="ap-urun-yapilandirma-icerik">
        {sekme === 'seviye1' && (
          <UrunSecimPanel
            baslik="1. Seviye Seçim"
            aciklama="Menü veya combo ürünlerde birinci seçim katmanı (ör. ana ürün seçimi)"
            satirlar={urun.seviye1}
            onDegistir={seviye1Degistir}
          />
        )}
        {sekme === 'seviye2' && seviye1Hazir && (
          <UrunSecimPanel
            baslik="2. Seviye Seçim"
            aciklama="1. seviye seçimine bağlı ikinci katman (porsiyon, lavaş vb.)"
            satirlar={urun.seviye2}
            onDegistir={(seviye2) => onDegistir({ ...urun, seviye2 })}
          />
        )}
        {sekme === 'secenekler' && <UrunSecenekPanel urun={urun} onDegistir={onDegistir} />}
      </div>
    </section>
  );
}
