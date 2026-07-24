import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  VERGI_TURLERI_GUNCELLENDI,
  vergiTuruEkle,
  vergiTuruGuncelle,
  vergiTuruSil,
  vergiTurleriGetir,
  type VergiTuru,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiTurleri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import { OtOutlinedGirdi } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';

export function VergiTurleriListeSayfasi() {
  const [liste, setListe] = useState<VergiTuru[]>(() => vergiTurleriGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<VergiTuru | null>(null);
  const [silinecek, setSilinecek] = useState<VergiTuru | null>(null);
  const [adi, setAdi] = useState('');
  const [kisaAdi, setKisaAdi] = useState('');
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(vergiTurleriGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(VERGI_TURLERI_GUNCELLENDI, h);
    return () => window.removeEventListener(VERGI_TURLERI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setAdi(duzenlenen?.adi ?? '');
    setKisaAdi(duzenlenen?.kisaAdi ?? '');
  }, [modalAcik, duzenlenen]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter(
      (t) =>
        t.adi.toLocaleLowerCase('tr').includes(q) ||
        t.kisaAdi.toLocaleLowerCase('tr').includes(q)
    );
  }, [liste, arama]);

  useEffect(() => setSayfa(1), [arama, sayfaBoyutu]);

  const { toplamSayfa, guvenliSayfa, baslangic, kayitlar, bitis } = otSayfaDilimleri(
    filtrelenen,
    sayfa,
    sayfaBoyutu
  );

  function kaydet(e: FormEvent) {
    e.preventDefault();
    if (duzenlenen) {
      if (!vergiTuruGuncelle(duzenlenen.id, { adi, kisaAdi, aktif: true })) {
        setHata('Güncellenemedi. Ad / kısa ad benzersiz olmalı.');
        return;
      }
    } else if (!vergiTuruEkle({ adi, kisaAdi, aktif: true })) {
      setHata('Eklenemedi. Ad / kısa ad benzersiz olmalı.');
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
              <th>Adı</th>
              <th>Kısa Adı</th>
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
              kayitlar.map((t) => (
                <tr key={t.id}>
                  <td>{t.adi}</td>
                  <td>{t.kisaAdi}</td>
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(t);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(t)}
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
        baslik={duzenlenen ? 'Vergi Türü Düzenle' : 'Vergi Türü Ekle'}
        genislik="md"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
                Kapat
              </button>
              <button type="submit" form="ot-vt-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-vt-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <div className="ot-pb-grid-2">
            <OtOutlinedGirdi etiket="Adı" deger={adi} onChange={setAdi} zorunlu />
            <OtOutlinedGirdi
              etiket="Kısa Adı"
              deger={kisaAdi}
              onChange={setKisaAdi}
              buyukHarf
              maxLength={12}
              zorunlu
            />
          </div>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            vergiTuruSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek ? `${silinecek.adi} (${silinecek.kisaAdi})` : ''}
      />
    </div>
  );
}
