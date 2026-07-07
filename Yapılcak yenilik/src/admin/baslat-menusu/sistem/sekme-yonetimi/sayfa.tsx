import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import {
  VARSAYILAN_SEKME_AYARLARI,
  sekmeAyarlariLogOzeti,
  sekmeAyarlariOku,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import { sekmeAyarlariKaliciKaydet } from '@/admin/ortak/api/kullaniciAyarlariApi';
function ToggleSatir({
  etiket,
  aciklama,
  acik,
  onDegistir,
  pasif,
  yakinda,
}: {
  etiket: string;
  aciklama?: string;
  acik: boolean;
  onDegistir: (v: boolean) => void;
  pasif?: boolean;
  yakinda?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-lg border border-[var(--ap-border)] p-3 ${
        pasif ? 'opacity-60' : ''
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="ap-heading text-sm font-medium">{etiket}</p>
          {yakinda && (
            <span className="rounded-full border border-[var(--ap-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ap-text-muted)]">
              Yakında
            </span>
          )}
        </div>
        {aciklama && <p className="ap-muted text-xs">{aciklama}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        disabled={pasif}
        onClick={() => {
          if (!pasif) onDegistir(!acik);
        }}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''} ${pasif ? 'cursor-not-allowed opacity-50' : ''}`}
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

  const kaydet = useCallback(async () => {
    const kaydedilecek = { ...ayarlar, hoverOnizleme: false };
    await sekmeAyarlariKaliciKaydet(kaydedilecek);
    setAyarlar(kaydedilecek);
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
        <AdminPanelKarti baslik="Sekme Ayarları" altBaslik="Değişiklikler Kaydet ile uygulanır">          <div className="space-y-4">
            <p className="ap-muted rounded-lg border border-dashed border-[var(--ap-border)] px-3 py-2 text-xs leading-relaxed">
              İki sekmeyi birleştirmek için birini diğerinin <strong>ortasına</strong> sürükleyin — Chrome
              gibi yan yana split açılır. Kenarına bırakırsanız yalnızca sıralama değişir; dışarı sürükleyerek
              ayırabilirsiniz.
            </p>

            <div>
              <p className="ap-heading mb-2 text-sm font-medium">Sekme görünümü</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'ikon-isim', ad: 'İkon + İsim' },
                    { id: 'isim', ad: 'Sadece İsim' },
                    { id: 'ikon', ad: 'Sadece İkon' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAyarlar((a) => ({ ...a, sekmeGorunumModu: m.id }))}
                    className={`rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm hover:bg-[var(--ap-hover)] ${
                      ayarlar.sekmeGorunumModu === m.id ? 'ap-secenek-btn--aktif' : ''
                    }`}
                  >
                    {m.ad}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="ap-heading mb-2 text-sm font-medium">Sekme yerleşimi</p>
              <p className="ap-muted mb-2 text-xs">
                Kare modda sekmeler üst çubukta yatay sıralanır; her sekme kare şeklinde görünür.
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'dikdortgen', ad: 'Dikdörtgen', aciklama: 'Üst çubukta yatay' },
                    { id: 'kare', ad: 'Kare', aciklama: 'Üst çubukta kare' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAyarlar((a) => ({ ...a, sekmeYerlesim: m.id }))}
                    className={`rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-left text-sm hover:bg-[var(--ap-hover)] ${
                      ayarlar.sekmeYerlesim === m.id ? 'ap-secenek-btn--aktif' : ''
                    }`}
                  >
                    <span className="block font-medium">{m.ad}</span>
                    <span className="ap-muted block text-[10px]">{m.aciklama}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="ap-heading mb-2 text-sm font-medium">Varsayılan açılış</p>
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

            <div>
              <p className="ap-heading mb-2 text-sm font-medium">Sekme boyutu</p>
              <div className="flex flex-wrap gap-2">
                {(['kucuk', 'orta', 'buyuk'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAyarlar((a) => ({ ...a, sekmeYukseklik: b }))}
                    className={`rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm capitalize hover:bg-[var(--ap-hover)] ${
                      ayarlar.sekmeYukseklik === b ? 'ap-secenek-btn--aktif' : ''
                    }`}
                  >
                    {b === 'kucuk' ? 'Küçük' : b === 'buyuk' ? 'Büyük' : 'Orta'}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSatir
              etiket="Üzerine gelince önizleme"
              aciklama="Sekme üzerine gelindiğinde içerik önizlemesi gösterilir"
              acik={false}
              pasif
              yakinda
              onDegistir={() => {}}
            />
            <ToggleSatir
              etiket="Yan yana split (Chrome)"
              aciklama="İki sekmeyi birleştirince içerik alanı ikiye bölünür"
              acik={ayarlar.yanYanaAcilabilir}
              onDegistir={(yanYanaAcilabilir) => setAyarlar((a) => ({ ...a, yanYanaAcilabilir }))}
            />
            <ToggleSatir
              etiket="Sürükleyerek pencereye ayır"
              aciklama="Sekmeyi aşağı sürükleyerek yüzen pencere olarak açar"
              acik={ayarlar.surukleAyirPencere}
              onDegistir={(surukleAyirPencere) => setAyarlar((a) => ({ ...a, surukleAyirPencere }))}
            />

            <ToggleSatir
              etiket="Modül arama"
              aciklama="Alt aksiyon çubuğunda (gece/gündüz düğmesinin yanında) modül arama gösterilir"
              acik={ayarlar.sekmeAramaAktif}
              onDegistir={(sekmeAramaAktif) => setAyarlar((a) => ({ ...a, sekmeAramaAktif }))}
            />

            <div>
              <p className="ap-heading mb-2 text-sm font-medium">Başlat menüsü tasarımı</p>
              <p className="ap-muted mb-2 text-xs">
                Mevcut klasik görünüm korunur; istediğiniz zaman modern görünüme geçebilirsiniz.
              </p>
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
                    className={`ap-baslat-tasarim-secim rounded-lg border border-[var(--ap-border)] p-3 text-left transition hover:bg-[var(--ap-hover)] ${
                      ayarlar.baslatMenuTasarim === t.id ? 'ap-secenek-btn-kart--aktif' : ''
                    }`}
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

              {ayarlar.baslatMenuTasarim === 'modern' && (
                <div className="mt-4 space-y-4 rounded-lg border border-dashed border-[var(--ap-border)] bg-[var(--ap-hover)]/20 p-3">
                  <div>
                    <p className="ap-heading mb-1 text-sm font-medium">Kategori görünümü</p>
                    <p className="ap-muted mb-2 text-xs">Sol sütundaki kategoriler nasıl görünsün?</p>
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
                          className={`rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm hover:bg-[var(--ap-hover)] ${
                            ayarlar.baslatMenuKategoriGorunum === m.id ? 'ap-secenek-btn--aktif' : ''
                          }`}
                        >
                          {m.ad}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="ap-heading mb-1 text-sm font-medium">Modül kutusu boyutu</p>
                    <p className="ap-muted mb-2 text-xs">
                      Kategori içindeki sayfa kutularının boyutu. Büyük seçilirse Windows tarzı tam ekran açılır.
                    </p>
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
                          className={`rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm hover:bg-[var(--ap-hover)] ${
                            ayarlar.baslatMenuKutuBoyutu === m.id ? 'ap-secenek-btn--aktif' : ''
                          }`}
                        >
                          {m.ad}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAyarlar({ ...VARSAYILAN_SEKME_AYARLARI })}
              className="ap-secenek-link"
            >
              Varsayılana sıfırla
            </button>
          </div>
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}