import { FormAlani, formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { GorselAlan } from '@/formlar/GorselAlan';
import { AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { DurumAnahtari } from './SistemSekmeCubugu';
import type { AdminSayfa } from '@/admin/ortak/api/sayfaApi';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { SAYFA404_MENU_SECENEKLERI } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

export function Sistem404Sekme({
  form,
  sayfalar,
  onChange,
}: {
  form: SistemAyarlariForm;
  sayfalar: AdminSayfa[];
  onChange: (f: SistemAyarlariForm) => void;
}) {
  const s404 = form.sayfa404;

  const guncelle = (parcalar: Partial<typeof s404>) => {
    onChange({ ...form, sayfa404: { ...s404, ...parcalar } });
  };

  return (
    <div className="space-y-6">
      <AdminPanelKarti baslik="404 İçeriği" altBaslik="Sayfa bulunamadığında gösterilecek metinler">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
            <FormAlani etiket="Başlık">
              <input
                className={formInputSinifi}
                value={s404.baslik}
                onChange={(e) => guncelle({ baslik: e.target.value })}
              />
            </FormAlani>
            <FormAlani etiket="Önerilen Sayfa" aciklama="Ziyaretçiye yönlendirilebilecek alternatif sayfa">
              <select
                className={formSelectSinifi}
                value={s404.oneriSayfaId ?? ''}
                onChange={(e) => guncelle({ oneriSayfaId: e.target.value || null })}
              >
                <option value="">Seçilmedi</option>
                {sayfalar
                  .filter((s) => s.yayinda)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.baslik} (/{s.slug})
                    </option>
                  ))}
              </select>
            </FormAlani>
          </div>
          <FormAlani etiket="Açıklama Mesajı">
            <textarea
              className={formInputSinifi}
              rows={3}
              value={s404.mesaj}
              onChange={(e) => guncelle({ mesaj: e.target.value })}
            />
          </FormAlani>
          <DurumAnahtari
            etiket="Ana Sayfa Butonu"
            aciklama="404 sayfasında ana sayfaya dön butonu göster"
            acik={s404.anaSayfaButonu}
            onChange={(v) => guncelle({ anaSayfaButonu: v })}
            renk="mavi"
            ikon="🏠"
          />
          <div className="ap-sistem-404-gorsel-alan">
            <GorselAlan
              etiket="404 Görseli"
              aciklama="İsteğe bağlı illüstrasyon veya ikon"
              deger={s404.gorselUrl}
              onChange={(url) => guncelle({ gorselUrl: url })}
              duzen="dikey"
              onizlemeSinifi="h-28 w-28 rounded-xl object-contain bg-[var(--ap-input-bg)] border border-[var(--ap-border)] p-2"
            />
          </div>
        </div>
      </AdminPanelKarti>

      <AdminPanelKarti baslik="Menü Görünümü" altBaslik="404 sayfasında hangi menüler gösterilsin">
        <div className="ap-sistem-404-menu-grid">
          {SAYFA404_MENU_SECENEKLERI.map((sec) => (
            <button
              key={sec.deger}
              type="button"
              onClick={() => guncelle({ menuTipi: sec.deger })}
              className={`ap-sistem-404-menu-kart ${s404.menuTipi === sec.deger ? 'ap-sistem-404-menu-kart-secili' : ''}`}
            >
              <span className="ap-sistem-404-menu-baslik">{sec.ad}</span>
              <span className="ap-muted text-xs">{sec.aciklama}</span>
            </button>
          ))}
        </div>
      </AdminPanelKarti>

      <div className="ap-sistem-404-onizleme">
        <p className="ap-muted mb-2 text-[10px] uppercase tracking-wide">404 Önizleme</p>
        <div className="ap-sistem-404-onizleme-kart">
          {s404.gorselUrl && <img src={s404.gorselUrl} alt="" className="mx-auto mb-3 h-20 object-contain" />}
          <p className="text-4xl font-black text-slate-200">404</p>
          <h3 className="mt-2 text-lg font-bold text-slate-800">{s404.baslik}</h3>
          <p className="mt-1 text-sm text-slate-500">{s404.mesaj}</p>
          {s404.anaSayfaButonu && (
            <span className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-xs text-white">
              Ana Sayfaya Dön
            </span>
          )}
          <p className="ap-muted mt-4 text-[10px]">
            Menü: {SAYFA404_MENU_SECENEKLERI.find((m) => m.deger === s404.menuTipi)?.ad}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SistemGuvenlikSekme({
  form,
  onChange,
}: {
  form: SistemAyarlariForm;
  onChange: (f: SistemAyarlariForm) => void;
}) {
  return (
    <div className="space-y-4">
      <DurumAnahtari
        etiket="Güvenlik Başlıkları"
        aciklama="X-Frame-Options, X-Content-Type-Options gibi HTTP güvenlik başlıkları"
        acik={form.guvenlikBasliklari}
        onChange={(v) => onChange({ ...form, guvenlikBasliklari: v })}
        ikon="🛡️"
      />
      <DurumAnahtari
        etiket="Arama Motorlarını Engelle"
        aciklama="robots noindex — geliştirme veya bakım ortamları için"
        acik={form.robotsEngelle}
        onChange={(v) => onChange({ ...form, robotsEngelle: v })}
        renk="kirmizi"
        ikon="🤖"
      />
    </div>
  );
}

export function SistemBilgiPaneli({
  siteSlug,
  surum,
  siteAdi,
  form,
  onBakimToggle,
  bakimIslemYukleniyor,
}: {
  siteSlug: string;
  surum: string;
  siteAdi: string;
  form: SistemAyarlariForm;
  onBakimToggle?: () => void;
  bakimIslemYukleniyor?: boolean;
}) {
  return (
    <div className="ap-sistem-bilgi-grid">
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Site</span>
        <strong className="ap-heading mt-1 block text-sm">{siteAdi}</strong>
      </div>
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Slug</span>
        <strong className="ap-heading mt-1 block font-mono text-sm">{siteSlug}</strong>
      </div>
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Sürüm</span>
        <strong className="ap-heading mt-1 block text-sm">{surum}</strong>
      </div>
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">API</span>
        <strong className="ap-heading mt-1 block truncate font-mono text-xs">
          {import.meta.env.VITE_API_URL ?? '/api'}
        </strong>
      </div>
      <div className="ap-sistem-bilgi-kutu">
        <span className="ap-muted text-[10px] uppercase">Durum</span>
        <strong className={`mt-1 block text-sm ${form.siteAktif ? 'text-emerald-400' : 'text-red-400'}`}>
          {form.siteAktif ? '● Yayında' : '○ Kapalı'}
        </strong>
      </div>
      <button
        type="button"
        onClick={onBakimToggle}
        disabled={!onBakimToggle || bakimIslemYukleniyor}
        className={`ap-sistem-bilgi-kutu ap-sistem-bakim-kutu text-left ${
          form.bakimModu ? 'ap-sistem-bakim-kutu-aktif' : ''
        } ${onBakimToggle ? 'ap-sistem-bakim-kutu-tiklanabilir' : ''}`}
        title={
          onBakimToggle
            ? form.bakimModu
              ? 'Bakım modunu kapat'
              : 'Bakım modunu aç'
            : undefined
        }
      >
        <span className="ap-muted text-[10px] uppercase">Bakım</span>
        <strong className={`mt-1 block text-sm ${form.bakimModu ? 'text-orange-400' : 'text-slate-400'}`}>
          {bakimIslemYukleniyor ? '…' : form.bakimModu ? '● Aktif' : '○ Kapalı'}
        </strong>
        {onBakimToggle && (
          <span className="ap-muted mt-1 block text-[10px]">
            {form.bakimModu ? 'Kapatmak için tıklayın' : 'Açmak için tıklayın'}
          </span>
        )}
      </button>
    </div>
  );
}
