import {
  MUTFAK_EKRAN_ONERILERI,
  YAZICI_ONERILERI,
  yeniMutfakKurali,
  type MutfakYaziciKurali,
} from '@/admin/baslat-menusu/yazici-tanimlari/tipler';
import { URUN_GRUPLARI } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';
import { TumuAlanInput } from '@/admin/baslat-menusu/yazici-tanimlari/bilesenler/TumuAlanInput';

interface MutfakYaziciTablosuProps {
  kurallar: MutfakYaziciKurali[];
  seciliId: string | null;
  onSec: (id: string) => void;
  onDegistir: (kurallar: MutfakYaziciKurali[]) => void;
}

export function MutfakYaziciTablosu({ kurallar, seciliId, onSec, onDegistir }: MutfakYaziciTablosuProps) {
  const guncelle = (id: string, parca: Partial<MutfakYaziciKurali>) => {
    onDegistir(kurallar.map((k) => (k.id === id ? { ...k, ...parca } : k)));
  };

  const ekle = () => {
    const yeni = yeniMutfakKurali();
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
        <p className="ap-muted text-xs">
          Kaynak ve ürün eşleşmesine göre mutfak yazıcısı veya ekranı yönlendirin.
        </p>
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={ekle}>
          + Kural Ekle
        </button>
      </div>

      {kurallar.length === 0 ? (
        <p className="ap-yazici-bos">Henüz mutfak yazıcı kuralı yok.</p>
      ) : (
        <ul className="ap-yazici-kural-liste">
          {kurallar.map((k) => (
            <li
              key={k.id}
              className={`ap-yazici-kural-kart ap-yazici-kural-kart-mutfak ${seciliId === k.id ? 'ap-yazici-kural-kart-secili' : ''}`}
              onClick={() => onSec(k.id)}
            >
              <div className="ap-yazici-kural-grup">
                <p className="ap-yazici-kural-grup-baslik">Kaynak</p>
                <div className="ap-yazici-kural-alanlar">
                  <TumuAlanInput
                    etiket="Bilgisayar"
                    deger={k.bilgisayar}
                    onDegistir={(v) => guncelle(k.id, { bilgisayar: v })}
                  />
                  <TumuAlanInput
                    etiket="Masa Prefix"
                    deger={k.masaPrefix}
                    onDegistir={(v) => guncelle(k.id, { masaPrefix: v })}
                  />
                  <TumuAlanInput
                    etiket="Garson"
                    deger={k.garson}
                    onDegistir={(v) => guncelle(k.id, { garson: v })}
                  />
                </div>
              </div>

              <div className="ap-yazici-kural-grup">
                <p className="ap-yazici-kural-grup-baslik">Ürün</p>
                <div className="ap-yazici-kural-alanlar">
                  <TumuAlanInput
                    etiket="Ürün Grubu"
                    deger={k.urunGrubu}
                    onDegistir={(v) => guncelle(k.id, { urunGrubu: v })}
                    oneriler={URUN_GRUPLARI}
                  />
                  <TumuAlanInput
                    etiket="Ürün"
                    deger={k.urun}
                    onDegistir={(v) => guncelle(k.id, { urun: v })}
                  />
                </div>
              </div>

              <div className="ap-yazici-kural-grup">
                <p className="ap-yazici-kural-grup-baslik">Hedef</p>
                <div className="ap-yazici-kural-alanlar ap-yazici-kural-alanlar-hedef">
                  <TumuAlanInput
                    etiket="Yazıcı"
                    deger={k.yazici}
                    placeholder="Örn. MUTFAK"
                    onDegistir={(v) => guncelle(k.id, { yazici: v })}
                    oneriler={YAZICI_ONERILERI}
                  />
                  <TumuAlanInput
                    etiket="Mutfak Ekranı"
                    deger={k.mutfakEkrani}
                    placeholder="İsteğe bağlı"
                    onDegistir={(v) => guncelle(k.id, { mutfakEkrani: v })}
                    oneriler={MUTFAK_EKRAN_ONERILERI}
                  />
                </div>
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
