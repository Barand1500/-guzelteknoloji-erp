import { useState } from 'react';
import { FormAlani } from '@/formlar/FormAlani';
import { KenarlikRenkSecici } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/KenarlikRenkSecici';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import {
  VARSAYILAN_AYARLAR,
  type VarsayilanAyarlar,
} from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';
import type { DataGridCizgiModu } from '@/admin/ortak/datagrid/types';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

const SAYFA_BOYUTLARI = [5, 10, 25, 50] as const;

const CIZGI_MODLARI: { mod: DataGridCizgiModu; ikon: 'cizgi-yok' | 'cizgi-yatay' | 'cizgi-dikey' | 'cizgi-tam'; etiket: string }[] = [
  { mod: 'yok', ikon: 'cizgi-yok', etiket: 'Çizgisiz' },
  { mod: 'yatay', ikon: 'cizgi-yatay', etiket: 'Yatay' },
  { mod: 'dikey', ikon: 'cizgi-dikey', etiket: 'Dikey' },
  { mod: 'tam', ikon: 'cizgi-tam', etiket: 'Tam ızgara' },
];

function SecimGrubu<T extends string | number>({
  etiket,
  aciklama,
  secenekler,
  deger,
  onSec,
}: {
  etiket: string;
  aciklama?: string;
  secenekler: { id: T; ad: string; alt?: string; ikon?: string }[];
  deger: T;
  onSec: (id: T) => void;
}) {
  return (
    <div className="ap-var-ayar-satir">
      <div className="ap-var-ayar-satir-baslik">
        <p className="ap-var-ayar-etiket">{etiket}</p>
        {aciklama && <p className="ap-var-ayar-aciklama">{aciklama}</p>}
      </div>
      <div className="ap-var-ayar-secimler">
        {secenekler.map((s) => (
          <button
            key={String(s.id)}
            type="button"
            className={`ap-var-ayar-secim${deger === s.id ? ' ap-var-ayar-secim--aktif' : ''}`}
            onClick={() => onSec(s.id)}
          >
            <span className="ap-var-ayar-secim-ust">
              {s.ikon && <span aria-hidden>{s.ikon}</span>}
              <span>{s.ad}</span>
              {deger === s.id && <span className="ap-var-ayar-secim-onay" aria-hidden>✓</span>}
            </span>
            {s.alt && <span className="ap-var-ayar-secim-alt">{s.alt}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSatir({
  etiket,
  aciklama,
  acik,
  onDegistir,
}: {
  etiket: string;
  aciklama?: string;
  acik: boolean;
  onDegistir: (v: boolean) => void;
}) {
  return (
    <div className="ap-var-ayar-toggle">
      <div>
        <p className="ap-var-ayar-etiket">{etiket}</p>
        {aciklama && <p className="ap-var-ayar-aciklama">{aciklama}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        onClick={() => onDegistir(!acik)}
        className={`ap-toggle ${acik ? 'ap-toggle-on' : ''}`}
        aria-label={`${etiket}: ${acik ? 'Açık' : 'Kapalı'}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    </div>
  );
}

function AkordiyonOge({
  id,
  ikon,
  baslik,
  ozet,
  acik,
  onAc,
  children,
}: {
  id: string;
  ikon: string;
  baslik: string;
  ozet: string;
  acik: boolean;
  onAc: (id: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`ap-var-ayar-akordiyon${acik ? ' ap-var-ayar-akordiyon--acik' : ''}`}>
      <button
        type="button"
        className="ap-var-ayar-akordiyon-tus"
        aria-expanded={acik}
        onClick={() => onAc(acik ? null : id)}
      >
        <span className="ap-var-ayar-akordiyon-sol">
          <span className="ap-var-ayar-akordiyon-ikon" aria-hidden>
            {ikon}
          </span>
          <span className="ap-var-ayar-akordiyon-metin">
            <span className="ap-var-ayar-akordiyon-baslik">{baslik}</span>
          </span>
        </span>
        <span className="ap-var-ayar-akordiyon-sag">
          <span className="ap-var-ayar-akordiyon-durum">{ozet}</span>
          <span className={`ap-var-ayar-akordiyon-ok${acik ? ' ap-var-ayar-akordiyon-ok--acik' : ''}`} aria-hidden>
            ›
          </span>
        </span>
      </button>
      {acik && <div className="ap-var-ayar-akordiyon-icerik">{children}</div>}
    </div>
  );
}

interface VarsayilanAyarlarAkordiyonProps {
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
}

export function VarsayilanAyarlarAkordiyon({ form, onChange }: VarsayilanAyarlarAkordiyonProps) {
  const [acikPanel, setAcikPanel] = useState<string | null>('gorunum');
  const va = form.varsayilanAyarlar;

  const vaGuncelle = (parcalar: Partial<VarsayilanAyarlar>) => {
    onChange({
      ...form,
      varsayilanAyarlar: { ...va, ...parcalar },
    });
  };

  const sekmeGuncelle = (parcalar: Partial<VarsayilanAyarlar['sekme']>) => {
    onChange({
      ...form,
      varsayilanAyarlar: { ...va, sekme: { ...va.sekme, ...parcalar } },
    });
  };

  const temaOzet = va.panelTema === 'acik' ? 'Gündüz modu' : 'Gece modu';
  const tabloOzet = `${va.dataGridSayfaBoyutu} kayıt · ${
    CIZGI_MODLARI.find((c) => c.mod === va.dataGridCizgiModu)?.etiket ?? 'Tam ızgara'
  }`;
  const sekmeOzet = `${va.sekme.sekmeGorunumModu === 'ikon-isim' ? 'İkon+isim' : va.sekme.sekmeGorunumModu} · ${
    va.sekme.sekmeYukseklik === 'buyuk' ? 'Büyük' : va.sekme.sekmeYukseklik === 'kucuk' ? 'Küçük' : 'Orta'
  }`;

  const onerilenlereDon = () => {
    onChange({
      ...form,
      kenarlikRenk: 'turuncu',
      kenarlikNeon: false,
      varsayilanAyarlar: {
        ...VARSAYILAN_AYARLAR,
        sekme: { ...VARSAYILAN_AYARLAR.sekme },
      },
    });
  };

  return (
    <section className="ap-var-ayar-blok">
      <header className="ap-var-ayar-blok-baslik">
        <div className="ap-var-ayar-blok-baslik-sol">
          <span className="ap-var-ayar-blok-ikon" aria-hidden>⚙️</span>
          <div>
            <div className="ap-var-ayar-blok-baslik-satir">
              <h3 className="ap-var-ayar-blok-baslik-metin">Varsayılan Ayarlar</h3>
              <span className="ap-var-ayar-site-rozeti">Site geneli</span>
            </div>
            <p className="ap-var-ayar-blok-aciklama">
              Kişisel seçim yapılmamış ekranların başlangıç görünümünü buradan belirleyin.
            </p>
          </div>
        </div>
        <button type="button" className="ap-var-ayar-sifirla" onClick={onerilenlereDon}>
          <span aria-hidden>↺</span>
          Önerilenlere dön
        </button>
      </header>

      <div className="ap-var-ayar-ozetler" aria-label="Seçili varsayılanların özeti">
        <div className="ap-var-ayar-ozet-kart">
          <span className="ap-var-ayar-ozet-ikon" aria-hidden>{va.panelTema === 'acik' ? '☀️' : '🌙'}</span>
          <span><small>Tema</small><strong>{temaOzet}</strong></span>
        </div>
        <div className="ap-var-ayar-ozet-kart">
          <span className="ap-var-ayar-ozet-ikon" aria-hidden>▦</span>
          <span><small>Tablo</small><strong>{tabloOzet}</strong></span>
        </div>
        <div className="ap-var-ayar-ozet-kart">
          <span className="ap-var-ayar-ozet-ikon" aria-hidden>▱</span>
          <span><small>Sekmeler</small><strong>{sekmeOzet}</strong></span>
        </div>
      </div>

      <div className="ap-var-ayar-akordiyon-liste">
        <AkordiyonOge
          id="gorunum"
          ikon="🎨"
          baslik="Görünüm & Tema"
          ozet={`${temaOzet} · ${form.kenarlikRenk === 'mavi' ? 'Mavi' : form.kenarlikRenk === 'turuncu' ? 'Turuncu' : 'Özel renk'}`}
          acik={acikPanel === 'gorunum'}
          onAc={setAcikPanel}
        >
          <SecimGrubu
            etiket="Varsayılan mod"
            aciklama="Panel ilk açıldığında gece veya gündüz teması"
            secenekler={[
              { id: 'koyu' as const, ad: 'Gece', alt: 'Koyu arayüz', ikon: '🌙' },
              { id: 'acik' as const, ad: 'Gündüz', alt: 'Açık arayüz', ikon: '☀️' },
            ]}
            deger={va.panelTema}
            onSec={(panelTema) => vaGuncelle({ panelTema })}
          />
          <FormAlani
            etiket="Vurgu rengi"
            aciklama="Sekme, menü ve aksiyon çubuğu kenarlık rengi"
          >
            <KenarlikRenkSecici
              kenarlikRenk={form.kenarlikRenk}
              kenarlikNeon={form.kenarlikNeon}
              onChange={(ayar) =>
                onChange({
                  ...form,
                  kenarlikRenk: ayar.renk,
                  kenarlikNeon: ayar.neon,
                })
              }
            />
          </FormAlani>
        </AkordiyonOge>

        <AkordiyonOge
          id="tablo"
          ikon="📊"
          baslik="Tablo & Liste"
          ozet={tabloOzet}
          acik={acikPanel === 'tablo'}
          onAc={setAcikPanel}
        >
          <div className="ap-var-ayar-satir">
            <div className="ap-var-ayar-satir-baslik">
              <p className="ap-var-ayar-etiket">Sayfa başına kayıt</p>
              <p className="ap-var-ayar-aciklama">DataGrid ve liste tablolarında varsayılan gösterim</p>
            </div>
            <div className="ap-var-ayar-kayit-sec" role="group" aria-label="Sayfa başına kayıt sayısı">
              {SAYFA_BOYUTLARI.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ap-var-ayar-kayit-tus${va.dataGridSayfaBoyutu === n ? ' ap-var-ayar-kayit-tus--aktif' : ''}`}
                  aria-pressed={va.dataGridSayfaBoyutu === n}
                  onClick={() => vaGuncelle({ dataGridSayfaBoyutu: n })}
                >
                  <strong>{n}</strong>
                  <span>kayıt</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ap-var-ayar-satir">
            <div className="ap-var-ayar-satir-baslik">
              <p className="ap-var-ayar-etiket">Tablo çizgileri</p>
              <p className="ap-var-ayar-aciklama">Yeni tablolarda varsayılan ızgara görünümü</p>
            </div>
            <div className="ap-var-ayar-cizgi-grup" role="group" aria-label="Varsayılan çizgi modu">
              {CIZGI_MODLARI.map(({ mod, ikon, etiket }) => (
                <button
                  key={mod}
                  type="button"
                  title={etiket}
                  aria-label={etiket}
                  aria-pressed={va.dataGridCizgiModu === mod}
                  className={`ap-var-ayar-cizgi-tus${va.dataGridCizgiModu === mod ? ' ap-var-ayar-cizgi-tus--aktif' : ''}`}
                  onClick={() => vaGuncelle({ dataGridCizgiModu: mod })}
                >
                  <DgIkon ad={ikon} />
                  <span>{etiket}</span>
                </button>
              ))}
            </div>
          </div>
        </AkordiyonOge>

        <AkordiyonOge
          id="sekme"
          ikon="📑"
          baslik="Sekme Paneli"
          ozet={sekmeOzet}
          acik={acikPanel === 'sekme'}
          onAc={setAcikPanel}
        >
          <div className="ap-var-ayar-alt-baslik">
            <span aria-hidden>◫</span>
            Görünüm
          </div>
          <SecimGrubu
            etiket="Sekme görünümü"
            secenekler={[
              { id: 'ikon-isim' as const, ad: 'İkon + isim' },
              { id: 'isim' as const, ad: 'Sadece isim' },
              { id: 'ikon' as const, ad: 'Sadece ikon' },
            ]}
            deger={va.sekme.sekmeGorunumModu}
            onSec={(sekmeGorunumModu) => sekmeGuncelle({ sekmeGorunumModu })}
          />

          <SecimGrubu
            etiket="Sekme boyutu"
            secenekler={[
              { id: 'kucuk' as const, ad: 'Küçük' },
              { id: 'orta' as const, ad: 'Orta' },
              { id: 'buyuk' as const, ad: 'Büyük' },
            ]}
            deger={va.sekme.sekmeYukseklik}
            onSec={(sekmeYukseklik) => sekmeGuncelle({ sekmeYukseklik })}
          />

          <SecimGrubu
            etiket="Sekme yerleşimi"
            secenekler={[
              { id: 'dikdortgen' as const, ad: 'Dikdörtgen', alt: 'Üst çubuk' },
              { id: 'kare' as const, ad: 'Kare', alt: 'Kutucuk kart' },
            ]}
            deger={va.sekme.sekmeYerlesim}
            onSec={(sekmeYerlesim) => sekmeGuncelle({ sekmeYerlesim })}
          />

          <SecimGrubu
            etiket="Varsayılan açılış"
            aciklama="Modül açıldığında sekme davranışı"
            secenekler={[
              { id: 'tek-sekme' as const, ad: 'Tek sekme', alt: 'Mevcut sekmeyi kullan' },
              { id: 'yeni-sekme' as const, ad: 'Yeni sekme', alt: 'Her seferinde yeni' },
            ]}
            deger={va.sekme.varsayilanAcilis}
            onSec={(varsayilanAcilis) => sekmeGuncelle({ varsayilanAcilis })}
          />

          <SecimGrubu
            etiket="Başlat menüsü"
            secenekler={[
              { id: 'modern' as const, ad: 'Modern' },
              { id: 'klasik' as const, ad: 'Klasik' },
            ]}
            deger={va.sekme.baslatMenuTasarim}
            onSec={(baslatMenuTasarim) => sekmeGuncelle({ baslatMenuTasarim })}
          />

          {va.sekme.baslatMenuTasarim === 'modern' && (
            <SecimGrubu
              etiket="Menü kutu boyutu"
              secenekler={[
                { id: 'kucuk' as const, ad: 'Küçük' },
                { id: 'orta' as const, ad: 'Orta' },
                { id: 'buyuk' as const, ad: 'Büyük' },
              ]}
              deger={va.sekme.baslatMenuKutuBoyutu}
              onSec={(baslatMenuKutuBoyutu) => sekmeGuncelle({ baslatMenuKutuBoyutu })}
            />
          )}

          <div className="ap-var-ayar-alt-baslik">
            <span aria-hidden>⌁</span>
            Davranış
          </div>
          <div className="ap-var-ayar-toggle-grup">
            <ToggleSatir
              etiket="Yan yana sekme"
              aciklama="Sekmeleri sürükleyerek yan yana bölme"
              acik={va.sekme.yanYanaAcilabilir}
              onDegistir={(yanYanaAcilabilir) => sekmeGuncelle({ yanYanaAcilabilir })}
            />
            <ToggleSatir
              etiket="Sürükleyerek ayır"
              aciklama="Sekmeyi panelden ayırıp yeni pencere gibi açma"
              acik={va.sekme.surukleAyirPencere}
              onDegistir={(surukleAyirPencere) => sekmeGuncelle({ surukleAyirPencere })}
            />
            <ToggleSatir
              etiket="Sekme araması"
              aciklama="Üst sekme çubuğunda arama"
              acik={va.sekme.sekmeAramaAktif}
              onDegistir={(sekmeAramaAktif) => sekmeGuncelle({ sekmeAramaAktif })}
            />
          </div>
        </AkordiyonOge>
      </div>
    </section>
  );
}
