import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmp = path.join(os.tmpdir(), 'rest7_parse');
const shared = fs.readFileSync(path.join(tmp, 'xl/sharedStrings.xml'), 'utf8');
const strings = [...shared.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1]);

function colIndex(col) {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function parseSheet2() {
  const xml = fs.readFileSync(path.join(tmp, 'xl/worksheets/sheet2.xml'), 'utf8');
  const rows = [...xml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
  const tables = [];

  for (const row of rows) {
    const r = parseInt(row[1], 10);
    const cells = [...row[2].matchAll(/<c r="([A-Z]+)(\d+)"[^>]*?(?: t="s")?[^>]*>(?:<v>(\d+)<\/v>)?/g)];
    const map = {};
    for (const c of cells) {
      const v = c[3];
      if (v === undefined) continue;
      map[colIndex(c[1])] = strings[parseInt(v, 10)] ?? v;
    }
    const vals = Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((k) => map[k]);
    if (!vals.length) continue;

    const first = vals[0];
    if (first === first.toUpperCase() && first !== 'TABLO ADI' && !first.includes(' ')) {
      tables.push({ row: r, name: first, columns: vals.slice(1) });
    }
  }
  return tables;
}

const excelTables = parseSheet2();
console.log('=== REST7 Sayfa2 tablolari ===');
for (const t of excelTables) {
  console.log(`\n${t.name} (R${t.row})`);
  console.log('  Alanlar:', t.columns.join(', '));
}

const schemaModels = {
  KULLANICILAR: ['id', 'kullanici_kodu', 'ad_soyad', 'sifre_hash', 'pin', 'rol', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'firma_id', 'donem_id', 'sube_id', 'depo_id', 'kasa_id'],
  FIRMALAR: ['id', 'firma_kodu', 'firma_adi', 'vergi_dairesi', 'vergi_no', 'kayit_tarihi', 'guncelleme_tarihi', 'durum'],
  DONEMLER: ['id', 'donem_kodu', 'donem_adi', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'firma_id'],
  SUBELER: ['id', 'sube_kodu', 'sube_adi', 'il', 'ilce', 'mahalle', 'cadde', 'sokak', 'bina', 'no', 'posta_kodu', 'efatura_seri', 'earsiv_seri', 'eirsaliye_seri', 'mersis', 'ticaret_sicil', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'firma_id'],
  DEPOLAR: ['id', 'depo_kodu', 'depo_adi', 'il', 'ilce', 'mahalle', 'cadde', 'sokak', 'bina', 'no', 'posta_kodu', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'sube_id'],
  KASALAR: ['id', 'kasa_kodu', 'kasa_adi', 'para_birimi', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'sube_id'],
  F001CARILER: ['id', 'ust_id', 'cari_tipi', 'isletme_turu', 'cari_kodu', 'cari_adi', 'unvan', 'yetkili', 'vergi_dairesi', 'vergi_no', 'adres', 'il', 'ilce', 'telefon', 'eposta', 'web', 'efatura', 'efatura_tipi', 'alias', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'firma_id'],
  F001URUNLER: ['id', 'ust_id', 'urun_tipi', 'urun_nevi', 'urun_kodu', 'marka', 'urun_adi', 'ana_birim', 'varsayilan_birim', 'mensei', 'kayit_tarihi', 'guncelleme_tarihi', 'durum'],
  F001BIRIMLER: ['id', 'urun_id', 'fiyat_adi', 'birim_adi', 'carpan', 'barkod', 'alis_kdv', 'satis_kdv', 'alis_fiyati', 'satis_fiyati', 'kayit_tarihi', 'guncelleme_tarihi', 'durum', 'kdv_dahil'],
  F001MALIYETLER: ['id', 'birim_id', 'son_alis_maliyeti', 'yuruyen_agirlikli_ortalama', 'agirlikli_ortalama', 'basit_ortalama', 'lifo', 'fifo', 'kayit_tarihi', 'guncelleme_tarihi', 'durum'],
};

function excelToSnake(name) {
  const map = {
    KILLANICIKODU: 'kullanici_kodu',
    ADSOYAD: 'ad_soyad',
    SIFRE: 'sifre_hash',
    FIRMAKODU: 'firma_kodu',
    FIRMAADI: 'firma_adi',
    VERGIDAIRESI: 'vergi_dairesi',
    VERGINO: 'vergi_no',
    KAYITTARIHI: 'kayit_tarihi',
    GUNCELLEMETARIHI: 'guncelleme_tarihi',
    DURUM: 'durum',
    DONEMKODU: 'donem_kodu',
    DONEMADI: 'donem_adi',
    FIRMA_ID: 'firma_id',
    SUBEKODU: 'sube_kodu',
    SUBEADI: 'sube_adi',
    POSTAKODU: 'posta_kodu',
    EFATURASERI: 'efatura_seri',
    EARSIVSERI: 'earsiv_seri',
    EIRSALIYESERI: 'eirsaliye_seri',
    TICARETSICIL: 'ticaret_sicil',
    DEPOKODU: 'depo_kodu',
    DEPOADI: 'depo_adi',
    SUBE_ID: 'sube_id',
    KASAKODU: 'kasa_kodu',
    KASAADI: 'kasa_adi',
    PARABIRIMI: 'para_birimi',
    USTID: 'ust_id',
    CARITIPI: 'cari_tipi',
    ISLETMETURU: 'isletme_turu',
    CARIKODU: 'cari_kodu',
    CARIADI: 'cari_adi',
    YETKILI: 'yetkili',
    EPOSTA: 'eposta',
    EFATURATIPI: 'efatura_tipi',
    URUNTIPI: 'urun_tipi',
    URUNNEVI: 'urun_nevi',
    URUNKODU: 'urun_kodu',
    URUNADI: 'urun_adi',
    ANABIRIM: 'ana_birim',
    VARSAYILANBIRIM: 'varsayilan_birim',
    MENSEI: 'mensei',
    URUNID: 'urun_id',
    FIYATADI: 'fiyat_adi',
    BIRIMADI: 'birim_adi',
    ALISKDV: 'alis_kdv',
    SATISKDV: 'satis_kdv',
    ALISFIYATI: 'alis_fiyati',
    SATISFIYATI: 'satis_fiyati',
    KDVDAHIL: 'kdv_dahil',
    BIRIMID: 'birim_id',
    SONALISMALIYETI: 'son_alis_maliyeti',
    YURUYENAGIRLIKLIORTALAMA: 'yuruyen_agirlikli_ortalama',
    AGIRLIKLIORTALAMA: 'agirlikli_ortalama',
    BASITORALAMA: 'basit_ortalama',
    FIRMALAR: 'firma_id',
    DONEMLER: 'donem_id',
    SUBELER: 'sube_id',
    DEPOLAR: 'depo_id',
    KASALAR: 'kasa_id',
  };
  if (map[name]) return map[name];
  if (name === 'ID') return 'id';
  return name.toLowerCase();
}

console.log('\n=== Karsilastirma ===');
for (const t of excelTables) {
  const expected = schemaModels[t.name];
  if (!expected) {
    console.log(`EKSIK TABLO: ${t.name}`);
    continue;
  }
  const excelCols = ['id', ...t.columns.map(excelToSnake)];
  const missing = excelCols.filter((c) => !expected.includes(c));
  const extra = expected.filter((c) => !excelCols.includes(c));
  if (missing.length) console.log(`${t.name} — schema'da eksik: ${missing.join(', ')}`);
  if (extra.length) console.log(`${t.name} — schema'da fazla: ${extra.join(', ')}`);
  if (!missing.length && !extra.length) console.log(`${t.name} — TAMAM`);
}

const excelNames = new Set(excelTables.map((t) => t.name));
for (const name of Object.keys(schemaModels)) {
  if (!excelNames.has(name)) console.log(`Schema'da var, Excel'de yok: ${name}`);
}
