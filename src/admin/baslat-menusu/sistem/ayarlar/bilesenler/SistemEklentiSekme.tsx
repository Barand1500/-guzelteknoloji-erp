import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import {
  eklentiAktif,
  eklentiKaldir,
  eklentiKur,
  eklentiPasif,
  eklentileriGetir,
  eklentiZipYukle,
} from '@/admin/baslat-menusu/sistem/ayarlar/api-eklenti';
import { siteVerisiGuncellendiYayinla } from '@/araclar/siteVerisiOlaylari';
import type { EklentiKart, EklentiListeSekme } from '@/admin/ortak/tipler/eklenti';
import { EKLENTI_SEKMELER } from '@/admin/ortak/tipler/eklenti';
import { EklentiKarti } from './EklentiKarti';
import { EklentiDetayModal } from './EklentiDetayModal';
import { formInputSinifi } from '@/formlar/FormAlani';

export function SistemEklentiSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [eklentiler, setEklentiler] = useState<EklentiKart[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemKod, setIslemKod] = useState<string | null>(null);
  const [sekme, setSekme] = useState<EklentiListeSekme>('one-cikan');
  const [arama, setArama] = useState('');
  const [detay, setDetay] = useState<EklentiKart | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const [zipYukleniyor, setZipYukleniyor] = useState(false);

  const yenile = useCallback(async () => {
    const liste = await eklentileriGetir();
    setEklentiler(liste);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await yenile();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Eklentiler yüklenemedi');
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [yenile, hataBildir]);

  const filtrelenmis = useMemo(() => {
    const liste = eklentiler ?? [];
    const q = arama.trim().toLowerCase();
    return liste.filter((e) => {
      const sekmeUygun =
        sekme === 'kurulu'
          ? e.kurulu
          : sekme === 'one-cikan'
            ? e.kategori === 'one-cikan'
            : sekme === 'populer'
              ? e.kategori === 'populer'
              : e.kategori === 'onerilen';
      if (!sekmeUygun) return false;
      if (!q) return true;
      return (
        e.ad.toLowerCase().includes(q) ||
        e.aciklama.toLowerCase().includes(q) ||
        e.gelistirici.toLowerCase().includes(q) ||
        e.kod.includes(q)
      );
    });
  }, [eklentiler, sekme, arama]);

  async function islemCalistir(kod: string, fn: () => Promise<void>, mesaj: string) {
    setIslemKod(kod);
    try {
      await fn();
      await yenile();
      siteVerisiGuncellendiYayinla();
      basariBildir(mesaj);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setIslemKod(null);
    }
  }

  async function zipSecildi(dosya: File | undefined) {
    if (!dosya) return;
    setZipYukleniyor(true);
    try {
      await eklentiZipYukle(dosya);
      await yenile();
      siteVerisiGuncellendiYayinla();
      basariBildir('Eklenti zip dosyası yüklendi ve kuruldu.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Zip yüklenemedi');
    } finally {
      setZipYukleniyor(false);
      if (dosyaRef.current) dosyaRef.current.value = '';
    }
  }

  if (yukleniyor) {
    return <p className="ap-muted text-sm">Eklentiler yükleniyor...</p>;
  }

  return (
    <div className="ap-eklenti-yonetimi">
      <div className="ap-eklenti-ust">
        <div className="ap-eklenti-baslik-cubugu">
          <input
            ref={dosyaRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => void zipSecildi(e.target.files?.[0])}
          />
          <button
            type="button"
            className="ap-eklenti-ust-btn ap-eklenti-ust-btn-yukle"
            disabled={zipYukleniyor}
            onClick={() => dosyaRef.current?.click()}
          >
            {zipYukleniyor ? 'Yükleniyor...' : 'Eklenti yükle'}
          </button>
        </div>
        <p className="ap-muted max-w-2xl text-sm leading-relaxed">
          Eklentiler sitenize yeni özellikler katar. Katalogdan kurabilir veya zip dosyası yükleyebilirsiniz.
        </p>
      </div>

      <div className="ap-eklenti-filtre">
        <div className="ap-eklenti-sekmeler">
          {EKLENTI_SEKMELER.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ap-eklenti-sekme ${sekme === s.id ? 'ap-eklenti-sekme-aktif' : ''}`}
              onClick={() => setSekme(s.id)}
            >
              {s.ad}
            </button>
          ))}
        </div>
        <div className="ap-eklenti-ara">
          <label htmlFor="eklenti-ara" className="ap-eklenti-ara-etiket">
            Eklenti ara
          </label>
          <div className="ap-arama ap-eklenti-arama-kutu">
            <div className="ap-arama-input-wrap">
              <span className="ap-arama-ikon" aria-hidden>
                🔍
              </span>
              <input
                id="eklenti-ara"
                type="search"
                className={`${formInputSinifi} ap-arama-input ap-eklenti-arama-input`}
                placeholder="Anahtar kelime..."
                value={arama}
                onChange={(e) => setArama(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {filtrelenmis.length === 0 ? (
        <p className="ap-muted py-8 text-center text-sm">Bu filtrede eklenti bulunamadı.</p>
      ) : (
        <div className="ap-eklenti-grid">
          {filtrelenmis.map((e) => (
            <EklentiKarti
              key={e.kod}
              eklenti={e}
              islemde={islemKod === e.kod}
              onKur={() => void islemCalistir(e.kod, () => eklentiKur(e.kod), 'Eklenti kuruldu.')}
              onAktif={() =>
                void islemCalistir(e.kod, () => eklentiAktif(e.kod), 'Eklenti etkinleştirildi.')
              }
              onPasif={() =>
                void islemCalistir(e.kod, () => eklentiPasif(e.kod), 'Eklenti pasifleştirildi.')
              }
              onKaldir={() =>
                void islemCalistir(e.kod, () => eklentiKaldir(e.kod), 'Eklenti kaldırıldı.')
              }
              onDetay={() => setDetay(e)}
            />
          ))}
        </div>
      )}

      <EklentiDetayModal eklenti={detay} onKapat={() => setDetay(null)} />
    </div>
  );
}
