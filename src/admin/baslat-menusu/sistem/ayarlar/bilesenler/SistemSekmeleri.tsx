import { useCallback, useRef, useState } from 'react';
import { FormAlani, formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { GorselAlan } from '@/formlar/GorselAlan';
import { BakimEkrani } from './BakimEkrani';
import { AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { DurumAnahtari } from './SistemSekmeCubugu';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { PANEL_DILLERI } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { panelJsonIceAktar, PANEL_VARSAYILAN_DILLER } from '@/dil/panelSozluk';

interface PanelDilEditorProps {
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
}

export function PanelDilSekme({ form, onChange }: PanelDilEditorProps) {
  const [modalAcik, setModalAcik] = useState(false);
  const [jsonMetin, setJsonMetin] = useState('');
  const [jsonHata, setJsonHata] = useState('');
  const dosyaRef = useRef<HTMLInputElement>(null);

  const seciliDilAd = PANEL_DILLERI.find((d) => d.kod === form.panelDili)?.ad ?? form.panelDili;

  const modalAc = useCallback(() => {
    const ozel = form.panelCeviriler[form.panelDili] ?? {};
    const varsayilan = PANEL_VARSAYILAN_DILLER[form.panelDili] ?? {};
    const birlesik: Record<string, string> = { ...varsayilan, ...ozel };
    const sirali = Object.keys(birlesik)
      .sort()
      .reduce<Record<string, string>>((acc, k) => {
        acc[k] = birlesik[k];
        return acc;
      }, {});
    setJsonMetin(JSON.stringify(sirali, null, 2));
    setJsonHata('');
    setModalAcik(true);
  }, [form.panelDili, form.panelCeviriler]);

  const jsonKaydet = () => {
    try {
      const veri = panelJsonIceAktar(jsonMetin);
      onChange({
        ...form,
        panelCeviriler: {
          ...form.panelCeviriler,
          [form.panelDili]: veri,
        },
      });
      setModalAcik(false);
    } catch (err) {
      setJsonHata(err instanceof Error ? err.message : 'JSON geçersiz');
    }
  };

  const jsonIndir = () => {
    const blob = new Blob([jsonMetin], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panel-ceviri-${form.panelDili}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonYukle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = () => {
      setJsonMetin(String(okuyucu.result ?? ''));
      setJsonHata('');
    };
    okuyucu.readAsText(dosya);
    e.target.value = '';
  };

  const ingilizceSablonYukle = () => {
    const en = PANEL_VARSAYILAN_DILLER.en ?? {};
    setJsonMetin(JSON.stringify(en, null, 2));
    setJsonHata('');
  };

  return (
    <>
      <div className="space-y-6">
        <AdminPanelKarti baslik="Panel Dili" altBaslik="Admin arayüzünün görüntüleme dili">
          <div className="ap-sistem-dil-satir">
            <FormAlani etiket="Aktif Dil" aciklama="Panel menüleri ve butonlar bu dilde gösterilir">
              <div className="flex gap-2">
                <select
                  className={`${formSelectSinifi} flex-1`}
                  value={form.panelDili}
                  onChange={(e) => onChange({ ...form, panelDili: e.target.value })}
                >
                  {PANEL_DILLERI.map((d) => (
                    <option key={d.kod} value={d.kod}>
                      {d.ad} ({d.kod})
                    </option>
                  ))}
                </select>
                <button type="button" onClick={modalAc} className="ap-sistem-cark-btn" title="Çeviri ayarları">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </button>
              </div>
            </FormAlani>
          </div>

          <div className="ap-sistem-dil-bilgi">
            <p className="text-sm font-medium text-[var(--ap-heading)]">
              Seçili dil: <span className="text-[var(--ap-accent)]">{seciliDilAd}</span>
            </p>
            <p className="ap-muted mt-1 text-xs leading-relaxed">
              Çark simgesine tıklayarak tüm panel metinlerini JSON olarak görüntüleyebilir, düzenleyebilir veya
              İngilizce/özel dil çevirisi yükleyebilirsiniz. Her anahtar bir arayüz metnini temsil eder.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="ap-sistem-etiket">
                {Object.keys(form.panelCeviriler[form.panelDili] ?? {}).length} özel çeviri
              </span>
              <span className="ap-sistem-etiket ap-sistem-etiket-vurgu">
                {Object.keys(PANEL_VARSAYILAN_DILLER[form.panelDili] ?? PANEL_VARSAYILAN_DILLER.tr ?? {}).length}+ anahtar
              </span>
            </div>
          </div>
        </AdminPanelKarti>

        <AdminPanelKarti baslik="Hızlı İpuçları" altBaslik="Çeviri iş akışı">
          <ul className="ap-sistem-ipucu-liste">
            <li>JSON dosyasını indirip çeviri aracında düzenleyin, sonra tekrar yükleyin.</li>
            <li>Anahtarları değiştirmeyin — sadece değerleri çevirin (ör. <code>modul.dashboard</code>).</li>
            <li>İngilizce için &quot;İngilizce şablon yükle&quot; butonunu kullanabilirsiniz.</li>
            <li>Özel dil kodu seçip tamamen kendi çevirinizi oluşturabilirsiniz.</li>
          </ul>
        </AdminPanelKarti>
      </div>

      {modalAcik && (
        <div className="ap-sistem-modal-arka">
          <div className="ap-sistem-modal">
            <div className="ap-sistem-modal-baslik">
              <div>
                <h3 className="ap-heading text-base font-bold">Çeviri Ayarları — {seciliDilAd}</h3>
                <p className="ap-muted text-xs">Tüm panel metinleri JSON formatında</p>
              </div>
              <button type="button" onClick={() => setModalAcik(false)} className="ap-sistem-modal-kapat">
                ✕
              </button>
            </div>

            <div className="ap-sistem-modal-aksiyonlar">
              <button type="button" onClick={jsonIndir} className="ap-sistem-modal-btn">
                📥 JSON İndir
              </button>
              <button type="button" onClick={() => dosyaRef.current?.click()} className="ap-sistem-modal-btn">
                📤 JSON Yükle
              </button>
              <button type="button" onClick={ingilizceSablonYukle} className="ap-sistem-modal-btn">
                🇬🇧 İngilizce Şablon
              </button>
              <button
                type="button"
                onClick={() => {
                  const { [form.panelDili]: _, ...kalan } = form.panelCeviriler;
                  onChange({ ...form, panelCeviriler: kalan });
                  const varsayilan = PANEL_VARSAYILAN_DILLER[form.panelDili] ?? PANEL_VARSAYILAN_DILLER.tr ?? {};
                  setJsonMetin(JSON.stringify(varsayilan, null, 2));
                  setJsonHata('');
                }}
                className="ap-sistem-modal-btn ap-sistem-modal-btn-tehlike"
              >
                ↺ Sıfırla
              </button>
              <input ref={dosyaRef} type="file" accept=".json,application/json" className="hidden" onChange={jsonYukle} />
            </div>

            <textarea
              className="ap-sistem-json-editor"
              value={jsonMetin}
              onChange={(e) => {
                setJsonMetin(e.target.value);
                setJsonHata('');
              }}
              spellCheck={false}
            />

            {jsonHata && <p className="mt-2 text-xs text-red-400">{jsonHata}</p>}

            <div className="ap-sistem-modal-alt">
              <button type="button" onClick={() => setModalAcik(false)} className="ap-sistem-modal-btn">
                İptal
              </button>
              <button type="button" onClick={jsonKaydet} className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil">
                Çevirileri Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SistemGenelSekme({
  form,
  onChange,
  onSiteAktifDegis,
  siteAktifIslemde = false,
}: {
  form: SistemAyarlariForm;
  onChange: (f: SistemAyarlariForm) => void;
  onSiteAktifDegis?: (aktif: boolean) => void;
  siteAktifIslemde?: boolean;
}) {
  return (
    <div className="space-y-4">
      <DurumAnahtari
        etiket="Site Aktif"
        aciklama="Kapalıyken ziyaretçiler siteye erişemez. Admin paneli etkilenmez."
        acik={form.siteAktif}
        devreDisi={siteAktifIslemde}
        onChange={(v) => {
          if (onSiteAktifDegis) {
            onSiteAktifDegis(v);
            return;
          }
          onChange({ ...form, siteAktif: v });
        }}
        ikon="🌐"
      />
      <FormAlani etiket="Özel Domain" aciklama="Canlı yayında kullanılacak alan adı">
        <input
          className={formInputSinifi}
          placeholder="www.ornek.com"
          value={form.domain}
          onChange={(e) => onChange({ ...form, domain: e.target.value })}
        />
      </FormAlani>
      <FormAlani etiket="Log Saklama Süresi" aciklama="Etkinlik logları kaç gün tutulsun (7–365)">
        <input
          type="number"
          min={7}
          max={365}
          className={formInputSinifi}
          value={form.logSaklamaGun}
          onChange={(e) => onChange({ ...form, logSaklamaGun: Number(e.target.value) || 90 })}
        />
      </FormAlani>
    </div>
  );
}

export function SistemBakimSekme({
  form,
  onChange,
  siteAdi = 'Site',
}: {
  form: SistemAyarlariForm;
  onChange: (f: SistemAyarlariForm) => void;
  siteAdi?: string;
}) {
  const onizlemeAyarlar = {
    anaRenk: '#7c3aed',
    ikincilRenk: '#a78bfa',
    logoUrl: null,
    slogan: null,
    email: null,
    telefon: null,
    sistemAyarlariJson: {
      bakimModu: true,
      bakimBaslik: form.bakimBaslik,
      bakimMesaji: form.bakimMesaji,
      bakimGorselUrl: form.bakimGorselUrl,
      bakimTahminiSure: form.bakimTahminiSure,
    },
  };

  return (
    <div className="space-y-5">
      {form.bakimModu && (
        <div className="ap-sistem-bakim-aktif-banner">
          <span className="bakim-ekrani-nabiz inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
          <div>
            <p className="text-sm font-semibold text-orange-200">Bakım modu şu an aktif</p>
            <p className="text-xs text-orange-100/80">
              Ziyaretçiler siteye girdiğinde aşağıdaki bakım ekranını görür. Admin paneli etkilenmez.
            </p>
          </div>
        </div>
      )}

      <DurumAnahtari
        etiket="Bakım Modu"
        aciklama="Açıkken ziyaretçilere özel bakım ekranı gösterilir"
        acik={form.bakimModu}
        onChange={(v) => onChange({ ...form, bakimModu: v })}
        renk="turuncu"
        ikon="🔧"
      />

      <div className="ap-sistem-bakim-detay space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-4">
            <FormAlani etiket="Bakım Başlığı">
              <input
                className={formInputSinifi}
                value={form.bakimBaslik}
                onChange={(e) => onChange({ ...form, bakimBaslik: e.target.value })}
                placeholder="Örn. Kısa süreli bakım çalışması"
              />
            </FormAlani>
            <FormAlani etiket="Bakım Mesajı">
              <textarea
                className={formInputSinifi}
                rows={5}
                value={form.bakimMesaji}
                onChange={(e) => onChange({ ...form, bakimMesaji: e.target.value })}
                placeholder="Ziyaretçilere gösterilecek açıklama metni"
              />
            </FormAlani>
            <FormAlani etiket="Tahmini Süre" aciklama="Örn. 2 saat, yarın 10:00">
              <input
                className={formInputSinifi}
                placeholder="Yaklaşık 1 saat"
                value={form.bakimTahminiSure}
                onChange={(e) => onChange({ ...form, bakimTahminiSure: e.target.value })}
              />
            </FormAlani>
            <GorselAlan
              etiket="Bakım Görseli"
              aciklama="Logo veya illüstrasyon — bakım ekranında gösterilir"
              deger={form.bakimGorselUrl}
              onChange={(url) => onChange({ ...form, bakimGorselUrl: url })}
              onizlemeSinifi="h-32 w-full max-w-xs rounded-xl object-contain bg-[var(--ap-input-bg)] border border-[var(--ap-border)] p-4"
            />
            <FormAlani
              etiket="IP Beyaz Liste"
              aciklama="Bu IP adresleri bakım ekranını görmez (her satıra bir IP)"
            >
              <textarea
                className={formInputSinifi}
                rows={3}
                value={form.bakimIpBeyazListe.join('\n')}
                onChange={(e) =>
                  onChange({
                    ...form,
                    bakimIpBeyazListe: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="192.168.1.1"
              />
            </FormAlani>
          </div>

          <AdminPanelKarti
            baslik="Canlı Önizleme"
            altBaslik={`${siteAdi} — ziyaretçilerin göreceği ekran`}
          >
            <div className="overflow-hidden rounded-xl border border-[var(--ap-border)]">
              <BakimEkrani siteAdi={siteAdi} ayarlar={onizlemeAyarlar} onizleme />
            </div>
          </AdminPanelKarti>
        </div>
      </div>
    </div>
  );
}
