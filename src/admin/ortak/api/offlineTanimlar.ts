import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
  DepoFormDegeri,
  DonemFormDegeri,
  FirmaFormDegeri,
  KasaFormDegeri,
  SubeFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';

const OFFLINE_TANIMLAR_ANAHTAR = 'erp-offline-tanimlar';

interface OfflineTanimlarVeri {
  firmalar: AdminFirma[];
  donemler: AdminDonem[];
  subeler: AdminSube[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
}

function simdiIso() {
  return new Date().toISOString();
}

function varsayilanTanimlar(): OfflineTanimlarVeri {
  const simdi = simdiIso();
  const firmalar: AdminFirma[] = [
    {
      id: '1',
      firmaKodu: 'F001',
      firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      vergiDairesi: 'ANTALYA KURUMLAR',
      vergiNo: '9250508945',
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
  const donemler: AdminDonem[] = [
    {
      id: '1',
      firmaId: '1',
      donemKodu: 'D001',
      donemAdi: '2026',
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
  const subeler: AdminSube[] = [
    {
      id: '1',
      firmaId: '1',
      subeKodu: 'MERKEZ',
      subeAdi: 'MERKEZ',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      mahalle: 'YENI EMEK MAH.',
      cadde: 'YILDIRIM BEYAZIT CAD.',
      sokak: '',
      bina: '',
      no: '130A',
      postaKodu: '7060',
      efaturaSeri: 'GEF',
      earsivSeri: 'GEA',
      eirsaliyeSeri: 'GEI',
      mersis: '0925050894500018',
      ticaretSicil: '99725',
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
  const depolar: AdminDepo[] = [
    {
      id: '1',
      subeId: '1',
      subeKodu: 'MERKEZ',
      subeAdi: 'MERKEZ',
      depoKodu: 'MERKEZ',
      depoAdi: 'MERKEZ',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      mahalle: 'YENI EMEK MAH.',
      cadde: 'YILDIRIM BEYAZIT CAD.',
      sokak: '',
      bina: '',
      no: '130A',
      postaKodu: '7060',
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
  const kasalar: AdminKasa[] = [
    {
      id: '1',
      subeId: '1',
      subeKodu: 'MERKEZ',
      subeAdi: 'MERKEZ',
      kasaKodu: 'MERKEZ',
      kasaAdi: 'MERKEZ',
      paraBirimi: 'TL',
      aktif: true,
      olusturma: simdi,
      guncelleme: simdi,
    },
  ];
  return { firmalar, donemler, subeler, depolar, kasalar };
}

function tanimlarOku(): OfflineTanimlarVeri {
  try {
    const ham = localStorage.getItem(OFFLINE_TANIMLAR_ANAHTAR);
    if (ham) return JSON.parse(ham) as OfflineTanimlarVeri;
  } catch {
    /* bozuk kayit */
  }
  const varsayilan = varsayilanTanimlar();
  tanimlarKaydet(varsayilan);
  return varsayilan;
}

function tanimlarKaydet(veri: OfflineTanimlarVeri) {
  localStorage.setItem(OFFLINE_TANIMLAR_ANAHTAR, JSON.stringify(veri));
}

function sonrakiId(liste: { id: string }[]): string {
  return String(Math.max(0, ...liste.map((k) => Number(k.id) || 0)) + 1);
}

function subeBilgisiEkle<T extends { subeId: string }>(
  kayit: T,
  subeler: AdminSube[]
): T & { subeKodu?: string; subeAdi?: string } {
  const sube = subeler.find((s) => s.id === kayit.subeId);
  return sube ? { ...kayit, subeKodu: sube.subeKodu, subeAdi: sube.subeAdi } : kayit;
}

type Kaynak = 'firmalar' | 'donemler' | 'subeler' | 'depolar' | 'kasalar';

function kaynakBul(path: string): Kaynak | null {
  if (path.includes('/firmalar')) return 'firmalar';
  if (path.includes('/donemler')) return 'donemler';
  if (path.includes('/subeler')) return 'subeler';
  if (path.includes('/depolar')) return 'depolar';
  if (path.includes('/kasalar')) return 'kasalar';
  return null;
}

function tekilAnahtar(kaynak: Kaynak): 'firma' | 'donem' | 'sube' | 'depo' | 'kasa' {
  const map = {
    firmalar: 'firma',
    donemler: 'donem',
    subeler: 'sube',
    depolar: 'depo',
    kasalar: 'kasa',
  } as const;
  return map[kaynak];
}

export function offlineTanimlarGetir(path: string): unknown {
  const kaynak = kaynakBul(path);
  if (!kaynak) return {};
  const veri = tanimlarOku();
  if (kaynak === 'depolar') {
    return {
      depolar: veri.depolar.map((d) => subeBilgisiEkle(d, veri.subeler)),
    };
  }
  if (kaynak === 'kasalar') {
    return {
      kasalar: veri.kasalar.map((k) => subeBilgisiEkle(k, veri.subeler)),
    };
  }
  return { [kaynak]: veri[kaynak] };
}

export function offlineTanimlarYaz(path: string, method: string, body?: BodyInit | null): unknown {
  const kaynak = kaynakBul(path);
  if (!kaynak) return { mesaj: 'Kayit (offline mod)' };

  const idParca = path.split('/').pop();
  const id = idParca && /^\d+$/.test(idParca) ? idParca : null;

  if (method === 'DELETE' && id) {
    return offlineTanimSil(kaynak, id, body);
  }

  if (typeof body !== 'string') return { mesaj: 'Kayit (offline mod)' };

  const veri = tanimlarOku();
  const simdi = simdiIso();
  const tekil = tekilAnahtar(kaynak);

  if (method === 'POST') {
    const girdi = JSON.parse(body) as unknown;

    if (kaynak === 'firmalar') {
      const form = girdi as FirmaFormDegeri;
      if (!form.firmaKodu?.trim() || !form.firmaAdi?.trim()) {
        return { mesaj: 'Firma kodu ve adi zorunlu' };
      }
      const yeniId = sonrakiId(veri.firmalar);
      const firma: AdminFirma = {
        id: yeniId,
        firmaKodu: form.firmaKodu.trim().toUpperCase(),
        firmaAdi: form.firmaAdi.trim(),
        vergiDairesi: form.vergiDairesi?.trim() ?? '',
        vergiNo: form.vergiNo?.trim() ?? '',
        aktif: form.aktif !== false,
        olusturma: simdi,
        guncelleme: simdi,
      };
      veri.firmalar = [...veri.firmalar, firma];
      tanimlarKaydet(veri);
      return { firma };
    }

    if (kaynak === 'donemler') {
      const form = girdi as DonemFormDegeri;
      if (!form.donemKodu?.trim() || !form.donemAdi?.trim()) {
        return { mesaj: 'Donem kodu ve adi zorunlu' };
      }
      const yeniId = sonrakiId(veri.donemler);
      const donem: AdminDonem = {
        id: yeniId,
        firmaId: '1',
        donemKodu: form.donemKodu.trim().toUpperCase(),
        donemAdi: form.donemAdi.trim(),
        aktif: form.aktif !== false,
        olusturma: simdi,
        guncelleme: simdi,
      };
      veri.donemler = [...veri.donemler, donem];
      tanimlarKaydet(veri);
      return { donem };
    }

    if (kaynak === 'subeler') {
      const form = girdi as SubeFormDegeri & { firmaId?: string };
      if (!form.subeKodu?.trim() || !form.subeAdi?.trim()) {
        return { mesaj: 'Sube kodu ve adi zorunlu' };
      }
      const firmaId = form.firmaId ?? veri.firmalar[0]?.id ?? '1';
      if (veri.subeler.some((s) => s.firmaId === firmaId && s.subeKodu === form.subeKodu.trim().toUpperCase())) {
        return { mesaj: 'Bu sube kodu zaten kayitli' };
      }
      const yeniId = sonrakiId(veri.subeler);
      const sube: AdminSube = {
        id: yeniId,
        firmaId,
        subeKodu: form.subeKodu.trim().toUpperCase(),
        subeAdi: form.subeAdi.trim(),
        il: form.il ?? '',
        ilce: form.ilce ?? '',
        mahalle: form.mahalle ?? '',
        cadde: form.cadde ?? '',
        sokak: form.sokak ?? '',
        bina: form.bina ?? '',
        no: form.no ?? '',
        postaKodu: form.postaKodu ?? '',
        efaturaSeri: form.efaturaSeri ?? '',
        earsivSeri: form.earsivSeri ?? '',
        eirsaliyeSeri: form.eirsaliyeSeri ?? '',
        mersis: form.mersis ?? '',
        ticaretSicil: form.ticaretSicil ?? '',
        aktif: form.aktif !== false,
        olusturma: simdi,
        guncelleme: simdi,
      };
      veri.subeler = [...veri.subeler, sube];
      tanimlarKaydet(veri);
      return { sube };
    }

    if (kaynak === 'depolar') {
      const form = girdi as DepoFormDegeri;
      if (!form.subeId || !form.depoKodu?.trim() || !form.depoAdi?.trim()) {
        return { mesaj: 'Sube, depo kodu ve adi zorunlu' };
      }
      const yeniId = sonrakiId(veri.depolar);
      const depo: AdminDepo = {
        id: yeniId,
        subeId: form.subeId,
        depoKodu: form.depoKodu.trim().toUpperCase(),
        depoAdi: form.depoAdi.trim(),
        il: form.il ?? '',
        ilce: form.ilce ?? '',
        mahalle: form.mahalle ?? '',
        cadde: form.cadde ?? '',
        sokak: form.sokak ?? '',
        bina: form.bina ?? '',
        no: form.no ?? '',
        postaKodu: form.postaKodu ?? '',
        aktif: form.aktif !== false,
        olusturma: simdi,
        guncelleme: simdi,
      };
      veri.depolar = [...veri.depolar, depo];
      tanimlarKaydet(veri);
      return { depo: subeBilgisiEkle(depo, veri.subeler) };
    }

    if (kaynak === 'kasalar') {
      const form = girdi as KasaFormDegeri;
      if (!form.subeId || !form.kasaKodu?.trim() || !form.kasaAdi?.trim()) {
        return { mesaj: 'Sube, kasa kodu ve adi zorunlu' };
      }
      const yeniId = sonrakiId(veri.kasalar);
      const kasa: AdminKasa = {
        id: yeniId,
        subeId: form.subeId,
        kasaKodu: form.kasaKodu.trim().toUpperCase(),
        kasaAdi: form.kasaAdi.trim(),
        paraBirimi: form.paraBirimi?.trim() || 'TL',
        aktif: form.aktif !== false,
        olusturma: simdi,
        guncelleme: simdi,
      };
      veri.kasalar = [...veri.kasalar, kasa];
      tanimlarKaydet(veri);
      return { kasa: subeBilgisiEkle(kasa, veri.subeler) };
    }
  }

  if (method === 'PUT' && id) {
    const girdi = JSON.parse(body) as unknown;
    const simdiPut = simdiIso();

    if (kaynak === 'firmalar') {
      const idx = veri.firmalar.findIndex((k) => k.id === id);
      if (idx < 0) return { mesaj: `${tekil} bulunamadi` };
      const form = girdi as FirmaFormDegeri;
      const guncel: AdminFirma = {
        ...veri.firmalar[idx],
        firmaKodu: form.firmaKodu?.trim().toUpperCase() ?? veri.firmalar[idx].firmaKodu,
        firmaAdi: form.firmaAdi?.trim() ?? veri.firmalar[idx].firmaAdi,
        vergiDairesi: form.vergiDairesi ?? '',
        vergiNo: form.vergiNo ?? '',
        aktif: form.aktif !== false,
        guncelleme: simdiPut,
      };
      veri.firmalar[idx] = guncel;
      tanimlarKaydet(veri);
      return { firma: guncel };
    }

    if (kaynak === 'donemler') {
      const idx = veri.donemler.findIndex((k) => k.id === id);
      if (idx < 0) return { mesaj: `${tekil} bulunamadi` };
      const form = girdi as DonemFormDegeri;
      const guncel: AdminDonem = {
        ...veri.donemler[idx],
        donemKodu: form.donemKodu?.trim().toUpperCase() ?? veri.donemler[idx].donemKodu,
        donemAdi: form.donemAdi?.trim() ?? veri.donemler[idx].donemAdi,
        aktif: form.aktif !== false,
        guncelleme: simdiPut,
      };
      veri.donemler[idx] = guncel;
      tanimlarKaydet(veri);
      return { donem: guncel };
    }

    if (kaynak === 'subeler') {
      const idx = veri.subeler.findIndex((k) => k.id === id);
      if (idx < 0) return { mesaj: `${tekil} bulunamadi` };
      const form = girdi as SubeFormDegeri;
      const guncel: AdminSube = {
        ...veri.subeler[idx],
        subeKodu: form.subeKodu?.trim().toUpperCase() ?? veri.subeler[idx].subeKodu,
        subeAdi: form.subeAdi?.trim() ?? veri.subeler[idx].subeAdi,
        il: form.il ?? '',
        ilce: form.ilce ?? '',
        mahalle: form.mahalle ?? '',
        cadde: form.cadde ?? '',
        sokak: form.sokak ?? '',
        bina: form.bina ?? '',
        no: form.no ?? '',
        postaKodu: form.postaKodu ?? '',
        efaturaSeri: form.efaturaSeri ?? '',
        earsivSeri: form.earsivSeri ?? '',
        eirsaliyeSeri: form.eirsaliyeSeri ?? '',
        mersis: form.mersis ?? '',
        ticaretSicil: form.ticaretSicil ?? '',
        aktif: form.aktif !== false,
        guncelleme: simdiPut,
      };
      veri.subeler[idx] = guncel;
      tanimlarKaydet(veri);
      return { sube: guncel };
    }

    if (kaynak === 'depolar') {
      const idx = veri.depolar.findIndex((k) => k.id === id);
      if (idx < 0) return { mesaj: `${tekil} bulunamadi` };
      const form = girdi as DepoFormDegeri;
      const guncel: AdminDepo = {
        ...veri.depolar[idx],
        subeId: form.subeId || veri.depolar[idx].subeId,
        depoKodu: form.depoKodu?.trim().toUpperCase() ?? veri.depolar[idx].depoKodu,
        depoAdi: form.depoAdi?.trim() ?? veri.depolar[idx].depoAdi,
        il: form.il ?? '',
        ilce: form.ilce ?? '',
        mahalle: form.mahalle ?? '',
        cadde: form.cadde ?? '',
        sokak: form.sokak ?? '',
        bina: form.bina ?? '',
        no: form.no ?? '',
        postaKodu: form.postaKodu ?? '',
        aktif: form.aktif !== false,
        guncelleme: simdiPut,
      };
      veri.depolar[idx] = guncel;
      tanimlarKaydet(veri);
      return { depo: subeBilgisiEkle(guncel, veri.subeler) };
    }

    if (kaynak === 'kasalar') {
      const idx = veri.kasalar.findIndex((k) => k.id === id);
      if (idx < 0) return { mesaj: `${tekil} bulunamadi` };
      const form = girdi as KasaFormDegeri;
      const guncel: AdminKasa = {
        ...veri.kasalar[idx],
        subeId: form.subeId || veri.kasalar[idx].subeId,
        kasaKodu: form.kasaKodu?.trim().toUpperCase() ?? veri.kasalar[idx].kasaKodu,
        kasaAdi: form.kasaAdi?.trim() ?? veri.kasalar[idx].kasaAdi,
        paraBirimi: form.paraBirimi?.trim() || 'TL',
        aktif: form.aktif !== false,
        guncelleme: simdiPut,
      };
      veri.kasalar[idx] = guncel;
      tanimlarKaydet(veri);
      return { kasa: subeBilgisiEkle(guncel, veri.subeler) };
    }
  }

  return { mesaj: 'Kayit (offline mod)' };
}

type OfflineTanimKaynak = 'firmalar' | 'donemler' | 'subeler' | 'depolar' | 'kasalar';
type TanimSilModu = 'hepsi' | 'pasif';

function silModuOku(body?: BodyInit | null): TanimSilModu | null {
  if (typeof body !== 'string' || !body.trim()) return null;
  try {
    const parsed = JSON.parse(body) as { mod?: TanimSilModu };
    return parsed.mod === 'pasif' || parsed.mod === 'hepsi' ? parsed.mod : null;
  } catch {
    return null;
  }
}

function offlineTanimSil(kaynak: OfflineTanimKaynak, id: string, body?: BodyInit | null): unknown {
  const veri = tanimlarOku();
  const simdi = simdiIso();
  const tekil = tekilAnahtar(kaynak);
  const mod = silModuOku(body);

  if (kaynak === 'firmalar') {
    const firma = veri.firmalar.find((k) => k.id === id);
    if (!firma) return { mesaj: `${tekil} bulunamadi` };

    const subeIdleri = veri.subeler.filter((s) => s.firmaId === id).map((s) => s.id);
    const bagliVar =
      subeIdleri.length > 0 || veri.donemler.some((d) => d.firmaId === id);

    if (mod === 'pasif') {
      veri.firmalar = veri.firmalar.map((k) =>
        k.id === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      veri.subeler = veri.subeler.map((k) =>
        k.firmaId === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      veri.donemler = veri.donemler.map((k) =>
        k.firmaId === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      const subeSet = new Set(subeIdleri);
      veri.depolar = veri.depolar.map((k) =>
        subeSet.has(k.subeId) ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      veri.kasalar = veri.kasalar.map((k) =>
        subeSet.has(k.subeId) ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      tanimlarKaydet(veri);
      return { mesaj: 'Pasif yapildi' };
    }

    if (bagliVar && mod !== 'hepsi') {
      return { mesaj: 'Bagli donem veya sube varken firma silinemez' };
    }

    const subeSet = new Set(subeIdleri);
    veri.firmalar = veri.firmalar.filter((k) => k.id !== id);
    veri.subeler = veri.subeler.filter((s) => s.firmaId !== id);
    veri.donemler = veri.donemler.filter((d) => d.firmaId !== id);
    veri.depolar = veri.depolar.filter((d) => !subeSet.has(d.subeId));
    veri.kasalar = veri.kasalar.filter((k) => !subeSet.has(k.subeId));
    tanimlarKaydet(veri);
    return { mesaj: 'Silindi' };
  }

  if (kaynak === 'subeler') {
    const sube = veri.subeler.find((k) => k.id === id);
    if (!sube) return { mesaj: `${tekil} bulunamadi` };

    const bagliDepo = veri.depolar.some((d) => d.subeId === id);
    const bagliKasa = veri.kasalar.some((k) => k.subeId === id);
    const bagliVar = bagliDepo || bagliKasa;

    if (mod === 'pasif') {
      veri.subeler = veri.subeler.map((k) =>
        k.id === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      veri.depolar = veri.depolar.map((k) =>
        k.subeId === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      veri.kasalar = veri.kasalar.map((k) =>
        k.subeId === id ? { ...k, aktif: false, guncelleme: simdi } : k
      );
      tanimlarKaydet(veri);
      return { mesaj: 'Pasif yapildi' };
    }

    if (bagliVar && mod !== 'hepsi') {
      return { mesaj: 'Bagli depo veya kasa varken sube silinemez' };
    }

    veri.subeler = veri.subeler.filter((k) => k.id !== id);
    veri.depolar = veri.depolar.filter((d) => d.subeId !== id);
    veri.kasalar = veri.kasalar.filter((k) => k.subeId !== id);
    tanimlarKaydet(veri);
    return { mesaj: 'Silindi' };
  }

  if (kaynak === 'donemler') {
    const yeni = veri.donemler.filter((k) => k.id !== id);
    if (yeni.length === veri.donemler.length) return { mesaj: `${tekil} bulunamadi` };
    veri.donemler = yeni;
    tanimlarKaydet(veri);
    return { mesaj: 'Silindi' };
  }

  if (kaynak === 'depolar') {
    const yeni = veri.depolar.filter((k) => k.id !== id);
    if (yeni.length === veri.depolar.length) return { mesaj: `${tekil} bulunamadi` };
    veri.depolar = yeni;
    tanimlarKaydet(veri);
    return { mesaj: 'Silindi' };
  }

  if (kaynak === 'kasalar') {
    const yeni = veri.kasalar.filter((k) => k.id !== id);
    if (yeni.length === veri.kasalar.length) return { mesaj: `${tekil} bulunamadi` };
    veri.kasalar = yeni;
    tanimlarKaydet(veri);
    return { mesaj: 'Silindi' };
  }

  return { mesaj: 'Kayit (offline mod)' };
}
