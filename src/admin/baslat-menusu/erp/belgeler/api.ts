import type { BelgeKayit, BelgeKayitGirdi, BelgeTur, BelgeYon, OdemeKanali } from './tipler';
import {
  belgeGetirMock,
  belgeGuncelleMock,
  belgeIptalMock,
  belgeOlusturMock,
  belgeOnaylaMock,
  belgeOdemeleriGetir,
  belgedenAktarMock,
  belgeSilMock,
  belgelerGetirMock,
  iadeTaslagiOlusturMock,
  odemeEkleMock,
  seriOner,
  stokBakiyeleriGetir,
  stokHareketleriGetir,
  cariBakiyeAl,
  cariHareketleriGetir,
  mockStokSeedKur,
} from './mockBelgeDepo';

/** Mock-first API — backend yerine localStorage */

export async function belgelerGetir(yon?: BelgeYon | null, tur?: BelgeTur | null): Promise<BelgeKayit[]> {
  return belgelerGetirMock(yon, tur);
}

export async function belgeGetir(id: string): Promise<BelgeKayit> {
  return belgeGetirMock(id);
}

export async function belgeOlustur(girdi: BelgeKayitGirdi): Promise<BelgeKayit> {
  return belgeOlusturMock(girdi);
}

export async function belgeGuncelle(id: string, girdi: BelgeKayitGirdi): Promise<BelgeKayit> {
  return belgeGuncelleMock(id, girdi);
}

export async function belgeOnayla(id: string): Promise<BelgeKayit> {
  return belgeOnaylaMock(id);
}

export async function belgeIptal(id: string): Promise<BelgeKayit> {
  return belgeIptalMock(id);
}

export async function belgeSil(id: string): Promise<void> {
  belgeSilMock(id);
}

export async function belgedenAktar(
  kaynakId: string,
  hedefTur: BelgeTur,
  seriBilgi: { efaturaSeri?: string; eirsaliyeSeri?: string }
): Promise<BelgeKayit> {
  return belgedenAktarMock(kaynakId, hedefTur, seriBilgi);
}

export async function iadeTaslagiOlustur(
  kaynakFaturaId: string,
  seriBilgi: { efaturaSeri?: string }
): Promise<BelgeKayit> {
  return iadeTaslagiOlusturMock(kaynakFaturaId, seriBilgi);
}

export async function odemeEkle(girdi: {
  belgeId: string;
  tutar: number;
  kanal: OdemeKanali;
  kasaId?: string | null;
  kasaKodu?: string;
  bankaId?: string | null;
  bankaKodu?: string;
  aciklama?: string;
}): Promise<void> {
  odemeEkleMock(girdi);
}

export async function odemeleriGetir(belgeId: string) {
  return belgeOdemeleriGetir(belgeId);
}

export { seriOner, stokBakiyeleriGetir, stokHareketleriGetir, cariBakiyeAl, cariHareketleriGetir, mockStokSeedKur };
