import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterDuzenlenebilirHucre } from '@/admin/baslat-menusu/master/bilesenler/MasterDuzenlenebilirHucre';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { lisansTabloSutunTanimiBul } from '@/admin/baslat-menusu/master/lisanslar/lisansTabloSutunlari';
import {
  tarihGoster,
  type LisansFormGirdi,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterPaket } from '@/admin/baslat-menusu/master/paketler/api';

export type LisansDuzenlenebilirAlan = keyof Pick<
  LisansFormGirdi,
  'paketId' | 'baslangicTarihi' | 'bitisTarihi'
>;

export interface AktifLisansHucre {
  lisansId: number;
  alan: LisansDuzenlenebilirAlan;
}

function isoTarih(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

interface LisansExcelTabloProps {
  lisanslar: MasterLisans[];
  paketler: MasterPaket[];
  seciliId: number | null;
  aktifHucre: AktifLisansHucre | null;
  hucreTaslak: string;
  hucreKaydediliyor: boolean;
  islemId: number | null;
  gorunurSutunlar: string[];
  onSatirSec: (id: number) => void;
  onHucreBaslat: (l: MasterLisans, alan: LisansDuzenlenebilirAlan) => void;
  onHucreTaslak: (v: string) => void;
  onHucreKaydet: (deger?: string) => void;
  onHucreIptal: () => void;
  onDurumDegistir: (l: MasterLisans, aktif: boolean) => void;
  onPanelDuzenle: (l: MasterLisans) => void;
}

export function LisansExcelTablo({
  lisanslar,
  paketler,
  seciliId,
  aktifHucre,
  hucreTaslak,
  hucreKaydediliyor,
  islemId,
  gorunurSutunlar,
  onSatirSec,
  onHucreBaslat,
  onHucreTaslak,
  onHucreKaydet,
  onHucreIptal,
  onDurumDegistir,
  onPanelDuzenle,
}: LisansExcelTabloProps) {
  const aktifPaketler = paketler.filter((p) => p.aktif);
  const paketSecenekleri = aktifPaketler.map((p) => ({
    value: p.id,
    label: `${p.paketAdi} — ₺${p.fiyat}`,
  }));

  function sutunBaslik(id: string) {
    return lisansTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function hucre(
    l: MasterLisans,
    alan: LisansDuzenlenebilirAlan,
    deger: string,
    opts?: {
      tip?: 'text' | 'email' | 'select' | 'tel' | 'number' | 'date';
      secenekler?: { value: string | number; label: string }[];
      gosterim?: React.ReactNode;
      placeholder?: string;
    }
  ) {
    return (
      <MasterDuzenlenebilirHucre
        key={alan}
        duzenleniyor={aktifHucre?.lisansId === l.id && aktifHucre.alan === alan}
        deger={deger}
        taslak={hucreTaslak}
        onTaslakDegistir={onHucreTaslak}
        onDuzenleBaslat={() => onHucreBaslat(l, alan)}
        onKaydet={onHucreKaydet}
        onIptal={onHucreIptal}
        kaydediliyor={hucreKaydediliyor}
        tip={opts?.tip}
        secenekler={opts?.secenekler}
        placeholder={opts?.placeholder}
        gosterim={opts?.gosterim}
      />
    );
  }

  function sutunHucre(l: MasterLisans, sutunId: string) {
    switch (sutunId) {
      case 'firma':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
            <span className="ap-heading font-medium">{l.firmaTabela ?? l.firmaUnvan}</span>
            {l.firmaTabela && l.firmaUnvan && l.firmaTabela !== l.firmaUnvan && (
              <span className="ap-muted block text-xs">{l.firmaUnvan}</span>
            )}
          </td>
        );
      case 'paketId':
        return hucre(l, 'paketId', String(l.paketId), {
          tip: 'select',
          secenekler: paketSecenekleri,
          gosterim: <span className="ap-master-etiket ap-master-etiket-mor">{l.paketAdi}</span>,
        });
      case 'baslangicTarihi':
        return hucre(l, 'baslangicTarihi', isoTarih(l.baslangicTarihi), {
          tip: 'date',
          gosterim: <span className="ap-master-excel-hucre-tarih">{tarihGoster(l.baslangicTarihi)}</span>,
        });
      case 'bitisTarihi':
        return hucre(l, 'bitisTarihi', isoTarih(l.bitisTarihi), {
          tip: 'date',
          placeholder: 'Süresiz',
          gosterim: (
            <span className="ap-master-excel-hucre-tarih">
              {l.bitisTarihi ? tarihGoster(l.bitisTarihi) : <span className="ap-muted">Süresiz</span>}
            </span>
          ),
        });
      case 'durum':
        return null;
      case 'aktif':
        return (
          <td
            key={sutunId}
            className="ap-master-excel-hucre ap-master-tablo-toggle-hucre"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ap-master-toggle-mini">
              <DurumAnahtari
                etiket={l.aktif ? 'Aktif lisans' : 'Pasif lisans'}
                acik={l.aktif}
                devreDisi={islemId === l.id}
                onChange={(v) => onDurumDegistir(l, v)}
                renk={l.aktif ? 'yesil' : 'turuncu'}
                sadeceToggle
              />
            </div>
          </td>
        );
      case 'kayitTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-tarih">
            {tarihGoster(l.kayitTarihi)}
          </td>
        );
      case 'guncellemeTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-tarih">
            {tarihGoster(l.guncellemeTarihi)}
          </td>
        );
      default:
        return null;
    }
  }

  return (
    <div className="ap-master-excel-wrap">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              {gorunurSutunlar.map((id) => (
                <th key={id}>{sutunBaslik(id)}</th>
              ))}
              <th className="ap-master-excel-th-aksiyon" />
            </tr>
          </thead>
          <tbody>
            {lisanslar.map((l) => (
              <tr
                key={l.id}
                className={`${seciliId === l.id ? 'ap-master-excel-satir-secili' : ''} ${
                  !l.aktif || l.durum === 'pasif' ? 'ap-master-tablo-pasif' : ''
                } ${l.durum === 'yakinda' ? 'ap-master-excel-satir-uyari' : ''}`}
                onClick={() => onSatirSec(l.id)}
              >
                {gorunurSutunlar.map((id) => sutunHucre(l, id))}
                <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn"
                    onClick={() => onPanelDuzenle(l)}
                    aria-label="Lisans düzenle"
                    title="Tüm alanları düzenle"
                  >
                    <DuzenleIkonu />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
