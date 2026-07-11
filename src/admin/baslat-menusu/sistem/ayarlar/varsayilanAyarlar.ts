import type { AdminTema } from '@/baglamlar/AdminTemaContext';
import type { DataGridCizgiModu } from '@/admin/ortak/datagrid/types';
import {
  VARSAYILAN_SEKME_AYARLARI,
  type BaslatMenuKutuBoyutu,
  type BaslatMenuTasarim,
  type SekmeGorunumModu,
  type SekmePanelAyarlari,
  type SekmeYukseklik,
  type SekmeYerlesim,
  type VarsayilanAcilis,
} from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

export const SITE_VARSAYILAN_ANAHTAR = 'erp-site-varsayilan-ayarlar';

export interface VarsayilanSekmeAyarlari {
  sekmeYukseklik: SekmeYukseklik;
  varsayilanAcilis: VarsayilanAcilis;
  sekmeGorunumModu: SekmeGorunumModu;
  sekmeYerlesim: SekmeYerlesim;
  yanYanaAcilabilir: boolean;
  surukleAyirPencere: boolean;
  sekmeAramaAktif: boolean;
  baslatMenuTasarim: BaslatMenuTasarim;
  baslatMenuKutuBoyutu: BaslatMenuKutuBoyutu;
}

export interface VarsayilanAyarlar {
  panelTema: AdminTema;
  dataGridSayfaBoyutu: 5 | 10 | 25 | 50;
  dataGridCizgiModu: DataGridCizgiModu;
  sekme: VarsayilanSekmeAyarlari;
}

export const VARSAYILAN_AYARLAR: VarsayilanAyarlar = {
  panelTema: 'koyu',
  dataGridSayfaBoyutu: 10,
  dataGridCizgiModu: 'tam',
  sekme: {
    sekmeYukseklik: VARSAYILAN_SEKME_AYARLARI.sekmeYukseklik,
    varsayilanAcilis: VARSAYILAN_SEKME_AYARLARI.varsayilanAcilis,
    sekmeGorunumModu: VARSAYILAN_SEKME_AYARLARI.sekmeGorunumModu,
    sekmeYerlesim: VARSAYILAN_SEKME_AYARLARI.sekmeYerlesim,
    yanYanaAcilabilir: VARSAYILAN_SEKME_AYARLARI.yanYanaAcilabilir,
    surukleAyirPencere: VARSAYILAN_SEKME_AYARLARI.surukleAyirPencere,
    sekmeAramaAktif: VARSAYILAN_SEKME_AYARLARI.sekmeAramaAktif,
    baslatMenuTasarim: VARSAYILAN_SEKME_AYARLARI.baslatMenuTasarim,
    baslatMenuKutuBoyutu: VARSAYILAN_SEKME_AYARLARI.baslatMenuKutuBoyutu,
  },
};

const GECERLI_SAYFA_BOYUTLARI = new Set([5, 10, 25, 50]);
const GECERLI_CIZGI: DataGridCizgiModu[] = ['yok', 'yatay', 'dikey', 'tam'];

function sekmeAyariNormalize(kaynak?: Partial<VarsayilanSekmeAyarlari>): VarsayilanSekmeAyarlari {
  const v = VARSAYILAN_AYARLAR.sekme;
  return {
    sekmeYukseklik:
      kaynak?.sekmeYukseklik === 'kucuk' || kaynak?.sekmeYukseklik === 'buyuk' || kaynak?.sekmeYukseklik === 'orta'
        ? kaynak.sekmeYukseklik
        : v.sekmeYukseklik,
    varsayilanAcilis:
      kaynak?.varsayilanAcilis === 'yeni-sekme' || kaynak?.varsayilanAcilis === 'tek-sekme'
        ? kaynak.varsayilanAcilis
        : v.varsayilanAcilis,
    sekmeGorunumModu:
      kaynak?.sekmeGorunumModu === 'ikon' ||
      kaynak?.sekmeGorunumModu === 'isim' ||
      kaynak?.sekmeGorunumModu === 'ikon-isim'
        ? kaynak.sekmeGorunumModu
        : v.sekmeGorunumModu,
    sekmeYerlesim:
      kaynak?.sekmeYerlesim === 'kare' || kaynak?.sekmeYerlesim === 'dikdortgen'
        ? kaynak.sekmeYerlesim
        : v.sekmeYerlesim,
    yanYanaAcilabilir: kaynak?.yanYanaAcilabilir ?? v.yanYanaAcilabilir,
    surukleAyirPencere: kaynak?.surukleAyirPencere ?? v.surukleAyirPencere,
    sekmeAramaAktif: kaynak?.sekmeAramaAktif ?? v.sekmeAramaAktif,
    baslatMenuTasarim:
      kaynak?.baslatMenuTasarim === 'klasik' || kaynak?.baslatMenuTasarim === 'modern'
        ? kaynak.baslatMenuTasarim
        : v.baslatMenuTasarim,
    baslatMenuKutuBoyutu:
      kaynak?.baslatMenuKutuBoyutu === 'kucuk' ||
      kaynak?.baslatMenuKutuBoyutu === 'buyuk' ||
      kaynak?.baslatMenuKutuBoyutu === 'orta'
        ? kaynak.baslatMenuKutuBoyutu
        : v.baslatMenuKutuBoyutu,
  };
}

export function varsayilanAyarlarNormalize(kaynak?: Partial<VarsayilanAyarlar> | null): VarsayilanAyarlar {
  if (!kaynak) return { ...VARSAYILAN_AYARLAR, sekme: { ...VARSAYILAN_AYARLAR.sekme } };
  const boyut = Number(kaynak.dataGridSayfaBoyutu);
  return {
    panelTema: kaynak.panelTema === 'acik' ? 'acik' : 'koyu',
    dataGridSayfaBoyutu: GECERLI_SAYFA_BOYUTLARI.has(boyut) ? (boyut as 5 | 10 | 25 | 50) : 10,
    dataGridCizgiModu: GECERLI_CIZGI.includes(kaynak.dataGridCizgiModu as DataGridCizgiModu)
      ? (kaynak.dataGridCizgiModu as DataGridCizgiModu)
      : 'tam',
    sekme: sekmeAyariNormalize(kaynak.sekme),
  };
}

export function siteVarsayilanAyarlarOku(): VarsayilanAyarlar {
  try {
    const ham = localStorage.getItem(SITE_VARSAYILAN_ANAHTAR);
    if (!ham) return varsayilanAyarlarNormalize(null);
    return varsayilanAyarlarNormalize(JSON.parse(ham) as Partial<VarsayilanAyarlar>);
  } catch {
    return varsayilanAyarlarNormalize(null);
  }
}

export function siteVarsayilanAyarlarKaydet(ayarlar: VarsayilanAyarlar) {
  const normalize = varsayilanAyarlarNormalize(ayarlar);
  localStorage.setItem(SITE_VARSAYILAN_ANAHTAR, JSON.stringify(normalize));
  return normalize;
}

export function varsayilanSekmeAyarlariBirlestir(
  kullanici?: Partial<SekmePanelAyarlari> | null
): SekmePanelAyarlari {
  const site = siteVarsayilanAyarlarOku().sekme;
  return { ...VARSAYILAN_SEKME_AYARLARI, ...site, ...(kullanici ?? {}) };
}

export function varsayilanAyarlarYayinla(ayarlar: VarsayilanAyarlar) {
  const normalize = siteVarsayilanAyarlarKaydet(ayarlar);
  window.dispatchEvent(new CustomEvent('ap-varsayilan-ayarlar-guncellendi', { detail: normalize }));
  window.dispatchEvent(new CustomEvent('ap-sekme-ayarlari-guncellendi'));
}
