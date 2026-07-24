import type {
  AdminBirim, AdminMaliyet, AdminUrun, BirimForm, MaliyetForm, UrunForm,
} from './tipler';

const ANAHTAR = 'erp-offline-urun-yonetimi-v1';
interface Depo { urunler: AdminUrun[]; birimler: AdminBirim[]; maliyetler: AdminMaliyet[] }
const simdi = () => new Date().toISOString();
const idUret = (liste: { id: string }[]) => String(Math.max(0, ...liste.map((k) => Number(k.id))) + 1);

function varsayilan(): Depo {
  const tarih = simdi();
  const urunler: AdminUrun[] = [
    { id: '1', ustId: '', urunTipi: 'BASIT_URUN', urunNevi: 'RESMI', urunKodu: '10.0001',
      marka: '', urunAdi: 'FIYAT FARKI', anaBirim: 'ADET', varsayilanBirim: 'ADET',
      mensei: '', aktif: true, olusturma: tarih, guncelleme: tarih },
    { id: '2', ustId: '', urunTipi: 'BASIT_URUN', urunNevi: 'RESMI', urunKodu: '20.0002',
      marka: 'INPOS', urunAdi: 'M530 YENI NESIL YAZARKASA POS', anaBirim: 'ADET',
      varsayilanBirim: 'ADET', mensei: 'TURKIYE', aktif: true, olusturma: tarih, guncelleme: tarih },
  ];
  const birimler: AdminBirim[] = [
    { id: '1', urunId: '1', urunKodu: '10.0001', urunAdi: 'FIYAT FARKI', fiyatAdi: 'PERAKENDE',
      birimAdi: 'ADET', carpan: 1, barkod: '', alisKdv: 20, satisKdv: 20, alisFiyati: 0,
      satisFiyati: 0, kdvDahil: true, aktif: true, olusturma: tarih, guncelleme: tarih },
    { id: '2', urunId: '2', urunKodu: '20.0002', urunAdi: 'M530 YENI NESIL YAZARKASA POS',
      fiyatAdi: 'PERAKENDE', birimAdi: 'ADET', carpan: 1, barkod: '', alisKdv: 10,
      satisKdv: 10, alisFiyati: 0, satisFiyati: 0, kdvDahil: false, aktif: true,
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
    if (ham) return JSON.parse(ham) as Depo;
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
      const birimSayisi = d.birimler.filter((b) => b.urunId === id).length;
      if (birimSayisi > 0) throw new Error(`Bu ürüne bağlı ${birimSayisi} birim var. Önce bağlı birimleri silin.`);
      d.urunler = d.urunler.filter((u) => u.id !== id);
      kaydet(d); return { mesaj: 'Urun silindi' };
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
