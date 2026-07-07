import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { UstSekmeCubugu } from '@/admin/kabuk/sekme-cubugu/UstSekmeCubugu';
import type { AdminSekme } from '@/admin/ortak/tipler/admin';
import {
  VARSAYILAN_SEKME_AYARLARI,
  sekmeAyarlariKaydet,
  sekmeAyarlariLogOzeti,
  sekmeAyarlariOku,
  type SekmePanelAyarlari,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

const ORNEK_SEKMELER_BASLANGIC: AdminSekme[] = [
  { id: 'o1', modulId: 'kullanicilar', baslik: 'Kullanıcılar' },
  { id: 'o2', modulId: 'roller', baslik: 'Roller ve Yetkiler' },
  { id: 'o3', modulId: 'ayarlar', baslik: 'Ayarlar' },
];

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

function ornekSekmeTasi(
  liste: AdminSekme[],
  kaynakId: string,
  hedefId: string,
  mod: 'once' | 'sonra'
): AdminSekme[] {
  if (kaynakId === hedefId) return liste;
  let yeni = [...liste];
  const kaynakIdx = yeni.findIndex((s) => s.id === kaynakId);
  const hedefIdx = yeni.findIndex((s) => s.id === hedefId);
  if (kaynakIdx < 0 || hedefIdx < 0) return liste;

  const kaynak = yeni[kaynakIdx];
  const hedef = yeni[hedefIdx];
  if (kaynak.grupId && kaynak.grupId !== hedef.grupId) {
    yeni[kaynakIdx] = { ...kaynak, grupId: undefined };
  }

  const guncelIdx = yeni.findIndex((s) => s.id === kaynakId);
  const [tasinan] = yeni.splice(guncelIdx, 1);
  let insertIdx = yeni.findIndex((s) => s.id === hedefId);
  if (mod === 'sonra') insertIdx += 1;
  yeni.splice(insertIdx, 0, tasinan);

  if (tasinan.grupId) {
    const kalan = yeni.filter((s) => s.grupId === tasinan.grupId);
    if (kalan.length === 1) {
      yeni = yeni.map((s) => (s.grupId === tasinan.grupId ? { ...s, grupId: undefined } : s));
    }
  }
  return yeni;
}

function ornekSekmeBirlestir(liste: AdminSekme[], kaynakId: string, hedefId: string): AdminSekme[] {
  if (kaynakId === hedefId) return liste;
  const kaynak = liste.find((s) => s.id === kaynakId);
  const hedef = liste.find((s) => s.id === hedefId);
  if (!kaynak || !hedef) return liste;

  const grupId = hedef.grupId ?? `grup-onizleme-${Date.now()}`;
  let guncel = liste.map((s) =>
    s.id === kaynakId || s.id === hedefId ? { ...s, grupId } : s
  );
  const kaynakIdx = guncel.findIndex((s) => s.id === kaynakId);
  const [tasinan] = guncel.splice(kaynakIdx, 1);
  const hedefIdx = guncel.findIndex((s) => s.id === hedefId);
  guncel.splice(hedefIdx + 1, 0, tasinan);
  return guncel;
}

export function SekmeYonetimiSayfasi() {
  const logMesajiAyarla = useAdminLogMesaji();
  const [ayarlar, setAyarlar] = useState<SekmePanelAyarlari>(() => sekmeAyarlariOku());
  const [sonKayitli, setSonKayitli] = useState<SekmePanelAyarlari>(() => sekmeAyarlariOku());
  const [ornekSekmeler, setOrnekSekmeler] = useState<AdminSekme[]>(ORNEK_SEKMELER_BASLANGIC);
  const [ornekAktif, setOrnekAktif] = useState('o1');

  const kirli = useMemo(() => JSON.stringify(ayarlar) !== JSON.stringify(sonKayitli), [ayarlar, sonKayitli]);

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
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminPanelKarti baslik="Sekme Ayarları" altBaslik="Değişiklikler Kaydet ile uygulanır">
          <div className="space-y-4">
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
                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                      ayarlar.sekmeGorunumModu === m.id
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                    }`}
                  >
                    {m.ad}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="ap-heading mb-1 text-sm font-medium">Sekme yerleşimi</p>
              <p className="ap-muted mb-2 text-xs">
                Kare modda sekmeler üst çubukta yatay sıralanır; her sekme kare kutu şeklinde görünür.
              </p>
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
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                    }`}
                  >
                    <span className="block leading-tight">{m.ad}</span>
                    <span className="ap-muted block text-[10px]">{m.alt}</span>
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
                    className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                      ayarlar.sekmeYukseklik === b
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                    }`}
                  >
                    {b === 'kucuk' ? 'Küçük' : b === 'buyuk' ? 'Büyük' : 'Orta'}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSatir
              etiket="Üzerine gelince önizleme"
              aciklama="Sekme üzerine gelindiğinde Windows tarzı içerik önizlemesi (ekran görüntüsü) gösterilir"
              acik={false}
              devreDisi
              etiketRozeti="Yakında"
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
              etiket="Sekmelerde arama"
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
                    className={`ap-baslat-tasarim-secim rounded-lg border p-3 text-left transition ${
                      ayarlar.baslatMenuTasarim === t.id
                        ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500/40'
                        : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
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
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                            ayarlar.baslatMenuKategoriGorunum === m.id
                              ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                              : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
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
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                            ayarlar.baslatMenuKutuBoyutu === m.id
                              ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                              : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
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

            {ayarlar.sekmeAramaAktif && (
              <div>
                <p className="ap-heading mb-2 text-sm font-medium">Arama görünümü</p>
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
                          ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                          : 'border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'
                      }`}
                    >
                      {m.ad}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAyarlar({ ...VARSAYILAN_SEKME_AYARLARI });
                setOrnekSekmeler(ORNEK_SEKMELER_BASLANGIC);
                setOrnekAktif('o1');
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Varsayılana sıfırla
            </button>
          </div>
        </AdminPanelKarti>

        <AdminPanelKarti baslik="Canlı Önizleme" altBaslik="Sürükleyerek deneyin — ortaya bırak birleştirir">
          <div
            className="ap-sekme-onizleme-alan rounded-lg border border-[var(--ap-border)] bg-[var(--ap-header-bg)] p-2"
            style={{
              ['--ap-tab-height' as string]:
                ayarlar.sekmeYukseklik === 'kucuk' ? '1.75rem' : ayarlar.sekmeYukseklik === 'buyuk' ? '2.5rem' : '2rem',
              ['--ap-tab-font-size' as string]:
                ayarlar.sekmeYukseklik === 'kucuk' ? '0.6875rem' : ayarlar.sekmeYukseklik === 'buyuk' ? '0.875rem' : '0.75rem',
              ['--ap-tab-kare' as string]: ayarlar.sekmeYerlesim === 'kare' ? '1' : '0',
            }}
          >
            <UstSekmeCubugu
              sekmeler={ornekSekmeler}
              aktifSekmeId={ornekAktif}
              onSekmeSec={setOrnekAktif}
              onSekmeKapat={(id) => {
                setOrnekSekmeler((s) => {
                  const kalan = s.filter((x) => x.id !== id);
                  if (ornekAktif === id) {
                    setOrnekAktif(kalan[0]?.id ?? '');
                  }
                  return kalan;
                });
              }}
              onSekmeTasi={(k, h, mod) => setOrnekSekmeler((s) => ornekSekmeTasi(s, k, h, mod))}
              onSekmeBirlestir={(k, h) => setOrnekSekmeler((s) => ornekSekmeBirlestir(s, k, h))}
              sekmeAyarlari={ayarlar}
            />
          </div>
          <p className="ap-muted mt-3 text-xs">
            Boyut: <strong>{ayarlar.sekmeYukseklik}</strong> · Görünüm:{' '}
            <strong>{ayarlar.sekmeGorunumModu}</strong> · Yerleşim:{' '}
            <strong>{ayarlar.sekmeYerlesim === 'kare' ? 'Kare' : 'Dikdörtgen'}</strong> · Önizleme:{' '}
            <strong>Yakında</strong> · Split:{' '}
            <strong>{ayarlar.yanYanaAcilabilir ? 'Açık' : 'Kapalı'}</strong> · Başlat menüsü:{' '}
            <strong>{ayarlar.baslatMenuTasarim === 'modern' ? 'Modern' : 'Klasik'}</strong>
            {ayarlar.baslatMenuTasarim === 'modern' && (
              <>
                {' '}
                · Kategori:{' '}
                <strong>{ayarlar.baslatMenuKategoriGorunum === 'dikdortgen' ? 'Dikdörtgen' : 'Kare'}</strong> ·
                Kutu: <strong>{ayarlar.baslatMenuKutuBoyutu}</strong>
              </>
            )}
          </p>
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
