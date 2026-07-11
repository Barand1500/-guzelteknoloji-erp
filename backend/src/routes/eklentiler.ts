import { Router } from 'express';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authZorunlu } from '../middleware/auth.js';
import { EKLENTI_KATALOGU } from '../lib/eklentiKatalogu.js';

/** Bellek içi kurulum durumu — tam DB entegrasyonu gelene kadar */
const kurulumlar = new Map<string, 'kurulu' | 'aktif' | 'pasif'>();

function eklentiListesiOlustur() {
  return EKLENTI_KATALOGU.map((sablon) => {
    const durum = kurulumlar.get(sablon.kod);
    return {
      ...sablon,
      kurulu: !!durum,
      durum: durum ?? undefined,
      kaynak: 'katalog' as const,
    };
  });
}

const router = Router();
router.use(authZorunlu);

/** Express 5 tiplerinde req.params değerleri string | string[] olabilir */
function paramKod(req: AuthRequest): string {
  const v = req.params.kod;
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

router.get('/', (_req: AuthRequest, res: Response) => {
  return res.json({ eklentiler: eklentiListesiOlustur() });
});

router.post('/:kod/kur', (req: AuthRequest, res: Response) => {
  const kod = paramKod(req);
  if (!EKLENTI_KATALOGU.some((e) => e.kod === kod)) {
    return res.status(404).json({ mesaj: 'Eklenti bulunamadi' });
  }
  kurulumlar.set(kod, 'kurulu');
  return res.json({ mesaj: 'Eklenti kuruldu', eklentiler: eklentiListesiOlustur() });
});

router.patch('/:kod/aktif', (req: AuthRequest, res: Response) => {
  const kod = paramKod(req);
  if (!kurulumlar.has(kod)) return res.status(404).json({ mesaj: 'Eklenti kurulu degil' });
  kurulumlar.set(kod, 'aktif');
  return res.json({ mesaj: 'Eklenti etkinlestirildi', eklentiler: eklentiListesiOlustur() });
});

router.patch('/:kod/pasif', (req: AuthRequest, res: Response) => {
  const kod = paramKod(req);
  if (!kurulumlar.has(kod)) return res.status(404).json({ mesaj: 'Eklenti kurulu degil' });
  kurulumlar.set(kod, 'pasif');
  return res.json({ mesaj: 'Eklenti pasiflestirildi', eklentiler: eklentiListesiOlustur() });
});

router.delete('/:kod', (req: AuthRequest, res: Response) => {
  const kod = paramKod(req);
  kurulumlar.delete(kod);
  return res.json({ mesaj: 'Eklenti kaldirildi', eklentiler: eklentiListesiOlustur() });
});

router.post('/yukle', (_req: AuthRequest, res: Response) => {
  return res.status(501).json({ mesaj: 'Zip yukleme henuz desteklenmiyor' });
});

export default router;
