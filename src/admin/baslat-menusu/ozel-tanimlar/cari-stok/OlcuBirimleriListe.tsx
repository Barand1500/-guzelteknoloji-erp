import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  OLCU_BIRIMLERI_GUNCELLENDI,
  olcuBirimEkle,
  olcuBirimGuncelle,
  olcuBirimSil,
  olcuBirimleriGetir,
  type OlcuBirim,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/olcuBirimleri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';

export function OlcuBirimleriListeSayfasi() {
  const [liste, setListe] = useState<OlcuBirim[]>(() => olcuBirimleriGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<OlcuBirim | null>(null);
  const [silinecek, setSilinecek] = useState<OlcuBirim | null>(null);
  const [adi, setAdi] = useState('');
  const [kisaAdi, setKisaAdi] = useState('');
  const [carpan, setCarpan] = useState('1');
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(olcuBirimleriGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(OLCU_BIRIMLERI_GUNCELLENDI, h);
    return () => window.removeEventListener(OLCU_BIRIMLERI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setAdi(duzenlenen?.adi ?? '');
    setKisaAdi(duzenlenen?.kisaAdi ?? '');
    setCarpan(duzenlenen ? String(duzenlenen.carpan) : '1');
  }, [modalAcik, duzenlenen]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter(
      (b) =>
        b.adi.toLocaleLowerCase('tr').includes(q) ||
        b.kisaAdi.toLocaleLowerCase('tr').includes(q)
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
    const carpanSayi = Number(carpan);
    const girdi = { adi, kisaAdi, carpan: carpanSayi, aktif: true };
    if (duzenlenen) {
      if (!olcuBirimGuncelle(duzenlenen.id, girdi)) {
        setHata('Güncellenemedi. Ad / kısa ad benzersiz olmalı; çarpan pozitif olmalı.');
        return;
      }
    } else if (!olcuBirimEkle(girdi)) {
      setHata('Eklenemedi. Ad / kısa ad benzersiz olmalı; çarpan pozitif olmalı.');
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
              kayitlar.map((b) => (
                <tr key={b.id}>
                  <td>{b.adi}</td>
                  <td>{b.kisaAdi}</td>
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(b);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(b)}
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
        baslik={duzenlenen ? 'Ölçü / Birim Düzenle' : 'Ölçü / Birim Ekle'}
        genislik="md"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="ap-btn-ghost rounded-lg px-4 py-2 text-sm"
                onClick={() => setModalAcik(false)}
              >
                Kapat
              </button>
              <button type="submit" form="ot-ob-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-ob-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <div className="ot-pb-grid-2">
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Adı <span className="ot-zorunlu">*</span>
              </span>
              <input
                className="ot-pb-girdi"
                value={adi}
                onChange={(e) => setAdi(e.target.value)}
                required
              />
            </label>
            <label className="ot-alan">
              <span className="ot-alan-etiket">
                Kısa Adı <span className="ot-zorunlu">*</span>
              </span>
              <input
                className="ot-pb-girdi"
                value={kisaAdi}
                onChange={(e) => setKisaAdi(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="ot-alan">
            <span className="ot-alan-etiket">Çarpan</span>
            <input
              className="ot-pb-girdi"
              type="number"
              min={0.0001}
              step="any"
              value={carpan}
              onChange={(e) => setCarpan(e.target.value)}
              required
            />
          </label>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            olcuBirimSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek?.adi ?? ''}
      />
    </div>
  );
}
