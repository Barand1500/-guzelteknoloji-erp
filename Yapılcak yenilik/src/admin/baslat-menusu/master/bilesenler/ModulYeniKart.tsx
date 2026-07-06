import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { prefixNormalize, prefixUret } from '@/admin/baslat-menusu/master/moduller/api';

export interface ModulYeniTaslak {
  modulAdi: string;
  prefix: string;
  aktif: boolean;
}

interface ModulYeniKartProps {
  taslak: ModulYeniTaslak;
  mevcutPrefixler: string[];
  prefixElle: boolean;
  kaydediliyor?: boolean;
  onTaslakDegistir: (taslak: ModulYeniTaslak) => void;
  onPrefixElleDegistir: (elle: boolean) => void;
}

export const BOS_MODUL_TASLAK: ModulYeniTaslak = {
  modulAdi: '',
  prefix: '',
  aktif: true,
};

export function ModulYeniKart({
  taslak,
  mevcutPrefixler,
  prefixElle,
  kaydediliyor,
  onTaslakDegistir,
  onPrefixElleDegistir,
}: ModulYeniKartProps) {
  function adDegistir(modulAdi: string) {
    onTaslakDegistir({
      ...taslak,
      modulAdi,
      prefix: prefixElle ? taslak.prefix : modulAdi.trim() ? prefixUret(modulAdi, mevcutPrefixler) : '',
    });
  }

  return (
    <article
      className="ap-master-kart ap-master-modul-kart ap-master-modul-kart-yeni ap-master-kart-secili"
      aria-label="Yeni modül"
    >
      <div className="ap-master-kart-ust">
        <span className="ap-master-kart-ikon">🧩</span>
        <span className={`ap-master-durum ${taslak.aktif ? 'ap-master-durum-aktif' : ''}`}>
          {taslak.aktif ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <input
        type="text"
        className="ap-master-modul-kart-baslik"
        placeholder="Modül adı"
        value={taslak.modulAdi}
        onChange={(e) => adDegistir(e.target.value)}
        disabled={kaydediliyor}
        autoFocus
        aria-label="Modül adı"
      />

      <div className="ap-master-modul-kart-prefix-satir">
        <input
          type="text"
          className="ap-master-modul-kart-prefix"
          placeholder="prefix"
          value={taslak.prefix}
          readOnly={!prefixElle}
          onChange={(e) => onTaslakDegistir({ ...taslak, prefix: prefixNormalize(e.target.value) })}
          disabled={kaydediliyor}
          aria-label="Prefix"
        />
        <button
          type="button"
          className="ap-master-modul-prefix-duzenle"
          onClick={() => {
            const sonraki = !prefixElle;
            onPrefixElleDegistir(sonraki);
            if (!sonraki) {
              onTaslakDegistir({
                ...taslak,
                prefix: taslak.modulAdi.trim() ? prefixUret(taslak.modulAdi, mevcutPrefixler) : '',
              });
            }
          }}
          disabled={kaydediliyor}
        >
          {prefixElle ? 'Otomatik' : 'Düzenle'}
        </button>
      </div>

      <div className="ap-master-modul-toggle ap-master-modul-toggle-sade">
        <DurumAnahtari
          etiket={taslak.aktif ? 'Aktif modül' : 'Pasif modül'}
          acik={taslak.aktif}
          devreDisi={kaydediliyor}
          onChange={(aktif) => onTaslakDegistir({ ...taslak, aktif })}
          renk={taslak.aktif ? 'yesil' : 'turuncu'}
          sadeceToggle
        />
      </div>
    </article>
  );
}

export function modulTaslakDogrula(
  taslak: ModulYeniTaslak,
  mevcutPrefixler: string[]
): { girdi?: { modulAdi: string; prefix: string; aktif: boolean }; hata?: string } {
  const modulAdi = taslak.modulAdi.trim();
  const prefix = prefixNormalize(taslak.prefix);

  if (modulAdi.length < 2) return { hata: 'Modül adı en az 2 karakter olmalı' };
  if (prefix.length < 2) return { hata: 'Geçerli bir prefix girin' };
  if (mevcutPrefixler.includes(prefix)) return { hata: 'Bu prefix zaten kullanılıyor' };

  return { girdi: { modulAdi, prefix, aktif: taslak.aktif } };
}
