import type { SistemAyarlariJson } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { varsayilanScriptAyarlari, bosSistemForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';

export interface SiteAyarlariOzet {
  anaRenk?: string;
  ikincilRenk?: string;
  logoUrl?: string | null;
  slogan?: string | null;
  email?: string | null;
  telefon?: string | null;
  sistemAyarlariJson?: unknown;
}

function scriptAyarlariCoz(kaynak: unknown) {
  if (!kaynak || typeof kaynak !== 'object') return { ...varsayilanScriptAyarlari };
  const s = kaynak as Record<string, unknown>;
  return {
    googleAnalytics: typeof s.googleAnalytics === 'string' ? s.googleAnalytics : '',
    headerScript: typeof s.headerScript === 'string' ? s.headerScript : '',
    bodyAcilisScript: typeof s.bodyAcilisScript === 'string' ? s.bodyAcilisScript : '',
    footerScript: typeof s.footerScript === 'string' ? s.footerScript : '',
  };
}

export function sistemAyarlariCoz(ayarlar: SiteAyarlariOzet | null | undefined): SistemAyarlariJson {
  const json = (ayarlar as { sistemAyarlariJson?: unknown } | null | undefined)?.sistemAyarlariJson;
  if (!json || typeof json !== 'object') {
    return {
      bakimModu: false,
      bakimBaslik: bosSistemForm.bakimBaslik,
      bakimMesaji: bosSistemForm.bakimMesaji,
      bakimGorselUrl: '',
      bakimTahminiSure: '',
      scriptAyarlari: { ...varsayilanScriptAyarlari },
    };
  }
  const kayit = json as Record<string, unknown>;
  return {
    bakimModu: typeof kayit.bakimModu === 'boolean' ? kayit.bakimModu : false,
    bakimBaslik: typeof kayit.bakimBaslik === 'string' ? kayit.bakimBaslik : bosSistemForm.bakimBaslik,
    bakimMesaji: typeof kayit.bakimMesaji === 'string' ? kayit.bakimMesaji : bosSistemForm.bakimMesaji,
    bakimGorselUrl: typeof kayit.bakimGorselUrl === 'string' ? kayit.bakimGorselUrl : '',
    bakimTahminiSure: typeof kayit.bakimTahminiSure === 'string' ? kayit.bakimTahminiSure : '',
    sayfa404:
      kayit.sayfa404 && typeof kayit.sayfa404 === 'object'
        ? (kayit.sayfa404 as SistemAyarlariJson['sayfa404'])
        : undefined,
    scriptAyarlari: scriptAyarlariCoz(kayit.scriptAyarlari),
  };
}

export function bakimModuAktifMi(ayarlar: SiteAyarlariOzet | null | undefined) {
  return sistemAyarlariCoz(ayarlar).bakimModu === true;
}

export function siteKapaliMi(site: { aktif?: boolean } | null | undefined) {
  return site?.aktif === false;
}
