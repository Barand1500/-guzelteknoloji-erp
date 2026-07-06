import { useMemo } from 'react';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import {
  MasterAgacArac,
  MasterAgacBos,
  MasterAgacDugum,
  MasterAgacKart,
  useAgacAcik,
} from '@/admin/baslat-menusu/master/bilesenler/agac/MasterAgacArac';

interface BayiAgacGorunumuProps {
  bayiler: MasterBayi[];
  arama: string;
  filtre: 'tumu' | 'aktif' | 'pasif';
}

function altBayileriBul(bayiler: MasterBayi[], ustId: number): MasterBayi[] {
  return bayiler.filter((b) => b.ustId === ustId);
}

function kokBayiler(bayiler: MasterBayi[]): MasterBayi[] {
  const idSet = new Set(bayiler.map((b) => b.id));
  return bayiler.filter((b) => b.ustId == null || !idSet.has(b.ustId));
}

function BayiAltAgaci({ bayi, tumBayiler, derinlik = 0 }: { bayi: MasterBayi; tumBayiler: MasterBayi[]; derinlik?: number }) {
  const altlar = altBayileriBul(tumBayiler, bayi.id);
  if (altlar.length === 0) return null;

  return (
    <div className="ap-master-agac-alt-liste">
      {altlar.map((alt) => (
        <div key={alt.id}>
          <MasterAgacDugum
            ikon="🏢"
            baslik={alt.unvan}
            altMetin={alt.eposta ?? alt.il ?? undefined}
            aktif={alt.aktif}
            girinti={derinlik > 0}
          />
          <BayiAltAgaci bayi={alt} tumBayiler={tumBayiler} derinlik={derinlik + 1} />
        </div>
      ))}
    </div>
  );
}

export function BayiAgacGorunumu({ bayiler, arama, filtre }: BayiAgacGorunumuProps) {
  const { toggle, tumunuKapat, acikMi, acikIdler } = useAgacAcik();

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return bayiler.filter((b) => {
      if (filtre === 'aktif' && !b.aktif) return false;
      if (filtre === 'pasif' && b.aktif) return false;
      if (!q) return true;
      return (
        b.unvan.toLowerCase().includes(q) ||
        (b.eposta?.toLowerCase().includes(q) ?? false) ||
        (b.ustUnvan?.toLowerCase().includes(q) ?? false) ||
        (b.il?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [bayiler, arama, filtre]);

  const kokler = useMemo(() => kokBayiler(liste), [liste]);

  return (
    <MasterAgacArac
      baslik="Bayi Hiyerarşisi"
      aciklama="Bayilere tıklayarak alt bayi ağını görüntüleyebilirsiniz."
      onTumunuKapat={tumunuKapat}
      acikSayisi={acikIdler.size}
    >
      {kokler.length === 0 ? (
        <MasterAgacBos mesaj="Filtreye uygun bayi bulunamadı." />
      ) : (
        kokler.map((bayi) => {
          const altSayisi = altBayileriBul(liste, bayi.id).length;
          const id = `bayi-${bayi.id}`;
          return (
            <MasterAgacKart
              key={bayi.id}
              id={id}
              acik={acikMi(id)}
              onToggle={() => toggle(id)}
              ikon="🏢"
              baslik={bayi.unvan}
              altMetin={bayi.eposta ?? bayi.il ?? undefined}
              sayacEtiket={`${bayi.firmaSayisi} Firma${altSayisi > 0 ? ` · ${altSayisi} alt bayi` : ''}`}
              aktif={bayi.aktif}
            >
              {altSayisi > 0 ? (
                <BayiAltAgaci bayi={bayi} tumBayiler={liste} />
              ) : (
                <MasterAgacBos mesaj="Bu bayinin alt bayisi bulunmamaktadır." />
              )}
            </MasterAgacKart>
          );
        })
      )}
    </MasterAgacArac>
  );
}
