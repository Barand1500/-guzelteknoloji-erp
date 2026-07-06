import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterDuzenlenebilirHucre } from '@/admin/baslat-menusu/master/bilesenler/MasterDuzenlenebilirHucre';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { iskontoGoster } from '@/araclar/iskontoYardimci';
import {
  firmaTabloSutunTanimiBul,
} from '@/admin/baslat-menusu/master/firmalar/firmaTabloSutunlari';
import {
  lisansDurumEtiketi,
  type FirmaFormGirdi,
  type MasterFirma,
} from '@/admin/baslat-menusu/master/firmalar/api';

export type FirmaDuzenlenebilirAlan = keyof Pick<
  FirmaFormGirdi,
  | 'tabelaAdi'
  | 'unvan'
  | 'bayiId'
  | 'il'
  | 'ilce'
  | 'eposta'
  | 'telefon'
  | 'gsm'
  | 'vergiDairesi'
  | 'vergiNo'
  | 'iskonto'
>;

export interface AktifHucre {
  firmaId: number;
  alan: FirmaDuzenlenebilirAlan;
}

interface FirmaExcelTabloProps {
  firmalar: MasterFirma[];
  bayiler: MasterBayi[];
  seciliId: number | null;
  aktifHucre: AktifHucre | null;
  hucreTaslak: string;
  hucreKaydediliyor: boolean;
  islemId: number | null;
  gorunurSutunlar: string[];
  onSatirSec: (id: number) => void;
  onHucreBaslat: (firma: MasterFirma, alan: FirmaDuzenlenebilirAlan) => void;
  onHucreTaslak: (v: string) => void;
  onHucreKaydet: (deger?: string) => void;
  onHucreIptal: () => void;
  onDurumDegistir: (firma: MasterFirma, aktif: boolean) => void;
  onPanelDuzenle: (firma: MasterFirma) => void;
}

export function FirmaExcelTablo({
  firmalar,
  bayiler,
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
}: FirmaExcelTabloProps) {
  const aktifBayiler = bayiler.filter((b) => b.aktif);
  const bayiSecenekleri = aktifBayiler.map((b) => ({ value: b.id, label: b.unvan }));

  function sutunBaslik(id: string) {
    return firmaTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function hucre(
    f: MasterFirma,
    alan: FirmaDuzenlenebilirAlan,
    deger: string,
    opts?: {
      tip?: 'text' | 'email' | 'select' | 'tel' | 'number';
      secenekler?: { value: string | number; label: string }[];
      gosterim?: React.ReactNode;
      placeholder?: string;
    }
  ) {
    return (
      <MasterDuzenlenebilirHucre
        key={alan}
        duzenleniyor={aktifHucre?.firmaId === f.id && aktifHucre.alan === alan}
        deger={deger}
        taslak={hucreTaslak}
        onTaslakDegistir={onHucreTaslak}
        onDuzenleBaslat={() => onHucreBaslat(f, alan)}
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

  function sutunHucre(f: MasterFirma, sutunId: string) {
    switch (sutunId) {
      case 'tabelaAdi':
        return hucre(f, 'tabelaAdi', f.tabelaAdi ?? '', {
          gosterim: f.tabelaAdi ? <span className="ap-heading font-medium">{f.tabelaAdi}</span> : undefined,
        });
      case 'unvan':
        return hucre(f, 'unvan', f.unvan, {
          gosterim: <span className="font-medium">{f.unvan}</span>,
        });
      case 'bayiId':
        return hucre(f, 'bayiId', String(f.bayiId), {
          tip: 'select',
          secenekler: bayiSecenekleri,
          gosterim: <span className="ap-master-etiket">{f.bayiUnvan}</span>,
        });
      case 'il':
        return hucre(f, 'il', f.il ?? '');
      case 'ilce':
        return hucre(f, 'ilce', f.ilce ?? '');
      case 'eposta':
        return hucre(f, 'eposta', f.eposta ?? '', { tip: 'email' });
      case 'telefon':
        return hucre(f, 'telefon', f.telefon ?? '', { tip: 'tel' });
      case 'gsm':
        return hucre(f, 'gsm', f.gsm ?? '', { tip: 'tel', placeholder: '05XX XXX XX XX' });
      case 'vergiDairesi':
        return hucre(f, 'vergiDairesi', f.vergiDairesi ?? '');
      case 'vergiNo':
        return hucre(f, 'vergiNo', f.vergiNo ?? '', { placeholder: 'En fazla 10 hane' });
      case 'iskonto':
        return hucre(f, 'iskonto', f.iskonto != null ? String(f.iskonto) : '', {
          gosterim:
            f.iskonto != null ? (
              <span className="font-mono text-xs">{iskontoGoster(f.iskonto)}</span>
            ) : undefined,
          placeholder: 'ör. 5 veya 20+20',
        });
      case 'subeSayisi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt ap-master-excel-hucre-sayi">
            {f.subeSayisi}
          </td>
        );
      case 'lisansDurum':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-excel-hucre-salt">
            <span
              className={`ap-master-lisans-badge ${
                f.lisansDurum === 'aktif'
                  ? 'ap-master-lisans-aktif'
                  : f.lisansDurum === 'yakinda'
                    ? 'ap-master-lisans-uyari'
                    : ''
              }`}
            >
              {lisansDurumEtiketi(f.lisansDurum)}
            </span>
          </td>
        );
      case 'aktif':
        return (
          <td
            key={sutunId}
            className="ap-master-excel-hucre ap-master-tablo-toggle-hucre"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ap-master-toggle-mini">
              <DurumAnahtari
                etiket={f.aktif ? 'Aktif firma' : 'Pasif firma'}
                acik={f.aktif}
                devreDisi={islemId === f.id}
                onChange={(v) => onDurumDegistir(f, v)}
                renk={f.aktif ? 'yesil' : 'turuncu'}
                sadeceToggle
              />
            </div>
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
            {firmalar.map((f) => (
              <tr
                key={f.id}
                className={`${seciliId === f.id ? 'ap-master-excel-satir-secili' : ''} ${
                  !f.aktif ? 'ap-master-tablo-pasif' : ''
                }`}
                onClick={() => onSatirSec(f.id)}
              >
                {gorunurSutunlar.map((id) => sutunHucre(f, id))}
                <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-master-tablo-ikon-btn"
                    onClick={() => onPanelDuzenle(f)}
                    aria-label="Firma düzenle"
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
