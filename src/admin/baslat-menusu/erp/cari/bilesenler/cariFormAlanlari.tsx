import type { Dispatch, SetStateAction } from 'react';
import { CariAdresFormu } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariAdresFormu';
import {
  CARI_TIPLERI,
  EFATURA_TIPLERI,
  ISLETME_TURLERI,
  type CariFormDegeri,
  type CariTipi,
} from '@/admin/baslat-menusu/erp/cari/tipler';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

export function CariTemelAlanlar({
  form,
  setForm,
}: {
  form: CariFormDegeri;
  setForm: Dispatch<SetStateAction<CariFormDegeri>>;
}) {
  return (
    <>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Cari Tipi *</span>
          <FormAcilirSecim
            value={form.cariTipi}
            onChange={(cariTipi) => setForm((f) => ({ ...f, cariTipi: cariTipi as CariTipi }))}
            secenekler={CARI_TIPLERI.map((t) => ({ value: t.value, label: t.label }))}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">İşletme Türü</span>
          <FormAcilirSecim
            value={form.isletmeTuru}
            onChange={(isletmeTuru) =>
              setForm((f) => ({ ...f, isletmeTuru: isletmeTuru as CariFormDegeri['isletmeTuru'] }))
            }
            secenekler={[
              { value: '', label: 'Seçilmedi' },
              ...ISLETME_TURLERI.map((t) => ({ value: t.value, label: t.label })),
            ]}
          />
        </label>
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Cari Kodu"
          deger={form.cariKodu}
          kural="serbestMetin"
          maxLength={30}
          zorunlu
          onChange={(cariKodu) => setForm((f) => ({ ...f, cariKodu }))}
          placeholder="Örn. S.07.0001"
        />
        <TanimGirdi
          etiket="Cari Adı"
          deger={form.cariAdi}
          kural="serbestMetin"
          maxLength={255}
          zorunlu
          onChange={(cariAdi) => setForm((f) => ({ ...f, cariAdi }))}
        />
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Ünvan"
          deger={form.unvan}
          kural="serbestMetin"
          maxLength={255}
          onChange={(unvan) => setForm((f) => ({ ...f, unvan }))}
        />
        <TanimGirdi
          etiket="Yetkili"
          deger={form.yetkili}
          kural="serbestMetin"
          maxLength={150}
          onChange={(yetkili) => setForm((f) => ({ ...f, yetkili }))}
        />
      </div>
    </>
  );
}

export function CariVergiIletisimAlanlari({
  form,
  setForm,
}: {
  form: CariFormDegeri;
  setForm: Dispatch<SetStateAction<CariFormDegeri>>;
}) {
  return (
    <>
      <TanimFormBolum baslik="Vergi Bilgileri">
        <VergiDairesiSecici
          deger={form.vergiDairesi}
          onChange={(vergiDairesi) => setForm((f) => ({ ...f, vergiDairesi }))}
        />
        <TanimGirdi
          etiket={form.isletmeTuru === 'GERCEK' ? 'T.C. Kimlik No' : 'Vergi No'}
          deger={form.vergiNo}
          kural="serbestMetin"
          maxLength={form.isletmeTuru === 'GERCEK' ? 11 : 10}
          onChange={(vergiNo) =>
            setForm((f) => ({
              ...f,
              vergiNo: vergiNo.replace(/\D/g, '').slice(0, f.isletmeTuru === 'GERCEK' ? 11 : 10),
            }))
          }
          placeholder={
            form.isletmeTuru === 'GERCEK' ? '11 haneli T.C. kimlik no' : '10 haneli vergi numarası'
          }
          inputMode="numeric"
        />
      </TanimFormBolum>
      <CariAdresFormu deger={form} onChange={(adres) => setForm((f) => ({ ...f, ...adres }))} />
      <TanimFormBolum baslik="İletişim">
        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <TanimGirdi
            etiket="Telefon"
            deger={form.telefon}
            kural="serbestMetin"
            maxLength={20}
            onChange={(telefon) => setForm((f) => ({ ...f, telefon }))}
          />
          <TanimGirdi
            etiket="E-posta"
            deger={form.eposta}
            kural="serbestMetin"
            maxLength={191}
            onChange={(eposta) => setForm((f) => ({ ...f, eposta }))}
          />
        </div>
        <TanimGirdi
          etiket="Web"
          deger={form.web}
          kural="serbestMetin"
          maxLength={255}
          onChange={(web) => setForm((f) => ({ ...f, web }))}
          placeholder="www.ornek.com"
        />
      </TanimFormBolum>
    </>
  );
}

export function CariEbelgeAlanlari({
  form,
  setForm,
}: {
  form: CariFormDegeri;
  setForm: Dispatch<SetStateAction<CariFormDegeri>>;
}) {
  return (
    <TanimFormBolum baslik="E-Belge">
      <div className="ap-tanimlar-aktif-satir">
        <span
          className={`ap-tanimlar-aktif-etiket ${form.efatura ? 'ap-tanimlar-aktif-etiket--aktif' : 'ap-tanimlar-aktif-etiket--pasif'}`}
        >
          {form.efatura ? 'E-Fatura Mükellefi' : 'E-Fatura Değil'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={form.efatura}
          aria-label="E-Fatura mükellefi"
          onClick={() => setForm((f) => ({ ...f, efatura: !f.efatura }))}
          className={`ap-tanimlar-toggle ${form.efatura ? 'ap-tanimlar-toggle--acik' : ''}`}
        >
          <span className="ap-tanimlar-toggle-dugme" aria-hidden />
        </button>
      </div>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">E-Fatura Tipi</span>
        <FormAcilirSecim
          value={form.efaturaTipi}
          onChange={(efaturaTipi) => setForm((f) => ({ ...f, efaturaTipi }))}
          secenekler={EFATURA_TIPLERI.map((t) => ({ value: t.value, label: t.label }))}
        />
      </label>
      <TanimGirdi
        etiket="E-Fatura Alias"
        deger={form.alias}
        kural="serbestMetin"
        maxLength={255}
        onChange={(alias) => setForm((f) => ({ ...f, alias }))}
        placeholder="urn:mail:..."
      />
    </TanimFormBolum>
  );
}
