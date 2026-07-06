import {
  YAZICI_ONERILERI,
  yeniBasitKural,
  type BasitYaziciKurali,
} from '@/admin/baslat-menusu/yazici-tanimlari/tipler';
import { TumuAlanInput } from '@/admin/baslat-menusu/yazici-tanimlari/bilesenler/TumuAlanInput';

interface BasitYaziciTablosuProps {
  aciklama: string;
  varsayilanYazici?: string;
  kurallar: BasitYaziciKurali[];
  seciliId: string | null;
  onSec: (id: string) => void;
  onDegistir: (kurallar: BasitYaziciKurali[]) => void;
}

export function BasitYaziciTablosu({
  aciklama,
  varsayilanYazici = '',
  kurallar,
  seciliId,
  onSec,
  onDegistir,
}: BasitYaziciTablosuProps) {
  const guncelle = (id: string, parca: Partial<BasitYaziciKurali>) => {
    onDegistir(kurallar.map((k) => (k.id === id ? { ...k, ...parca } : k)));
  };

  const ekle = () => {
    const yeni = yeniBasitKural(varsayilanYazici);
    onDegistir([...kurallar, yeni]);
    onSec(yeni.id);
  };

  const sil = (id: string) => {
    const yeni = kurallar.filter((k) => k.id !== id);
    onDegistir(yeni);
    if (seciliId === id) onSec(yeni[0]?.id ?? '');
  };

  return (
    <div className="ap-yazici-tablo-bolum">
      <div className="ap-yazici-tablo-ust">
        <p className="ap-muted text-xs">{aciklama}</p>
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={ekle}>
          + Kural Ekle
        </button>
      </div>

      {kurallar.length === 0 ? (
        <p className="ap-yazici-bos">Henüz kural tanımlanmadı. Ekleyerek başlayın.</p>
      ) : (
        <ul className="ap-yazici-kural-liste">
          {kurallar.map((k) => (
            <li
              key={k.id}
              className={`ap-yazici-kural-kart ap-yazici-kural-kart-basit ${seciliId === k.id ? 'ap-yazici-kural-kart-secili' : ''}`}
              onClick={() => onSec(k.id)}
            >
              <div className="ap-yazici-kural-alanlar ap-yazici-kural-alanlar-basit">
                <TumuAlanInput
                  etiket="Bilgisayar"
                  deger={k.bilgisayar}
                  onDegistir={(v) => guncelle(k.id, { bilgisayar: v })}
                />
                <TumuAlanInput
                  etiket="Garson"
                  deger={k.garson}
                  onDegistir={(v) => guncelle(k.id, { garson: v })}
                />
                <TumuAlanInput
                  etiket="Yazıcı"
                  deger={k.yazici}
                  placeholder="Örn. PUSULA"
                  onDegistir={(v) => guncelle(k.id, { yazici: v })}
                  oneriler={YAZICI_ONERILERI}
                />
              </div>
              <button
                type="button"
                className="ap-yazici-kural-sil"
                onClick={(e) => {
                  e.stopPropagation();
                  sil(k.id);
                }}
                title="Kuralı sil"
                aria-label="Kuralı sil"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
