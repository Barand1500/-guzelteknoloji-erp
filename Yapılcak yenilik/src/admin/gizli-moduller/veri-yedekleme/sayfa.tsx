import { useCallback, useEffect, useState } from 'react';
import { FormAlani, formInputSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { SefimMerkezBilgileri } from '@/admin/gizli-moduller/veri-yedekleme/bilesenler/SefimMerkezBilgileri';
import { useYedekleme } from '@/admin/gizli-moduller/veri-yedekleme/kullan-yedekleme';
import { adminYedekApi } from '@/admin/ortak/api/adminSistemApi';
import { sistemAyarlariGetir, sistemAyarlariGuncelle } from '@/admin/baslat-menusu/sistem/ayarlar/api';
import { bosSistemForm, sistemdenForm, type SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import {
  YEDEKLEME_FORMATLARI,
  yedekDosyaAdiFormatla,
  type YedeklemeFormati,
} from '@/types/yedekleme';

function tarihFormat(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function tipEtiket(tip: string) {
  return tip === 'geri_yukle' ? 'Geri Yükleme' : 'İndirme';
}

export function VeriYedeklemeSayfasi() {
  const { varsayilanDosyaAdi, kayitlar, sonKayit, yukleniyor, hata, yenile } = useYedekleme();
  const [sistemForm, setSistemForm] = useState<SistemAyarlariForm>(bosSistemForm);
  const [ayarlarYukleniyor, setAyarlarYukleniyor] = useState(true);
  const [ayarKaydediliyor, setAyarKaydediliyor] = useState(false);
  const [ayarMesaji, setAyarMesaji] = useState('');
  const [indirDosyaAdi, setIndirDosyaAdi] = useState('');
  const [geriDosyaAdi, setGeriDosyaAdi] = useState('');
  const [seciliDosya, setSeciliDosya] = useState<File | null>(null);
  const [indiriliyor, setIndiriliyor] = useState(false);
  const [hizliSqlIndiriliyor, setHizliSqlIndiriliyor] = useState(false);
  const [yukleniyorGeri, setYukleniyorGeri] = useState(false);

  const format = sistemForm.yedeklemeFormati;

  useEffect(() => {
    void (async () => {
      try {
        const veri = await sistemAyarlariGetir();
        setSistemForm(sistemdenForm(veri.site, veri.sistem));
      } catch {
        setSistemForm(bosSistemForm);
      } finally {
        setAyarlarYukleniyor(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (varsayilanDosyaAdi) {
      setIndirDosyaAdi(yedekDosyaAdiFormatla(varsayilanDosyaAdi, format));
      setGeriDosyaAdi(yedekDosyaAdiFormatla(varsayilanDosyaAdi, format));
    }
  }, [varsayilanDosyaAdi, format]);

  const ayarlariKaydet = useCallback(async (guncel: SistemAyarlariForm) => {
    setAyarKaydediliyor(true);
    setAyarMesaji('');
    try {
      const veri = await sistemAyarlariGuncelle(guncel);
      setSistemForm(sistemdenForm(veri.site, { ...guncel, ...veri.sistem }));
      setAyarMesaji('Ayarlar kaydedildi.');
    } catch (err) {
      setAyarMesaji(err instanceof Error ? err.message : 'Ayarlar kaydedilemedi');
    } finally {
      setAyarKaydediliyor(false);
    }
  }, []);

  function formatDegistir(yeniFormat: YedeklemeFormati) {
    const guncel = { ...sistemForm, yedeklemeFormati: yeniFormat };
    setSistemForm(guncel);
    setIndirDosyaAdi((ad) => yedekDosyaAdiFormatla(ad, yeniFormat));
    void ayarlariKaydet(guncel);
  }

  function otomatikYedeklemeDegistir(acik: boolean) {
    const guncel = { ...sistemForm, otomatikYedekleme: acik };
    setSistemForm(guncel);
    void ayarlariKaydet(guncel);
  }

  function yedeklemeAraligiDegistir(gun: number) {
    const guncel = { ...sistemForm, otomatikYedeklemeGun: gun };
    setSistemForm(guncel);
  }

  async function yedeklemeAraligiKaydet() {
    await ayarlariKaydet(sistemForm);
  }

  async function indirHandler() {
    setIndiriliyor(true);
    try {
      await adminYedekApi.indir({
        dosyaAdi: indirDosyaAdi.trim() || undefined,
        format,
      });
      await yenile();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'İndirme başarısız');
    } finally {
      setIndiriliyor(false);
    }
  }

  async function hizliSqlIndirHandler() {
    setHizliSqlIndiriliyor(true);
    try {
      await adminYedekApi.indir({
        dosyaAdi: yedekDosyaAdiFormatla(indirDosyaAdi.trim() || varsayilanDosyaAdi, 'sql'),
        format: 'sql',
      });
      await yenile();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'SQL yedekleme başarısız');
    } finally {
      setHizliSqlIndiriliyor(false);
    }
  }

  async function geriYukleHandler() {
    if (!seciliDosya) {
      alert('Lütfen bir yedek dosyası seçin');
      return;
    }

    const onay = confirm(
      'Mevcut site verileri silinip seçilen yedek yüklenecek. Devam etmek istiyor musunuz?'
    );
    if (!onay) return;

    setYukleniyorGeri(true);
    try {
      await adminYedekApi.geriYukle(seciliDosya, geriDosyaAdi.trim() || seciliDosya.name);
      setSeciliDosya(null);
      await yenile();
      alert('Geri yükleme tamamlandı. Sayfayı yenilemeniz önerilir.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Geri yükleme başarısız');
    } finally {
      setYukleniyorGeri(false);
    }
  }

  const formatAdi = YEDEKLEME_FORMATLARI.find((f) => f.deger === format)?.ad ?? format.toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ap-heading text-xl font-bold">Veri Yedekleme</h1>
        <p className="ap-muted mt-1 text-sm">
          Site verilerini seçtiğiniz formatta indirin, otomatik yedeklemeyi yönetin veya daha önce alınan
          yedeği geri yükleyin.
        </p>
      </div>

      {sonKayit && (
        <div className="ap-card rounded-xl border px-4 py-3 text-sm">
          <span className="ap-muted">Son işlem: </span>
          <strong className="ap-heading">{sonKayit.kullaniciAd}</strong>
          <span className="ap-muted"> ({sonKayit.kullaniciEmail}) — </span>
          <span>{tipEtiket(sonKayit.tip)}</span>
          <span className="ap-muted"> — {tarihFormat(sonKayit.olusturma)}</span>
          <span className="ap-muted"> — {sonKayit.dosyaAdi}</span>
        </div>
      )}

      {hata && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {hata}
        </div>
      )}

      <section className="ap-card space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="ap-heading text-lg font-semibold">Otomatik Yedekleme</h2>
          <p className="ap-muted mt-1 text-sm">
            Belirli aralıklarla site verisi seçilen formatta otomatik yedeklenir.
          </p>
        </div>

        {ayarlarYukleniyor ? (
          <p className="ap-muted text-sm">Ayarlar yükleniyor...</p>
        ) : (
          <>
            <DurumAnahtari
              etiket="Otomatik Yedekleme"
              aciklama="Belirli aralıklarla site verisi yedeklenir"
              acik={sistemForm.otomatikYedekleme}
              onChange={otomatikYedeklemeDegistir}
              renk="mavi"
              ikon="💾"
              devreDisi={ayarKaydediliyor}
            />
            {sistemForm.otomatikYedekleme && (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <FormAlani etiket="Yedekleme Aralığı (gün)">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      className={formInputSinifi}
                      value={sistemForm.otomatikYedeklemeGun}
                      disabled={ayarKaydediliyor}
                      onChange={(e) => yedeklemeAraligiDegistir(Number(e.target.value) || 7)}
                      onBlur={() => void yedeklemeAraligiKaydet()}
                    />
                  </FormAlani>
                </div>
                <p className="ap-muted pb-2 text-xs">
                  Format: <strong className="ap-heading">{formatAdi}</strong> (aşağıdan değiştirilebilir)
                </p>
              </div>
            )}
            {ayarMesaji && (
              <p className={`text-xs ${ayarMesaji.includes('kaydedilemedi') ? 'text-red-400' : 'text-emerald-400'}`}>
                {ayarMesaji}
              </p>
            )}
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ap-card space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="ap-heading text-lg font-semibold">Veri İndirme</h2>
            <p className="ap-muted mt-1 text-sm">Tüm site verisini seçilen formatta indirin.</p>
          </div>

          <div>
            <label className="ap-muted mb-2 block text-sm">Yedekleme formatı</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {YEDEKLEME_FORMATLARI.map((sec) => (
                <button
                  key={sec.deger}
                  type="button"
                  disabled={ayarKaydediliyor || ayarlarYukleniyor}
                  onClick={() => formatDegistir(sec.deger)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    format === sec.deger
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-[var(--ap-border)] hover:border-blue-500/50'
                  }`}
                >
                  <span className="ap-heading block text-sm font-semibold">{sec.ad}</span>
                  <span className="ap-muted mt-0.5 block text-[10px] leading-tight">{sec.aciklama}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="ap-muted mb-1 block text-sm">Dosya adı</label>
            <input
              type="text"
              value={indirDosyaAdi}
              onChange={(e) => setIndirDosyaAdi(e.target.value)}
              placeholder={`site-adi-admin-2026-06-13.${format}`}
              className="ap-input w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <p className="ap-muted mt-1 text-xs">Otomatik format: site-adi-admin-tarih.{format}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={hizliSqlIndiriliyor || yukleniyor || ayarlarYukleniyor}
              onClick={() => void hizliSqlIndirHandler()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {hizliSqlIndiriliyor ? 'Yedekleniyor...' : 'Hızlı SQL yedek al'}
            </button>
            <button
              type="button"
              disabled={indiriliyor || yukleniyor || ayarlarYukleniyor}
              onClick={() => void indirHandler()}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {indiriliyor ? 'İndiriliyor...' : `${formatAdi} İndir`}
            </button>
          </div>
        </section>

        <section className="ap-card space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="ap-heading text-lg font-semibold">Veri Geri Yükleme</h2>
            <p className="ap-muted mt-1 text-sm">
              Daha önce indirilen yedek dosyasını (.json, .sql, .zip) yükleyerek siteyi geri yükleyin.
            </p>
          </div>

          <div>
            <label className="ap-muted mb-1 block text-sm">Dosya adı (kayıt için)</label>
            <input
              type="text"
              value={geriDosyaAdi}
              onChange={(e) => setGeriDosyaAdi(e.target.value)}
              className="ap-input w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="ap-muted mb-1 block text-sm">Yedek dosyası</label>
            <input
              type="file"
              accept=".json,.sql,.zip,application/json,application/zip,text/plain"
              onChange={(e) => setSeciliDosya(e.target.files?.[0] ?? null)}
              className="ap-input w-full rounded border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-xs file:text-white"
            />
            {seciliDosya && (
              <p className="ap-muted mt-1 text-xs">Seçili: {seciliDosya.name}</p>
            )}
          </div>

          <button
            type="button"
            disabled={yukleniyorGeri || !seciliDosya}
            onClick={() => void geriYukleHandler()}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {yukleniyorGeri ? 'Yükleniyor...' : 'Geri Yükle'}
          </button>
        </section>
      </div>

      <SefimMerkezBilgileri />

      <section className="ap-card overflow-hidden rounded-xl border">
        <div className="border-b border-[var(--ap-border)] px-4 py-3">
          <h2 className="ap-heading font-semibold">Yedekleme Geçmişi</h2>
          <p className="ap-muted text-xs">Kim, ne zaman yedek aldı veya geri yükledi</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--ap-border)] text-xs uppercase ap-muted">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Dosya</th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor ? (
              <tr>
                <td colSpan={4} className="ap-muted px-4 py-8 text-center">
                  Yükleniyor...
                </td>
              </tr>
            ) : kayitlar.length === 0 ? (
              <tr>
                <td colSpan={4} className="ap-muted px-4 py-8 text-center">
                  Henüz yedekleme kaydı yok.
                </td>
              </tr>
            ) : (
              kayitlar.map((k) => (
                <tr key={k.id} className="border-b border-[var(--ap-border)]/50 hover:bg-[var(--ap-hover)]">
                  <td className="whitespace-nowrap px-4 py-3">{tarihFormat(k.olusturma)}</td>
                  <td className="px-4 py-3">
                    <div className="ap-heading font-medium">{k.kullaniciAd}</div>
                    <div className="ap-muted text-xs">{k.kullaniciEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        k.tip === 'geri_yukle'
                          ? 'bg-amber-900/40 text-amber-300'
                          : 'bg-emerald-900/40 text-emerald-300'
                      }`}
                    >
                      {tipEtiket(k.tip)}
                    </span>
                  </td>
                  <td className="ap-muted px-4 py-3 font-mono text-xs">{k.dosyaAdi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
