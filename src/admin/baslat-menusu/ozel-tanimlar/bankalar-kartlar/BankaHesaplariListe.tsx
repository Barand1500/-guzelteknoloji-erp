import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import { OtAcilirSecim } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtAcilirSecim';
import type { OzelBanka } from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankalar';
import {
  BANKA_HESAPLARI_GUNCELLENDI,
  bankaHesapEkle,
  bankaHesapGuncelle,
  bankaHesapSil,
  bankaHesaplariGetir,
  type BankaHesap,
  type BankaHesapGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/bankaHesaplari';
import {
  paraBirimiFormSecenekleri,
  paraBirimiTamEtiket,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';

function ibanGoster(iban: string): string {
  const t = iban.trim();
  if (!t) return '—';
  return t.replace(/(.{4})/g, '$1 ').trim();
}

function OnayIkon({ aktif }: { aktif: boolean }) {
  if (!aktif) return <span className="ap-muted">—</span>;
  return (
    <span className="ot-bk-onay" title="Evet" aria-label="Evet">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
        <path
          d="M7.5 12.5l3 3 6-7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ToggleSatir({
  etiket,
  acik,
  onChange,
}: {
  etiket: string;
  acik: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="ot-bh-toggle">
      <span className="ot-bh-toggle-etiket">{etiket}</span>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        className={`ot-bh-switch${acik ? ' ot-bh-switch-acik' : ''}`}
        onClick={() => onChange(!acik)}
      >
        <span className="ot-bh-switch-top" aria-hidden>
          {acik ? '✓' : '✕'}
        </span>
      </button>
    </label>
  );
}

const BOS = (bankaKodu: string): BankaHesapGirdi => ({
  bankaKodu,
  paraBirimi: '',
  hesapAdi: '',
  iban: '',
  subeAdi: '',
  subeKodu: '',
  hesapNo: '',
  sanalPos: false,
  havaleEft: false,
  aktif: true,
});

export function BankaHesaplariListeSayfasi({ banka }: { banka: OzelBanka }) {
  const [liste, setListe] = useState<BankaHesap[]>(() => bankaHesaplariGetir(banka.kisaAdi));
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<BankaHesap | null>(null);
  const [silinecek, setSilinecek] = useState<BankaHesap | null>(null);
  const [form, setForm] = useState<BankaHesapGirdi>(() => BOS(banka.kisaAdi));
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(bankaHesaplariGetir(banka.kisaAdi)), [banka.kisaAdi]);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(BANKA_HESAPLARI_GUNCELLENDI, h);
    return () => window.removeEventListener(BANKA_HESAPLARI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setForm(
      duzenlenen
        ? {
            bankaKodu: duzenlenen.bankaKodu,
            paraBirimi: duzenlenen.paraBirimi,
            hesapAdi: duzenlenen.hesapAdi,
            iban: duzenlenen.iban,
            subeAdi: duzenlenen.subeAdi,
            subeKodu: duzenlenen.subeKodu,
            hesapNo: duzenlenen.hesapNo,
            sanalPos: duzenlenen.sanalPos,
            havaleEft: duzenlenen.havaleEft,
            aktif: duzenlenen.aktif,
          }
        : BOS(banka.kisaAdi)
    );
  }, [modalAcik, duzenlenen, banka.kisaAdi]);

  const pbSecenekleri = useMemo(() => paraBirimiFormSecenekleri(), [modalAcik]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter((h) => {
      const pb = paraBirimiTamEtiket(h.paraBirimi).toLocaleLowerCase('tr');
      return (
        pb.includes(q) ||
        h.hesapAdi.toLocaleLowerCase('tr').includes(q) ||
        h.hesapNo.toLocaleLowerCase('tr').includes(q) ||
        h.subeAdi.toLocaleLowerCase('tr').includes(q) ||
        h.subeKodu.toLocaleLowerCase('tr').includes(q) ||
        h.iban.toLocaleLowerCase('tr').includes(q)
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
    const girdi = { ...form, bankaKodu: banka.kisaAdi };
    if (duzenlenen) {
      if (!bankaHesapGuncelle(duzenlenen.id, girdi)) {
        setHata('Güncellenemedi. Para birimi, hesap adı ve IBAN zorunlu.');
        return;
      }
    } else if (!bankaHesapEkle(girdi)) {
      setHata('Eklenemedi. Para birimi, hesap adı ve IBAN zorunlu.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  return (
    <div className="ot-pb-sayfa">
      <div className="ot-pb-kontroller">
        <div className="ot-bk-hesap-ust-sol">
          <span className="ot-bk-hesap-banka">
            {banka.gorselUrl ? (
              <img src={banka.gorselUrl} alt="" className="ot-bk-marka-img" />
            ) : null}
            {banka.adi}
          </span>
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
        </div>
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
              <th>Para Birimi</th>
              <th>Şube Adı / Şube Kodu</th>
              <th>Hesap Adı / Hesap No</th>
              <th>IBAN</th>
              <th>Sanal POS</th>
              <th>Havale/EFT</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={7} className="ot-pb-bos">
                  Bu bankaya ait hesap bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((h) => (
                <tr key={h.id}>
                  <td>{paraBirimiTamEtiket(h.paraBirimi)}</td>
                  <td>
                    <div className="ot-bk-cift-satir">
                      <span>{h.subeAdi || '—'}</span>
                      <span className="ap-muted text-xs">{h.subeKodu || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ot-bk-cift-satir">
                      <span>{h.hesapAdi || '—'}</span>
                      <span className="ap-muted text-xs">{h.hesapNo || '—'}</span>
                    </div>
                  </td>
                  <td className="ot-bk-iban">{ibanGoster(h.iban)}</td>
                  <td>
                    <OnayIkon aktif={h.sanalPos} />
                  </td>
                  <td>
                    <OnayIkon aktif={h.havaleEft} />
                  </td>
                  <td className="ot-pb-islem">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(h);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(h)}
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
        baslik={duzenlenen ? 'Banka Hesabı Düzenle' : 'Banka Hesabı Ekle'}
        genislik="lg"
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
              <button type="submit" form="ot-bh-form" className="ot-btn-kaydet">
                Kaydet
              </button>
            </div>
          </SistemModalAksiyonlar>
        }
      >
        <form id="ot-bh-form" className="ot-pb-form" onSubmit={kaydet}>
          {hata ? <p className="ot-form-hata">{hata}</p> : null}

          <p className="ot-bh-banka-etiket">
            Banka : <strong>{banka.adi}</strong>
          </p>

          <label className="ot-alan">
            <span className="ot-alan-etiket">
              Para Birimi <span className="ot-zorunlu">*</span>
            </span>
            <OtAcilirSecim
              value={form.paraBirimi}
              onChange={(paraBirimi) => setForm((f) => ({ ...f, paraBirimi }))}
              secenekler={pbSecenekleri}
              aria-label="Para Birimi"
              className="ot-pb-acilir w-full"
            />
          </label>

          <label className="ot-alan">
            <span className="ot-alan-etiket">
              Hesap Adı <span className="ot-zorunlu">*</span>
            </span>
            <input
              className="ot-pb-girdi"
              value={form.hesapAdi}
              onChange={(e) => setForm((f) => ({ ...f, hesapAdi: e.target.value }))}
              required
            />
          </label>

          <label className="ot-alan">
            <span className="ot-alan-etiket">
              IBAN <span className="ot-zorunlu">*</span>
            </span>
            <input
              className="ot-pb-girdi"
              value={form.iban}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  iban: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 34),
                }))
              }
              required
            />
          </label>

          <label className="ot-alan">
            <span className="ot-alan-etiket">Şube Adı</span>
            <input
              className="ot-pb-girdi"
              value={form.subeAdi}
              onChange={(e) => setForm((f) => ({ ...f, subeAdi: e.target.value }))}
            />
          </label>

          <div className="ot-pb-grid-2">
            <label className="ot-alan">
              <span className="ot-alan-etiket">Şube Kodu</span>
              <input
                className="ot-pb-girdi"
                value={form.subeKodu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subeKodu: e.target.value.replace(/\D/g, '').slice(0, 12) }))
                }
                inputMode="numeric"
              />
            </label>
            <label className="ot-alan">
              <span className="ot-alan-etiket">Hesap No</span>
              <input
                className="ot-pb-girdi"
                value={form.hesapNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hesapNo: e.target.value.replace(/\D/g, '').slice(0, 24) }))
                }
                inputMode="numeric"
              />
            </label>
          </div>

          <div className="ot-bh-toggle-liste">
            <ToggleSatir
              etiket="Sanal POS Hesabı mı?"
              acik={form.sanalPos}
              onChange={(sanalPos) => setForm((f) => ({ ...f, sanalPos }))}
            />
            <ToggleSatir
              etiket="Havale/EFT ödeme şekli için kullanılsın mı?"
              acik={form.havaleEft}
              onChange={(havaleEft) => setForm((f) => ({ ...f, havaleEft }))}
            />
          </div>
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            bankaHesapSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek ? `${silinecek.hesapAdi} (${ibanGoster(silinecek.iban)})` : ''}
      />
    </div>
  );
}
