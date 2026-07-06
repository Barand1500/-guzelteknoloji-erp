import { useMemo } from 'react';
import {
  lisansDurumEtiketi,
  tarihGoster,
  type LisansDurumKod,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterPaket } from '@/admin/baslat-menusu/master/paketler/api';
import { paketParaBirimiSembol } from '@/admin/baslat-menusu/master/paketler/paraBirimi';
import {
  MasterAgacArac,
  MasterAgacBos,
  MasterAgacKart,
  useAgacAcik,
} from '@/admin/baslat-menusu/master/bilesenler/agac/MasterAgacArac';

type LisansFiltre = 'tumu' | 'aktif' | 'yakinda' | 'pasif';

interface LisansAgacGorunumuProps {
  lisanslar: MasterLisans[];
  paketler: MasterPaket[];
  filtre: LisansFiltre;
}

const DURUM_SIRASI: LisansDurumKod[] = ['aktif', 'yakinda', 'pasif'];

const DURUM_IKON: Record<LisansDurumKod, string> = {
  aktif: '✅',
  yakinda: '⏳',
  pasif: '⏸️',
};

function paketOzet(p: MasterPaket): string {
  const sembol = paketParaBirimiSembol(p.paraBirimi);
  return `${p.subeSayisi} şube · ${p.personelSayisi} personel · ${p.masaSayisi} masa · ${sembol}${p.fiyat}`;
}

function firmaEtiketi(l: MasterLisans): string {
  return l.firmaTabela ?? l.firmaUnvan;
}

function durumSinifi(durum: LisansDurumKod): string {
  if (durum === 'aktif') return 'ap-master-agac-paket-aktif';
  if (durum === 'yakinda') return 'ap-master-agac-paket-uyari';
  return '';
}

function LisansFirmaSatiri({ lisans }: { lisans: MasterLisans }) {
  const tarihMetin = `${tarihGoster(lisans.baslangicTarihi)} — ${lisans.bitisTarihi ? tarihGoster(lisans.bitisTarihi) : 'Süresiz'}`;

  return (
    <div className="ap-master-agac-dugum ap-master-agac-dugum-girinti">
      <span className="ap-master-agac-dugum-cizgi" aria-hidden />
      <span className="ap-master-agac-dugum-ikon" aria-hidden>
        🏢
      </span>
      <div className="ap-master-agac-dugum-metin min-w-0">
        <span className="block truncate text-sm font-medium">{firmaEtiketi(lisans)}</span>
        <span className="ap-muted block truncate text-xs">{tarihMetin}</span>
      </div>
      <span className={`ap-master-agac-paket shrink-0 ${durumSinifi(lisans.durum)}`}>
        {lisansDurumEtiketi(lisans.durum)}
      </span>
    </div>
  );
}

export function LisansAgacGorunumu({ lisanslar, paketler, filtre }: LisansAgacGorunumuProps) {
  const { toggle, tumunuKapat, acikMi, acikIdler } = useAgacAcik();

  const gorunurDurumlar = useMemo(
    () => (filtre === 'tumu' ? DURUM_SIRASI : DURUM_SIRASI.filter((d) => d === filtre)),
    [filtre]
  );

  const paketGruplari = useMemo(() => {
    const map = new Map<number, MasterLisans[]>();
    for (const l of lisanslar) {
      const mevcut = map.get(l.paketId) ?? [];
      mevcut.push(l);
      map.set(l.paketId, mevcut);
    }

    return Array.from(map.entries())
      .map(([paketId, liste]) => {
        const paket = paketler.find((p) => p.id === paketId);
        const durumGruplari = gorunurDurumlar
          .map((durum) => ({
            durum,
            lisanslar: liste.filter((l) => l.durum === durum).sort((a, b) => firmaEtiketi(a).localeCompare(firmaEtiketi(b), 'tr')),
          }))
          .filter((g) => g.lisanslar.length > 0);

        return {
          paketId,
          paketAdi: paket?.paketAdi ?? liste[0]?.paketAdi ?? 'Paket',
          paket,
          toplam: liste.length,
          durumGruplari,
        };
      })
      .filter((g) => g.durumGruplari.length > 0)
      .sort((a, b) => a.paketAdi.localeCompare(b.paketAdi, 'tr'));
  }, [lisanslar, paketler, gorunurDurumlar]);

  return (
    <MasterAgacArac
      baslik="Paket → Durum → Firma"
      aciklama="Paketlere tıklayarak aktif, yakında bitecek ve pasif lisansları firma bazında inceleyebilirsiniz."
      onTumunuKapat={tumunuKapat}
      acikSayisi={acikIdler.size}
    >
      {paketGruplari.length === 0 ? (
        <MasterAgacBos mesaj="Filtreye uygun lisans bulunamadı." />
      ) : (
        paketGruplari.map((grup) => {
          const paketId = `lisans-paket-${grup.paketId}`;
          return (
            <MasterAgacKart
              key={grup.paketId}
              id={paketId}
              acik={acikMi(paketId)}
              onToggle={() => toggle(paketId)}
              ikon="📦"
              baslik={grup.paketAdi}
              altMetin={grup.paket ? paketOzet(grup.paket) : undefined}
              sayacEtiket={`${grup.toplam} lisans`}
              aktif={grup.paket?.aktif ?? true}
            >
              <div className="ap-master-agac-alt-liste">
                {grup.durumGruplari.map((durumGrubu) => {
                  const durumId = `${paketId}-durum-${durumGrubu.durum}`;
                  return (
                    <div key={durumGrubu.durum} className="ap-master-agac-firma-blok">
                      <MasterAgacKart
                        id={durumId}
                        acik={acikMi(durumId)}
                        onToggle={() => toggle(durumId)}
                        ikon={DURUM_IKON[durumGrubu.durum]}
                        baslik={lisansDurumEtiketi(durumGrubu.durum)}
                        sayacEtiket={`${durumGrubu.lisanslar.length} firma`}
                        aktif={durumGrubu.durum === 'aktif'}
                        vurgulu={durumGrubu.durum === 'yakinda'}
                      >
                        <div className="ap-master-agac-alt-liste">
                          {durumGrubu.lisanslar.map((l) => (
                            <LisansFirmaSatiri key={l.id} lisans={l} />
                          ))}
                        </div>
                      </MasterAgacKart>
                    </div>
                  );
                })}
              </div>
            </MasterAgacKart>
          );
        })
      )}
    </MasterAgacArac>
  );
}
