import type { SiparisSatiri } from '@/admin/baslat-menusu/datagrid/demo/demoVeri';

const OFFLINE_ANAHTAR = 'erp-offline-datagrid-demo';

interface OfflineDatagridKayit {
  kdvDahil: boolean;
  satirlar: SiparisSatiri[];
}

function varsayilanKayit(): OfflineDatagridKayit {
  return { kdvDahil: true, satirlar: [] };
}

function oku(): OfflineDatagridKayit {
  try {
    const ham = localStorage.getItem(OFFLINE_ANAHTAR);
    if (!ham) return varsayilanKayit();
    const veri = JSON.parse(ham) as Partial<OfflineDatagridKayit>;
    return {
      kdvDahil: veri.kdvDahil !== false,
      satirlar: Array.isArray(veri.satirlar) ? veri.satirlar : [],
    };
  } catch {
    return varsayilanKayit();
  }
}

function kaydet(veri: OfflineDatagridKayit) {
  localStorage.setItem(OFFLINE_ANAHTAR, JSON.stringify(veri));
}

export function offlineDatagridDemoGetir(): OfflineDatagridKayit {
  return oku();
}

export function offlineDatagridDemoKaydet(body: BodyInit | null | undefined): OfflineDatagridKayit {
  if (typeof body !== 'string') return oku();
  try {
    const veri = JSON.parse(body) as Partial<OfflineDatagridKayit>;
    const kayit: OfflineDatagridKayit = {
      kdvDahil: veri.kdvDahil !== false,
      satirlar: Array.isArray(veri.satirlar) ? veri.satirlar : [],
    };
    kaydet(kayit);
    return kayit;
  } catch {
    return oku();
  }
}

export { OFFLINE_ANAHTAR as OFFLINE_DATAGRID_ANAHTAR };
