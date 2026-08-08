/**
 * Mock belge deposu — localStorage.
 * Diğer ERP sayfalarına dokunmaz; yalnızca belgeler modülü kullanır.
 */
import {
  belgeTipKodu,
  bosBelgeIskontolari,
  bosBelgeIskontoTutarlari,
  cariEtkiHesapla,
  gecerliBelgeIskontolari,
  gecerliBelgeIskontoTutarlari,
  stokMiktarIsareti,
  type BelgeKayit,
  type BelgeKayitGirdi,
  type BelgeSatiri,
  type BelgeTur,
  type BelgeYon,
  type CariHareketKayit,
  type OdemeKanali,
  type OdemeKayit,
  type StokBakiyeSatir,
  type StokEksikSatir,
  type StokHareketKayit,
} from './tipler';

const BELGE_ANAHTAR = 'erp-mock-belgeler-v2';
const STOK_HAREKET_ANAHTAR = 'erp-mock-stok-hareket-v2';
const CARI_HAREKET_ANAHTAR = 'erp-mock-cari-hareket-v2';
const ODEME_ANAHTAR = 'erp-mock-odeme-v2';
const SERI_ANAHTAR = 'erp-mock-belge-seri-v2';
const STOK_SEED_ANAHTAR = 'erp-mock-stok-seed-v2';
let sahteSeedTemizlendi = false;

function okuJson<T>(anahtar: string, yedek: T): T {
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return yedek;
    return JSON.parse(ham) as T;
  } catch {
    return yedek;
  }
}

function yazJson(anahtar: string, veri: unknown) {
  localStorage.setItem(anahtar, JSON.stringify(veri));
}

function belgelerOku(): BelgeKayit[] {
  const ham = okuJson<(Partial<BelgeKayit> & BelgeKayit)[]>(BELGE_ANAHTAR, []);
  return ham.map((b) => {
    const yon = b.yon === 'SATIS' ? 'SATIS' : 'ALIS';
    return {
      ...b,
      belgeNeviId: b.belgeNeviId || (yon === 'ALIS' ? 'bn-alis' : 'bn-satis'),
      belgeNeviAdi: b.belgeNeviAdi || (yon === 'ALIS' ? 'Alış' : 'Satış'),
      belgeIskontolari: gecerliBelgeIskontolari(b.belgeIskontolari),
      belgeIskontoTutarlari: gecerliBelgeIskontoTutarlari(b.belgeIskontoTutarlari),
      kasaId: b.kasaId ?? null,
      kasaKodu: b.kasaKodu ?? '',
      kasaAdi: b.kasaAdi ?? '',
    };
  });
}

function belgelerYaz(liste: BelgeKayit[]) {
  yazJson(BELGE_ANAHTAR, liste);
}

function stokHareketOku(): StokHareketKayit[] {
  return okuJson<StokHareketKayit[]>(STOK_HAREKET_ANAHTAR, []);
}

function stokHareketYaz(liste: StokHareketKayit[]) {
  yazJson(STOK_HAREKET_ANAHTAR, liste);
}

/** Eski demo seed (sabit 50) hareketlerini bir kez temizle — stoklar/hızlı ekle tutarlı kalsın */
function sahteStokSeedTemizle() {
  if (sahteSeedTemizlendi) return;
  sahteSeedTemizlendi = true;
  try {
    const ham = stokHareketOku();
    const kalan = ham.filter((h) => h.belgeId !== 'SEED');
    if (kalan.length !== ham.length) stokHareketYaz(kalan);
    localStorage.removeItem(STOK_SEED_ANAHTAR);
  } catch {
    /* localStorage yoksa yok say */
  }
}

function cariHareketOku(): CariHareketKayit[] {
  return okuJson<CariHareketKayit[]>(CARI_HAREKET_ANAHTAR, []);
}

function cariHareketYaz(liste: CariHareketKayit[]) {
  yazJson(CARI_HAREKET_ANAHTAR, liste);
}

function odemelerOku(): OdemeKayit[] {
  return okuJson<OdemeKayit[]>(ODEME_ANAHTAR, []);
}

function odemelerYaz(liste: OdemeKayit[]) {
  yazJson(ODEME_ANAHTAR, liste);
}

function seriOku(): Record<string, number> {
  return okuJson<Record<string, number>>(SERI_ANAHTAR, {});
}

function seriYaz(map: Record<string, number>) {
  yazJson(SERI_ANAHTAR, map);
}

function simdi(): string {
  return new Date().toISOString();
}

function yuvarla2(n: number) {
  return Math.round(n * 100) / 100;
}

export function seriOner(
  yon: BelgeYon,
  tur: BelgeTur,
  subeSeri: { efaturaSeri?: string; earsivSeri?: string; eirsaliyeSeri?: string; subeKodu?: string }
): { seri: string; siraNo: number; belgeNo: string } {
  let seri = 'BEL';
  if (tur === 'FATURA' || tur === 'IADE') {
    seri = (subeSeri.efaturaSeri || 'GEF').toUpperCase().slice(0, 3);
  } else if (tur === 'IRSALIYE') {
    seri = (subeSeri.eirsaliyeSeri || 'GEI').toUpperCase().slice(0, 3);
  } else {
    seri = yon === 'ALIS' ? 'ASP' : 'SSP';
  }
  const anahtar = `${yon}:${tur}:${seri}`;
  const map = seriOku();
  const siraNo = (map[anahtar] ?? 0) + 1;
  const belgeNo = `${seri}${new Date().getFullYear()}${String(siraNo).padStart(7, '0')}`;
  return { seri, siraNo, belgeNo };
}

function seriTuket(yon: BelgeYon, tur: BelgeTur, seri: string, siraNo: number) {
  const anahtar = `${yon}:${tur}:${seri}`;
  const map = seriOku();
  map[anahtar] = Math.max(map[anahtar] ?? 0, siraNo);
  seriYaz(map);
}

export function stokBakiyeleriGetir(depoId?: string): StokBakiyeSatir[] {
  sahteStokSeedTemizle();
  const map = new Map<string, StokBakiyeSatir>();
  for (const h of stokHareketOku()) {
    if (h.belgeId === 'SEED') continue;
    if (depoId && h.depoId !== depoId) continue;
    const urunKodu = (h.urunKodu ?? '').trim();
    if (!urunKodu) continue;
    const key = `${h.depoId}::${urunKodu}`;
    const onceki = map.get(key);
    if (onceki) {
      onceki.miktar = yuvarla2(onceki.miktar + h.miktar);
    } else {
      map.set(key, {
        urunKodu,
        urunAdi: h.urunAdi,
        depoId: h.depoId,
        depoKodu: h.depoKodu,
        miktar: yuvarla2(h.miktar),
        birim: h.birim,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.urunKodu.localeCompare(b.urunKodu, 'tr'));
}

export function stokBakiyeAl(urunKodu: string, depoId: string): number {
  const kod = urunKodu.trim();
  return stokBakiyeleriGetir(depoId)
    .filter((s) => s.urunKodu === kod)
    .reduce((t, s) => t + s.miktar, 0);
}

export function cariBakiyeAl(cariKodu: string): { borc: number; alacak: number; bakiye: number } {
  let borc = 0;
  let alacak = 0;
  // Görünen hareketlerle aynı filtre — iptal/orphan bakiyeyi şişirmesin
  for (const h of cariHareketleriGetir(cariKodu)) {
    borc += h.borc;
    alacak += h.alacak;
  }
  borc = yuvarla2(borc);
  alacak = yuvarla2(alacak);
  return { borc, alacak, bakiye: yuvarla2(borc - alacak) };
}

export function belgelerGetirMock(yon?: BelgeYon | null, tur?: BelgeTur | null): BelgeKayit[] {
  return belgelerOku()
    .filter((b) => (!yon || b.yon === yon) && (!tur || b.tur === tur))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : a.tarih > b.tarih ? -1 : 0));
}

export function belgeGetirMock(id: string): BelgeKayit {
  const b = belgelerOku().find((x) => x.id === id);
  if (!b) throw new Error('Belge bulunamadı');
  return b;
}

function girdiNormalize(girdi: BelgeKayitGirdi, mevcut?: BelgeKayit): BelgeKayit {
  const zaman = simdi();
  const etki = cariEtkiHesapla(girdi.yon, girdi.tur, girdi.genelToplam);
  const seri = girdi.seri || mevcut?.seri || 'BEL';
  const siraNo = girdi.siraNo || mevcut?.siraNo || 0;
  const belgeNo = girdi.belgeNo?.trim() || mevcut?.belgeNo || `${seri}${new Date().getFullYear()}${String(siraNo).padStart(7, '0')}`;
  return {
    id: mevcut?.id ?? `b-${Date.now()}`,
    yon: girdi.yon,
    tur: girdi.tur,
    belgeNeviId:
      girdi.belgeNeviId ||
      mevcut?.belgeNeviId ||
      (girdi.yon === 'ALIS' ? 'bn-alis' : 'bn-satis'),
    belgeNeviAdi:
      girdi.belgeNeviAdi ||
      mevcut?.belgeNeviAdi ||
      (girdi.yon === 'ALIS' ? 'Alış' : 'Satış'),
    tip: belgeTipKodu(girdi.yon, girdi.tur),
    belgeNo,
    seri,
    siraNo,
    tarih: girdi.tarih,
    vadeTarihi: girdi.vadeTarihi ?? null,
    subeId: girdi.subeId ?? null,
    subeKodu: girdi.subeKodu ?? '',
    subeAdi: girdi.subeAdi ?? '',
    depoId: girdi.depoId ?? null,
    depoKodu: girdi.depoKodu ?? '',
    depoAdi: girdi.depoAdi ?? '',
    cariId: girdi.cariId ?? null,
    cariKodu: girdi.cariKodu ?? '',
    cariAdi: girdi.cariAdi ?? '',
    aciklama: girdi.aciklama ?? '',
    kasaId: girdi.kasaId ?? mevcut?.kasaId ?? null,
    kasaKodu: girdi.kasaKodu ?? mevcut?.kasaKodu ?? '',
    kasaAdi: girdi.kasaAdi ?? mevcut?.kasaAdi ?? '',
    kdvDahil: girdi.kdvDahil !== false,
    durum: mevcut?.durum ?? 'TASLAK',
    belgeIskontolari: gecerliBelgeIskontolari(
      girdi.belgeIskontolari ?? mevcut?.belgeIskontolari ?? bosBelgeIskontolari()
    ),
    belgeIskontoTutarlari: gecerliBelgeIskontoTutarlari(
      girdi.belgeIskontoTutarlari ?? mevcut?.belgeIskontoTutarlari ?? bosBelgeIskontoTutarlari()
    ),
    araToplam: girdi.araToplam ?? 0,
    kdvToplam: girdi.kdvToplam ?? 0,
    genelToplam: girdi.genelToplam ?? 0,
    cariBorc: etki.cariBorc,
    cariAlacak: etki.cariAlacak,
    odenenTutar: mevcut?.odenenTutar ?? 0,
    kaynakBelgeId: girdi.kaynakBelgeId ?? null,
    kaynakBelgeNo: girdi.kaynakBelgeNo ?? '',
    satirlar: Array.isArray(girdi.satirlar) ? girdi.satirlar : [],
    onayTarihi: mevcut?.onayTarihi ?? null,
    iptalTarihi: mevcut?.iptalTarihi ?? null,
    kayitTarihi: mevcut?.kayitTarihi ?? zaman,
    guncellemeTarihi: zaman,
  };
}

export function belgeOlusturMock(girdi: BelgeKayitGirdi): BelgeKayit {
  const liste = belgelerOku();
  let seri = girdi.seri;
  let siraNo = girdi.siraNo;
  let belgeNo = girdi.belgeNo;
  if (!belgeNo || !seri || !siraNo) {
    const oner = seriOner(girdi.yon, girdi.tur, { efaturaSeri: girdi.seri });
    seri = seri || oner.seri;
    siraNo = siraNo || oner.siraNo;
    belgeNo = belgeNo || oner.belgeNo;
  }
  const belge = girdiNormalize({ ...girdi, seri, siraNo, belgeNo });
  if (liste.some((b) => b.belgeNo === belge.belgeNo && b.yon === belge.yon && b.tur === belge.tur)) {
    throw new Error('Bu belge numarası zaten kullanılıyor');
  }
  seriTuket(belge.yon, belge.tur, belge.seri, belge.siraNo);
  belgelerYaz([belge, ...liste]);
  return belge;
}

export function belgeGuncelleMock(id: string, girdi: BelgeKayitGirdi): BelgeKayit {
  const liste = belgelerOku();
  const idx = liste.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error('Belge bulunamadı');
  const mevcut = liste[idx]!;
  if (mevcut.durum !== 'TASLAK') throw new Error('Sadece taslak belgeler düzenlenebilir');
  const guncel = girdiNormalize(girdi, mevcut);
  const kopya = [...liste];
  kopya[idx] = guncel;
  belgelerYaz(kopya);
  return guncel;
}

/** Stok çıkışı yapan belgede depodaki bakiyenin yetmediği satırlar */
export function stokEksikleriBul(
  satirlar: BelgeSatiri[],
  yon: BelgeYon,
  tur: BelgeTur,
  depoId: string | null | undefined
): StokEksikSatir[] {
  if (stokMiktarIsareti(yon, tur) >= 0 || !depoId) return [];
  const talepler = new Map<string, StokEksikSatir>();
  for (const s of satirlar) {
    if (s.durum === false) continue;
    const kod = s.urun?.sku?.trim();
    if (!kod || !s.miktar) continue;
    const onceki = talepler.get(kod);
    if (onceki) {
      onceki.istenen = yuvarla2(onceki.istenen + s.miktar);
      continue;
    }
    talepler.set(kod, {
      urunKodu: kod,
      urunAdi: s.urun?.ad ?? '',
      birim: s.birim,
      mevcut: stokBakiyeAl(kod, depoId),
      istenen: s.miktar,
      eksik: 0,
    });
  }
  const eksikler: StokEksikSatir[] = [];
  for (const t of talepler.values()) {
    const eksik = yuvarla2(t.istenen - t.mevcut);
    if (eksik > 0) eksikler.push({ ...t, eksik });
  }
  return eksikler;
}

function stokKontrolEt(belge: BelgeKayit) {
  const isaret = stokMiktarIsareti(belge.yon, belge.tur);
  if (isaret >= 0) return;
  if (!belge.depoId) throw new Error('Stok çıkışı için depo seçimi zorunlu');
  const eksikler = stokEksikleriBul(belge.satirlar, belge.yon, belge.tur, belge.depoId);
  const ilk = eksikler[0];
  if (ilk) {
    throw new Error(
      `Stok yetersiz: ${ilk.urunKodu} — depoda ${ilk.mevcut} ${ilk.birim}, istenen ${ilk.istenen}`
    );
  }
}

/** Belgeye bağlı olmayan elle stok girişi (hızlı ekleme / açılış) */
export function stokGirisiEkleMock(girdi: {
  urunKodu: string;
  urunAdi?: string;
  depoId: string;
  depoKodu?: string;
  miktar: number;
  birim: string;
  aciklama?: string;
}) {
  const kod = girdi.urunKodu.trim();
  if (!kod || !girdi.depoId || !girdi.miktar) return;
  const hareket: StokHareketKayit = {
    id: `sh-elle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    belgeId: 'ELLE',
    belgeNo: girdi.aciklama || 'HIZLI GİRİŞ',
    yon: 'ALIS',
    tur: 'FATURA',
    depoId: girdi.depoId,
    depoKodu: girdi.depoKodu ?? '',
    urunKodu: kod,
    urunAdi: girdi.urunAdi ?? '',
    birim: girdi.birim,
    miktar: yuvarla2(girdi.miktar),
    kayitTarihi: simdi(),
  };
  stokHareketYaz([hareket, ...stokHareketOku()]);
}

function stokHareketOlustur(belge: BelgeKayit) {
  const isaret = stokMiktarIsareti(belge.yon, belge.tur);
  if (!isaret || !belge.depoId) return;
  const hareketler = stokHareketOku();
  const yeni: StokHareketKayit[] = [];
  for (const s of belge.satirlar) {
    const kod = s.urun?.sku?.trim();
    if (!kod || !s.miktar) continue;
    yeni.push({
      id: `sh-${Date.now()}-${kod}-${Math.random().toString(36).slice(2, 6)}`,
      belgeId: belge.id,
      belgeNo: belge.belgeNo,
      yon: belge.yon,
      tur: belge.tur,
      depoId: belge.depoId,
      depoKodu: belge.depoKodu,
      urunKodu: kod,
      urunAdi: s.urun?.ad ?? '',
      birim: s.birim,
      miktar: yuvarla2(s.miktar * isaret),
      kayitTarihi: simdi(),
    });
  }
  stokHareketYaz([...yeni, ...hareketler]);
}

function cariHareketOlustur(belge: BelgeKayit, ters = false) {
  if (!belge.cariBorc && !belge.cariAlacak) return;
  const cariler = cariHareketOku();
  cariler.unshift({
    id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    belgeId: belge.id,
    odemeId: null,
    cariId: belge.cariId,
    cariKodu: belge.cariKodu,
    cariAdi: belge.cariAdi,
    borc: ters ? belge.cariAlacak : belge.cariBorc,
    alacak: ters ? belge.cariBorc : belge.cariAlacak,
    aciklama: `${belge.tur} ${belge.belgeNo}${ters ? ' (iptal)' : ''}`,
    kayitTarihi: simdi(),
  });
  cariHareketYaz(cariler);
}

export function belgeOnaylaMock(
  id: string,
  secenek?: { negatifStokIzin?: boolean }
): BelgeKayit {
  const liste = belgelerOku();
  const idx = liste.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error('Belge bulunamadı');
  const mevcut = liste[idx]!;
  if (mevcut.durum !== 'TASLAK') throw new Error('Sadece taslak belgeler onaylanabilir');
  if (!mevcut.satirlar.length) throw new Error('Onay için en az bir satır gerekli');
  if (!mevcut.cariKodu && !mevcut.cariAdi) throw new Error('Onay için cari seçimi gerekli');
  if (!mevcut.subeId) throw new Error('Onay için şube seçimi gerekli');
  if (stokMiktarIsareti(mevcut.yon, mevcut.tur) !== 0 && !mevcut.depoId) {
    throw new Error('Stok hareketi için depo seçimi gerekli');
  }

  if (!secenek?.negatifStokIzin) stokKontrolEt(mevcut);
  stokHareketOlustur(mevcut);
  cariHareketOlustur(mevcut, false);

  const guncel: BelgeKayit = {
    ...mevcut,
    durum: 'ONAYLI',
    onayTarihi: simdi(),
    guncellemeTarihi: simdi(),
  };
  const kopya = [...liste];
  kopya[idx] = guncel;
  belgelerYaz(kopya);
  return guncel;
}

export function belgeIptalMock(id: string): BelgeKayit {
  const liste = belgelerOku();
  const idx = liste.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error('Belge bulunamadı');
  const mevcut = liste[idx]!;
  if (mevcut.durum !== 'ONAYLI') throw new Error('Sadece onaylı belgeler iptal edilebilir');
  if (mevcut.odenenTutar > 0) throw new Error('Ödemesi olan belge iptal edilemez; önce ödemeleri kontrol edin');

  // Ters stok
  const isaret = stokMiktarIsareti(mevcut.yon, mevcut.tur);
  if (isaret && mevcut.depoId) {
    const hareketler = stokHareketOku();
    const yeni: StokHareketKayit[] = mevcut.satirlar
      .filter((s) => s.urun?.sku && s.miktar)
      .map((s) => ({
        id: `sh-ipt-${Date.now()}-${s.urun.sku}`,
        belgeId: mevcut.id,
        belgeNo: mevcut.belgeNo,
        yon: mevcut.yon,
        tur: mevcut.tur,
        depoId: mevcut.depoId!,
        depoKodu: mevcut.depoKodu,
        urunKodu: s.urun.sku,
        urunAdi: s.urun.ad,
        birim: s.birim,
        miktar: yuvarla2(s.miktar * -isaret),
        kayitTarihi: simdi(),
      }));
    // İptal çıkışı negatif stoka düşmesin (alış iptali)
    if (isaret > 0) {
      for (const s of mevcut.satirlar) {
        const kod = s.urun?.sku;
        if (!kod) continue;
        const bakiye = stokBakiyeAl(kod, mevcut.depoId);
        if (bakiye < s.miktar) {
          throw new Error(`İptal stok yetersiz: ${kod} (bakiye ${bakiye})`);
        }
      }
    }
    stokHareketYaz([...yeni, ...hareketler]);
  }

  cariHareketOlustur(mevcut, true);

  const guncel: BelgeKayit = {
    ...mevcut,
    durum: 'IPTAL',
    iptalTarihi: simdi(),
    guncellemeTarihi: simdi(),
  };
  const kopya = [...liste];
  kopya[idx] = guncel;
  belgelerYaz(kopya);
  return guncel;
}

export function belgeSilMock(id: string): void {
  const liste = belgelerOku();
  const mevcut = liste.find((b) => b.id === id);
  if (!mevcut) throw new Error('Belge bulunamadı');
  // Kalıcı sil: iptal/stok kontrolüne takılmadan belge + hareketleri kaldır.
  // Bakiye kalan hareketlerden yeniden hesaplanır.
  belgelerYaz(liste.filter((b) => b.id !== id));
  cariHareketYaz(cariHareketOku().filter((h) => h.belgeId !== id));
  stokHareketYaz(stokHareketOku().filter((h) => h.belgeId !== id));
}

/** Zincir: sipariş→irsaliye veya irsaliye→fatura taslağı */
export function belgedenAktarMock(
  kaynakId: string,
  hedefTur: BelgeTur,
  seriBilgi: { efaturaSeri?: string; eirsaliyeSeri?: string }
): BelgeKayit {
  const kaynak = belgeGetirMock(kaynakId);
  if (kaynak.durum !== 'ONAYLI') throw new Error('Sadece onaylı belgeden aktarım yapılabilir');

  const izin =
    (kaynak.tur === 'SIPARIS' && hedefTur === 'IRSALIYE') ||
    (kaynak.tur === 'IRSALIYE' && hedefTur === 'FATURA') ||
    (kaynak.tur === 'SIPARIS' && hedefTur === 'FATURA');
  if (!izin) throw new Error(`${kaynak.tur} → ${hedefTur} aktarımı desteklenmiyor`);

  const oner = seriOner(kaynak.yon, hedefTur, seriBilgi);
  return belgeOlusturMock({
    yon: kaynak.yon,
    tur: hedefTur,
    belgeNeviId: kaynak.belgeNeviId,
    belgeNeviAdi: kaynak.belgeNeviAdi,
    belgeNo: oner.belgeNo,
    seri: oner.seri,
    siraNo: oner.siraNo,
    tarih: new Date().toISOString().slice(0, 10),
    vadeTarihi: kaynak.vadeTarihi,
    subeId: kaynak.subeId,
    subeKodu: kaynak.subeKodu,
    subeAdi: kaynak.subeAdi,
    depoId: kaynak.depoId,
    depoKodu: kaynak.depoKodu,
    depoAdi: kaynak.depoAdi,
    cariId: kaynak.cariId,
    cariKodu: kaynak.cariKodu,
    cariAdi: kaynak.cariAdi,
    aciklama: `Kaynak: ${kaynak.belgeNo}`,
    kdvDahil: kaynak.kdvDahil,
    araToplam: kaynak.araToplam,
    kdvToplam: kaynak.kdvToplam,
    genelToplam: kaynak.genelToplam,
    kaynakBelgeId: kaynak.id,
    kaynakBelgeNo: kaynak.belgeNo,
    satirlar: kaynak.satirlar.map((s) => ({
      ...s,
      id: `y-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
  });
}

export function iadeTaslagiOlusturMock(
  kaynakFaturaId: string,
  seriBilgi: { efaturaSeri?: string }
): BelgeKayit {
  const kaynak = belgeGetirMock(kaynakFaturaId);
  if (kaynak.tur !== 'FATURA' || kaynak.durum !== 'ONAYLI') {
    throw new Error('İade yalnızca onaylı faturadan oluşturulur');
  }
  const oner = seriOner(kaynak.yon, 'IADE', seriBilgi);
  return belgeOlusturMock({
    yon: kaynak.yon,
    tur: 'IADE',
    belgeNeviId: kaynak.belgeNeviId,
    belgeNeviAdi: kaynak.belgeNeviAdi,
    belgeNo: oner.belgeNo,
    seri: oner.seri,
    siraNo: oner.siraNo,
    tarih: new Date().toISOString().slice(0, 10),
    vadeTarihi: null,
    subeId: kaynak.subeId,
    subeKodu: kaynak.subeKodu,
    subeAdi: kaynak.subeAdi,
    depoId: kaynak.depoId,
    depoKodu: kaynak.depoKodu,
    depoAdi: kaynak.depoAdi,
    cariId: kaynak.cariId,
    cariKodu: kaynak.cariKodu,
    cariAdi: kaynak.cariAdi,
    aciklama: `İade / kaynak fatura: ${kaynak.belgeNo}`,
    kdvDahil: kaynak.kdvDahil,
    araToplam: kaynak.araToplam,
    kdvToplam: kaynak.kdvToplam,
    genelToplam: kaynak.genelToplam,
    kaynakBelgeId: kaynak.id,
    kaynakBelgeNo: kaynak.belgeNo,
    satirlar: kaynak.satirlar.map((s) => ({
      ...s,
      id: `y-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
  });
}

export function odemeEkleMock(girdi: {
  belgeId: string;
  tutar: number;
  kanal: OdemeKanali;
  kasaId?: string | null;
  kasaKodu?: string;
  bankaId?: string | null;
  bankaKodu?: string;
  aciklama?: string;
}): OdemeKayit {
  const belge = belgeGetirMock(girdi.belgeId);
  if (belge.durum !== 'ONAYLI') throw new Error('Ödeme yalnızca onaylı belgede');
  if (belge.tur !== 'FATURA' && belge.tur !== 'IADE') throw new Error('Ödeme yalnızca fatura/iade için');
  const tutar = yuvarla2(girdi.tutar);
  if (tutar <= 0) throw new Error('Ödeme tutarı geçersiz');
  const kalan = yuvarla2(belge.genelToplam - belge.odenenTutar);
  if (tutar > kalan + 0.001) throw new Error(`Kalan tutardan fazla ödeme olamaz (kalan: ${kalan})`);

  const odeme: OdemeKayit = {
    id: `od-${Date.now()}`,
    belgeId: belge.id,
    belgeNo: belge.belgeNo,
    yon: belge.yon,
    cariId: belge.cariId,
    cariKodu: belge.cariKodu,
    tutar,
    kanal: girdi.kanal,
    kasaId: girdi.kasaId ?? null,
    kasaKodu: girdi.kasaKodu ?? '',
    bankaId: girdi.bankaId ?? null,
    bankaKodu: girdi.bankaKodu ?? '',
    aciklama: girdi.aciklama ?? `${girdi.kanal} ödeme`,
    kayitTarihi: simdi(),
  };
  odemelerYaz([odeme, ...odemelerOku()]);

  // Satış tahsilat → cari ALACAK; alış ödeme → cari BORÇ
  const cariler = cariHareketOku();
  cariler.unshift({
    id: `ch-od-${Date.now()}`,
    belgeId: belge.id,
    odemeId: odeme.id,
    cariId: belge.cariId,
    cariKodu: belge.cariKodu,
    cariAdi: belge.cariAdi,
    borc: belge.yon === 'ALIS' ? tutar : 0,
    alacak: belge.yon === 'SATIS' ? tutar : 0,
    aciklama: odeme.aciklama,
    kayitTarihi: simdi(),
  });
  cariHareketYaz(cariler);

  const liste = belgelerOku();
  const idx = liste.findIndex((b) => b.id === belge.id);
  if (idx >= 0) {
    liste[idx] = {
      ...liste[idx]!,
      odenenTutar: yuvarla2(liste[idx]!.odenenTutar + tutar),
      guncellemeTarihi: simdi(),
    };
    belgelerYaz(liste);
  }

  return odeme;
}

export function stokHareketleriGetir(urunKodu?: string, depoId?: string): StokHareketKayit[] {
  sahteStokSeedTemizle();
  const kod = urunKodu?.trim();
  return stokHareketOku().filter((h) => {
    if (h.belgeId === 'SEED') return false;
    if (kod && (h.urunKodu ?? '').trim() !== kod) return false;
    if (depoId && h.depoId !== depoId) return false;
    return true;
  });
}

export function belgeOdemeleriGetir(belgeId: string): OdemeKayit[] {
  return odemelerOku().filter((o) => o.belgeId === belgeId);
}

/**
 * İptal / silinmiş belge hareketleri ekranda görünmesin.
 * - IPTAL durumundaki belgenin tüm hareketleri
 * - Açıklamasında "(iptal)" geçen ters kayıtlar
 * - Belgesi artık olmayan orphan hareketler
 */
export function cariHareketleriGetir(
  cariKodu?: string,
  secenek?: { iptalleriDahilEt?: boolean }
): CariHareketKayit[] {
  const liste = cariHareketOku();
  if (secenek?.iptalleriDahilEt) {
    return cariKodu ? liste.filter((h) => h.cariKodu === cariKodu) : liste;
  }
  const belgeler = belgelerOku();
  const belgeMap = new Map(belgeler.map((b) => [b.id, b]));
  const iptalIdler = new Set(belgeler.filter((b) => b.durum === 'IPTAL').map((b) => b.id));
  return liste.filter((h) => {
    if (cariKodu && h.cariKodu !== cariKodu) return false;
    if (h.aciklama?.includes('(iptal)')) return false;
    if (h.belgeId) {
      if (iptalIdler.has(h.belgeId)) return false;
      if (!belgeMap.has(h.belgeId)) return false;
    }
    return true;
  });
}
