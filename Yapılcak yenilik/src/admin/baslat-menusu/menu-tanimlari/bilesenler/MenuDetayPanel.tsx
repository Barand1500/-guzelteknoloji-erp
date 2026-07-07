import { useId, useRef, type ChangeEvent } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { MetinSayiAlani } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MetinSayiAlani';
import type { MenuTanim } from '@/admin/baslat-menusu/menu-tanimlari/tipler';

interface MenuDetayPanelProps {
  menu: MenuTanim;
  duzenlenebilir: boolean;
  onDegistir: (menu: MenuTanim) => void;
}

export function MenuDetayPanel({ menu, duzenlenebilir, onDegistir }: MenuDetayPanelProps) {
  const resimInputId = useId();
  const resimRef = useRef<HTMLInputElement>(null);

  const resimSec = (e: ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = () => {
      onDegistir({ ...menu, resimUrl: typeof okuyucu.result === 'string' ? okuyucu.result : null });
    };
    okuyucu.readAsDataURL(dosya);
    e.target.value = '';
  };

  return (
    <section className="ap-menu-tanim-tanim" aria-labelledby="menu-tanim-baslik">
      <h3 id="menu-tanim-baslik" className="ap-menu-tanim-bolum-baslik">
        Menü Tanımı
      </h3>

      <div className={`ap-menu-tanim-tanim-icerik${duzenlenebilir ? '' : ' ap-menu-tanim-pasif'}`}>
        <label className="ap-menu-tanim-alan ap-menu-tanim-alan-tam">
          <span className="ap-menu-tanim-etiket">Menü Adı</span>
          <input
            type="text"
            className={formInputSinifi}
            value={menu.ad}
            placeholder="Yeni Menü Adını Giriniz"
            disabled={!duzenlenebilir}
            onChange={(e) => onDegistir({ ...menu, ad: e.target.value })}
          />
        </label>

        <div className="ap-menu-tanim-resim-satir">
          <div className="ap-menu-tanim-resim-tuslar">
            <span className="ap-menu-tanim-etiket">Resim</span>
            <div className="ap-menu-tanim-resim-butonlar">
              <button
                type="button"
                className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs"
                disabled={!duzenlenebilir}
                onClick={() => resimRef.current?.click()}
              >
                Ekle
              </button>
              <button
                type="button"
                className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil text-xs"
                disabled={!duzenlenebilir || !menu.resimUrl}
                onClick={() => onDegistir({ ...menu, resimUrl: null })}
              >
                Kaldır
              </button>
            </div>
            <input
              ref={resimRef}
              id={resimInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={!duzenlenebilir}
              onChange={resimSec}
            />
          </div>
          <div className="ap-menu-tanim-resim-onizleme" aria-hidden={!menu.resimUrl}>
            {menu.resimUrl ? (
              <img src={menu.resimUrl} alt="" />
            ) : (
              <span className="ap-menu-tanim-resim-placeholder">✕</span>
            )}
          </div>
        </div>

        <div className="ap-menu-tanim-sayi-satir">
          <MetinSayiAlani
            etiket="KDV Dahil Fiyatı"
            deger={menu.kdvDahilFiyat}
            senkronAnahtar={`${menu.id}-kdv`}
            tip="ondalik"
            disabled={!duzenlenebilir}
            onDegistir={(kdvDahilFiyat) => onDegistir({ ...menu, kdvDahilFiyat })}
          />

          <MetinSayiAlani
            etiket="Ürün Sayısı"
            deger={menu.urunSayisi}
            senkronAnahtar={`${menu.id}-adet`}
            tip="tam"
            minTam={1}
            disabled={!duzenlenebilir}
            onDegistir={(urunSayisi) => onDegistir({ ...menu, urunSayisi: Math.max(1, urunSayisi) })}
          />
        </div>

        <label className="ap-menu-tanim-aktif">
          <input
            type="checkbox"
            checked={menu.aktif}
            disabled={!duzenlenebilir}
            onChange={(e) => onDegistir({ ...menu, aktif: e.target.checked })}
          />
          <span>Aktif Mi?</span>
        </label>
      </div>
    </section>
  );
}
