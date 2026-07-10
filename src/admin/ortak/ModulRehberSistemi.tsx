import { useCallback, useEffect, useState } from 'react';
import { AdminRehberModal } from './AdminRehberModal';
import { modulRehberBul } from '@/admin/veri/adminModulRehberleri';
import { kisayolAyarlariOku } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { tooltipMetni } from '@/araclar/tooltipMetni';

interface ModulRehberSistemiProps {
  modulId: string;
  zorlaAcik?: boolean;
  onAcikDegisti?: (acik: boolean) => void;
  gizliButon?: boolean;
}

export function ModulRehberSistemi({ modulId, zorlaAcik, onAcikDegisti, gizliButon }: ModulRehberSistemiProps) {
  const [acik, setAcik] = useState(false);
  const { rehberModulId } = useAdminAksiyon();
  const etkinModulId = rehberModulId ?? modulId;
  const rehber = modulRehberBul(etkinModulId);

  const ac = useCallback(() => {
    setAcik(true);
    onAcikDegisti?.(true);
  }, [onAcikDegisti]);

  const kapat = useCallback(() => {
    setAcik(false);
    onAcikDegisti?.(false);
  }, [onAcikDegisti]);

  useEffect(() => {
    if (zorlaAcik !== undefined) setAcik(zorlaAcik);
  }, [zorlaAcik]);

  useEffect(() => {
    setAcik(false);
    onAcikDegisti?.(false);
  }, [modulId, rehberModulId, onAcikDegisti]);

  return (
    <>
      {!gizliButon && (
        <button
          type="button"
          onClick={ac}
          className="ap-rehber-float"
          title={tooltipMetni(`Rehber (${kisayolAyarlariOku().rehber})`)}
          aria-label="Sayfa rehberini aç"
        >
          ?
        </button>
      )}

      <AdminRehberModal
        acik={acik}
        onKapat={kapat}
        baslik={rehber.baslik}
        altBaslik={rehber.altBaslik}
        bolumBaslik={rehber.bolumBaslik}
        kartlar={rehber.kartlar}
        ipucu={rehber.ipucu}
      />
    </>
  );
}
