/**
 * Offline HTTP köprüsü — mock depo ile uyumlu tutar (eski path'ler kırılmasın).
 */
import type { BelgeKayitGirdi, BelgeTur, BelgeYon } from './tipler';
import {
  belgeGetirMock,
  belgeGuncelleMock,
  belgeIptalMock,
  belgeOlusturMock,
  belgeOnaylaMock,
  belgeSilMock,
  belgelerGetirMock,
} from './mockBelgeDepo';

function pathParcala(path: string) {
  const temiz = path.split('?')[0].replace(/\/+$/, '');
  const parcalar = temiz.split('/').filter(Boolean);
  const belgelerIdx = parcalar.indexOf('belgeler');
  return belgelerIdx >= 0 ? parcalar.slice(belgelerIdx + 1) : [];
}

function yonTurSorgudan(path: string): { yon: BelgeYon | null; tur: BelgeTur | null } {
  const q = path.includes('?') ? path.slice(path.indexOf('?') + 1) : '';
  const params = new URLSearchParams(q);
  const yon = String(params.get('yon') ?? '').toUpperCase() as BelgeYon;
  const tur = String(params.get('tur') ?? '').toUpperCase() as BelgeTur;
  const tip = String(params.get('tip') ?? '').toUpperCase();
  if (yon === 'ALIS' || yon === 'SATIS') {
    return {
      yon,
      tur: ['SIPARIS', 'IRSALIYE', 'FATURA', 'IADE'].includes(tur) ? tur : null,
    };
  }
  if (tip.includes('ALIS')) return { yon: 'ALIS', tur: tip.includes('IADE') ? 'IADE' : tip.includes('IRSALIYE') ? 'IRSALIYE' : tip.includes('SIPARIS') ? 'SIPARIS' : 'FATURA' };
  if (tip.includes('SATIS')) return { yon: 'SATIS', tur: tip.includes('IADE') ? 'IADE' : tip.includes('IRSALIYE') ? 'IRSALIYE' : tip.includes('SIPARIS') ? 'SIPARIS' : 'FATURA' };
  return { yon: null, tur: null };
}

export function offlineBelgelerGetir(path: string): unknown {
  const sonrasi = pathParcala(path);
  if (sonrasi.length === 0) {
    const { yon, tur } = yonTurSorgudan(path);
    if (!yon) return { belgeler: [] };
    return { belgeler: belgelerGetirMock(yon, tur) };
  }
  if (sonrasi.length === 1) {
    return { belge: belgeGetirMock(sonrasi[0]!) };
  }
  return { belgeler: [] };
}

export function offlineBelgelerYaz(path: string, method: string, body: BodyInit | null | undefined): unknown {
  const sonrasi = pathParcala(path);

  if (method === 'POST' && sonrasi.length === 0) {
    if (typeof body !== 'string') throw new Error('Gövde gerekli');
    const girdi = JSON.parse(body) as BelgeKayitGirdi;
    return { belge: belgeOlusturMock(girdi) };
  }

  if (method === 'PUT' && sonrasi.length === 1) {
    if (typeof body !== 'string') throw new Error('Gövde gerekli');
    const girdi = JSON.parse(body) as BelgeKayitGirdi;
    return { belge: belgeGuncelleMock(sonrasi[0]!, girdi) };
  }

  if (method === 'POST' && sonrasi.length === 2 && sonrasi[1] === 'onayla') {
    return { belge: belgeOnaylaMock(sonrasi[0]!) };
  }

  if (method === 'POST' && sonrasi.length === 2 && sonrasi[1] === 'iptal') {
    return { belge: belgeIptalMock(sonrasi[0]!) };
  }

  if (method === 'DELETE' && sonrasi.length === 1) {
    belgeSilMock(sonrasi[0]!);
    return { mesaj: 'Silindi' };
  }

  return { mesaj: 'İşlem (mock)' };
}
