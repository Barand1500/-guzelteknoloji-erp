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

function sifreHashle(sifre) {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

async function varsayilanAyarlarOlustur(subeId = 0) {
  const mevcut = await prisma.ayar.count({ where: { subeId } });
  if (mevcut > 0) return;

  const kayitlar = [
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
    await prisma.ayar.create({ data: { subeId, anahtar: k.anahtar, deger: k.deger } });
  }
}

async function main() {
  console.log('Sube veritabani tohum verisi yukleniyor...');

  for (let i = 0; i < PANEL_MODULLERI.length; i++) {
    const modulId = i + 1;
    for (const rol of SISTEM_ROLLERI) {
      await prisma.rol.upsert({
        where: { modulId_rolAdi: { modulId, rolAdi: rol.rolAdi } },
        create: { rolAdi: rol.rolAdi, modulId, yetki: rol.yetkiler },
        update: { yetki: rol.yetkiler, durum: true },
      });
    }
  }

  await varsayilanAyarlarOlustur(0);

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
      ad: 'Sube Admin',
      sifreHash: sifreHashle(adminSifre),
      rolId: superAdminRol.id,
      kullaniciTipi: 'sube',
      subeId: 1,
      aktif: true,
    },
    update: {
      ad: 'Sube Admin',
      rolId: superAdminRol.id,
      kullaniciTipi: 'sube',
      subeId: 1,
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
        onizle: 'Ctrl+P',
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

  console.log('Sube tohum verisi tamamlandi.');
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
