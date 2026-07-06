import { useMemo } from 'react';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import { subeTipEtiketi, type MasterSube } from '@/admin/baslat-menusu/master/subeler/api';
import {
  MasterAgacArac,
  MasterAgacBos,
  MasterAgacDugum,
  MasterAgacKart,
  useAgacAcik,
} from '@/admin/baslat-menusu/master/bilesenler/agac/MasterAgacArac';

interface SubeAgacGorunumuProps {
  subeler: MasterSube[];
  firmalar: MasterFirma[];
  arama: string;
  filtre: 'tumu' | 'aktif' | 'pasif';
  firmaFiltre: number | '';
}

function firmaEtiketi(f: MasterFirma) {
  return f.tabelaAdi ?? f.unvan;
}

export function SubeAgacGorunumu({ subeler, firmalar, arama, filtre, firmaFiltre }: SubeAgacGorunumuProps) {
  const { toggle, tumunuKapat, acikMi, acikIdler } = useAgacAcik();

  const filtreliSubeler = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return subeler.filter((s) => {
      if (filtre === 'aktif' && !s.aktif) return false;
      if (filtre === 'pasif' && s.aktif) return false;
      if (firmaFiltre !== '' && s.firmaId !== firmaFiltre) return false;
      if (!q) return true;
      return (
        s.subeAdi.toLowerCase().includes(q) ||
        s.firmaUnvan.toLowerCase().includes(q) ||
        (s.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        (s.il?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [subeler, arama, filtre, firmaFiltre]);

  const firmaGruplari = useMemo(() => {
    const map = new Map<number, MasterSube[]>();
    for (const s of filtreliSubeler) {
      const mevcut = map.get(s.firmaId) ?? [];
      mevcut.push(s);
      map.set(s.firmaId, mevcut);
    }
    return Array.from(map.entries())
      .map(([firmaId, liste]) => {
        const firma = firmalar.find((f) => f.id === firmaId);
        return {
          firmaId,
          firmaUnvan: firma ? firmaEtiketi(firma) : liste[0]?.firmaTabela ?? liste[0]?.firmaUnvan ?? 'Firma',
          firmaAlt: firma?.unvan,
          firmaAktif: firma?.aktif ?? true,
          subeler: liste,
        };
      })
      .sort((a, b) => a.firmaUnvan.localeCompare(b.firmaUnvan, 'tr'));
  }, [filtreliSubeler, firmalar]);

  return (
    <MasterAgacArac
      baslik="Firma → Şube"
      aciklama="Firmalara tıklayarak bağlı şube lokasyonlarını görüntüleyebilirsiniz."
      onTumunuKapat={tumunuKapat}
      acikSayisi={acikIdler.size}
    >
      {firmaGruplari.length === 0 ? (
        <MasterAgacBos mesaj="Filtreye uygun şube bulunamadı." />
      ) : (
        firmaGruplari.map((grup) => {
          const id = `firma-${grup.firmaId}`;
          return (
            <MasterAgacKart
              key={grup.firmaId}
              id={id}
              acik={acikMi(id)}
              onToggle={() => toggle(id)}
              ikon="🏢"
              baslik={grup.firmaUnvan}
              altMetin={grup.firmaAlt && grup.firmaAlt !== grup.firmaUnvan ? grup.firmaAlt : undefined}
              sayacEtiket={`${grup.subeler.length} Şube`}
              aktif={grup.firmaAktif}
            >
              {grup.subeler.length === 0 ? (
                <MasterAgacBos mesaj="Bu firmaya bağlı şube bulunmamaktadır." />
              ) : (
                <div className="ap-master-agac-alt-liste">
                  {grup.subeler.map((s) => (
                    <MasterAgacDugum
                      key={s.id}
                      ikon="📍"
                      baslik={s.subeAdi}
                      altMetin={`${subeTipEtiketi(s.subeTipi)}${s.il ? ` · ${s.il}` : ''}${s.eposta ? ` · ${s.eposta}` : ''}`}
                      aktif={s.aktif}
                      girinti
                    />
                  ))}
                </div>
              )}
            </MasterAgacKart>
          );
        })
      )}
    </MasterAgacArac>
  );
}
