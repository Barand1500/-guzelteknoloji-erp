import { useCallback, useEffect, useState } from 'react';
import { birimGuncelle, birimOlustur, birimSil, birimleriGetir, urunleriGetir } from './api';
import { bosBirimForm, type AdminBirim, type AdminUrun, type BirimForm } from './tipler';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
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
const birimdenForm = (b: AdminBirim): BirimForm => ({
  urunId: b.urunId, fiyatAdi: b.fiyatAdi, birimAdi: b.birimAdi, carpan: b.carpan,
  barkod: b.barkod, alisKdv: b.alisKdv, satisKdv: b.satisKdv, alisFiyati: b.alisFiyati,
  satisFiyati: b.satisFiyati, kdvDahil: b.kdvDahil, aktif: b.aktif,
});

function SayiAlani({ etiket, deger, onChange, adim = '0.01' }: { etiket: string; deger: number; onChange: (v: number) => void; adim?: string }) {
  const [metin, setMetin] = useState(String(deger));
  const ondalikBasamak = adim === '0.0001' ? 4 : 2;

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
        const desen = new RegExp(`^\\d*(?:[.,]\\d{0,${ondalikBasamak}})?$`);
        if (!desen.test(sonraki)) return;
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

export function BirimlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('birimler');
  const [kayitlar, setKayitlar] = useState<AdminBirim[]>([]);
  const [urunler, setUrunler] = useState<AdminUrun[]>([]);
  const [form, setForm] = useState<BirimForm>(bosBirimForm);
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [secili, setSecili] = useState<AdminBirim | null>(null);
  const [adim, setAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silAcik, setSilAcik] = useState(false);
  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try { const [b, u] = await Promise.all([birimleriGetir(), urunleriGetir()]); setKayitlar(b); setUrunler(u); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Birimler alınamadı'); }
    finally { setYukleniyor(false); }
  }, [hataBildir]);
  useEffect(() => { void yukle(); }, [yukle]);
  const listeyeDon = useCallback(() => { setGorunum('liste'); setSecili(null); setForm(bosBirimForm); setAdim(0); }, []);
  const yeni = useCallback(() => { setForm({ ...bosBirimForm, urunId: urunler[0]?.id ?? '' }); setSecili(null); setGorunum('ekle'); }, [urunler]);
  const duzenle = useCallback((b: AdminBirim) => { setSecili(b); setForm(birimdenForm(b)); setGorunum('duzenle'); }, []);
  const dogrula = () => !form.urunId ? 'Ürün seçimi zorunludur' : !form.fiyatAdi.trim()
    ? 'Fiyat adı zorunludur' : !form.birimAdi.trim() ? 'Birim adı zorunludur' : form.carpan <= 0 ? 'Çarpan sıfırdan büyük olmalıdır' : null;
  const kaydet = useCallback(async () => {
    const hata = dogrula(); if (hata) return hataBildir(hata);
    try { if (secili) await birimGuncelle(secili.id, form); else await birimOlustur(form);
      basariBildir(secili ? 'Birim güncellendi.' : 'Birim eklendi.'); listeyeDon(); await yukle();
    } catch (e) { hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız'); }
  }, [basariBildir, form, hataBildir, listeyeDon, secili, yukle]);
  const silOnayla = useCallback(async () => {
    if (!secili) return; try { await birimSil(secili.id); basariBildir('Birim silindi.'); setSilAcik(false); listeyeDon(); await yukle(); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Silme başarısız'); }
  }, [basariBildir, hataBildir, listeyeDon, secili, yukle]);
  useModulAksiyonlari({ kaydet, ekle: yeni, sil: () => setSilAcik(true) }, {
    kaydet: gorunum === 'duzenle' && duzenlemeVar, ekle: gorunum === 'liste' && eklemeVar,
    sil: gorunum === 'duzenle' && silmeVar,
  }, gorunum !== 'liste');

  const temel = <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
    <label className="ap-tanimlar-secim-alan block"><span className="ap-tanim-girdi-etiket">Ürün *</span>
      <FormAcilirSecim value={form.urunId} onChange={(urunId) => setForm((f) => ({ ...f, urunId }))}
        secenekler={urunler.map((u) => ({ value: u.id, label: `${u.urunKodu} — ${u.urunAdi}` }))} /></label>
    <TanimGirdi etiket="Fiyat Adı" deger={form.fiyatAdi} maxLength={50} zorunlu onChange={(fiyatAdi) => setForm((f) => ({ ...f, fiyatAdi }))} />
    <TanimGirdi etiket="Birim Adı" deger={form.birimAdi} maxLength={20} zorunlu onChange={(birimAdi) => setForm((f) => ({ ...f, birimAdi }))} />
    <TanimGirdi etiket="Barkod" deger={form.barkod} maxLength={50} onChange={(barkod) => setForm((f) => ({ ...f, barkod }))} />
    <SayiAlani etiket="Çarpan" deger={form.carpan} adim="0.0001" onChange={(carpan) => setForm((f) => ({ ...f, carpan }))} />
  </div>;
  const fiyat = <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
    <SayiAlani etiket="Alış KDV (%)" deger={form.alisKdv} onChange={(alisKdv) => setForm((f) => ({ ...f, alisKdv }))} />
    <SayiAlani etiket="Satış KDV (%)" deger={form.satisKdv} onChange={(satisKdv) => setForm((f) => ({ ...f, satisKdv }))} />
    <SayiAlani etiket="Alış Fiyatı" deger={form.alisFiyati} adim="0.0001" onChange={(alisFiyati) => setForm((f) => ({ ...f, alisFiyati }))} />
    <SayiAlani etiket="Satış Fiyatı" deger={form.satisFiyati} adim="0.0001" onChange={(satisFiyati) => setForm((f) => ({ ...f, satisFiyati }))} />
    <OrtakDurumAlani aktif={form.kdvDahil} onChange={(kdvDahil) => setForm((f) => ({ ...f, kdvDahil }))} />
  </div>;

  let icerik;
  if (yukleniyor) icerik = <TanimYukleniyor />;
  else if (gorunum === 'ekle') icerik = <TanimSihirbaz baslik="Yeni Birim / Fiyat" aktifAdim={adim}
    onAdimDegistir={setAdim} onIptal={listeyeDon} onTamamla={() => void kaydet()} onHata={hataBildir}
    adimDogrula={() => dogrula()} adimlar={[
      { baslik: 'Birim Bilgileri', aciklama: 'Ürün, fiyat ve birim tanımı', icerik: temel },
      { baslik: 'Fiyat ve Vergi', aciklama: 'KDV ve fiyat alanları', icerik: fiyat },
      { baslik: 'Durum', aciklama: 'Kaydın durumunu belirleyin', icerik: <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} /> },
    ]} />;
  else if (gorunum === 'duzenle' && secili) icerik = <TanimDuzenleEkrani ustEtiket="Birim Düzenle"
    baslik={`${secili.urunKodu} — ${secili.birimAdi}`} onGeri={listeyeDon} onKaydet={duzenlemeVar ? () => void kaydet() : undefined} saltOkunur={!duzenlemeVar}>
    <TanimFormBolum baslik="Birim Bilgileri">{temel}</TanimFormBolum>
    <TanimFormBolum baslik="Fiyat ve Vergi">{fiyat}</TanimFormBolum>
    <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
  </TanimDuzenleEkrani>;
  else icerik = <TanimListeEkrani onYeniEkle={eklemeVar ? yeni : undefined} yeniEkleMetin="Yeni Birim">
    <TanimKayitTablosu baslik="Birimler ve Fiyatlar" kayitlar={kayitlar} onSatirTikla={duzenle} onDuzenle={duzenlemeVar ? duzenle : undefined}
      onSil={silmeVar ? (b) => { setSecili(b); setSilAcik(true); } : undefined}
      aramaMetni={(b) => `${b.urunKodu} ${b.urunAdi} ${b.fiyatAdi} ${b.birimAdi} ${b.barkod}`} pasifMi={(b) => !b.aktif}
      kolonlar={[
        { id: 'urun', baslik: 'Ürün', hucre: (b) => `${b.urunKodu} — ${b.urunAdi}` },
        { id: 'fiyat', baslik: 'Fiyat Adı', hucre: (b) => b.fiyatAdi }, { id: 'birim', baslik: 'Birim', hucre: (b) => b.birimAdi },
        { id: 'carpan', baslik: 'Çarpan', hucre: (b) => b.carpan }, { id: 'alis', baslik: 'Alış', hucre: (b) => b.alisFiyati.toLocaleString('tr-TR') },
        { id: 'satis', baslik: 'Satış', hucre: (b) => b.satisFiyati.toLocaleString('tr-TR') },
        { id: 'durum', baslik: 'Durum', hucre: (b) => <TanimDurumRozeti aktif={b.aktif} /> },
        { id: 'guncelleme', baslik: 'Güncelleme', hucre: (b) => tarihSaatFormatla(b.guncelleme) },
      ]} />
  </TanimListeEkrani>;
  return <AdminModulKabuk baslik="Birimler" aciklama="Ürün birimleri, fiyatları ve KDV oranları">
    {icerik}<SilmeOnayModal acik={silAcik} onKapat={() => setSilAcik(false)} onOnayla={() => void silOnayla()}
      baslik="Bu birimi silmek istiyor musunuz?" hedefMetin={secili ? `${secili.urunAdi} — ${secili.birimAdi}` : ''} ariaLabel="Birim silme onayı" />
  </AdminModulKabuk>;
}
