import type { Dispatch, SetStateAction } from 'react';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formInputSinifi } from '@/formlar/FormAlani';
import { isletmeTuruKimlikModu } from '../cariIsletmeTurleri';
import {
  bosCariAltKart,
  type CariAltKart,
  type CariKartForm,
  type CariKartSekmeId,
} from '../tipler';

type SetForm = Dispatch<SetStateAction<CariKartForm>>;

function Onay({
  etiket,
  checked,
  onChange,
  disabled,
}: {
  etiket: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="cari-onay">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{etiket}</span>
    </label>
  );
}

function MetinAlan({
  etiket,
  deger,
  onChange,
  satir = 3,
  disabled,
}: {
  etiket: string;
  deger: string;
  onChange: (v: string) => void;
  satir?: number;
  disabled?: boolean;
}) {
  return (
    <label className="ap-tanim-girdi block cari-metin-alan">
      <span className="ap-tanim-girdi-etiket">{etiket}</span>
      <textarea
        className={formInputSinifi}
        rows={satir}
        value={deger}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AnalizSatir({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="cari-analiz-satir">
      <span>{etiket}</span>
      <strong>{deger || '—'}</strong>
    </div>
  );
}

function KimlikAlanlari({
  form,
  set,
}: {
  form: CariKartForm;
  set: <K extends keyof CariKartForm>(alan: K, deger: CariKartForm[K]) => void;
}) {
  const mod = isletmeTuruKimlikModu(form.isletmeTuru);

  if (mod === 'gercek') {
    return (
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi etiket="Ad" deger={form.yetkiliAdi} onChange={(yetkiliAdi) => set('yetkiliAdi', yetkiliAdi)} />
        <TanimGirdi
          etiket="Soyad"
          deger={form.yetkiliSoyadi}
          onChange={(yetkiliSoyadi) => set('yetkiliSoyadi', yetkiliSoyadi)}
        />
        <TanimGirdi
          etiket="TC Kimlik No"
          deger={form.tcKimlikNo}
          kural="vergiNo"
          maxLength={11}
          onChange={(tcKimlikNo) => set('tcKimlikNo', tcKimlikNo)}
        />
        <TanimGirdi etiket="Sicil No" deger={form.sicilNo} onChange={(sicilNo) => set('sicilNo', sicilNo)} />
      </div>
    );
  }

  if (mod === 'yabanci') {
    return (
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi etiket="Ad" deger={form.yetkiliAdi} onChange={(yetkiliAdi) => set('yetkiliAdi', yetkiliAdi)} />
        <TanimGirdi
          etiket="Soyad"
          deger={form.yetkiliSoyadi}
          onChange={(yetkiliSoyadi) => set('yetkiliSoyadi', yetkiliSoyadi)}
        />
        <TanimGirdi
          etiket="Pasaport No"
          deger={form.pasaportNo}
          onChange={(pasaportNo) => set('pasaportNo', pasaportNo)}
        />
        <TanimGirdi etiket="Sicil No" deger={form.sicilNo} onChange={(sicilNo) => set('sicilNo', sicilNo)} />
      </div>
    );
  }

  return (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <TanimGirdi etiket="Şirket Ünvanı" deger={form.unvan} onChange={(unvan) => set('unvan', unvan)} />
      <TanimGirdi etiket="Sicil No" deger={form.sicilNo} onChange={(sicilNo) => set('sicilNo', sicilNo)} />
      <TanimGirdi
        etiket="Vergi Dairesi"
        deger={form.vergiDairesi}
        onChange={(vergiDairesi) => set('vergiDairesi', vergiDairesi)}
      />
      <TanimGirdi
        etiket="Vergi Numarası"
        deger={form.vergiNo}
        kural="vergiNo"
        onChange={(vergiNo) => set('vergiNo', vergiNo)}
      />
    </div>
  );
}

export function CariKartSekmeIcerik({
  sekme,
  form,
  setForm,
  saltOkunur,
  onAltKartDuzenle,
}: {
  sekme: CariKartSekmeId;
  form: CariKartForm;
  setForm: SetForm;
  saltOkunur: boolean;
  onAltKartDuzenle: (kart: CariAltKart | null) => void;
}) {
  const set = <K extends keyof CariKartForm>(alan: K, deger: CariKartForm[K]) => {
    if (saltOkunur) return;
    setForm((f) => ({ ...f, [alan]: deger }));
  };

  if (sekme === 'kart-bilgileri') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="İletişim Bilgileri">
          <KimlikAlanlari form={form} set={set} />
          <MetinAlan
            etiket="Posta Adresi"
            deger={form.postaAdresi}
            onChange={(postaAdresi) => set('postaAdresi', postaAdresi)}
            disabled={saltOkunur}
          />
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="İlçe/Semt" deger={form.ilce} onChange={(ilce) => set('ilce', ilce)} />
            <TanimGirdi etiket="Şehir" deger={form.sehir} onChange={(sehir) => set('sehir', sehir)} />
            <TanimGirdi etiket="1. Tel" deger={form.tel1} onChange={(tel1) => set('tel1', tel1)} />
            <TanimGirdi etiket="GSM" deger={form.gsm} onChange={(gsm) => set('gsm', gsm)} />
            <TanimGirdi etiket="2. Tel" deger={form.tel2} onChange={(tel2) => set('tel2', tel2)} />
            <TanimGirdi etiket="E-Mail" deger={form.eposta} onChange={(eposta) => set('eposta', eposta)} />
            <TanimGirdi etiket="Faks" deger={form.faks} onChange={(faks) => set('faks', faks)} />
            <TanimGirdi etiket="URL" deger={form.url} onChange={(url) => set('url', url)} />
          </div>
          <TanimGirdi etiket="GLN Kodu" deger={form.glnKodu} onChange={(glnKodu) => set('glnKodu', glnKodu)} />
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'finansman') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="Finansal Bilgiler">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <div className="cari-alan-yaninda-onay cari-alan-yaninda-onay--coklu">
              <TanimGirdi
                etiket="Bakiye Limiti (Kredi Lim.)"
                deger={form.bakiyeLimiti}
                onChange={(bakiyeLimiti) => set('bakiyeLimiti', bakiyeLimiti)}
              />
              <div className="cari-onay-grup">
                <Onay etiket="Uyar" checked={form.uyar} onChange={(uyar) => set('uyar', uyar)} disabled={saltOkunur} />
                <Onay
                  etiket="İzin Verme"
                  checked={form.izinVerme}
                  onChange={(izinVerme) => set('izinVerme', izinVerme)}
                  disabled={saltOkunur}
                />
              </div>
            </div>
            <TanimGirdi
              etiket="Çek, Senet, Taksit Lim. (Risk Lim.)"
              deger={form.cekSenetTaksitLim}
              onChange={(cekSenetTaksitLim) => set('cekSenetTaksitLim', cekSenetTaksitLim)}
            />
            <TanimGirdi etiket="Hedef Ciro" deger={form.hedefCiro} onChange={(hedefCiro) => set('hedefCiro', hedefCiro)} />
            <TanimGirdi etiket="Opsiyon" deger={form.opsiyon} inputMode="numeric" onChange={(opsiyon) => set('opsiyon', opsiyon)} />
            <TanimGirdi etiket="İskonto" deger={form.iskonto} inputMode="decimal" onChange={(iskonto) => set('iskonto', iskonto)} />
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Para Birimi</span>
              <FormAcilirSecim
                value={form.paraBirimi}
                onChange={(paraBirimi) => set('paraBirimi', paraBirimi)}
                secenekler={[
                  { value: 'TL', label: 'TL' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
                disabled={saltOkunur}
              />
            </label>
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Kur</span>
              <FormAcilirSecim
                value={form.kur}
                onChange={(kur) => set('kur', kur)}
                secenekler={[
                  { value: 'SATIS', label: 'Satış' },
                  { value: 'ALIS', label: 'Alış' },
                  { value: 'EFEKTIF', label: 'Efektif' },
                ]}
                disabled={saltOkunur}
              />
            </label>
            <TanimGirdi etiket="Sermaye" deger={form.sermaye} onChange={(sermaye) => set('sermaye', sermaye)} />
            <TanimGirdi
              etiket="Gecikme Faizi"
              deger={form.gecikmeFaizi}
              inputMode="decimal"
              onChange={(gecikmeFaizi) => set('gecikmeFaizi', gecikmeFaizi)}
            />
            <TanimGirdi
              etiket="Aylık Vade"
              deger={form.aylikVade}
              inputMode="numeric"
              onChange={(aylikVade) => set('aylikVade', aylikVade)}
            />
            <TanimGirdi etiket="Prim" deger={form.prim} inputMode="decimal" onChange={(prim) => set('prim', prim)} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="Durum">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Durum</span>
              <FormAcilirSecim
                value={form.durum}
                onChange={(durum) => {
                  set('durum', durum);
                  set('aktif', durum === 'AKTIF');
                }}
                secenekler={[
                  { value: 'AKTIF', label: 'Aktif' },
                  { value: 'PASIF', label: 'Pasif' },
                ]}
                disabled={saltOkunur}
              />
            </label>
            <TanimGirdi etiket="Pozisyon" deger={form.pozisyon} onChange={(pozisyon) => set('pozisyon', pozisyon)} />
          </div>
          <div className="cari-onay-grid">
            <Onay
              etiket="Satış Yapılmasın"
              checked={form.satisYapilmasin}
              onChange={(v) => set('satisYapilmasin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="Alış Yapılmasın"
              checked={form.alisYapilmasin}
              onChange={(v) => set('alisYapilmasin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="İade Faturası Kesilmesin"
              checked={form.iadeFaturasiKesilmesin}
              onChange={(v) => set('iadeFaturasiKesilmesin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="Sipariş Yapılmasın"
              checked={form.siparisYapilmasin}
              onChange={(v) => set('siparisYapilmasin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="Tahsilat Yapılmasın"
              checked={form.tahsilatYapilmasin}
              onChange={(v) => set('tahsilatYapilmasin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="Ödeme Yapılmasın"
              checked={form.odemeYapilmasin}
              onChange={(v) => set('odemeYapilmasin', v)}
              disabled={saltOkunur}
            />
            <Onay
              etiket="KDV Muafiyeti"
              checked={form.kdvMuafiyeti}
              onChange={(v) => set('kdvMuafiyeti', v)}
              disabled={saltOkunur}
            />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="Faaliyet Alanı">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Sektör" deger={form.sektor} onChange={(sektor) => set('sektor', sektor)} />
            <TanimGirdi etiket="Marka" deger={form.marka} onChange={(marka) => set('marka', marka)} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="Fiyat Ayarı">
          <TanimGirdi
            etiket="Satış Fiyatı"
            deger={form.satisFiyati}
            placeholder="Seçilmemiş"
            onChange={(satisFiyati) => set('satisFiyati', satisFiyati)}
          />
        </TanimFormBolum>

        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <TanimFormBolum baslik="Depo">
            <TanimGirdi etiket="Depo" deger={form.depo} onChange={(depo) => set('depo', depo)} />
          </TanimFormBolum>
          <TanimFormBolum baslik="Şube">
            <TanimGirdi etiket="Şube Adı" deger={form.subeAdi} onChange={(subeAdi) => set('subeAdi', subeAdi)} />
          </TanimFormBolum>
        </div>
      </div>
    );
  }

  if (sekme === 'ek-bilgiler') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="Özel Kodlar">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Tür" deger={form.ozelTur} onChange={(ozelTur) => set('ozelTur', ozelTur)} />
            <TanimGirdi etiket="Sınıf" deger={form.ozelSinif} onChange={(ozelSinif) => set('ozelSinif', ozelSinif)} />
            <TanimGirdi etiket="Grup" deger={form.ozelGrup} onChange={(ozelGrup) => set('ozelGrup', ozelGrup)} />
            <TanimGirdi etiket="4-ÖK (P)" deger={form.ozelKod4} onChange={(ozelKod4) => set('ozelKod4', ozelKod4)} />
            <TanimGirdi etiket="5-ÖK (P)" deger={form.ozelKod5} onChange={(ozelKod5) => set('ozelKod5', ozelKod5)} />
            <TanimGirdi etiket="6-ÖK" deger={form.ozelKod6} onChange={(ozelKod6) => set('ozelKod6', ozelKod6)} />
            <TanimGirdi etiket="7-ÖK" deger={form.ozelKod7} onChange={(ozelKod7) => set('ozelKod7', ozelKod7)} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="İstihbarat">
          <MetinAlan
            etiket="İstihbarat Notları"
            deger={form.istihbarat}
            satir={5}
            onChange={(istihbarat) => set('istihbarat', istihbarat)}
            disabled={saltOkunur}
          />
        </TanimFormBolum>

        <TanimFormBolum baslik="Personel Tanımı">
          <TanimGirdi
            etiket="Müşteri Temsilcisi"
            deger={form.musteriTemsilcisi}
            onChange={(musteriTemsilcisi) => set('musteriTemsilcisi', musteriTemsilcisi)}
          />
        </TanimFormBolum>

        <TanimFormBolum baslik="Ek Bilgiler">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Doğum Yeri" deger={form.dogumYeri} onChange={(dogumYeri) => set('dogumYeri', dogumYeri)} />
            <TanimGirdi
              etiket="Doğum Tarihi"
              deger={form.dogumTarihi}
              onChange={(dogumTarihi) => set('dogumTarihi', dogumTarihi)}
            />
            <TanimGirdi etiket="Ana Adı" deger={form.anaAdi} onChange={(anaAdi) => set('anaAdi', anaAdi)} />
            <TanimGirdi etiket="Baba Adı" deger={form.babaAdi} onChange={(babaAdi) => set('babaAdi', babaAdi)} />
            <TanimGirdi
              etiket="Sosyal Güvenlik No"
              deger={form.sosyalGuvenlikNo}
              onChange={(sosyalGuvenlikNo) => set('sosyalGuvenlikNo', sosyalGuvenlikNo)}
            />
            <div className="cari-onay-wrap">
              <Onay
                etiket="Müstahsil Bağkur Oranı Çalışmasın"
                checked={form.mustahsilBagkurOraniCalismasin}
                onChange={(v) => set('mustahsilBagkurOraniCalismasin', v)}
                disabled={saltOkunur}
              />
            </div>
            <div className="cari-tarih-aralik">
              <TanimGirdi
                etiket="Bağkur İstisna Başlangıç"
                deger={form.bagkurIstisnaBaslangic}
                onChange={(bagkurIstisnaBaslangic) => set('bagkurIstisnaBaslangic', bagkurIstisnaBaslangic)}
              />
              <TanimGirdi
                etiket="Bağkur İstisna Bitiş"
                deger={form.bagkurIstisnaBitis}
                onChange={(bagkurIstisnaBitis) => set('bagkurIstisnaBitis', bagkurIstisnaBitis)}
              />
            </div>
            <TanimGirdi etiket="NACE Kodu" deger={form.naceKodu} onChange={(naceKodu) => set('naceKodu', naceKodu)} />
          </div>
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'banka-kk') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="Banka Bilgileri">
          <div className="cari-tekrar-liste">
            {form.bankalar.map((satir, idx) => (
              <div key={satir.id} className="cari-tekrar-satir">
                <span className="cari-tekrar-no">{idx + 1}</span>
                {!saltOkunur ? (
                  <button
                    type="button"
                    className="cari-tekrar-sil"
                    aria-label={`Banka satırı ${idx + 1} sil`}
                    title="Satırı sil"
                    onClick={() =>
                      set(
                        'bankalar',
                        form.bankalar.filter((s) => s.id !== satir.id)
                      )
                    }
                  >
                    ×
                  </button>
                ) : null}
                <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                  <TanimGirdi
                    etiket="Banka Adı"
                    deger={satir.bankaAdi}
                    onChange={(bankaAdi) =>
                      set(
                        'bankalar',
                        form.bankalar.map((s) => (s.id === satir.id ? { ...s, bankaAdi } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="Banka Şubesi"
                    deger={satir.bankaSubesi}
                    onChange={(bankaSubesi) =>
                      set(
                        'bankalar',
                        form.bankalar.map((s) => (s.id === satir.id ? { ...s, bankaSubesi } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="Banka Hesap No"
                    deger={satir.hesapNo}
                    onChange={(hesapNo) =>
                      set(
                        'bankalar',
                        form.bankalar.map((s) => (s.id === satir.id ? { ...s, hesapNo } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="IBAN No"
                    deger={satir.iban}
                    onChange={(iban) =>
                      set(
                        'bankalar',
                        form.bankalar.map((s) => (s.id === satir.id ? { ...s, iban } : s))
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          {!saltOkunur ? (
            <button
              type="button"
              className="cari-satir-ekle"
              onClick={() =>
                set('bankalar', [
                  ...form.bankalar,
                  {
                    id: `b-${Date.now()}`,
                    bankaAdi: '',
                    bankaSubesi: '',
                    hesapNo: '',
                    iban: '',
                  },
                ])
              }
            >
              + Banka satırı ekle
            </button>
          ) : null}
        </TanimFormBolum>

        <TanimFormBolum baslik="Kart Bilgileri">
          <div className="cari-tekrar-liste">
            {form.krediKartlari.map((satir, idx) => (
              <div key={satir.id} className="cari-tekrar-satir">
                <span className="cari-tekrar-no">{idx + 1}</span>
                <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                  <TanimGirdi
                    etiket="Banka Adı"
                    deger={satir.bankaAdi}
                    onChange={(bankaAdi) =>
                      set(
                        'krediKartlari',
                        form.krediKartlari.map((s) => (s.id === satir.id ? { ...s, bankaAdi } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="Kart Tipi"
                    deger={satir.kartTipi}
                    onChange={(kartTipi) =>
                      set(
                        'krediKartlari',
                        form.krediKartlari.map((s) => (s.id === satir.id ? { ...s, kartTipi } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="Kart No"
                    deger={satir.kartNo}
                    onChange={(kartNo) =>
                      set(
                        'krediKartlari',
                        form.krediKartlari.map((s) => (s.id === satir.id ? { ...s, kartNo } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="CCV"
                    deger={satir.ccv}
                    maxLength={4}
                    onChange={(ccv) =>
                      set(
                        'krediKartlari',
                        form.krediKartlari.map((s) => (s.id === satir.id ? { ...s, ccv } : s))
                      )
                    }
                  />
                  <TanimGirdi
                    etiket="Son Kullanma Tarihi"
                    deger={satir.sonKullanma}
                    placeholder="AA / YY"
                    onChange={(sonKullanma) =>
                      set(
                        'krediKartlari',
                        form.krediKartlari.map((s) => (s.id === satir.id ? { ...s, sonKullanma } : s))
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          {!saltOkunur ? (
            <button
              type="button"
              className="cari-satir-ekle"
              onClick={() =>
                set('krediKartlari', [
                  ...form.krediKartlari,
                  {
                    id: `k-${Date.now()}`,
                    bankaAdi: '',
                    kartTipi: '',
                    kartNo: '',
                    ccv: '',
                    sonKullanma: '',
                  },
                ])
              }
            >
              + Kart satırı ekle
            </button>
          ) : null}
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'e-donusum') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="E-Fatura Bilgileri">
          <Onay
            etiket="E-Fatura Kullanıcısı"
            checked={form.efaturaKullanicisi}
            onChange={(v) => set('efaturaKullanicisi', v)}
            disabled={saltOkunur}
          />
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2" style={{ marginTop: '0.75rem' }}>
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Senaryo</span>
              <FormAcilirSecim
                value={form.efaturaSenaryo}
                onChange={(efaturaSenaryo) => set('efaturaSenaryo', efaturaSenaryo)}
                secenekler={[
                  { value: '', label: 'Seçilmedi' },
                  { value: 'TICARI FATURA', label: 'Ticari Fatura' },
                  { value: 'E-ARSIV', label: 'E-Arşiv' },
                  { value: 'TEMEL', label: 'Temel' },
                ]}
                disabled={saltOkunur}
              />
            </label>
            <TanimGirdi
              etiket="Alias"
              deger={form.efaturaAlias}
              onChange={(efaturaAlias) => set('efaturaAlias', efaturaAlias)}
            />
          </div>
          <button type="button" className="cari-ikincil-tus" disabled>
            Sistemden Kontrol Et
          </button>
        </TanimFormBolum>

        <TanimFormBolum baslik="E-Arşiv Bilgileri">
          <label className="ap-tanimlar-secim-alan block">
            <span className="ap-tanim-girdi-etiket">Fatura Teslim Tipi</span>
            <FormAcilirSecim
              value={form.faturaTeslimTipi}
              onChange={(faturaTeslimTipi) => set('faturaTeslimTipi', faturaTeslimTipi)}
              secenekler={[
                { value: '', label: 'Seçilmedi' },
                { value: 'ELEKTRONIK', label: 'Elektronik' },
                { value: 'KAGIT', label: 'Kağıt' },
              ]}
              disabled={saltOkunur}
            />
          </label>
        </TanimFormBolum>

        <TanimFormBolum baslik="Diğer">
          <Onay
            etiket="E-Ticaret"
            checked={form.eTicaret}
            onChange={(v) => set('eTicaret', v)}
            disabled={saltOkunur}
          />
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'muhasebe') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="Muhasebe Kodları">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Borç KV" deger={form.borcKv} onChange={(borcKv) => set('borcKv', borcKv)} />
            <TanimGirdi etiket="Borç UV" deger={form.borcUv} onChange={(borcUv) => set('borcUv', borcUv)} />
            <TanimGirdi etiket="Alacak KV" deger={form.alacakKv} onChange={(alacakKv) => set('alacakKv', alacakKv)} />
            <TanimGirdi etiket="Alacak UV" deger={form.alacakUv} onChange={(alacakUv) => set('alacakUv', alacakUv)} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="Gider Çeşit Kodları">
          {form.giderCesitleri.length === 0 ? (
            <p className="cari-bos-metin">Henüz gider çeşit kodu eklenmedi.</p>
          ) : (
            <div className="cari-tekrar-liste">
              {form.giderCesitleri.map((satir, idx) => (
                <div key={satir.id} className="cari-tekrar-satir">
                  <span className="cari-tekrar-no">{idx + 1}</span>
                  <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                    <TanimGirdi
                      etiket="Çeşit Kodu"
                      deger={satir.cesitKodu}
                      onChange={(cesitKodu) =>
                        set(
                          'giderCesitleri',
                          form.giderCesitleri.map((s) => (s.id === satir.id ? { ...s, cesitKodu } : s))
                        )
                      }
                    />
                    <TanimGirdi
                      etiket="Açıklama"
                      deger={satir.aciklama}
                      onChange={(aciklama) =>
                        set(
                          'giderCesitleri',
                          form.giderCesitleri.map((s) => (s.id === satir.id ? { ...s, aciklama } : s))
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!saltOkunur ? (
            <div className="cari-aksiyon-satir">
              <button
                type="button"
                className="cari-satir-ekle"
                onClick={() =>
                  set('giderCesitleri', [
                    ...form.giderCesitleri,
                    { id: `g-${Date.now()}`, cesitKodu: '', aciklama: '' },
                  ])
                }
              >
                Ekle…
              </button>
            </div>
          ) : null}
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'resim') {
    return (
      <div className="cari-sekme-icerik">
        <TanimFormBolum baslik="Resim">
          <label
            className={`cari-resim-alan${saltOkunur ? ' cari-resim-alan--salt' : ' cari-resim-alan--tiklanabilir'}`}
          >
            {form.resimVerisi ? (
              <img src={form.resimVerisi} alt={form.resimAdi || 'Cari resmi'} className="cari-resim-onizleme" />
            ) : (
              <p className="cari-bos-metin">
                {saltOkunur ? 'Resim yüklenmemiş.' : 'Resim yüklemek için bu alana tıklayın…'}
              </p>
            )}
            {!saltOkunur ? (
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const dosya = e.target.files?.[0];
                  if (!dosya) return;
                  const okuyucu = new FileReader();
                  okuyucu.onload = () => {
                    setForm((f) => ({
                      ...f,
                      resimVerisi: String(okuyucu.result ?? ''),
                      resimAdi: dosya.name,
                    }));
                  };
                  okuyucu.readAsDataURL(dosya);
                  e.target.value = '';
                }}
              />
            ) : null}
          </label>
        </TanimFormBolum>
      </div>
    );
  }

  if (sekme === 'analiz') {
    const riskToplam = [form.bakiyeLimiti, form.cekSenetTaksitLim]
      .map((v) => Number(String(v).replace(',', '.')) || 0)
      .reduce((a, b) => a + b, 0);

    return (
      <div className="cari-sekme-icerik cari-analiz">
        <TanimFormBolum baslik="Bakiye Durumu">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Toplam Borç" deger="—" />
            <AnalizSatir etiket="Toplam Alacak" deger="—" />
            <AnalizSatir etiket="Bakiye" deger={form.bakiyeLimiti || '—'} />
          </div>
        </TanimFormBolum>
        <TanimFormBolum baslik="Risk Analizi">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Çek Riski" deger="—" />
            <AnalizSatir etiket="Senet Riski" deger="—" />
            <AnalizSatir etiket="Taksit Riski" deger="—" />
            <AnalizSatir etiket="Açık Hesap Riski (Bakiye)" deger={form.bakiyeLimiti || '—'} />
            <AnalizSatir
              etiket="Toplam Risk"
              deger={riskToplam > 0 ? String(riskToplam) : form.cekSenetTaksitLim || '—'}
            />
          </div>
        </TanimFormBolum>
        <TanimFormBolum baslik="Kredi & Risk Durumu">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Bakiye Durumu (Kredi Durumu)" deger={form.durum === 'AKTIF' ? 'Aktif' : 'Pasif'} />
            <AnalizSatir etiket="Risk Durumu" deger={form.izinVerme ? 'İzin verilmiyor' : form.uyar ? 'Uyarı' : 'Normal'} />
          </div>
        </TanimFormBolum>
        <TanimFormBolum baslik="Alınan & Verilen Çekler">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Alınan Çek Top." deger="—" />
            <AnalizSatir etiket="Verilen Çek Top." deger="—" />
          </div>
        </TanimFormBolum>
        <TanimFormBolum baslik="Alış & Satış Faturaları">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Alış Fat. Top." deger="—" />
            <AnalizSatir etiket="Satış Fat. Top." deger="—" />
          </div>
        </TanimFormBolum>
        <TanimFormBolum baslik="Para Puan Bilgileri">
          <div className="cari-analiz-grid">
            <AnalizSatir etiket="Toplam Puan" deger="—" />
            <AnalizSatir etiket="Harcanan Puan" deger="—" />
            <AnalizSatir etiket="Kullanılabilir" deger="—" />
          </div>
        </TanimFormBolum>
      </div>
    );
  }

  // alt-kartlar
  return (
    <div className="cari-sekme-icerik">
      <TanimFormBolum baslik="Alt Kartlar">
        {form.altKartlar.length === 0 ? (
          <p className="cari-bos-metin">Henüz alt kart eklenmedi.</p>
        ) : (
          <div className="cari-alt-tablo-sarici">
            <table className="cari-alt-tablo">
              <thead>
                <tr>
                  <th>Firma Kodu</th>
                  <th>Firma Adı</th>
                  <th>Adı</th>
                  <th>Soyadı</th>
                  <th>Görevi</th>
                  <th>Tel No 1</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {form.altKartlar.map((k) => (
                  <tr key={k.id}>
                    <td>{k.firmaKodu || '—'}</td>
                    <td>{k.firmaAdi || '—'}</td>
                    <td>{k.adi || '—'}</td>
                    <td>{k.soyadi || '—'}</td>
                    <td>{k.gorevi || '—'}</td>
                    <td>{k.telefon1 || '—'}</td>
                    <td>
                      {!saltOkunur ? (
                        <div className="cari-aksiyon-satir">
                          <button type="button" className="cari-satir-ekle" onClick={() => onAltKartDuzenle(k)}>
                            Düzenle
                          </button>
                          <button
                            type="button"
                            className="cari-satir-sil"
                            onClick={() =>
                              set(
                                'altKartlar',
                                form.altKartlar.filter((x) => x.id !== k.id)
                              )
                            }
                          >
                            Sil
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <fieldset className="cari-radyo-grup">
          <legend>Firma Kodu ve Firma Adı aşağıdaki bilgilerden gelsin</legend>
          <label className="cari-radyo">
            <input
              type="radio"
              name="altKartKaynak"
              checked={form.altKartKaynak === 'is'}
              disabled={saltOkunur}
              onChange={() => set('altKartKaynak', 'is')}
            />
            İş Bilgilerinden
          </label>
          <label className="cari-radyo">
            <input
              type="radio"
              name="altKartKaynak"
              checked={form.altKartKaynak === 'kisisel'}
              disabled={saltOkunur}
              onChange={() => set('altKartKaynak', 'kisisel')}
            />
            Kişisel Bilgilerden
          </label>
        </fieldset>

        {!saltOkunur ? (
          <div className="cari-aksiyon-satir">
            <button
              type="button"
              className="cari-satir-ekle"
              onClick={() => {
                const yeni = {
                  ...bosCariAltKart(),
                  id: `a-${Date.now()}`,
                  firmaKodu:
                    form.altKartKaynak === 'is'
                      ? `${form.firmaKodu}-${String(form.altKartlar.length + 1).padStart(3, '0')}`
                      : '',
                  firmaAdi: form.altKartKaynak === 'is' ? form.firmaAdi : '',
                };
                onAltKartDuzenle(yeni);
              }}
            >
              Yeni Alt Kart
            </button>
          </div>
        ) : null}
      </TanimFormBolum>
    </div>
  );
}
