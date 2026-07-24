import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  bankaEtiketi,
  bankaFormSecenekleri,
  bankaGorseli,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankalar';
import {
  BIN_KAYITLARI_GUNCELLENDI,
  KART_TURLERI,
  binKayitEkle,
  binKayitGuncelle,
  binKayitSil,
  binKayitlariGetir,
  kartTuruEtiketi,
  type BinKayit,
  type BinKayitGirdi,
  type KartTuru,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/binKayitlari';
import { kartMarkaEtiketi, kartMarkaFormSecenekleri, kartMarkaGorseli } from '@/admin/baslat-menusu/ozel-tanimlar/veri/kartMarkalari';
import { kartTipiEtiketi, kartTipiFormSecenekleri } from '@/admin/baslat-menusu/ozel-tanimlar/veri/kartTipleri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import { OtOutlinedAcilir, OtOutlinedGirdi } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';

const BOS: BinKayitGirdi = {
  bankaKodu: '',
  bin: '',
  kartTipiId: '',
  kartMarkaId: '',
  kartTuru: 'bireysel',
  aktif: true,
};

export function BinKayitlariListeSayfasi() {
  const [liste, setListe] = useState<BinKayit[]>(() => binKayitlariGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<BinKayit | null>(null);
  const [silinecek, setSilinecek] = useState<BinKayit | null>(null);
  const [form, setForm] = useState<BinKayitGirdi>(BOS);
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(binKayitlariGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(BIN_KAYITLARI_GUNCELLENDI, h);
    return () => window.removeEventListener(BIN_KAYITLARI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    if (duzenlenen) {
      setForm({
        bankaKodu: duzenlenen.bankaKodu,
        bin: duzenlenen.bin,
        kartTipiId: duzenlenen.kartTipiId,
        kartMarkaId: duzenlenen.kartMarkaId,
        kartTuru: duzenlenen.kartTuru,
        aktif: duzenlenen.aktif,
      });
    } else {
      setForm({ ...BOS });
    }
  }, [modalAcik, duzenlenen]);

  const bankaSecenekleri = useMemo(() => bankaFormSecenekleri(), [liste, modalAcik]);
  const tipSecenekleri = useMemo(() => kartTipiFormSecenekleri(), [modalAcik]);
  const markaSecenekleri = useMemo(() => kartMarkaFormSecenekleri(), [modalAcik]);
  const turSecenekleri = useMemo(
    () => KART_TURLERI.map((t) => ({ value: t.value, label: t.label })),
    []
  );

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter((b) => {
      const banka = bankaEtiketi(b.bankaKodu).toLocaleLowerCase('tr');
      const tip = kartTipiEtiketi(b.kartTipiId).toLocaleLowerCase('tr');
      const marka = kartMarkaEtiketi(b.kartMarkaId).toLocaleLowerCase('tr');
      const tur = kartTuruEtiketi(b.kartTuru).toLocaleLowerCase('tr');
      return (
        banka.includes(q) ||
        b.bin.includes(q) ||
        tip.includes(q) ||
        marka.includes(q) ||
        tur.includes(q)
      );
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
    if (duzenlenen) {
      if (!binKayitGuncelle(duzenlenen.id, form)) {
        setHata('Güncellenemedi. BIN benzersiz ve 4–8 hane olmalı.');
        return;
      }
    } else if (!binKayitEkle(form)) {
      setHata('Eklenemedi. Tüm alanlar zorunlu; BIN 4–8 hane ve benzersiz olmalı.');
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
              <th>Banka</th>
              <th>BIN</th>
              <th>Tip</th>
              <th>Marka</th>
              <th>Tür</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={6} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((b) => {
                const bankaGorsel = bankaGorseli(b.bankaKodu);
                const markaGorsel = kartMarkaGorseli(b.kartMarkaId);
                return (
                  <tr key={b.id}>
                    <td>
                      <span className="ot-bk-marka-adi">
                        {bankaGorsel ? (
                          <img src={bankaGorsel} alt="" className="ot-bk-marka-img" />
                        ) : (
                          <span className="ot-bk-marka-rozet" aria-hidden>
                            {bankaEtiketi(b.bankaKodu).slice(0, 2).toLocaleUpperCase('tr')}
                          </span>
                        )}
                        {bankaEtiketi(b.bankaKodu)}
                      </span>
                    </td>
                    <td>{b.bin}</td>
                    <td>{kartTipiEtiketi(b.kartTipiId)}</td>
                    <td>
                      <span className="ot-bk-marka-adi">
                        {markaGorsel ? (
                          <img src={markaGorsel} alt="" className="ot-bk-marka-img" />
                        ) : null}
                        {kartMarkaEtiketi(b.kartMarkaId)}
                      </span>
                    </td>
                    <td>{kartTuruEtiketi(b.kartTuru)}</td>
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
        baslik={duzenlenen ? 'Bin Numarası Düzenle' : 'Bin Numarası Ekle'}
        genislik="lg"
        disariTiklaKapat={false}
        footer={
          <SistemModalAksiyonlar>
            <div className="flex justify-end gap-2">
              <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
                Kapat
              </button>
              <button type="submit" form="ot-bin-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-bin-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}

          <OtOutlinedAcilir
            etiket="Banka"
            deger={form.bankaKodu}
            onChange={(bankaKodu) => setForm((f) => ({ ...f, bankaKodu }))}
            secenekler={bankaSecenekleri}
            zorunlu
          />

          <div className="ot-pb-grid-2">
            <OtOutlinedGirdi
              etiket="BIN"
              deger={form.bin}
              onChange={(v) => setForm((f) => ({ ...f, bin: v.replace(/\D/g, '').slice(0, 8) }))}
              zorunlu
            />
            <OtOutlinedAcilir
              etiket="Kart Tipi"
              deger={form.kartTipiId}
              onChange={(kartTipiId) => setForm((f) => ({ ...f, kartTipiId }))}
              secenekler={tipSecenekleri}
              zorunlu
            />
          </div>

          <div className="ot-pb-grid-2">
            <OtOutlinedAcilir
              etiket="Kart Markası"
              deger={form.kartMarkaId}
              onChange={(kartMarkaId) => setForm((f) => ({ ...f, kartMarkaId }))}
              secenekler={markaSecenekleri}
              zorunlu
            />
            <OtOutlinedAcilir
              etiket="Kart Türü"
              deger={form.kartTuru}
              onChange={(kartTuru) => setForm((f) => ({ ...f, kartTuru: kartTuru as KartTuru }))}
              secenekler={turSecenekleri}
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
            binKayitSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek ? `BIN ${silinecek.bin}` : ''}
      />
    </div>
  );
}
