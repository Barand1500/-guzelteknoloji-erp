import type {
  AdminBirim, AdminMaliyet, AdminUrun, BirimForm, MaliyetForm, UrunForm,
} from './tipler';

const ANAHTAR = 'erp-offline-urun-yonetimi-v1';
interface Depo { urunler: AdminUrun[]; birimler: AdminBirim[]; maliyetler: AdminMaliyet[] }
const simdi = () => new Date().toISOString();
const idUret = (liste: { id: string }[]) => String(Math.max(0, ...liste.map((k) => Number(k.id))) + 1);

/** Belgeler barkod testi için sabit mock barkodlar */
const MOCK_BARKODLAR: Record<string, { barkod: string; satisFiyati: number; alisFiyati: number }> = {
  '10.0001': { barkod: '8690001000001', satisFiyati: 0, alisFiyati: 0 },
  '20.0002': { barkod: '8690002000002', satisFiyati: 18500, alisFiyati: 15000 },
  '30.0003': { barkod: '8690003000003', satisFiyati: 690, alisFiyati: 420 },
};

function mockBarkodlariUygula(d: Depo): boolean {
  let degisti = false;
  d.birimler = d.birimler.map((b) => {
    const mock = MOCK_BARKODLAR[b.urunKodu];
    if (!mock) return b;
    const barkodBos = !(b.barkod ?? '').trim();
    const fiyatBos = !Number(b.satisFiyati);
    if (!barkodBos && !fiyatBos) return b;
    degisti = true;
    return {
      ...b,
      barkod: barkodBos ? mock.barkod : b.barkod,
      satisFiyati: fiyatBos ? mock.satisFiyati : b.satisFiyati,
      alisFiyati: !Number(b.alisFiyati) ? mock.alisFiyati : b.alisFiyati,
    };
  });
  return degisti;
}

function varsayilan(): Depo {
  const tarih = simdi();
  const urunler: AdminUrun[] = [
    { id: '1', ustId: '', urunTipi: 'BASIT_URUN', urunNevi: 'RESMI', urunKodu: '10.0001',
      marka: '', urunAdi: 'FIYAT FARKI', anaBirim: 'ADET', varsayilanBirim: 'ADET',
      mensei: '', aktif: true, olusturma: tarih, guncelleme: tarih },
    { id: '2', ustId: '', urunTipi: 'BASIT_URUN', urunNevi: 'RESMI', urunKodu: '20.0002',
      marka: 'INPOS', urunAdi: 'M530 YENI NESIL YAZARKASA POS', anaBirim: 'ADET',
      varsayilanBirim: 'ADET', mensei: 'TURKIYE', aktif: true, olusturma: tarih, guncelleme: tarih },
    { id: '3', ustId: '', urunTipi: 'BASIT_URUN', urunNevi: 'RESMI', urunKodu: '30.0003',
      marka: 'HP', urunAdi: 'HP LASERJET TONER 85A', anaBirim: 'ADET',
      varsayilanBirim: 'ADET', mensei: 'CIN', aktif: true, olusturma: tarih, guncelleme: tarih },
  ];
  const birimler: AdminBirim[] = [
    { id: '1', urunId: '1', urunKodu: '10.0001', urunAdi: 'FIYAT FARKI', fiyatAdi: 'PERAKENDE',
      birimAdi: 'ADET', carpan: 1, barkod: '8690001000001', alisKdv: 20, satisKdv: 20, alisFiyati: 0,
      satisFiyati: 0, kdvDahil: true, aktif: true, olusturma: tarih, guncelleme: tarih },
    { id: '2', urunId: '2', urunKodu: '20.0002', urunAdi: 'M530 YENI NESIL YAZARKASA POS',
      fiyatAdi: 'PERAKENDE', birimAdi: 'ADET', carpan: 1, barkod: '8690002000002', alisKdv: 10,
      satisKdv: 10, alisFiyati: 15000, satisFiyati: 18500, kdvDahil: false, aktif: true,
      olusturma: tarih, guncelleme: tarih },
    { id: '3', urunId: '3', urunKodu: '30.0003', urunAdi: 'HP LASERJET TONER 85A',
      fiyatAdi: 'PERAKENDE', birimAdi: 'ADET', carpan: 1, barkod: '8690003000003', alisKdv: 20,
      satisKdv: 20, alisFiyati: 420, satisFiyati: 690, kdvDahil: false, aktif: true,
      olusturma: tarih, guncelleme: tarih },
  ];
  const maliyetler = birimler.map((b, i): AdminMaliyet => ({
    id: String(i + 1), birimId: b.id, birimAdi: b.birimAdi, urunKodu: b.urunKodu,
    urunAdi: b.urunAdi, sonAlisMaliyeti: 0, yuruyenAgirlikliOrtalama: 0,
    agirlikliOrtalama: 0, basitOrtalama: 0, lifo: 0, fifo: 0, aktif: true,
    olusturma: tarih, guncelleme: tarih,
  }));
  return { urunler, birimler, maliyetler };
}

function oku(): Depo {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const d = JSON.parse(ham) as Depo;
      if (mockBarkodlariUygula(d)) kaydet(d);
      /* Eksik mock ürünü (toner) ekle */
      if (!d.urunler.some((u) => u.urunKodu === '30.0003')) {
        const seed = varsayilan();
        const ekstraUrun = seed.urunler.find((u) => u.urunKodu === '30.0003');
        const ekstraBirim = seed.birimler.find((b) => b.urunKodu === '30.0003');
        if (ekstraUrun && ekstraBirim) {
          const yeniUrunId = idUret(d.urunler);
          const yeniBirimId = idUret(d.birimler);
          d.urunler.push({ ...ekstraUrun, id: yeniUrunId });
          d.birimler.push({ ...ekstraBirim, id: yeniBirimId, urunId: yeniUrunId });
          d.maliyetler.push({
            id: idUret(d.maliyetler),
            birimId: yeniBirimId,
            birimAdi: ekstraBirim.birimAdi,
            urunKodu: ekstraBirim.urunKodu,
            urunAdi: ekstraBirim.urunAdi,
            sonAlisMaliyeti: 0,
            yuruyenAgirlikliOrtalama: 0,
            agirlikliOrtalama: 0,
            basitOrtalama: 0,
            lifo: 0,
            fifo: 0,
            aktif: true,
            olusturma: simdi(),
            guncelleme: simdi(),
          });
          kaydet(d);
        }
      }
      return d;
    }
  } catch { /* bozuk veri */ }
  const veri = varsayilan(); kaydet(veri); return veri;
}
function kaydet(veri: Depo) { localStorage.setItem(ANAHTAR, JSON.stringify(veri)); }
function formOku<T>(body?: BodyInit | null): T { return JSON.parse(typeof body === 'string' ? body : '{}') as T; }
function idAl(path: string) { const p = path.split('/').pop() ?? ''; return /^\d+$/.test(p) ? p : null; }

export function offlineUrunYonetimiGetir(path: string): unknown {
  const d = oku();
  if (path.includes('/urunler')) return { urunler: d.urunler };
  if (path.includes('/birimler')) {
    const urunId = new URL(path, 'http://local').searchParams.get('urunId');
    const birimler = urunId ? d.birimler.filter((b) => b.urunId === urunId) : d.birimler;
    return { birimler };
  }
  if (path.includes('/maliyetler')) return { maliyetler: d.maliyetler };
  return {};
}

export function offlineUrunYonetimiYaz(path: string, method: string, body?: BodyInit | null): unknown {
  const d = oku(); const id = idAl(path); const tarih = simdi();
  if (path.includes('/urunler')) {
    if (method === 'DELETE' && id) {
      const birimIdler = new Set(d.birimler.filter((b) => b.urunId === id).map((b) => b.id));
      d.maliyetler = d.maliyetler.filter((m) => !birimIdler.has(m.birimId));
      d.birimler = d.birimler.filter((b) => b.urunId !== id);
      d.urunler = d.urunler.filter((u) => u.id !== id);
      kaydet(d);
      return { mesaj: 'Urun silindi' };
    }
    const f = formOku<UrunForm & { aktif: boolean }>(body);
    const mevcut = id ? d.urunler.find((u) => u.id === id) : undefined;
    if (d.urunler.some((u) => u.id !== id && u.urunKodu === f.urunKodu.trim())) {
      throw new Error('Bu ürün kodu zaten kayıtlı.');
    }
    const urun: AdminUrun = { ...f, id: id ?? idUret(d.urunler), aktif: f.aktif !== false,
      olusturma: mevcut?.olusturma ?? tarih, guncelleme: tarih };
    d.urunler = mevcut ? d.urunler.map((u) => u.id === id ? urun : u) : [...d.urunler, urun];
    d.birimler = d.birimler.map((b) => b.urunId === urun.id ? { ...b, urunKodu: urun.urunKodu, urunAdi: urun.urunAdi } : b);
    kaydet(d); return { urun };
  }
  if (path.includes('/birimler')) {
    if (method === 'DELETE' && id) {
      if (d.maliyetler.some((m) => m.birimId === id)) {
        throw new Error('Bu birime bağlı maliyet kaydı var. Önce maliyet kaydını silin.');
      }
      d.birimler = d.birimler.filter((b) => b.id !== id);
      kaydet(d); return { mesaj: 'Birim silindi' };
    }
    const f = formOku<BirimForm>(body); const u = d.urunler.find((x) => x.id === f.urunId);
    const mevcut = id ? d.birimler.find((b) => b.id === id) : undefined;
    const birim: AdminBirim = { ...f, id: id ?? idUret(d.birimler), urunKodu: u?.urunKodu ?? '',
      urunAdi: u?.urunAdi ?? '', olusturma: mevcut?.olusturma ?? tarih, guncelleme: tarih };
    d.birimler = mevcut ? d.birimler.map((b) => b.id === id ? birim : b) : [...d.birimler, birim];
    kaydet(d); return { birim };
  }
  if (path.includes('/maliyetler')) {
    if (method === 'DELETE' && id) {
      d.maliyetler = d.maliyetler.filter((m) => m.id !== id); kaydet(d);
      return { mesaj: 'Maliyet silindi' };
    }
    const f = formOku<MaliyetForm>(body); const b = d.birimler.find((x) => x.id === f.birimId);
    if (d.maliyetler.some((m) => m.id !== id && m.birimId === f.birimId)) {
      throw new Error('Bu birim için maliyet kaydı zaten var.');
    }
    const mevcut = id ? d.maliyetler.find((m) => m.id === id) : undefined;
    const maliyet: AdminMaliyet = { ...f, id: id ?? idUret(d.maliyetler), birimAdi: b?.birimAdi ?? '',
      urunKodu: b?.urunKodu ?? '', urunAdi: b?.urunAdi ?? '', olusturma: mevcut?.olusturma ?? tarih,
      guncelleme: tarih };
    d.maliyetler = mevcut ? d.maliyetler.map((m) => m.id === id ? maliyet : m) : [...d.maliyetler, maliyet];
    kaydet(d); return { maliyet };
  }
  return {};
}
