import { useCallback, useEffect, useState } from 'react';
import { birimleriGetir, maliyetGuncelle, maliyetOlustur, maliyetSil, maliyetleriGetir } from './api';
import { bosMaliyetForm, type AdminBirim, type AdminMaliyet, type MaliyetForm } from './tipler';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimDurumRozeti, TanimKayitTablosu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimListeEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimListeEkrani';
import { TanimSihirbaz } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formInputSinifi } from '@/formlar/FormAlani';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';

type Gorunum = 'liste' | 'ekle' | 'duzenle';
const maliyettenForm = (m: AdminMaliyet): MaliyetForm => ({
  birimId: m.birimId, sonAlisMaliyeti: m.sonAlisMaliyeti,
  yuruyenAgirlikliOrtalama: m.yuruyenAgirlikliOrtalama,
  agirlikliOrtalama: m.agirlikliOrtalama, basitOrtalama: m.basitOrtalama,
  lifo: m.lifo, fifo: m.fifo, aktif: m.aktif,
});
const para = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
function SayiAlani({ etiket, deger, onChange }: { etiket: string; deger: number; onChange: (v: number) => void }) {
  const [metin, setMetin] = useState(String(deger));

  useEffect(() => {
    setMetin(String(deger));
  }, [deger]);

  return <label className="ap-tanim-girdi block"><span className="ap-tanim-girdi-etiket">{etiket}</span>
    <input
      className={formInputSinifi}
      type="text"
      inputMode="decimal"
      value={metin}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const sonraki = e.target.value;
        if (!/^\d*(?:[.,]\d{0,4})?$/.test(sonraki)) return;
        setMetin(sonraki);
        if (sonraki !== '' && sonraki !== ',' && sonraki !== '.') {
          onChange(Number(sonraki.replace(',', '.')));
        }
      }}
      onBlur={() => {
        if (metin.trim() === '' || metin === ',' || metin === '.') {
          setMetin('0');
          onChange(0);
          return;
        }
        const sayi = Number(metin.replace(',', '.'));
        const normal = Number.isFinite(sayi) ? sayi : 0;
        setMetin(String(normal));
        onChange(normal);
      }}
    /></label>;
}

export function MaliyetlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('maliyetler');
  const [kayitlar, setKayitlar] = useState<AdminMaliyet[]>([]);
  const [birimler, setBirimler] = useState<AdminBirim[]>([]);
  const [form, setForm] = useState<MaliyetForm>(bosMaliyetForm);
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [secili, setSecili] = useState<AdminMaliyet | null>(null);
  const [adim, setAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silAcik, setSilAcik] = useState(false);
  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try { const [m, b] = await Promise.all([maliyetleriGetir(), birimleriGetir()]); setKayitlar(m); setBirimler(b); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Maliyetler alınamadı'); }
    finally { setYukleniyor(false); }
  }, [hataBildir]);
  useEffect(() => { void yukle(); }, [yukle]);
  const listeyeDon = useCallback(() => { setGorunum('liste'); setSecili(null); setForm(bosMaliyetForm); setAdim(0); }, []);
  const yeni = useCallback(() => {
    const kullanilan = new Set(kayitlar.map((m) => m.birimId));
    setForm({ ...bosMaliyetForm, birimId: birimler.find((b) => !kullanilan.has(b.id))?.id ?? '' });
    setSecili(null); setGorunum('ekle');
  }, [birimler, kayitlar]);
  const duzenle = useCallback((m: AdminMaliyet) => { setSecili(m); setForm(maliyettenForm(m)); setGorunum('duzenle'); }, []);
  const dogrula = () => !form.birimId ? 'Birim seçimi zorunludur' : null;
  const kaydet = useCallback(async () => {
    const hata = dogrula(); if (hata) return hataBildir(hata);
    try { if (secili) await maliyetGuncelle(secili.id, form); else await maliyetOlustur(form);
      basariBildir(secili ? 'Maliyet güncellendi.' : 'Maliyet eklendi.'); listeyeDon(); await yukle();
    } catch (e) { hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız'); }
  }, [basariBildir, form, hataBildir, listeyeDon, secili, yukle]);
  const silOnayla = useCallback(async () => {
    if (!secili) return; try { await maliyetSil(secili.id); basariBildir('Maliyet silindi.'); setSilAcik(false); listeyeDon(); await yukle(); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Silme başarısız'); }
  }, [basariBildir, hataBildir, listeyeDon, secili, yukle]);
  useModulAksiyonlari({ kaydet, ekle: yeni, sil: () => setSilAcik(true) }, {
    kaydet: gorunum === 'duzenle' && duzenlemeVar, ekle: gorunum === 'liste' && eklemeVar,
    sil: gorunum === 'duzenle' && silmeVar,
  }, gorunum !== 'liste');

  const alanlar = <>
    <label className="ap-tanimlar-secim-alan block"><span className="ap-tanim-girdi-etiket">Ürün / Birim *</span>
      <FormAcilirSecim value={form.birimId} onChange={(birimId) => setForm((f) => ({ ...f, birimId }))}
        disabled={Boolean(secili)} secenekler={birimler.map((b) => ({ value: b.id, label: `${b.urunKodu} — ${b.urunAdi} / ${b.birimAdi}` }))} /></label>
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <SayiAlani etiket="Son Alış Maliyeti" deger={form.sonAlisMaliyeti} onChange={(sonAlisMaliyeti) => setForm((f) => ({ ...f, sonAlisMaliyeti }))} />
      <SayiAlani etiket="Yürüyen Ağırlıklı Ortalama" deger={form.yuruyenAgirlikliOrtalama} onChange={(yuruyenAgirlikliOrtalama) => setForm((f) => ({ ...f, yuruyenAgirlikliOrtalama }))} />
      <SayiAlani etiket="Ağırlıklı Ortalama" deger={form.agirlikliOrtalama} onChange={(agirlikliOrtalama) => setForm((f) => ({ ...f, agirlikliOrtalama }))} />
      <SayiAlani etiket="Basit Ortalama" deger={form.basitOrtalama} onChange={(basitOrtalama) => setForm((f) => ({ ...f, basitOrtalama }))} />
      <SayiAlani etiket="LIFO" deger={form.lifo} onChange={(lifo) => setForm((f) => ({ ...f, lifo }))} />
      <SayiAlani etiket="FIFO" deger={form.fifo} onChange={(fifo) => setForm((f) => ({ ...f, fifo }))} />
    </div>
  </>;

  let icerik;
  if (yukleniyor) icerik = <TanimYukleniyor />;
  else if (gorunum === 'ekle') icerik = <TanimSihirbaz baslik="Yeni Maliyet Kartı" aktifAdim={adim}
    onAdimDegistir={setAdim} onIptal={listeyeDon} onTamamla={() => void kaydet()} onHata={hataBildir}
    adimDogrula={() => dogrula()} adimlar={[
      { baslik: 'Maliyet Bilgileri', aciklama: 'Birim ve maliyet hesaplama değerleri', icerik: alanlar },
      { baslik: 'Durum', aciklama: 'Maliyet kaydının durumunu belirleyin', icerik: <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} /> },
    ]} />;
  else if (gorunum === 'duzenle' && secili) icerik = <TanimDuzenleEkrani ustEtiket="Maliyet Düzenle"
    baslik={`${secili.urunKodu} — ${secili.birimAdi}`} onGeri={listeyeDon} onKaydet={duzenlemeVar ? () => void kaydet() : undefined} saltOkunur={!duzenlemeVar}>
    <TanimFormBolum baslik="Maliyet Bilgileri">{alanlar}</TanimFormBolum>
    <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
  </TanimDuzenleEkrani>;
  else icerik = <TanimListeEkrani onYeniEkle={eklemeVar ? yeni : undefined} yeniEkleMetin="Yeni Maliyet">
    <TanimKayitTablosu baslik="Maliyetler" kayitlar={kayitlar} onSatirTikla={duzenle} onDuzenle={duzenlemeVar ? duzenle : undefined}
      onSil={silmeVar ? (m) => { setSecili(m); setSilAcik(true); } : undefined}
      aramaMetni={(m) => `${m.urunKodu} ${m.urunAdi} ${m.birimAdi}`} pasifMi={(m) => !m.aktif}
      kolonlar={[
        { id: 'urun', baslik: 'Ürün', hucre: (m) => `${m.urunKodu} — ${m.urunAdi}` },
        { id: 'birim', baslik: 'Birim', hucre: (m) => m.birimAdi },
        { id: 'son', baslik: 'Son Alış', hucre: (m) => para(m.sonAlisMaliyeti) },
        { id: 'yuruyen', baslik: 'Yürüyen Ort.', hucre: (m) => para(m.yuruyenAgirlikliOrtalama) },
        { id: 'agirlikli', baslik: 'Ağırlıklı Ort.', hucre: (m) => para(m.agirlikliOrtalama) },
        { id: 'fifo', baslik: 'FIFO', hucre: (m) => para(m.fifo) }, { id: 'lifo', baslik: 'LIFO', hucre: (m) => para(m.lifo) },
        { id: 'durum', baslik: 'Durum', hucre: (m) => <TanimDurumRozeti aktif={m.aktif} /> },
        { id: 'guncelleme', baslik: 'Güncelleme', hucre: (m) => tarihSaatFormatla(m.guncelleme) },
      ]} />
  </TanimListeEkrani>;
  return <AdminModulKabuk baslik="Maliyetler" aciklama="Ürün birimi bazında maliyet hesaplama değerleri">
    {icerik}<SilmeOnayModal acik={silAcik} onKapat={() => setSilAcik(false)} onOnayla={() => void silOnayla()}
      baslik="Bu maliyet kaydını silmek istiyor musunuz?" hedefMetin={secili ? `${secili.urunAdi} — ${secili.birimAdi}` : ''} ariaLabel="Maliyet silme onayı" />
  </AdminModulKabuk>;
}
