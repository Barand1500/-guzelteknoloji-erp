import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { OtAcilirSecim } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtAcilirSecim';
import {
  VERGILER_GUNCELLENDI,
  vergiEkle,
  vergiGuncelle,
  vergiSil,
  vergileriGetir,
  type VergiKayit,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiler';
import {
  VERGI_TURLERI_GUNCELLENDI,
  vergiTuruEtiketi,
  vergiTuruFormSecenekleri,
  vergiTuruKisaAdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiTurleri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';

export function VergilerListeSayfasi() {
  const [liste, setListe] = useState<VergiKayit[]>(() => vergileriGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<VergiKayit | null>(null);
  const [silinecek, setSilinecek] = useState<VergiKayit | null>(null);
  const [vergiTuruId, setVergiTuruId] = useState('');
  const [oran, setOran] = useState('');
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(vergileriGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(VERGILER_GUNCELLENDI, h);
    window.addEventListener(VERGI_TURLERI_GUNCELLENDI, h);
    return () => {
      window.removeEventListener(VERGILER_GUNCELLENDI, h);
      window.removeEventListener(VERGI_TURLERI_GUNCELLENDI, h);
    };
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setVergiTuruId(duzenlenen?.vergiTuruId ?? '');
    setOran(duzenlenen ? String(duzenlenen.oran) : '');
  }, [modalAcik, duzenlenen]);

  const turSecenekleri = useMemo(() => vergiTuruFormSecenekleri(), [liste, modalAcik]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter((v) => {
      const adi = vergiTuruEtiketi(v.vergiTuruId).toLocaleLowerCase('tr');
      const kisa = vergiTuruKisaAdi(v.vergiTuruId).toLocaleLowerCase('tr');
      return adi.includes(q) || kisa.includes(q) || String(v.oran).includes(q);
    });
  }, [liste, arama]);

  useEffect(() => setSayfa(1), [arama, sayfaBoyutu]);

  const { toplamSayfa, guvenliSayfa, baslangic, kayitlar, bitis } = otSayfaDilimleri(
    filtrelenen,
    sayfa,
    sayfaBoyutu
  );

  function kaydet(e: FormEvent) {
    e.preventDefault();
    const oranSayi = Number(oran.replace(',', '.'));
    if (!Number.isFinite(oranSayi) || oranSayi < 0 || oranSayi > 100) {
      setHata('Oran %0 ile %100 arasında olmalıdır.');
      return;
    }
    const girdi = { vergiTuruId, oran: oranSayi, aktif: true };
    if (duzenlenen) {
      if (!vergiGuncelle(duzenlenen.id, girdi)) {
        setHata('Güncellenemedi. Tür ve oran zorunlu; oran en fazla 100.');
        return;
      }
    } else if (!vergiEkle(girdi)) {
      setHata('Eklenemedi. Tür ve oran zorunlu; oran en fazla 100.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  return (
    <div className="ot-pb-sayfa">
      <div className="ot-pb-kontroller">
        <label className="ot-pb-sayfa-boyutu">
          <select
            value={sayfaBoyutu}
            onChange={(e) => setSayfaBoyutu(Number(e.target.value))}
            className="ap-input"
          >
            {OT_SAYFA_SECENEKLERI.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ap-muted text-sm">veri göster</span>
        </label>
        <div className="ot-pb-kontroller-sag">
          <div className="ot-pb-arama">
            <AdminAramaKutusu deger={arama} onChange={setArama} placeholder="Ara" />
          </div>
          <button
            type="button"
            className="ot-btn-ekle"
            onClick={() => {
              setDuzenlenen(null);
              setModalAcik(true);
            }}
          >
            + Ekle
          </button>
        </div>
      </div>

      <div className="ot-pb-tablo-sarici">
        <table className="ot-pb-tablo">
          <thead>
            <tr>
              <th>Vergi Türü</th>
              <th>Oran</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={3} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="ot-bk-cift-satir">
                      <span>{vergiTuruEtiketi(v.vergiTuruId)}</span>
                      <span className="ap-muted text-xs">{vergiTuruKisaAdi(v.vergiTuruId)}</span>
                    </div>
                  </td>
                  <td>% {v.oran}</td>
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(v);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(v)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OtSayfalama
        guvenliSayfa={guvenliSayfa}
        toplamSayfa={toplamSayfa}
        baslangic={baslangic}
        bitis={bitis}
        toplam={filtrelenen.length}
        onSayfa={setSayfa}
      />

      <SistemModal
        acik={modalAcik}
        onKapat={() => setModalAcik(false)}
        baslik={duzenlenen ? 'Vergi Düzenle' : 'Vergi Ekle'}
        genislik="md"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
                Kapat
              </button>
              <button type="submit" form="ot-vergi-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-vergi-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <div className="ot-pb-grid-2">
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Vergi Türü <span className="ot-zorunlu">*</span>
              </span>
              <OtAcilirSecim
                value={vergiTuruId}
                onChange={setVergiTuruId}
                secenekler={turSecenekleri}
                aria-label="Vergi Türü"
                className="ot-pb-acilir w-full"
              />
            </label>
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Oran % <span className="ot-zorunlu">*</span>
              </span>
              <input
                className="ot-pb-girdi"
                value={oran}
                onChange={(e) => {
                  const ham = e.target.value.replace(/[^\d.,]/g, '');
                  if (!ham) {
                    setOran('');
                    return;
                  }
                  const n = Number(ham.replace(',', '.'));
                  if (Number.isFinite(n) && n > 100) {
                    setOran('100');
                    return;
                  }
                  setOran(ham);
                }}
                inputMode="decimal"
                max={100}
                required
              />
            </label>
          </div>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            vergiSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={
          silinecek
            ? `${vergiTuruEtiketi(silinecek.vergiTuruId)} %${silinecek.oran}`
            : ''
        }
      />
    </div>
  );
}
