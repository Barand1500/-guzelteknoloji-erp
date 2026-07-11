import { useState } from 'react';
import { FormAlani } from '@/formlar/FormAlani';
import { KenarlikRenkSecici } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/KenarlikRenkSecici';
import { PanelSurumAcilir } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/PanelSurumAcilir';
import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import {
  VARSAYILAN_AYARLAR,
  type VarsayilanAyarlar,
} from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';
import { VARSAYILAN_PANEL_GORUNUM } from '@/admin/baslat-menusu/sistem/ayarlar/panelGorunum';
import type { DataGridCizgiModu } from '@/admin/ortak/datagrid/types';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

const SAYFA_BOYUTLARI = [5, 10, 25, 50] as const;

const CIZGI_MODLARI: { mod: DataGridCizgiModu; ikon: 'cizgi-yok' | 'cizgi-yatay' | 'cizgi-dikey' | 'cizgi-tam'; etiket: string }[] = [
  { mod: 'yok', ikon: 'cizgi-yok', etiket: 'Çizgisiz' },
  { mod: 'yatay', ikon: 'cizgi-yatay', etiket: 'Yatay' },
  { mod: 'dikey', ikon: 'cizgi-dikey', etiket: 'Dikey' },
  { mod: 'tam', ikon: 'cizgi-tam', etiket: 'Tam' },
];

function SecimGrubu<T extends string | number>({
  etiket,
  secenekler,
  deger,
  onSec,
}: {
  etiket: string;
  secenekler: { id: T; ad: string; ikon?: string }[];
  deger: T;
  onSec: (id: T) => void;
}) {
  return (
    <div className="ap-var-ayar-satir ap-var-ayar-satir--sade">
      <p className="ap-var-ayar-etiket">{etiket}</p>
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
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSatir({
  etiket,
  acik,
  onDegistir,
}: {
  etiket: string;
  acik: boolean;
  onDegistir: (v: boolean) => void;
}) {
  return (
    <div className="ap-var-ayar-toggle ap-var-ayar-toggle--sade">
      <p className="ap-var-ayar-etiket">{etiket}</p>
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
  baslik,
  ozet,
  acik,
  onAc,
  children,
}: {
  id: string;
  baslik: string;
  ozet: string;
  acik: boolean;
  onAc: (id: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`ap-var-ayar-akordiyon ap-var-ayar-akordiyon--sade${acik ? ' ap-var-ayar-akordiyon--acik' : ''}`}>
      <button
        type="button"
        className="ap-var-ayar-akordiyon-tus"
        aria-expanded={acik}
        onClick={() => onAc(acik ? null : id)}
      >
        <span className="ap-var-ayar-akordiyon-baslik">{baslik}</span>
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
  const [acikPanel, setAcikPanel] = useState<string | null>(null);
  const va = form.varsayilanAyarlar;

  const vaGuncelle = (parcalar: Partial<VarsayilanAyarlar>) => {
    onChange({ ...form, varsayilanAyarlar: { ...va, ...parcalar } });
  };

  const sekmeGuncelle = (parcalar: Partial<VarsayilanAyarlar['sekme']>) => {
    onChange({ ...form, varsayilanAyarlar: { ...va, sekme: { ...va.sekme, ...parcalar } } });
  };

  const temaOzet = va.panelTema === 'acik' ? 'Gündüz' : 'Gece';
  const tabloOzet = `${va.dataGridSayfaBoyutu} kayıt`;
  const sekmeOzet =
    va.sekme.sekmeGorunumModu === 'ikon-isim' ? 'İkon+isim' : va.sekme.sekmeGorunumModu;

  const onerilenlereDon = () => {
    onChange({
      ...form,
      kenarlikRenk: 'turuncu',
      kenarlikNeon: false,
      panelGorunum: { ...VARSAYILAN_PANEL_GORUNUM },
      varsayilanAyarlar: { ...VARSAYILAN_AYARLAR, sekme: { ...VARSAYILAN_AYARLAR.sekme } },
    });
  };

  return (
    <section className="ap-var-ayar-blok ap-var-ayar-blok--sade">
      <header className="ap-var-ayar-blok-baslik ap-var-ayar-blok-baslik--sade">
        <div>
          <h3 className="ap-var-ayar-blok-baslik-metin">Varsayılan Ayarlar</h3>
          <p className="ap-var-ayar-blok-aciklama">Site geneli panel görünümü ve davranışları</p>
        </div>
        <button type="button" className="ap-var-ayar-sifirla" onClick={onerilenlereDon}>
          Sıfırla
        </button>
      </header>

      <div className="ap-var-ayar-govde-sade">
        <PanelSurumAcilir form={form} onChange={onChange} />

        <div className="ap-var-ayar-akordiyon-liste">
          <AkordiyonOge
            id="tema"
            baslik="Tema & renk"
            ozet={`${temaOzet} · ${form.kenarlikRenk === 'mavi' ? 'Mavi' : form.kenarlikRenk === 'turuncu' ? 'Turuncu' : 'Özel'}`}
            acik={acikPanel === 'tema'}
            onAc={setAcikPanel}
          >
            <SecimGrubu
              etiket="Varsayılan mod"
              secenekler={[
                { id: 'koyu' as const, ad: 'Gece', ikon: '🌙' },
                { id: 'acik' as const, ad: 'Gündüz', ikon: '☀️' },
              ]}
              deger={va.panelTema}
              onSec={(panelTema) => vaGuncelle({ panelTema })}
            />
            <FormAlani etiket="Vurgu rengi">
              <KenarlikRenkSecici
                kenarlikRenk={form.kenarlikRenk}
                kenarlikNeon={form.kenarlikNeon}
                onChange={(ayar) =>
                  onChange({ ...form, kenarlikRenk: ayar.renk, kenarlikNeon: ayar.neon })
                }
              />
            </FormAlani>
          </AkordiyonOge>

          <AkordiyonOge
            id="tablo"
            baslik="Tablo"
            ozet={tabloOzet}
            acik={acikPanel === 'tablo'}
            onAc={setAcikPanel}
          >
            <div className="ap-var-ayar-tablo">
              <div className="ap-var-ayar-tablo-satir">
                <span className="ap-var-ayar-tablo-etiket">Sayfa başına kayıt</span>
                <div className="ap-var-ayar-segment-grup" role="group" aria-label="Sayfa başına kayıt">
                  {SAYFA_BOYUTLARI.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`ap-var-ayar-segment-tus${va.dataGridSayfaBoyutu === n ? ' ap-var-ayar-segment-tus--aktif' : ''}`}
                      aria-pressed={va.dataGridSayfaBoyutu === n}
                      onClick={() => vaGuncelle({ dataGridSayfaBoyutu: n })}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ap-var-ayar-tablo-satir">
                <span className="ap-var-ayar-tablo-etiket">Çizgiler</span>
                <div className="ap-var-ayar-segment-grup" role="group" aria-label="Tablo çizgileri">
                  {CIZGI_MODLARI.map(({ mod, ikon, etiket }) => (
                    <button
                      key={mod}
                      type="button"
                      title={etiket}
                      aria-label={etiket}
                      aria-pressed={va.dataGridCizgiModu === mod}
                      className={`ap-var-ayar-segment-tus ap-var-ayar-segment-tus--ikon${va.dataGridCizgiModu === mod ? ' ap-var-ayar-segment-tus--aktif' : ''}`}
                      onClick={() => vaGuncelle({ dataGridCizgiModu: mod })}
                    >
                      <DgIkon ad={ikon} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AkordiyonOge>

          <AkordiyonOge
            id="sekme"
            baslik="Sekmeler"
            ozet={sekmeOzet}
            acik={acikPanel === 'sekme'}
            onAc={setAcikPanel}
          >
            <SecimGrubu
              etiket="Görünüm"
              secenekler={[
                { id: 'ikon-isim' as const, ad: 'İkon+isim' },
                { id: 'isim' as const, ad: 'İsim' },
                { id: 'ikon' as const, ad: 'İkon' },
              ]}
              deger={va.sekme.sekmeGorunumModu}
              onSec={(sekmeGorunumModu) => sekmeGuncelle({ sekmeGorunumModu })}
            />
            <SecimGrubu
              etiket="Boyut"
              secenekler={[
                { id: 'kucuk' as const, ad: 'Küçük' },
                { id: 'orta' as const, ad: 'Orta' },
                { id: 'buyuk' as const, ad: 'Büyük' },
              ]}
              deger={va.sekme.sekmeYukseklik}
              onSec={(sekmeYukseklik) => sekmeGuncelle({ sekmeYukseklik })}
            />
            <SecimGrubu
              etiket="Yerleşim"
              secenekler={[
                { id: 'dikdortgen' as const, ad: 'Dikdörtgen' },
                { id: 'kare' as const, ad: 'Kare' },
              ]}
              deger={va.sekme.sekmeYerlesim}
              onSec={(sekmeYerlesim) => sekmeGuncelle({ sekmeYerlesim })}
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
            <ToggleSatir
              etiket="Yan yana sekme"
              acik={va.sekme.yanYanaAcilabilir}
              onDegistir={(yanYanaAcilabilir) => sekmeGuncelle({ yanYanaAcilabilir })}
            />
            <ToggleSatir
              etiket="Sürükleyerek ayır"
              acik={va.sekme.surukleAyirPencere}
              onDegistir={(surukleAyirPencere) => sekmeGuncelle({ surukleAyirPencere })}
            />
            <ToggleSatir
              etiket="Sekme araması"
              acik={va.sekme.sekmeAramaAktif}
              onDegistir={(sekmeAramaAktif) => sekmeGuncelle({ sekmeAramaAktif })}
            />
          </AkordiyonOge>
        </div>
      </div>
    </section>
  );
}
