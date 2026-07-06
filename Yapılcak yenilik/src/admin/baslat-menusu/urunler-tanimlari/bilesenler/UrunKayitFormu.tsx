import { formInputSinifi, formSelectSinifi, FormAlani } from '@/formlar/FormAlani';
import { AdminAnahtarDugme } from '@/admin/ortak/AdminFormBilesenleri';
import { FiyatTanimlariButonu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/FiyatTanimlariModal';
import {
  FATURA_GRUPLARI,
  FAVORI_SECENEKLERI,
  URUN_GRUPLARI,
  URUN_TIPLERI,
  type UrunTanimi,
} from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

interface UrunKayitFormuProps {
  urun: UrunTanimi;
  onDegistir: (urun: UrunTanimi) => void;
  kirli?: boolean;
}

function fiyatGoster(fiyat: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(fiyat);
}

function SayiGirdi({
  deger,
  onDegistir,
  min,
  step = 1,
  className,
}: {
  deger: number;
  onDegistir: (v: number) => void;
  min?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      className={className ?? formInputSinifi}
      value={deger}
      min={min}
      step={step}
      onChange={(e) => {
        const n = e.target.value === '' ? 0 : Number(e.target.value);
        onDegistir(Number.isFinite(n) ? n : 0);
      }}
    />
  );
}

export function UrunKayitFormu({ urun, onDegistir, kirli }: UrunKayitFormuProps) {
  const alanGuncelle = <K extends keyof UrunTanimi>(alan: K, deger: UrunTanimi[K]) => {
    onDegistir({ ...urun, [alan]: deger });
  };

  return (
    <div className="ap-urun-kart">
      <header className="ap-urun-kart-ust">
        <label className="ap-urun-kart-resim">
          {urun.resimUrl ? (
            <img src={urun.resimUrl} alt="" className="ap-urun-kart-resim-img" />
          ) : (
            <span className="ap-urun-kart-resim-bos" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </span>
          )}
          <span className="ap-urun-kart-resim-etiket">Resim seç</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const dosya = e.target.files?.[0];
              if (!dosya) return;
              alanGuncelle('resimUrl', URL.createObjectURL(dosya));
              e.target.value = '';
            }}
          />
        </label>

        <div className="ap-urun-kart-baslik-alan">
          <div className="ap-urun-kart-baslik-satir">
            <input
              className="ap-urun-kart-ad"
              value={urun.ad}
              onChange={(e) => alanGuncelle('ad', e.target.value)}
              placeholder="Ürün adı"
              aria-label="Ürün adı"
            />
            {kirli && <span className="ap-urun-kart-kirli-rozet">Kaydedilmedi</span>}
          </div>

          <div className="ap-urun-kart-meta">
            <input
              className="ap-urun-kart-kod"
              value={urun.stokKodu}
              onChange={(e) => alanGuncelle('stokKodu', e.target.value)}
              placeholder="Stok kodu"
              aria-label="Stok kodu"
            />
            <span className="ap-urun-kart-ayrac" aria-hidden />
            <span className="ap-urun-kart-grup">{urun.urunGrubu}</span>
            <span className="ap-urun-kart-tip">{urun.urunTipi}</span>
          </div>
        </div>

        <div className="ap-urun-kart-fiyat-blok">
          <span className="ap-urun-kart-fiyat-etiket">KDV dahil</span>
          <div className="ap-urun-kart-fiyat-satir">
            <span className="ap-urun-kart-fiyat-onizleme" aria-hidden>
              {fiyatGoster(urun.kdvDahilFiyat)}
            </span>
            <SayiGirdi
              className="ap-urun-kart-fiyat-girdi"
              deger={urun.kdvDahilFiyat}
              min={0}
              step={0.01}
              onDegistir={(kdvDahilFiyat) => alanGuncelle('kdvDahilFiyat', kdvDahilFiyat)}
            />
            <FiyatTanimlariButonu
              liste={urun.fiyatListeleri}
              modalBaslik={`${urun.ad || 'Ürün'} — Fiyat Tanımları`}
              modalAltBaslik="PAKET, SALON gibi listelere özel fiyat girin"
              onKaydet={(fiyatListeleri) => alanGuncelle('fiyatListeleri', fiyatListeleri)}
            />
          </div>
          <div className="ap-urun-kart-kdv">
            <span>KDV %</span>
            <SayiGirdi
              deger={urun.kdvOrani}
              min={0}
              step={0.01}
              onDegistir={(kdvOrani) => alanGuncelle('kdvOrani', kdvOrani)}
            />
          </div>
        </div>
      </header>

      <div className="ap-urun-kart-alanlar">
        <div className="ap-urun-kart-bolum">
          <h3 className="ap-urun-kart-bolum-baslik">Sınıflandırma</h3>
          <div className="ap-urun-kart-grid">
            <FormAlani etiket="Ürün Grubu">
              <select
                className={formSelectSinifi}
                value={urun.urunGrubu}
                onChange={(e) => alanGuncelle('urunGrubu', e.target.value)}
              >
                {URUN_GRUPLARI.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </FormAlani>
            <FormAlani etiket="Ürün Tipi">
              <select
                className={formSelectSinifi}
                value={urun.urunTipi}
                onChange={(e) => alanGuncelle('urunTipi', e.target.value as UrunTanimi['urunTipi'])}
              >
                {URUN_TIPLERI.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormAlani>
            <FormAlani etiket="Fatura Grubu">
              <select
                className={formSelectSinifi}
                value={urun.faturaGrubu}
                onChange={(e) => alanGuncelle('faturaGrubu', e.target.value)}
              >
                {FATURA_GRUPLARI.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormAlani>
            <FormAlani etiket="Favoriler">
              <select
                className={formSelectSinifi}
                value={urun.favori}
                onChange={(e) => alanGuncelle('favori', e.target.value)}
              >
                {FAVORI_SECENEKLERI.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormAlani>
          </div>
        </div>

        <div className="ap-urun-kart-bolum">
          <h3 className="ap-urun-kart-bolum-baslik">Ek Bilgiler</h3>
          <div className="ap-urun-kart-grid">
            <FormAlani etiket="Sıra">
              <SayiGirdi deger={urun.sira} min={1} onDegistir={(sira) => alanGuncelle('sira', sira)} />
            </FormAlani>
            <FormAlani etiket="PLU">
              <input
                className={formInputSinifi}
                value={urun.plu}
                onChange={(e) => alanGuncelle('plu', e.target.value)}
                placeholder="PLU kodu"
              />
            </FormAlani>
            <FormAlani etiket="İstisna Kodu">
              <input
                className={formInputSinifi}
                value={urun.istisnaKodu}
                onChange={(e) => alanGuncelle('istisnaKodu', e.target.value)}
                placeholder="—"
              />
            </FormAlani>
            <FormAlani etiket="Özel Matrah Kodu">
              <input
                className={formInputSinifi}
                value={urun.ozelMatrahKodu}
                onChange={(e) => alanGuncelle('ozelMatrahKodu', e.target.value)}
                placeholder="—"
              />
            </FormAlani>
            <FormAlani etiket="İkram">
              <AdminAnahtarDugme
                etiket={urun.ikram ? 'Evet' : 'Hayır'}
                acik={urun.ikram}
                onDegistir={(ikram: boolean) => alanGuncelle('ikram', ikram)}
              />
            </FormAlani>
          </div>
        </div>

        {urun.resimUrl && (
          <div className="ap-urun-kart-resim-kaldir">
            <button type="button" className="ap-urun-kart-resim-kaldir-tus" onClick={() => alanGuncelle('resimUrl', null)}>
              Resmi kaldır
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
