export type RollerTasarimModu = 'yeni-renkli' | 'eski-sade';

export interface PanelGorunumAyarlari {
  /** Site geneli panel arayüz stili (şu an roller modülünde uygulanır) */
  rollerTasarim: RollerTasarimModu;
}

export const PANEL_GORUNUM_ANAHTAR = 'erp-panel-gorunum-ayarlari';

export const VARSAYILAN_PANEL_GORUNUM: PanelGorunumAyarlari = {
  rollerTasarim: 'yeni-renkli',
};

export const PANEL_SURUM_SECENEKLERI: {
  id: RollerTasarimModu;
  ad: string;
  aciklama: string;
}[] = [
  { id: 'eski-sade', ad: 'GT-Panel 1.1.1', aciklama: 'Klasik sade arayüz' },
  { id: 'yeni-renkli', ad: 'GT-Panel 1.1.2', aciklama: 'Güncel renkli arayüz' },
];

export function panelSurumEtiketi(mod: RollerTasarimModu): string {
  return PANEL_SURUM_SECENEKLERI.find((s) => s.id === mod)?.ad ?? 'GT-Panel 1.1.2';
}

export function panelGorunumNormalize(
  kaynak?: Partial<PanelGorunumAyarlari> | null
): PanelGorunumAyarlari {
  const mod = kaynak?.rollerTasarim;
  return {
    rollerTasarim: mod === 'eski-sade' ? 'eski-sade' : 'yeni-renkli',
  };
}

export function sitePanelGorunumOku(): PanelGorunumAyarlari {
  try {
    const ham = localStorage.getItem(PANEL_GORUNUM_ANAHTAR);
    if (!ham) return { ...VARSAYILAN_PANEL_GORUNUM };
    return panelGorunumNormalize(JSON.parse(ham) as Partial<PanelGorunumAyarlari>);
  } catch {
    return { ...VARSAYILAN_PANEL_GORUNUM };
  }
}

export function sitePanelGorunumKaydet(ayarlar: PanelGorunumAyarlari): PanelGorunumAyarlari {
  const normalize = panelGorunumNormalize(ayarlar);
  localStorage.setItem(PANEL_GORUNUM_ANAHTAR, JSON.stringify(normalize));
  return normalize;
}

export function panelGorunumYayinla(ayarlar: PanelGorunumAyarlari) {
  const normalize = sitePanelGorunumKaydet(ayarlar);
  window.dispatchEvent(new CustomEvent('ap-panel-gorunum-guncellendi', { detail: normalize }));
  return normalize;
}

export const PANEL_GORUNUM_OLAY = 'ap-panel-gorunum-guncellendi';
