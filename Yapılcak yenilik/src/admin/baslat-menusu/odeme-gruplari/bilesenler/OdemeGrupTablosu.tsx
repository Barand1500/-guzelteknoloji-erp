import {
  ODEME_GRUBU_ONERILERI,
  ODEME_YONTEMI_ONERILERI,
  UYGULAMA_ONERILERI,
  type OdemeGrupAlan,
  type OdemeGrupSatiri,
} from '@/admin/baslat-menusu/odeme-gruplari/tipler';
import { OneriInput } from '@/admin/baslat-menusu/odeme-gruplari/bilesenler/OneriInput';

interface OdemeGrupTablosuProps {
  satirlar: OdemeGrupSatiri[];
  seciliId: string | null;
  onSatirSec: (id: string) => void;
  onSatirDegistir: (id: string, alan: OdemeGrupAlan, deger: string) => void;
}

export function OdemeGrupTablosu({
  satirlar,
  seciliId,
  onSatirSec,
  onSatirDegistir,
}: OdemeGrupTablosuProps) {
  if (satirlar.length === 0) {
    return (
      <div className="ap-odeme-grup-bos">
        <p className="ap-muted text-sm">Henüz ödeme grubu tanımı yok.</p>
        <p className="ap-muted mt-1 text-xs">Alt çubuktan <strong className="ap-heading">Yeni Ekle</strong> ile satır ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="ap-master-excel-wrap ap-tanimlar-paket-tablo ap-odeme-grup-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Ödeme Grubu</th>
              <th>Ödeme Yöntemi</th>
              <th>Uygulama</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((s) => (
              <tr
                key={s.id}
                className={seciliId === s.id ? 'ap-master-excel-satir-secili' : ''}
                onClick={() => onSatirSec(s.id)}
              >
                <td className="ap-master-excel-hucre">
                  <OneriInput
                    deger={s.odemeGrubu}
                    oneriler={ODEME_GRUBU_ONERILERI}
                    placeholder="Örn. Nakit"
                    aria-label="Ödeme grubu"
                    onDegistir={(v) => onSatirDegistir(s.id, 'odemeGrubu', v)}
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <OneriInput
                    deger={s.odemeYontemi}
                    oneriler={ODEME_YONTEMI_ONERILERI}
                    placeholder="Örn. Kredi Kartı"
                    aria-label="Ödeme yöntemi"
                    onDegistir={(v) => onSatirDegistir(s.id, 'odemeYontemi', v)}
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <OneriInput
                    deger={s.uygulama}
                    oneriler={UYGULAMA_ONERILERI}
                    placeholder="Örn. Kasa"
                    aria-label="Uygulama"
                    onDegistir={(v) => onSatirDegistir(s.id, 'uygulama', v)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
