import { useCallback, useEffect, useState } from 'react';
import { urunGuncelle, urunOlustur, urunSil, urunleriGetir } from './api';
import { bosUrunForm, URUN_NEVILERI, URUN_TIPLERI, type AdminUrun, type UrunForm } from './tipler';
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
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';

type Gorunum = 'liste' | 'ekle' | 'duzenle';
const urundenForm = (u: AdminUrun): UrunForm => ({
  ustId: u.ustId, urunTipi: u.urunTipi, urunNevi: u.urunNevi, urunKodu: u.urunKodu,
  marka: u.marka, urunAdi: u.urunAdi, anaBirim: u.anaBirim,
  varsayilanBirim: u.varsayilanBirim, mensei: u.mensei,
});

export function UrunlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler();
  const [kayitlar, setKayitlar] = useState<AdminUrun[]>([]);
  const [form, setForm] = useState<UrunForm>(bosUrunForm);
  const [aktif, setAktif] = useState(true);
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [secili, setSecili] = useState<AdminUrun | null>(null);
  const [adim, setAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silAcik, setSilAcik] = useState(false);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try { setKayitlar(await urunleriGetir()); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Ürünler alınamadı'); }
    finally { setYukleniyor(false); }
  }, [hataBildir]);
  useEffect(() => { void yukle(); }, [yukle]);

  const listeyeDon = useCallback(() => {
    setGorunum('liste'); setSecili(null); setForm(bosUrunForm); setAktif(true); setAdim(0);
  }, []);
  const yeni = useCallback(() => { setForm(bosUrunForm); setAktif(true); setSecili(null); setGorunum('ekle'); }, []);
  const duzenle = useCallback((u: AdminUrun) => {
    setSecili(u); setForm(urundenForm(u)); setAktif(u.aktif); setGorunum('duzenle');
  }, []);
  const dogrula = () => !form.urunTipi ? 'Ürün tipi zorunludur' : !form.urunKodu.trim()
    ? 'Ürün kodu zorunludur' : !form.urunAdi.trim() ? 'Ürün adı zorunludur' : null;
  const kaydet = useCallback(async () => {
    const hata = dogrula(); if (hata) return hataBildir(hata);
    try {
      if (secili) await urunGuncelle(secili.id, { ...form, aktif });
      else await urunOlustur({ ...form, aktif });
      basariBildir(secili ? 'Ürün güncellendi.' : 'Ürün eklendi.'); listeyeDon(); await yukle();
    } catch (e) { hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız'); }
  }, [aktif, basariBildir, form, hataBildir, listeyeDon, secili, yukle]);
  const silOnayla = useCallback(async () => {
    if (!secili) return; try { await urunSil(secili.id); basariBildir('Ürün silindi.'); setSilAcik(false); listeyeDon(); await yukle(); }
    catch (e) { hataBildir(e instanceof Error ? e.message : 'Silme başarısız'); }
  }, [basariBildir, hataBildir, listeyeDon, secili, yukle]);

  useModulAksiyonlari({ kaydet, ekle: yeni, sil: () => setSilAcik(true) }, {
    kaydet: gorunum === 'duzenle' && duzenlemeVar, ekle: gorunum === 'liste' && eklemeVar,
    sil: gorunum === 'duzenle' && silmeVar,
  }, gorunum !== 'liste');

  const alanlar = (
    <>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block"><span className="ap-tanim-girdi-etiket">Ürün Tipi *</span>
          <FormAcilirSecim value={form.urunTipi} onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
            secenekler={URUN_TIPLERI.map((x) => ({ ...x }))} /></label>
        <label className="ap-tanimlar-secim-alan block"><span className="ap-tanim-girdi-etiket">Ürün Nevi</span>
          <FormAcilirSecim value={form.urunNevi} onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
            secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]} /></label>
        <TanimGirdi etiket="Ürün Kodu" deger={form.urunKodu} maxLength={30} zorunlu onChange={(urunKodu) => setForm((f) => ({ ...f, urunKodu }))} />
        <TanimGirdi etiket="Ürün Adı" deger={form.urunAdi} maxLength={255} zorunlu onChange={(urunAdi) => setForm((f) => ({ ...f, urunAdi }))} />
        <TanimGirdi etiket="Marka" deger={form.marka} maxLength={100} onChange={(marka) => setForm((f) => ({ ...f, marka }))} />
        <TanimGirdi etiket="Menşei" deger={form.mensei} maxLength={50} onChange={(mensei) => setForm((f) => ({ ...f, mensei }))} />
        <TanimGirdi etiket="Ana Birim" deger={form.anaBirim} maxLength={20} onChange={(anaBirim) => setForm((f) => ({ ...f, anaBirim }))} />
        <TanimGirdi etiket="Varsayılan Birim" deger={form.varsayilanBirim} maxLength={20} onChange={(varsayilanBirim) => setForm((f) => ({ ...f, varsayilanBirim }))} />
        <TanimGirdi etiket="Üst Ürün ID" deger={form.ustId} maxLength={12} inputMode="numeric" onChange={(ustId) => setForm((f) => ({ ...f, ustId: ustId.replace(/\D/g, '') }))} />
      </div>
    </>
  );

  let icerik;
  if (yukleniyor) icerik = <TanimYukleniyor />;
  else if (gorunum === 'ekle') icerik = <TanimSihirbaz baslik="Yeni Ürün Kartı" aktifAdim={adim}
    onAdimDegistir={setAdim} onIptal={listeyeDon} onTamamla={() => void kaydet()}
    onHata={hataBildir} adimDogrula={() => dogrula()} adimlar={[
      { baslik: 'Ürün Bilgileri', aciklama: 'Veritabanındaki ürün kartı alanlarını doldurun', icerik: alanlar },
      { baslik: 'Durum', aciklama: 'Ürün kartının durumunu belirleyin', icerik: <OrtakDurumAlani aktif={aktif} onChange={setAktif} /> },
    ]} />;
  else if (gorunum === 'duzenle' && secili) icerik = <TanimDuzenleEkrani ustEtiket="Ürün Düzenle"
    baslik={secili.urunAdi} onGeri={listeyeDon} onKaydet={duzenlemeVar ? () => void kaydet() : undefined} saltOkunur={!duzenlemeVar}>
    <TanimFormBolum baslik="Ürün Bilgileri">{alanlar}</TanimFormBolum>
    <OrtakDurumAlani aktif={aktif} onChange={setAktif} />
  </TanimDuzenleEkrani>;
  else icerik = <TanimListeEkrani onYeniEkle={eklemeVar ? yeni : undefined} yeniEkleMetin="Yeni Ürün">
    <TanimKayitTablosu baslik="Ürünler" kayitlar={kayitlar} aramaMetni={(u) => `${u.urunKodu} ${u.urunAdi} ${u.marka}`}
      pasifMi={(u) => !u.aktif} onSatirTikla={duzenle} onDuzenle={duzenlemeVar ? duzenle : undefined}
      onSil={silmeVar ? (u) => { setSecili(u); setSilAcik(true); } : undefined}
      kolonlar={[
        { id: 'kod', baslik: 'Kod', hucre: (u) => <span className="ap-tanimlar-tablo-kod">{u.urunKodu}</span> },
        { id: 'ad', baslik: 'Ürün Adı', hucre: (u) => u.urunAdi }, { id: 'tip', baslik: 'Tip', hucre: (u) => u.urunTipi },
        { id: 'marka', baslik: 'Marka', hucre: (u) => u.marka || '—' }, { id: 'birim', baslik: 'Ana Birim', hucre: (u) => u.anaBirim || '—' },
        { id: 'durum', baslik: 'Durum', hucre: (u) => <TanimDurumRozeti aktif={u.aktif} /> },
        { id: 'guncelleme', baslik: 'Güncelleme', hucre: (u) => tarihSaatFormatla(u.guncelleme) },
      ]} />
  </TanimListeEkrani>;

  return <AdminModulKabuk baslik="Ürünler" aciklama="Ürün ve hizmet kartları">
    {icerik}<SilmeOnayModal acik={silAcik} onKapat={() => setSilAcik(false)} onOnayla={() => void silOnayla()}
      baslik="Bu ürünü silmek istiyor musunuz?" hedefMetin={secili ? `${secili.urunAdi} (${secili.urunKodu})` : ''} ariaLabel="Ürün silme onayı" />
  </AdminModulKabuk>;
}
