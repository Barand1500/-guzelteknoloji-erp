import { Router } from 'express';
import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';
import { yetkiZorunlu } from '../middleware/yetki.js';

const router = Router();
router.use(authZorunlu);

const metin = (deger: unknown, max: number) => String(deger ?? '').trim().slice(0, max);
const opsiyonel = (deger: unknown, max: number) => metin(deger, max) || null;
const sayi = (deger: unknown, varsayilan = 0) => {
  const sonuc = Number(deger);
  return Number.isFinite(sonuc) ? sonuc : varsayilan;
};
const tarih = (deger: Date) => deger.toISOString();

const urunYanit = (u: {
  id: number; ustId: number | null; urunTipi: string; urunNevi: string | null;
  urunKodu: string; marka: string | null; urunAdi: string; anaBirim: string | null;
  varsayilanBirim: string | null; mensei: string | null; kayitTarihi: Date;
  guncellemeTarihi: Date; durum: boolean;
}) => ({
  id: String(u.id), ustId: u.ustId == null ? '' : String(u.ustId), urunTipi: u.urunTipi,
  urunNevi: u.urunNevi ?? '', urunKodu: u.urunKodu, marka: u.marka ?? '',
  urunAdi: u.urunAdi, anaBirim: u.anaBirim ?? '', varsayilanBirim: u.varsayilanBirim ?? '',
  mensei: u.mensei ?? '', aktif: u.durum, olusturma: tarih(u.kayitTarihi),
  guncelleme: tarih(u.guncellemeTarihi),
});

const birimYanit = (b: any) => ({
  id: String(b.id), urunId: String(b.urunId), urunKodu: b.f001Urun?.urunKodu ?? '',
  urunAdi: b.f001Urun?.urunAdi ?? '', fiyatAdi: b.fiyatAdi, birimAdi: b.birimAdi,
  carpan: Number(b.carpan), barkod: b.barkod ?? '', alisKdv: Number(b.alisKdv),
  satisKdv: Number(b.satisKdv), alisFiyati: Number(b.alisFiyati),
  satisFiyati: Number(b.satisFiyati), kdvDahil: b.kdvDahil, aktif: b.durum,
  olusturma: tarih(b.kayitTarihi), guncelleme: tarih(b.guncellemeTarihi),
});

const maliyetYanit = (m: any) => ({
  id: String(m.id), birimId: String(m.birimId), birimAdi: m.f001Birim?.birimAdi ?? '',
  urunKodu: m.f001Birim?.f001Urun?.urunKodu ?? '', urunAdi: m.f001Birim?.f001Urun?.urunAdi ?? '',
  sonAlisMaliyeti: Number(m.sonAlisMaliyeti),
  yuruyenAgirlikliOrtalama: Number(m.yuruyenAgirlikliOrtalama),
  agirlikliOrtalama: Number(m.agirlikliOrtalama), basitOrtalama: Number(m.basitOrtalama),
  lifo: Number(m.lifo), fifo: Number(m.fifo), aktif: m.durum,
  olusturma: tarih(m.kayitTarihi), guncelleme: tarih(m.guncellemeTarihi),
});

router.get('/urunler', yetkiZorunlu('goruntuleme'), async (_req: AuthRequest, res: Response) => {
  const urunler = await prisma.f001Urun.findMany({ orderBy: { urunKodu: 'asc' } });
  return res.json({ urunler: urunler.map(urunYanit) });
});

router.post('/urunler', yetkiZorunlu('ekleme'), async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const urunKodu = metin(body.urunKodu, 30);
  const urunAdi = metin(body.urunAdi, 255);
  const urunTipi = metin(body.urunTipi, 20).toUpperCase();
  if (!urunKodu || !urunAdi || !urunTipi) return res.status(400).json({ mesaj: 'Urun tipi, kodu ve adi zorunlu' });
  const urun = await prisma.f001Urun.create({ data: {
    ustId: body.ustId ? sayi(body.ustId) : null, urunTipi, urunNevi: opsiyonel(body.urunNevi, 50),
    urunKodu, marka: opsiyonel(body.marka, 100), urunAdi, anaBirim: opsiyonel(body.anaBirim, 20),
    varsayilanBirim: opsiyonel(body.varsayilanBirim, 20), mensei: opsiyonel(body.mensei, 50),
    durum: body.aktif !== false,
  } });
  return res.status(201).json({ urun: urunYanit(urun) });
});

router.put('/urunler/:id', yetkiZorunlu('duzenleme'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body as Record<string, unknown>;
  const urunKodu = metin(body.urunKodu, 30);
  const urunAdi = metin(body.urunAdi, 255);
  const urunTipi = metin(body.urunTipi, 20).toUpperCase();
  if (!urunKodu || !urunAdi || !urunTipi) return res.status(400).json({ mesaj: 'Urun tipi, kodu ve adi zorunlu' });
  const urun = await prisma.f001Urun.update({ where: { id }, data: {
    ustId: body.ustId ? sayi(body.ustId) : null, urunTipi, urunNevi: opsiyonel(body.urunNevi, 50),
    urunKodu, marka: opsiyonel(body.marka, 100), urunAdi, anaBirim: opsiyonel(body.anaBirim, 20),
    varsayilanBirim: opsiyonel(body.varsayilanBirim, 20), mensei: opsiyonel(body.mensei, 50),
    durum: body.aktif !== false,
  } });
  return res.json({ urun: urunYanit(urun) });
});

router.delete('/urunler/:id', yetkiZorunlu('silme'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const birimSayisi = await prisma.f001Birim.count({ where: { urunId: id } });
  if (birimSayisi > 0) {
    return res.status(409).json({ mesaj: `Bu ürüne bağlı ${birimSayisi} birim var. Önce bağlı birimleri silin.` });
  }
  await prisma.f001Urun.delete({ where: { id } });
  return res.json({ mesaj: 'Urun silindi' });
});

router.get('/birimler', yetkiZorunlu('goruntuleme'), async (req: AuthRequest, res: Response) => {
  const urunIdHam = req.query.urunId;
  const urunId =
    urunIdHam !== undefined && urunIdHam !== '' ? Number(urunIdHam) : Number.NaN;
  const birimler = await prisma.f001Birim.findMany({
    where: Number.isFinite(urunId) && urunId > 0 ? { urunId } : undefined,
    include: { f001Urun: true },
    orderBy: { id: 'asc' },
  });
  return res.json({ birimler: birimler.map(birimYanit) });
});

router.post('/birimler', yetkiZorunlu('ekleme'), async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const urunId = sayi(body.urunId);
  const fiyatAdi = metin(body.fiyatAdi, 50);
  const birimAdi = metin(body.birimAdi, 20);
  if (!urunId || !fiyatAdi || !birimAdi) return res.status(400).json({ mesaj: 'Urun, fiyat adi ve birim adi zorunlu' });
  const birim = await prisma.f001Birim.create({ data: {
    urunId, fiyatAdi, birimAdi, carpan: sayi(body.carpan, 1), barkod: opsiyonel(body.barkod, 50),
    alisKdv: sayi(body.alisKdv), satisKdv: sayi(body.satisKdv), alisFiyati: sayi(body.alisFiyati),
    satisFiyati: sayi(body.satisFiyati), kdvDahil: body.kdvDahil === true, durum: body.aktif !== false,
  }, include: { f001Urun: true } });
  return res.status(201).json({ birim: birimYanit(birim) });
});

router.put('/birimler/:id', yetkiZorunlu('duzenleme'), async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const urunId = sayi(body.urunId);
  const fiyatAdi = metin(body.fiyatAdi, 50);
  const birimAdi = metin(body.birimAdi, 20);
  if (!urunId || !fiyatAdi || !birimAdi) return res.status(400).json({ mesaj: 'Urun, fiyat adi ve birim adi zorunlu' });
  const birim = await prisma.f001Birim.update({ where: { id: Number(req.params.id) }, data: {
    urunId, fiyatAdi, birimAdi, carpan: sayi(body.carpan, 1), barkod: opsiyonel(body.barkod, 50),
    alisKdv: sayi(body.alisKdv), satisKdv: sayi(body.satisKdv), alisFiyati: sayi(body.alisFiyati),
    satisFiyati: sayi(body.satisFiyati), kdvDahil: body.kdvDahil === true, durum: body.aktif !== false,
  }, include: { f001Urun: true } });
  return res.json({ birim: birimYanit(birim) });
});

router.delete('/birimler/:id', yetkiZorunlu('silme'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const maliyetSayisi = await prisma.f001Maliyet.count({ where: { birimId: id } });
  if (maliyetSayisi > 0) {
    return res.status(409).json({ mesaj: 'Bu birime bağlı maliyet kaydı var. Önce maliyet kaydını silin.' });
  }
  await prisma.f001Birim.delete({ where: { id } });
  return res.json({ mesaj: 'Birim silindi' });
});

router.get('/maliyetler', yetkiZorunlu('goruntuleme'), async (_req: AuthRequest, res: Response) => {
  const maliyetler = await prisma.f001Maliyet.findMany({
    include: { f001Birim: { include: { f001Urun: true } } }, orderBy: { id: 'asc' },
  });
  return res.json({ maliyetler: maliyetler.map(maliyetYanit) });
});

router.post('/maliyetler', yetkiZorunlu('ekleme'), async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const birimId = sayi(body.birimId);
  if (!birimId) return res.status(400).json({ mesaj: 'Birim secimi zorunlu' });
  const maliyet = await prisma.f001Maliyet.create({ data: {
    birimId, sonAlisMaliyeti: sayi(body.sonAlisMaliyeti),
    yuruyenAgirlikliOrtalama: sayi(body.yuruyenAgirlikliOrtalama),
    agirlikliOrtalama: sayi(body.agirlikliOrtalama), basitOrtalama: sayi(body.basitOrtalama),
    lifo: sayi(body.lifo), fifo: sayi(body.fifo), durum: body.aktif !== false,
  }, include: { f001Birim: { include: { f001Urun: true } } } });
  return res.status(201).json({ maliyet: maliyetYanit(maliyet) });
});

router.put('/maliyetler/:id', yetkiZorunlu('duzenleme'), async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const birimId = sayi(body.birimId);
  if (!birimId) return res.status(400).json({ mesaj: 'Birim secimi zorunlu' });
  const maliyet = await prisma.f001Maliyet.update({ where: { id: Number(req.params.id) }, data: {
    birimId, sonAlisMaliyeti: sayi(body.sonAlisMaliyeti),
    yuruyenAgirlikliOrtalama: sayi(body.yuruyenAgirlikliOrtalama),
    agirlikliOrtalama: sayi(body.agirlikliOrtalama), basitOrtalama: sayi(body.basitOrtalama),
    lifo: sayi(body.lifo), fifo: sayi(body.fifo), durum: body.aktif !== false,
  }, include: { f001Birim: { include: { f001Urun: true } } } });
  return res.json({ maliyet: maliyetYanit(maliyet) });
});

router.delete('/maliyetler/:id', yetkiZorunlu('silme'), async (req: AuthRequest, res: Response) => {
  await prisma.f001Maliyet.delete({ where: { id: Number(req.params.id) } });
  return res.json({ mesaj: 'Maliyet silindi' });
});

export default router;
