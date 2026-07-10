import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  VARSAYILAN_SEKME_AYARLARI,
  sekmeAyarlariKaydet,
  sekmeAyarlariLogOzeti,
  sekmeAyarlariOku,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

function ToggleSatir({
  etiket,
  aciklama,
  acik,
  onDegistir,
  devreDisi = false,
  etiketRozeti,
}: {
  etiket: string;
  aciklama?: string;
  acik: boolean;
  onDegistir: (v: boolean) => void;
  devreDisi?: boolean;
  etiketRozeti?: string;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-lg border border-[var(--ap-border)] p-3 ${
        devreDisi ? 'opacity-70' : ''
      }`}
    >
      <div>
        <p className="ap-heading flex items-center gap-2 text-sm font-medium">
          {etiket}
          {etiketRozeti ? (
            <span className="rounded-full border border-[var(--ap-border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--ap-text-muted)]">
              {etiketRozeti}
            </span>
          ) : null}
        </p>
        {aciklama && <p className="ap-muted text-xs">{aciklama}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        disabled={devreDisi}
        onClick={() => {
          if (devreDisi) return;
          onDegistir(!acik);
        }}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    </label>
  );
}

export function SekmeYonetimiSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const [ayarlar, setAyarlar] = useState<SekmePanelAyarlari>(() => sekmeAyarlariOku());
  const [sonKayitli, setSonKayitli] = useState<SekmePanelAyarlari>(() => sekmeAyarlariOku());
  const kirli = useMemo(() => JSON.stringify(ayarlar) !== JSON.stringify(sonKayitli), [ayarlar, sonKayitli]);
  const seciliButonStili = {
    borderColor: 'var(--ap-accent)',
    backgroundColor: 'color-mix(in srgb, var(--ap-accent) 18%, transparent)',
    color: 'color-mix(in srgb, var(--ap-accent) 72%, var(--ap-text))',
  } as const;
  const seciliHafifButonStili = {
    borderColor: 'var(--ap-accent)',
    backgroundColor: 'color-mix(in srgb, var(--ap-accent) 14%, transparent)',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--ap-accent) 35%, transparent) inset',
  } as const;
  const vurguRozetStili = {
    borderColor: 'color-mix(in srgb, var(--ap-accent) 45%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--ap-accent) 12%, transparent)',
    color: 'color-mix(in srgb, var(--ap-accent) 70%, var(--ap-text))',
  } as const;

  const kaydet = useCallback(() => {
    const kaydedilecek = { ...ayarlar, hoverOnizleme: false };
    setAyarlar(kaydedilecek);
    sekmeAyarlariKaydet(kaydedilecek);
    setSonKayitli(kaydedilecek);
    logMesajiAyarla(sekmeAyarlariLogOzeti(kaydedilecek));
    window.dispatchEvent(new CustomEvent('ap-sekme-ayarlari-guncellendi'));
  }, [ayarlar, logMesajiAyarla]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli }, kirli);

  useEffect(() => {
    const handler = () => {
      const guncel = sekmeAyarlariOku();
      setAyarlar(guncel);
      setSonKayitli(guncel);
    };
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  return (
    <AdminModulKabuk
      baslik="Sekme Yönetimi"
      aciklama="Üst sekme çubuğunun boyutunu ve davranışını ayarlayın."
      onizleGoster={false}
    >
      <div className="mt-6">
        <AdminPanelKarti baslik="Sekme Ayarları" altBaslik="Değişiklikler, Kaydet ile uygulanır">
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--ap-border)] bg-[var(--ap-hover)]/30 p-3">
              <p className="ap-heading text-sm font-semibold">Hızlı Bilgi</p>
              <p className="ap-muted mt-1 text-xs leading-relaxed">
                Sekmeleri ortadan sürükleyip bırakınca yan yana açılır; kenara bırakırsanız sırası değişir.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="space-y-3 rounded-xl border border-[var(--ap-border)] bg-[var(--ap-surface-2)]/35 p-4">
                <p className="ap-heading text-sm font-semibold">Görünüm</p>

                <div>
                  <p className="ap-muted mb-2 text-xs">Sekme Görünümü</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: 'ikon-isim', ad: 'İkon + isim' },
                        { id: 'isim', ad: 'Sadece isim' },
                        { id: 'ikon', ad: 'Sadece ikon' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAyarlar((a) => ({ ...a, sekmeGorunumModu: m.id }))}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          ayarlar.sekmeGorunumModu === m.id
                            ? ''
                            : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                        }`}
                        style={ayarlar.sekmeGorunumModu === m.id ? seciliButonStili : undefined}
                      >
                        {m.ad}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="ap-muted mb-2 text-xs">Sekme Yerleşimi</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: 'dikdortgen', ad: 'Dikdörtgen', alt: 'Üst çubukta yatay' },
                        { id: 'kare', ad: 'Kare', alt: 'Çoklu kutucuk kartı' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAyarlar((a) => ({ ...a, sekmeYerlesim: m.id }))}
                        className={`rounded-lg border px-3 py-1.5 text-left text-sm ${
                          ayarlar.sekmeYerlesim === m.id
                            ? ''
                            : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                        }`}
                        style={ayarlar.sekmeYerlesim === m.id ? seciliButonStili : undefined}
                      >
                        <span className="block leading-tight">{m.ad}</span>
                        <span className="ap-muted block text-[10px]">{m.alt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="ap-muted mb-2 text-xs">Sekme Boyutu</p>
                  <div className="flex flex-wrap gap-2">
                    {(['kucuk', 'orta', 'buyuk'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setAyarlar((a) => ({ ...a, sekmeYukseklik: b }))}
                        className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                          ayarlar.sekmeYukseklik === b
                            ? ''
                            : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                        }`}
                        style={ayarlar.sekmeYukseklik === b ? seciliButonStili : undefined}
                      >
                        {b === 'kucuk' ? 'Küçük' : b === 'buyuk' ? 'Büyük' : 'Orta'}
                      </button>
                    ))}
                  </div>
                </div>

                {ayarlar.sekmeAramaAktif && (
                  <div className="rounded-lg border border-[var(--ap-border)] bg-[var(--ap-surface)]/55 p-3">
                    <p className="ap-muted mb-2 text-xs">Arama Görünümü</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'ikon', ad: 'Sadece ikon (Windows tarzı)' },
                          { id: 'input', ad: 'Arama kutusu' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAyarlar((a) => ({ ...a, sekmeAramaGorunum: m.id }))}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                            ayarlar.sekmeAramaGorunum === m.id
                              ? ''
                              : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                          }`}
                          style={ayarlar.sekmeAramaGorunum === m.id ? seciliButonStili : undefined}
                        >
                          {m.ad}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {ayarlar.baslatMenuTasarim === 'modern' && (
                  <div className="space-y-3 rounded-lg border border-dashed border-[var(--ap-border)] bg-[var(--ap-hover)]/20 p-3">
                    <div className="flex items-center justify-between">
                      <p className="ap-heading text-xs font-semibold">Modern Başlat Menüsü</p>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide"
                        style={vurguRozetStili}
                      >
                        Modern mod
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="ap-muted mb-2 text-xs">Kategori Görünümü</p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { id: 'kare', ad: 'Kare kutular' },
                              { id: 'dikdortgen', ad: 'Uzun dikdörtgen' },
                            ] as const
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setAyarlar((a) => ({ ...a, baslatMenuKategoriGorunum: m.id }))}
                              className={`rounded-lg border px-3 py-1.5 text-sm ${
                                ayarlar.baslatMenuKategoriGorunum === m.id
                                  ? ''
                                  : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                              }`}
                              style={ayarlar.baslatMenuKategoriGorunum === m.id ? seciliButonStili : undefined}
                            >
                              {m.ad}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="ap-muted mb-2 text-xs">Modül Kutusu Boyutu</p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { id: 'kucuk', ad: 'Küçük' },
                              { id: 'orta', ad: 'Orta' },
                              { id: 'buyuk', ad: 'Büyük (tam ekran)' },
                            ] as const
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setAyarlar((a) => ({ ...a, baslatMenuKutuBoyutu: m.id }))}
                              className={`rounded-lg border px-3 py-1.5 text-sm ${
                                ayarlar.baslatMenuKutuBoyutu === m.id
                                  ? ''
                                  : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                              }`}
                              style={ayarlar.baslatMenuKutuBoyutu === m.id ? seciliButonStili : undefined}
                            >
                              {m.ad}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 rounded-xl border border-[var(--ap-border)] bg-[var(--ap-surface-2)]/35 p-4">
                <p className="ap-heading text-sm font-semibold">Davranış</p>

                <div>
                  <p className="ap-muted mb-2 text-xs">Varsayılan açılış</p>
                  <select
                    className="w-full rounded-lg border border-[var(--ap-border)] bg-[var(--ap-input-bg)] px-3 py-2 text-sm"
                    value={ayarlar.varsayilanAcilis}
                    onChange={(e) =>
                      setAyarlar((a) => ({
                        ...a,
                        varsayilanAcilis: e.target.value as SekmePanelAyarlari['varsayilanAcilis'],
                      }))
                    }
                  >
                    <option value="tek-sekme">Aynı modül için mevcut sekmeyi kullan</option>
                    <option value="yeni-sekme">Her seferinde yeni sekme aç</option>
                  </select>
                </div>

                <ToggleSatir
                  etiket="Üzerine gelince önizleme"
                  aciklama="Sekme üzerinde ekran görüntüsü önizlemesi"
                  acik={false}
                  devreDisi
                  etiketRozeti="Yakında"
                  onDegistir={() => {}}
                />
                <ToggleSatir
                  etiket="Yan yana bölme (Chrome)"
                  aciklama="Birleştirilen sekmeleri iki panelde açar"
                  acik={ayarlar.yanYanaAcilabilir}
                  onDegistir={(yanYanaAcilabilir) => setAyarlar((a) => ({ ...a, yanYanaAcilabilir }))}
                />
                <ToggleSatir
                  etiket="Sürükleyerek pencereye ayır"
                  aciklama="Sekmeyi ayrı pencereye taşır"
                  acik={ayarlar.surukleAyirPencere}
                  onDegistir={(surukleAyirPencere) => setAyarlar((a) => ({ ...a, surukleAyirPencere }))}
                />
                <ToggleSatir
                  etiket="Sekmelerde arama"
                  aciklama="Alt çubukta modül arama gösterir"
                  acik={ayarlar.sekmeAramaAktif}
                  onDegistir={(sekmeAramaAktif) => setAyarlar((a) => ({ ...a, sekmeAramaAktif }))}
                />
                <ToggleSatir
                  etiket="Sekme değiştirince otomatik kaydet"
                  aciklama="Geçişte aktif sekmedeki değişiklikleri kaydeder"
                  acik={ayarlar.sekmeGecisindeOtomatikKaydet}
                  onDegistir={(sekmeGecisindeOtomatikKaydet) =>
                    setAyarlar((a) => ({ ...a, sekmeGecisindeOtomatikKaydet }))
                  }
                />
              </section>
            </div>

            <section className="space-y-3 rounded-xl border border-[var(--ap-border)] bg-[var(--ap-surface-2)]/35 p-4">
              <p className="ap-heading text-sm font-semibold">Başlat Menüsü</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { id: 'klasik', ad: 'Klasik', aciklama: 'Mevcut sol panel tasarımı' },
                    { id: 'modern', ad: 'Modern', aciklama: 'Yenilenmiş kart ve arama düzeni' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAyarlar((a) => ({ ...a, baslatMenuTasarim: t.id }))}
                    className={`ap-baslat-tasarim-secim rounded-lg border p-3 text-left transition ${
                      ayarlar.baslatMenuTasarim === t.id
                        ? ''
                        : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                    }`}
                    style={ayarlar.baslatMenuTasarim === t.id ? seciliHafifButonStili : undefined}
                  >
                    <div
                      className={`ap-baslat-tasarim-onizleme ap-baslat-tasarim-onizleme-${t.id} mb-2`}
                      aria-hidden
                    />
                    <p className="ap-heading text-sm font-medium">{t.ad}</p>
                    <p className="ap-muted text-xs">{t.aciklama}</p>
                  </button>
                ))}
              </div>

            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAyarlar({ ...VARSAYILAN_SEKME_AYARLARI });
                }}
                className="rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-xs hover:bg-[var(--ap-hover)]"
                style={{ color: 'color-mix(in srgb, var(--ap-accent) 72%, var(--ap-text))' }}
              >
                Varsayılana sıfırla
              </button>
            </div>
          </div>
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
