import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

const PANEL_MODULLERI = [
  { modulAdi: 'Kullanicilar', prefix: 'kullanicilar' },
  { modulAdi: 'Roller', prefix: 'roller' },
  { modulAdi: 'Ayarlar', prefix: 'ayarlar' },
  { modulAdi: 'Sekme Yonetimi', prefix: 'sekme_yonetimi' },
  { modulAdi: 'Kisayol Ayarlari', prefix: 'kisayol_ayarlari' },
  { modulAdi: 'Loglar', prefix: 'loglar' },
  { modulAdi: 'Veri Yedekleme', prefix: 'veri_yedekleme' },
];

const SISTEM_ROLLERI = [
  { rolAdi: 'YONETICI', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'SUPER_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'EDITOR', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'] },
  { rolAdi: 'GORUNTULEME', yetkiler: ['goruntuleme'] },
];

function sifreHashle(sifre: string) {
  const tuz = randomBytes(16).toString('hex');
  const hash = scryptSync(sifre, tuz, 64).toString('hex');
  return `scrypt:${tuz}:${hash}`;
}

async function varsayilanAyarlarOlustur(firmaId = 0) {
  const mevcut = await prisma.ayar.count({ where: { firmaId } });
  if (mevcut > 0) return;

  const kayitlar: { anahtar: string; deger: unknown }[] = [
    { anahtar: 'site_aktif', deger: true },
    { anahtar: 'domain', deger: '' },
    {
      anahtar: 'bakim',
      deger: {
        modu: false,
        baslik: 'Bakim Calismasi',
        mesaj: 'ERP gecici olarak bakimda.',
        gorselUrl: '',
        tahminiSure: '',
        ipBeyazListe: [],
      },
    },
    {
      anahtar: 'sayfa_404',
      deger: {
        baslik: 'Sayfa Bulunamadi',
        mesaj: 'Aradiginiz sayfa bulunamadi.',
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
    await prisma.ayar.create({ data: { firmaId, anahtar: k.anahtar, deger: k.deger as object } });
  }
}

async function main() {
  console.log('ERP tohum verisi yukleniyor (REST7.xlsx Sayfa2)...');

  for (const modul of PANEL_MODULLERI) {
    await prisma.modul.upsert({
      where: { prefix: modul.prefix },
      create: { modulAdi: modul.modulAdi, prefix: modul.prefix },
      update: { modulAdi: modul.modulAdi, durum: true },
    });
  }

  const moduller = await prisma.modul.findMany({ orderBy: { id: 'asc' } });
  for (const modul of moduller) {
    for (const rol of SISTEM_ROLLERI) {
      await prisma.rol.upsert({
        where: { modulId_rolAdi: { modulId: modul.id, rolAdi: rol.rolAdi } },
        create: { rolAdi: rol.rolAdi, modulId: modul.id, yetki: rol.yetkiler },
        update: { yetki: rol.yetkiler, durum: true },
      });
    }
  }

  const firma = await prisma.firma.upsert({
    where: { firmaKodu: 'F001' },
    create: {
      firmaKodu: 'F001',
      firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      vergiDairesi: 'ANTALYA KURUMLAR',
      vergiNo: '9250508945',
    },
    update: {
      firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      vergiDairesi: 'ANTALYA KURUMLAR',
      vergiNo: '9250508945',
      durum: true,
    },
  });

  await varsayilanAyarlarOlustur(firma.id);
  await varsayilanAyarlarOlustur(0);

  const donem = await prisma.donem.upsert({
    where: { firmaId_donemKodu: { firmaId: firma.id, donemKodu: 'D001' } },
    create: { firmaId: firma.id, donemKodu: 'D001', donemAdi: '2026' },
    update: { donemAdi: '2026', durum: true },
  });

  const sube = await prisma.sube.upsert({
    where: { firmaId_subeKodu: { firmaId: firma.id, subeKodu: 'MERKEZ' } },
    create: {
      firmaId: firma.id,
      subeKodu: 'MERKEZ',
      subeAdi: 'MERKEZ',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      mahalle: 'YENI EMEK MAH.',
      cadde: 'YILDIRIM BEYAZIT CAD.',
      no: '130A',
      postaKodu: '7060',
      efaturaSeri: 'GEF',
      earsivSeri: 'GEA',
      eirsaliyeSeri: 'GEI',
      mersis: '0925050894500018',
      ticaretSicil: '99725',
    },
    update: { durum: true },
  });

  const depo = await prisma.depo.upsert({
    where: { subeId_depoKodu: { subeId: sube.id, depoKodu: 'MERKEZ' } },
    create: {
      subeId: sube.id,
      depoKodu: 'MERKEZ',
      depoAdi: 'MERKEZ',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      mahalle: 'YENI EMEK MAH.',
      cadde: 'YILDIRIM BEYAZIT CAD.',
      no: '130A',
      postaKodu: '7060',
    },
    update: { durum: true },
  });

  const kasa = await prisma.kasa.upsert({
    where: { subeId_kasaKodu: { subeId: sube.id, kasaKodu: 'MERKEZ' } },
    create: { subeId: sube.id, kasaKodu: 'MERKEZ', kasaAdi: 'MERKEZ', paraBirimi: 'TL' },
    update: { durum: true },
  });

  const adminKodu = process.env.SEED_ADMIN_KODU ?? 'ADMIN';
  const adminSifre = process.env.SEED_ADMIN_PASSWORD ?? 'eRc241016!';

  const admin = await prisma.kullanici.upsert({
    where: { kullaniciKodu: adminKodu },
    create: {
      firmaId: firma.id,
      donemId: donem.id,
      subeId: sube.id,
      depoId: depo.id,
      kasaId: kasa.id,
      kullaniciKodu: adminKodu,
      adSoyad: 'ERCAN GUZEL',
      sifreHash: sifreHashle(adminSifre),
      pin: '2410',
      rol: 'YONETICI',
      durum: true,
    },
    update: {
      adSoyad: 'ERCAN GUZEL',
      firmaId: firma.id,
      donemId: donem.id,
      subeId: sube.id,
      depoId: depo.id,
      kasaId: kasa.id,
      rol: 'YONETICI',
      durum: true,
      sifreHash: sifreHashle(adminSifre),
      pin: '2410',
    },
  });

  await prisma.f001Cari.upsert({
    where: { firmaId_cariKodu: { firmaId: firma.id, cariKodu: 'S.07.0001' } },
    create: {
      firmaId: firma.id,
      cariTipi: 'SATICI',
      isletmeTuru: 'TUZEL',
      cariKodu: 'S.07.0001',
      cariAdi: 'GUZEL TEKNOLOJI',
      unvan: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      yetkili: 'ERCAN GUZEL',
      vergiDairesi: 'ANTALYA KURUMLAR',
      vergiNo: '9250508945',
      adres: 'YENI EMEK MAH. YILDIRIM BEYAZIT CAD. NO:130A',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      telefon: '8508851160',
      eposta: 'bilgi@guzelteknoloji.com',
      web: 'www.guzelteknoloji.com',
      efatura: true,
      efaturaTipi: 'TICARI FATURA',
      alias: 'urn:mail:defaultpk@guzelteknoloji.com',
    },
    update: { durum: true },
  });

  await prisma.f001Cari.upsert({
    where: { firmaId_cariKodu: { firmaId: firma.id, cariKodu: 'A.07.0001' } },
    create: {
      firmaId: firma.id,
      cariTipi: 'ALICI',
      isletmeTuru: 'GERCEK',
      cariKodu: 'A.07.0001',
      cariAdi: 'ERCAN GUZEL',
      unvan: 'ERCAN GUZEL',
      yetkili: 'ERCAN GUZEL',
      vergiDairesi: 'TC',
      adres: 'KUTUKCU MAH. 2979 SOK. NO:4 DAIRE:5',
      il: 'ANTALYA',
      ilce: 'KEPEZ',
      telefon: '5325674660',
      eposta: 'bilgi@ercanguzel.com',
      web: 'www.ercanguzel.com',
      efatura: false,
      efaturaTipi: 'E-ARSIV',
    },
    update: { durum: true },
  });

  const urunHizmet = await prisma.f001Urun.upsert({
    where: { urunKodu: '10.0001' },
    create: {
      urunTipi: 'HIZMET',
      urunNevi: 'RESMI',
      urunKodu: '10.0001',
      urunAdi: 'FIYAT FARKI',
      anaBirim: 'ADET',
      varsayilanBirim: 'ADET',
    },
    update: { durum: true },
  });

  const urunEmtea = await prisma.f001Urun.upsert({
    where: { urunKodu: '20.0002' },
    create: {
      urunTipi: 'EMTIA',
      urunNevi: 'RESMI',
      urunKodu: '20.0002',
      marka: 'INPOS',
      urunAdi: 'M530 YENI NESIL YAZARKASA POS',
      anaBirim: 'ADET',
      varsayilanBirim: 'ADET',
      mensei: 'TURKIYE',
    },
    update: { durum: true },
  });

  const birimHizmet = await prisma.f001Birim.upsert({
    where: { id: 1 },
    create: {
      urunId: urunHizmet.id,
      fiyatAdi: 'PERAKENDE',
      birimAdi: 'ADET',
      carpan: 1,
      alisKdv: 20,
      satisKdv: 20,
      kdvDahil: true,
    },
    update: { durum: true },
  }).catch(async () => {
    const mevcut = await prisma.f001Birim.findFirst({ where: { urunId: urunHizmet.id } });
    if (mevcut) return mevcut;
    return prisma.f001Birim.create({
      data: {
        urunId: urunHizmet.id,
        fiyatAdi: 'PERAKENDE',
        birimAdi: 'ADET',
        carpan: 1,
        alisKdv: 20,
        satisKdv: 20,
        kdvDahil: true,
      },
    });
  });

  const birimEmtea = await prisma.f001Birim.upsert({
    where: { id: 2 },
    create: {
      urunId: urunEmtea.id,
      fiyatAdi: 'PERAKENDE',
      birimAdi: 'ADET',
      carpan: 1,
      alisKdv: 10,
      satisKdv: 10,
      kdvDahil: false,
    },
    update: { durum: true },
  }).catch(async () => {
    const mevcut = await prisma.f001Birim.findFirst({ where: { urunId: urunEmtea.id } });
    if (mevcut) return mevcut;
    return prisma.f001Birim.create({
      data: {
        urunId: urunEmtea.id,
        fiyatAdi: 'PERAKENDE',
        birimAdi: 'ADET',
        carpan: 1,
        alisKdv: 10,
        satisKdv: 10,
        kdvDahil: false,
      },
    });
  });

  await prisma.f001Maliyet.upsert({
    where: { birimId: birimHizmet.id },
    create: { birimId: birimHizmet.id },
    update: { durum: true },
  });

  await prisma.f001Maliyet.upsert({
    where: { birimId: birimEmtea.id },
    create: { birimId: birimEmtea.id },
    update: { durum: true },
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

  console.log('Tohum verisi tamamlandi.');
  console.log(`  Firma: ${firma.firmaKodu}`);
  console.log(`  Donem: ${donem.donemKodu}`);
  console.log(`  Sube: ${sube.subeKodu}`);
  console.log(`  Admin: ${adminKodu} / ${adminSifre}`);
}

main()
  .catch((err) => {
    console.error('Tohum verisi hatasi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
