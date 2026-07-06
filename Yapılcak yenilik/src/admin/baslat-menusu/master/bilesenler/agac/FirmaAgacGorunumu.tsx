import { useMemo } from 'react';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import { lisansDurumEtiketi, tarihGoster, type MasterLisans } from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterSube } from '@/admin/baslat-menusu/master/subeler/api';
import { subeTipEtiketi } from '@/admin/baslat-menusu/master/subeler/api';
import {
  MasterAgacArac,
  MasterAgacBos,
  MasterAgacDugum,
  MasterAgacKart,
  MasterAgacPaketRozet,
  useAgacAcik,
} from '@/admin/baslat-menusu/master/bilesenler/agac/MasterAgacArac';

interface FirmaAgacGorunumuProps {
  firmalar: MasterFirma[];
  bayiler: MasterBayi[];
  subeler: MasterSube[];
  lisanslar: MasterLisans[];
  arama: string;
  filtre: 'tumu' | 'aktif' | 'pasif';
  bayiFiltre: number | '';
}

function firmaEtiketi(f: MasterFirma) {
  return f.tabelaAdi ?? f.unvan;
}

export function FirmaAgacGorunumu({
  firmalar,
  bayiler,
  subeler,
  lisanslar,
  arama,
  filtre,
  bayiFiltre,
}: FirmaAgacGorunumuProps) {
  const { toggle, tumunuKapat, acikMi, acikIdler } = useAgacAcik();

  const filtreliFirmalar = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return firmalar.filter((f) => {
      if (filtre === 'aktif' && !f.aktif) return false;
      if (filtre === 'pasif' && f.aktif) return false;
      if (bayiFiltre !== '' && f.bayiId !== bayiFiltre) return false;
      if (!q) return true;
      return (
        f.unvan.toLowerCase().includes(q) ||
        (f.tabelaAdi?.toLowerCase().includes(q) ?? false) ||
        f.bayiUnvan.toLowerCase().includes(q)
      );
    });
  }, [firmalar, arama, filtre, bayiFiltre]);

  const bayiGruplari = useMemo(() => {
    const map = new Map<number, MasterFirma[]>();
    for (const f of filtreliFirmalar) {
      const mevcut = map.get(f.bayiId) ?? [];
      mevcut.push(f);
      map.set(f.bayiId, mevcut);
    }
    return Array.from(map.entries())
      .map(([bayiId, liste]) => {
        const bayi = bayiler.find((b) => b.id === bayiId);
        return { bayiId, bayiUnvan: bayi?.unvan ?? 'Bayi', bayiAktif: bayi?.aktif ?? true, firmalar: liste };
      })
      .sort((a, b) => a.bayiUnvan.localeCompare(b.bayiUnvan, 'tr'));
  }, [filtreliFirmalar, bayiler]);

  return (
    <MasterAgacArac
      baslik="Bayi → Firma → Şube"
      aciklama="Bayilere tıklayarak firmalarını, paketlerini ve şubelerini görüntüleyebilirsiniz."
      onTumunuKapat={tumunuKapat}
      acikSayisi={acikIdler.size}
    >
      {bayiGruplari.length === 0 ? (
        <MasterAgacBos mesaj="Filtreye uygun firma bulunamadı." />
      ) : (
        bayiGruplari.map((grup) => {
          const bayiId = `bayi-${grup.bayiId}`;
          return (
            <MasterAgacKart
              key={grup.bayiId}
              id={bayiId}
              acik={acikMi(bayiId)}
              onToggle={() => toggle(bayiId)}
              ikon="🤝"
              baslik={grup.bayiUnvan}
              altMetin={`${grup.firmalar.length} müşteri firma`}
              sayacEtiket={`${grup.firmalar.length} Firma`}
              aktif={grup.bayiAktif}
            >
              {grup.firmalar.length === 0 ? (
                <MasterAgacBos mesaj="Bu bayinin firması bulunmamaktadır." />
              ) : (
                <div className="ap-master-agac-alt-liste">
                  {grup.firmalar.map((firma) => {
                    const firmaId = `firma-${firma.id}`;
                    const firmaSubeleri = subeler.filter((s) => s.firmaId === firma.id);
                    const firmaLisanslari = lisanslar.filter((l) => l.firmaId === firma.id);
                    return (
                      <div key={firma.id} className="ap-master-agac-firma-blok">
                        <MasterAgacKart
                          id={firmaId}
                          acik={acikMi(firmaId)}
                          onToggle={() => toggle(firmaId)}
                          ikon="🏢"
                          baslik={firmaEtiketi(firma)}
                          altMetin={firma.unvan !== firmaEtiketi(firma) ? firma.unvan : firma.eposta ?? undefined}
                          sayacEtiket={`${firmaSubeleri.length} Şube`}
                          aktif={firma.aktif}
                          vurgulu
                        >
                          {firmaLisanslari.length > 0 && (
                            <div className="ap-master-agac-paket-liste">
                              {firmaLisanslari.map((l) => (
                                <div key={l.id} className="ap-master-agac-paket-satir">
                                  <MasterAgacPaketRozet paketAdi={l.paketAdi} durum={l.durum} />
                                  <span className="ap-muted text-xs">
                                    {tarihGoster(l.baslangicTarihi)} — {l.bitisTarihi ? tarihGoster(l.bitisTarihi) : 'Süresiz'}
                                    {' · '}
                                    {lisansDurumEtiketi(l.durum)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {firmaSubeleri.length > 0 ? (
                            <div className="ap-master-agac-alt-liste">
                              {firmaSubeleri.map((s) => (
                                <MasterAgacDugum
                                  key={s.id}
                                  ikon="📍"
                                  baslik={s.subeAdi}
                                  altMetin={`${subeTipEtiketi(s.subeTipi)}${s.il ? ` · ${s.il}` : ''}`}
                                  aktif={s.aktif}
                                  girinti
                                />
                              ))}
                            </div>
                          ) : (
                            <MasterAgacBos mesaj="Bu firmaya bağlı şube bulunmamaktadır." />
                          )}
                          {firmaLisanslari.length === 0 && (
                            <p className="ap-muted mt-2 text-xs">Atanmış paket / lisans yok.</p>
                          )}
                        </MasterAgacKart>
                      </div>
                    );
                  })}
                </div>
              )}
            </MasterAgacKart>
          );
        })
      )}
    </MasterAgacArac>
  );
}
