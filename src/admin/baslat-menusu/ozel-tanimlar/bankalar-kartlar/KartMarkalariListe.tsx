import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  KART_MARKALARI_GUNCELLENDI,
  kartMarkaEkle,
  kartMarkaGuncelle,
  kartMarkaSil,
  kartMarkalariGetir,
  type KartMarka,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/kartMarkalari';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import { OtGorselAlani } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtGorselAlani';
import { OtOutlinedAlan, OtOutlinedGirdi } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';

export function KartMarkalariListeSayfasi() {
  const [liste, setListe] = useState<KartMarka[]>(() => kartMarkalariGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<KartMarka | null>(null);
  const [silinecek, setSilinecek] = useState<KartMarka | null>(null);
  const [adi, setAdi] = useState('');
  const [gorselUrl, setGorselUrl] = useState('');
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(kartMarkalariGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(KART_MARKALARI_GUNCELLENDI, h);
    return () => window.removeEventListener(KART_MARKALARI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setAdi(duzenlenen?.adi ?? '');
    setGorselUrl(duzenlenen?.gorselUrl ?? '');
  }, [modalAcik, duzenlenen]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter((m) => m.adi.toLocaleLowerCase('tr').includes(q));
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
      if (!kartMarkaGuncelle(duzenlenen.id, { adi, gorselUrl, aktif: true })) {
        setHata('Güncellenemedi. Ad benzersiz olmalı.');
        return;
      }
    } else if (!kartMarkaEkle({ adi, gorselUrl, aktif: true })) {
      setHata('Eklenemedi. Ad benzersiz olmalı.');
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
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={2} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="ot-bk-marka-adi">
                      {m.gorselUrl ? (
                        <img src={m.gorselUrl} alt="" className="ot-bk-marka-img" />
                      ) : (
                        <span className="ot-bk-marka-rozet" aria-hidden>
                          {m.adi.slice(0, 2).toLocaleUpperCase('tr')}
                        </span>
                      )}
                      {m.adi}
                    </span>
                  </td>
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(m);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(m)}
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
        baslik={duzenlenen ? 'Kart Markası Düzenle' : 'Kart Markası Ekle'}
        genislik="md"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
                Kapat
              </button>
              <button type="submit" form="ot-km-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-km-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <OtOutlinedGirdi etiket="Adı" deger={adi} onChange={setAdi} zorunlu />
          <OtOutlinedAlan etiket="Görsel">
            <OtGorselAlani deger={gorselUrl} onChange={setGorselUrl} />
          </OtOutlinedAlan>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            kartMarkaSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek?.adi ?? ''}
      />
    </div>
  );
}
