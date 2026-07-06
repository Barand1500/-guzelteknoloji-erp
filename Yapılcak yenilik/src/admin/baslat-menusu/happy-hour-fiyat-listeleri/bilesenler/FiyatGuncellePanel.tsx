import { SayiGirdiHesapAlani } from '@/formlar/SayiGirdiHesapAlani';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { FiyatGuncellemeTaslak } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

interface FiyatGuncellePanelProps {
  taslak: FiyatGuncellemeTaslak;
  onTaslakDegistir: (taslak: FiyatGuncellemeTaslak) => void;
  onGeri: () => void;
}

export function FiyatGuncellePanel({ taslak, onTaslakDegistir, onGeri }: FiyatGuncellePanelProps) {
  return (
    <div className="ap-fiyat-alt-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>
      <h3 className="ap-fiyat-alt-panel-baslik">Fiyat Güncelleme</h3>

      <p className="ap-fiyat-guncelle-sablon">
        Fiyatları güncellenecek şablon: <strong>{taslak.sablonAd}</strong>
      </p>

      <fieldset className="ap-fiyat-guncelle-secenekler">
        <legend className="ap-fiyat-guncelle-legend">Güncelleme tipi</legend>
        <label className="ap-fiyat-guncelle-radio">
          <input
            type="radio"
            name="fiyat-guncelle-tip"
            checked={taslak.tip === 'indirim'}
            onChange={() => onTaslakDegistir({ ...taslak, tip: 'indirim' })}
          />
          <span>Baz fiyatlardan indirim yapmak istiyorum</span>
        </label>
        <label className="ap-fiyat-guncelle-radio">
          <input
            type="radio"
            name="fiyat-guncelle-tip"
            checked={taslak.tip === 'arttirim'}
            onChange={() => onTaslakDegistir({ ...taslak, tip: 'arttirim' })}
          />
          <span>Baz fiyatlardan arttırım yapmak istiyorum</span>
        </label>
      </fieldset>

      <label className="ap-fiyat-alt-panel-alan">
        <span className="ap-fiyat-alt-panel-etiket">Baz fiyatların üstüne uygulanacak oranı giriniz</span>
        <SayiGirdiHesapAlani
          deger={taslak.oran}
          onDegistir={(oran) => onTaslakDegistir({ ...taslak, oran })}
          placeholder="10"
          onEk="%"
        />
      </label>

      <label className="ap-fiyat-alt-panel-alan">
        <span className="ap-fiyat-alt-panel-etiket">
          Elde edilen fiyatların yuvarlanacağı en küçük para miktarını giriniz
        </span>
        <SayiGirdiHesapAlani
          deger={taslak.yuvarlama}
          onDegistir={(yuvarlama) => onTaslakDegistir({ ...taslak, yuvarlama })}
          placeholder="0,50"
        />
      </label>
    </div>
  );
}
