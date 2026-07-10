import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';

export type TanimVarlikTipi = 'firma' | 'sube' | 'depo' | 'kasa' | 'donem';

export interface TanimVeriSeti {
  firmalar: AdminFirma[];
  subeler: AdminSube[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
  donemler: AdminDonem[];
}

export interface TanimBaglantiOzeti {
  bagliVar: boolean;
  subeSayisi: number;
  depoSayisi: number;
  kasaSayisi: number;
  donemSayisi: number;
  ozetSatirlari: string[];
}

export function tanimBaglantiOzeti(
  tip: TanimVarlikTipi,
  id: string,
  veri: TanimVeriSeti
): TanimBaglantiOzeti {
  if (tip === 'firma') {
    const subeler = veri.subeler.filter((s) => s.firmaId === id);
    const subeIdleri = new Set(subeler.map((s) => s.id));
    const depolar = veri.depolar.filter((d) => subeIdleri.has(d.subeId));
    const kasalar = veri.kasalar.filter((k) => subeIdleri.has(k.subeId));
    const donemler = veri.donemler.filter((d) => d.firmaId === id);
    const ozetSatirlari: string[] = [];
    if (subeler.length) ozetSatirlari.push(`${subeler.length} şube`);
    if (donemler.length) ozetSatirlari.push(`${donemler.length} dönem`);
    if (depolar.length) ozetSatirlari.push(`${depolar.length} depo`);
    if (kasalar.length) ozetSatirlari.push(`${kasalar.length} kasa`);
    return {
      bagliVar: ozetSatirlari.length > 0,
      subeSayisi: subeler.length,
      depoSayisi: depolar.length,
      kasaSayisi: kasalar.length,
      donemSayisi: donemler.length,
      ozetSatirlari,
    };
  }

  if (tip === 'sube') {
    const depolar = veri.depolar.filter((d) => d.subeId === id);
    const kasalar = veri.kasalar.filter((k) => k.subeId === id);
    const ozetSatirlari: string[] = [];
    if (depolar.length) ozetSatirlari.push(`${depolar.length} depo`);
    if (kasalar.length) ozetSatirlari.push(`${kasalar.length} kasa`);
    return {
      bagliVar: ozetSatirlari.length > 0,
      subeSayisi: 0,
      depoSayisi: depolar.length,
      kasaSayisi: kasalar.length,
      donemSayisi: 0,
      ozetSatirlari,
    };
  }

  return {
    bagliVar: false,
    subeSayisi: 0,
    depoSayisi: 0,
    kasaSayisi: 0,
    donemSayisi: 0,
    ozetSatirlari: [],
  };
}

export function tanimHedefMetni(
  tip: TanimVarlikTipi,
  kayit: AdminFirma | AdminSube | AdminDepo | AdminKasa | AdminDonem
): string {
  switch (tip) {
    case 'firma': {
      const f = kayit as AdminFirma;
      return `«${f.firmaAdi}» (${f.firmaKodu})`;
    }
    case 'sube': {
      const s = kayit as AdminSube;
      return `«${s.subeAdi}» (${s.subeKodu})`;
    }
    case 'depo': {
      const d = kayit as AdminDepo;
      return `«${d.depoAdi}» (${d.depoKodu})`;
    }
    case 'kasa': {
      const k = kayit as AdminKasa;
      return `«${k.kasaAdi}» (${k.kasaKodu})`;
    }
    case 'donem': {
      const dn = kayit as AdminDonem;
      return `«${dn.donemAdi}» (${dn.donemKodu})`;
    }
  }
}
