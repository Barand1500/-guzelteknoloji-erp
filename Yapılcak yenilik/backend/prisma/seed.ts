import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

const PANEL_MODULLERI = [
  { modulAdi: 'Master', prefix: 'master' },
  { modulAdi: 'Kullanicilar', prefix: 'kullanicilar' },
  { modulAdi: 'Roller', prefix: 'roller' },
  { modulAdi: 'Tanimlar', prefix: 'tanimlar' },
  { modulAdi: 'Urunler Tanimlari', prefix: 'urunler_tanimlari' },
  { modulAdi: 'Menu Tanimlari', prefix: 'menu_tanimlari' },
  { modulAdi: 'Cari Tanimlari', prefix: 'cari_tanimlari' },
  { modulAdi: 'Yazici Tanimlari', prefix: 'yazici_tanimlari' },
  { modulAdi: 'Happy Hour Fiyat Listeleri', prefix: 'happy_hour_fiyat_listeleri' },
  { modulAdi: 'Tarilacak Urunler', prefix: 'tarilacak_urunler' },
  { modulAdi: 'Favoriler', prefix: 'favoriler' },
  { modulAdi: 'Odeme Gruplari', prefix: 'odeme_gruplari' },
  { modulAdi: 'Urun Eslestir', prefix: 'urun_eslestir' },
  { modulAdi: 'E Fatura Ayarlari', prefix: 'e_fatura_ayarlari' },
  { modulAdi: 'Marslanacak Urunler', prefix: 'marslanacak_urunler' },
  { modulAdi: 'Ayarlar', prefix: 'ayarlar' },
  { modulAdi: 'Sekme Yonetimi', prefix: 'sekme_yonetimi' },
  { modulAdi: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari' },
  { modulAdi: 'Loglar', prefix: 'loglar' },
  { modulAdi: 'Veri Yedekleme', prefix: 'veri_yedekleme' },
];

const SISTEM_ROLLERI = [
  { rolAdi: 'SUPER_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'AJANS_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'MUSTERI_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'EDITOR', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'] },
  { rolAdi: 'SEO_EDITOR', yetkiler: ['goruntuleme', 'duzenleme'] },
  { rolAdi: 'GORUNTULEME', yetkiler: ['goruntuleme'] },
];

function sifreHashle(sifre: string) {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

async function varsayilanAyarlarOlustur(subeId = 0) {
  const mevcut = await prisma.ayar.count({ where: { subeId } });
  if (mevcut > 0) return;

  const kayitlar: { anahtar: string; deger: unknown }[] = [
    { anahtar: 'site_aktif', deger: true },
    { anahtar: 'domain', deger: '' },
    {
      anahtar: 'bakim',
      deger: {
        modu: false,
        baslik: 'Bakim Calismasi',
        mesaj: 'Site gecici olarak bakimda.',
        gorselUrl: '',
        tahminiSure: '',
        ipBeyazListe: [],
      },
    },
    {
      anahtar: 'sayfa_404',
      deger: {
        baslik: 'Sayfa Bulunamadi',
        mesaj: 'Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.',
        gorselUrl: '',
        menuTipi: 'ust',
        oneriSayfaId: null,
        anaSayfaButonu: true,
      },
    },
    { anahtar: 'panel_dili', deger: 'tr' },
    { anahtar: 'panel_ceviriler', deger: {} },
    { anahtar: 'log_saklama_gun', deger: 90 },
    { anahtar: 'yedekleme', deger: { otomatik: false, gun: 7, format: 'json' } },
    { anahtar: 'guvenlik', deger: { basliklari: true, robotsEngelle: false } },
    {
      anahtar: 'script',
      deger: { googleAnalytics: '', headerScript: '', bodyAcilisScript: '', footerScript: '' },
    },
    { anahtar: 'sag_tik_paneli', deger: { aktif: true, ogeler: [], modulIdler: [] } },
  ];

  for (const k of kayitlar) {
    await prisma.ayar.create({ data: { subeId, anahtar: k.anahtar, deger: k.deger as object } });
  }
}

async function main() {
  console.log('Veritabani tohum verisi yukleniyor...');

  const modulIds: number[] = [];
  for (const m of PANEL_MODULLERI) {
    const kayit = await prisma.modul.upsert({
      where: { prefix: m.prefix },
      create: { modulAdi: m.modulAdi, prefix: m.prefix },
      update: { modulAdi: m.modulAdi, durum: true },
    });
    modulIds.push(kayit.id);
  }

  for (const rol of SISTEM_ROLLERI) {
    for (const modulId of modulIds) {
      await prisma.rol.upsert({
        where: { modulId_rolAdi: { modulId, rolAdi: rol.rolAdi } },
        create: { rolAdi: rol.rolAdi, modulId, yetki: rol.yetkiler },
        update: { yetki: rol.yetkiler, durum: true },
      });
    }
  }

  await varsayilanAyarlarOlustur(0);

  const bayi = await prisma.bayi.upsert({
    where: { id: 1 },
    create: { id: 1, unvan: 'Guzel Teknoloji', eposta: 'info@guzelteknoloji.com', il: 'Istanbul', durum: true },
    update: { unvan: 'Guzel Teknoloji', durum: true },
  });

  const firma = await prisma.firma.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      bayiId: bayi.id,
      tabelaAdi: 'Demo Restoran',
      unvan: 'Demo Restoran Grubu',
      eposta: 'demo@restoran.local',
      il: 'Istanbul',
      durum: true,
    },
    update: { unvan: 'Demo Restoran Grubu', durum: true },
  });

  const paket = await prisma.paket.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      paketAdi: 'Temel Paket',
      subeSayisi: 5,
      personelSayisi: 20,
      masaSayisi: 100,
      fiyat: 0,
      paraBirimi: 'TRY',
      durum: true,
    },
    update: { paketAdi: 'Temel Paket', durum: true },
  });

  await prisma.lisans.upsert({
    where: { id: 1 },
    create: { id: 1, firmaId: firma.id, paketId: paket.id, durum: true },
    update: { durum: true },
  });

  const sube = await prisma.sube.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      firmaId: firma.id,
      subeAdi: 'Merkez Sube',
      subeTipi: 'restoran',
      dbBilgileri: { not: 'Tek MySQL — restoran-db' },
      lisansBilgileri: { paketId: paket.id },
      il: 'Istanbul',
      durum: true,
    },
    update: { subeAdi: 'Merkez Sube', durum: true },
  });

  const superAdminRol = await prisma.rol.findFirst({
    where: { rolAdi: 'SUPER_ADMIN' },
    orderBy: { id: 'asc' },
  });

  if (!superAdminRol) throw new Error('SUPER_ADMIN rolu bulunamadi');

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@restorant.local';
  const adminSifre = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  const admin = await prisma.kullanici.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      ad: 'Sistem Admin',
      sifreHash: sifreHashle(adminSifre),
      rolId: superAdminRol.id,
      kullaniciTipi: 'merkez',
      subeId: sube.id,
      firmaId: firma.id,
      bayiId: bayi.id,
      aktif: true,
    },
    update: {
      ad: 'Sistem Admin',
      rolId: superAdminRol.id,
      kullaniciTipi: 'merkez',
      subeId: sube.id,
      aktif: true,
      sifreHash: sifreHashle(adminSifre),
    },
  });

  await prisma.kullaniciKisayol.upsert({
    where: { kullaniciId: admin.id },
    create: {
      kullaniciId: admin.id,
      harita: {
        rehber: 'F1',
        kaydet: 'Ctrl+S',
        ekle: 'Ctrl+N',
        guncelle: 'Ctrl+P',
        sil: 'Delete',
        oncekiKayit: 'Alt+ArrowLeft',
        sonrakiKayit: 'Alt+ArrowRight',
      },
    },
    update: {},
  });

  await prisma.kullaniciSekmeAyar.upsert({
    where: { kullaniciId: admin.id },
    create: { kullaniciId: admin.id, ayarlar: {} },
    update: {},
  });

  console.log('Tohum verisi tamamlandi.');
  console.log(`  Admin id: ${admin.id} — ${adminEmail}`);
}

main()
  .catch((err) => {
    console.error('Tohum verisi hatasi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
