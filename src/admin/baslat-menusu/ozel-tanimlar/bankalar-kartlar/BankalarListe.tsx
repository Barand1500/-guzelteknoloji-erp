import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  BANKALAR_GUNCELLENDI,
  bankaEkle,
  bankaGuncelle,
  bankaSil,
  bankalariGetir,
  type OzelBanka,
  type OzelBankaGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankalar';
import {
  BANKA_HESAPLARI_GUNCELLENDI,
  bankaHesapSayilari,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankaHesaplari';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import { OtGorselAlani } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtGorselAlani';
import { BankaHesaplariListeSayfasi } from './BankaHesaplariListe';

const BOS: OzelBankaGirdi = { adi: '', kisaAdi: '', gorselUrl: '', aktif: true };

export function BankalarListeSayfasi({
  hesapBanka,
  onHesapBanka,
}: {
  hesapBanka: OzelBanka | null;
  onHesapBanka: (banka: OzelBanka | null) => void;
}) {
  const [liste, setListe] = useState<OzelBanka[]>(() => bankalariGetir());
  const [hesapSayilari, setHesapSayilari] = useState<Record<string, number>>(() =>
    bankaHesapSayilari()
  );
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<OzelBanka | null>(null);
  const [silinecek, setSilinecek] = useState<OzelBanka | null>(null);
  const [form, setForm] = useState<OzelBankaGirdi>(BOS);
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(bankalariGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(BANKALAR_GUNCELLENDI, h);
    return () => window.removeEventListener(BANKALAR_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    const yenileSayac = () => setHesapSayilari(bankaHesapSayilari());
    yenileSayac();
    window.addEventListener(BANKA_HESAPLARI_GUNCELLENDI, yenileSayac);
    return () => window.removeEventListener(BANKA_HESAPLARI_GUNCELLENDI, yenileSayac);
  }, [liste]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setForm(
      duzenlenen
        ? {
            adi: duzenlenen.adi,
            kisaAdi: duzenlenen.kisaAdi,
            gorselUrl: duzenlenen.gorselUrl,
            aktif: duzenlenen.aktif,
          }
        : { ...BOS }
    );
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
    if (duzenlenen) {
      if (!bankaGuncelle(duzenlenen.id, form)) {
        setHata('Güncellenemedi. Kısa ad benzersiz olmalı.');
        return;
      }
    } else if (!bankaEkle(form)) {
      setHata('Eklenemedi. Kısa ad benzersiz olmalı.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  if (hesapBanka) {
    return <BankaHesaplariListeSayfasi banka={hesapBanka} />;
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
              <th>Hesap Sayısı</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={4} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((b) => {
                const hesapAdet = hesapSayilari[b.kisaAdi] ?? 0;
                return (
                  <tr key={b.id}>
                    <td>
                      <span className="ot-bk-marka-adi">
                        {b.gorselUrl ? (
                          <img src={b.gorselUrl} alt="" className="ot-bk-marka-img" />
                        ) : (
                          <span className="ot-bk-marka-rozet" aria-hidden>
                            {b.kisaAdi.slice(0, 2)}
                          </span>
                        )}
                        {b.adi}
                      </span>
                    </td>
                    <td>{b.kisaAdi}</td>
                    <td>{hesapAdet}</td>
                    <td className="ot-pb-islem">
                      <OtIslemButonlari
                        gozYeri
                        onGoz={() => onHesapBanka(b)}
                        gozBaslik="Banka Hesapları"
                        onDuzenle={() => {
                          setDuzenlenen(b);
                          setModalAcik(true);
                        }}
                        onSil={() => setSilinecek(b)}
                      />
                    </td>
                  </tr>
                );
              })
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
        baslik={duzenlenen ? 'Banka Düzenle' : 'Banka Ekle'}
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
              <button type="submit" form="ot-banka-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-banka-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}
          <label className="ot-alan">
            <span className="ot-alan-etiket">
              Adı <span className="ot-zorunlu">*</span>
            </span>
            <input
              className="ot-pb-girdi"
              value={form.adi}
              onChange={(e) => setForm((f) => ({ ...f, adi: e.target.value }))}
              required
            />
          </label>
          <label className="ot-alan">
            <span className="ot-alan-etiket">
              Kısa Adı <span className="ot-zorunlu">*</span>
            </span>
            <input
              className="ot-pb-girdi"
              value={form.kisaAdi}
              onChange={(e) => setForm((f) => ({ ...f, kisaAdi: e.target.value.toUpperCase() }))}
              maxLength={24}
              required
            />
          </label>
          <div className="ot-alan">
            <span className="ot-alan-etiket">Görsel</span>
            <OtGorselAlani
              deger={form.gorselUrl ?? ''}
              onChange={(gorselUrl) => setForm((f) => ({ ...f, gorselUrl }))}
            />
          </div>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            bankaSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek ? `${silinecek.adi} (${silinecek.kisaAdi})` : ''}
      />
    </div>
  );
}
