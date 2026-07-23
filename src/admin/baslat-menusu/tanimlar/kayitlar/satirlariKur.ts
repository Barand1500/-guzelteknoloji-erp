import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { TIP_SIRASI, type TanimSatir } from './tipler';

export function satirlariKur(params: {
  firma: AdminFirma | null;
  firmaSubeleri: AdminSube[];
  donemler: AdminDonem[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
  subeMap: Map<string, AdminSube>;
}): TanimSatir[] {
  const { firma, firmaSubeleri, donemler, depolar, kasalar, subeMap } = params;
  if (!firma) return [];

  const subeIdleri = new Set(firmaSubeleri.map((s) => s.id));
  const liste: TanimSatir[] = [];

  liste.push({
    id: `firma:${firma.id}`,
    tip: 'firma',
    kod: firma.firmaKodu,
    ad: firma.firmaAdi,
    baglamMetin: '',
    aktif: firma.aktif,
    olusturma: firma.olusturma,
    guncelleme: firma.guncelleme,
    firmaId: firma.id,
    kayit: firma,
  });

  for (const d of donemler.filter((x) => x.firmaId === firma.id)) {
    liste.push({
      id: `donem:${d.id}`,
      tip: 'donem',
      kod: d.donemKodu,
      ad: d.donemAdi,
      baglamMetin: `${d.donemKodu} — ${d.donemAdi}`,
      aktif: d.aktif,
      olusturma: d.olusturma,
      guncelleme: d.guncelleme,
      firmaId: firma.id,
      kayit: d,
    });
  }

  for (const s of firmaSubeleri) {
    liste.push({
      id: `sube:${s.id}`,
      tip: 'sube',
      kod: s.subeKodu,
      ad: s.subeAdi,
      baglamMetin: `${s.subeKodu} — ${s.subeAdi}`,
      aktif: s.aktif,
      olusturma: s.olusturma,
      guncelleme: s.guncelleme,
      firmaId: firma.id,
      subeId: s.id,
      kayit: s,
    });
  }

  for (const d of depolar.filter((x) => subeIdleri.has(x.subeId))) {
    const sube = subeMap.get(d.subeId);
    liste.push({
      id: `depo:${d.id}`,
      tip: 'depo',
      kod: d.depoKodu,
      ad: d.depoAdi,
      baglamMetin: sube ? `${sube.subeKodu} — ${sube.subeAdi}` : (d.subeKodu ?? ''),
      aktif: d.aktif,
      olusturma: d.olusturma,
      guncelleme: d.guncelleme,
      firmaId: firma.id,
      subeId: d.subeId,
      kayit: d,
    });
  }

  for (const k of kasalar.filter((x) => subeIdleri.has(x.subeId))) {
    const sube = subeMap.get(k.subeId);
    liste.push({
      id: `kasa:${k.id}`,
      tip: 'kasa',
      kod: k.kasaKodu,
      ad: k.kasaAdi,
      baglamMetin: sube ? `${sube.subeKodu} — ${sube.subeAdi}` : (k.subeKodu ?? ''),
      aktif: k.aktif,
      olusturma: k.olusturma,
      guncelleme: k.guncelleme,
      firmaId: firma.id,
      subeId: k.subeId,
      kayit: k,
    });
  }

  return liste.sort((a, b) => {
    const tipFark = TIP_SIRASI[a.tip] - TIP_SIRASI[b.tip];
    if (tipFark !== 0) return tipFark;
    return a.kod.localeCompare(b.kod, 'tr');
  });
}
