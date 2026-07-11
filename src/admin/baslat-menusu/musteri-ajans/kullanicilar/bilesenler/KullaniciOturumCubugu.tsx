import type { KullaniciFormDegeri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import {
  firmaDegistir,
  firmaDonemleri,
  firmaSubeleri,
  subeDegistir,
  subeDepolari,
  subeKasalari,
  type KullaniciOturumSecenekleri,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/kullaniciOturumYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

interface KullaniciOturumCubuguProps {
  form: KullaniciFormDegeri;
  oturumSecenekleri: KullaniciOturumSecenekleri;
  onChange: (form: KullaniciFormDegeri) => void;
  /** form-ici: Yeni/Eski kullanıcı kartının içinde ikinci satır */
  variant?: 'yeni' | 'eski' | 'form-ici-yeni' | 'form-ici-eski';
}

export function KullaniciOturumCubugu({
  form,
  oturumSecenekleri,
  onChange,
  variant = 'yeni',
}: KullaniciOturumCubuguProps) {
  const { firmalar, donemler, subeler, depolar, kasalar } = oturumSecenekleri;
  const donemListe = firmaDonemleri(donemler, form.firmaId);
  const subeListe = firmaSubeleri(subeler, form.firmaId);
  const depoListe = subeDepolari(depolar, form.subeId);
  const kasaListe = subeKasalari(kasalar, form.subeId);

  const formIci = variant === 'form-ici-yeni' || variant === 'form-ici-eski';
  const eski = variant === 'eski' || variant === 'form-ici-eski';

  const satirSinifi = formIci
    ? eski
      ? 'ap-kullanici-editor-form-satir ap-kullanici-editor-form-satir--oturum'
      : 'ap-kullanici-yeni-form-satir ap-kullanici-yeni-form-satir--oturum'
    : 'ap-kullanici-oturum-satir';

  const alanSinifi = formIci
    ? eski
      ? 'ap-kullanici-editor-alan'
      : 'ap-kullanici-yeni-alan'
    : eski
      ? 'ap-kullanici-oturum-alan ap-kullanici-oturum-alan--eski'
      : 'ap-kullanici-oturum-alan';

  const etiketSinifi = formIci
    ? eski
      ? 'ap-kullanici-editor-etiket'
      : 'ap-kullanici-yeni-etiket'
    : 'ap-kullanici-oturum-etiket';

  const inputSinifi = formIci || !eski ? 'ap-kullanici-yeni-input' : 'ap-kullanici-oturum-pin-input';

  const alanlar = (
    <>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Firma</span>
        <FormAcilirSecim
          aria-label="Firma"
          value={form.firmaId}
          onChange={(firmaId) => onChange(firmaDegistir(form, firmaId, oturumSecenekleri))}
          secenekler={firmalar.map((f) => ({ value: f.id, label: `${f.firmaKodu} — ${f.firmaAdi}` }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Dönem</span>
        <FormAcilirSecim
          aria-label="Dönem"
          value={form.donemId}
          onChange={(donemId) => onChange({ ...form, donemId })}
          secenekler={donemListe.map((d) => ({ value: d.id, label: `${d.donemKodu} — ${d.donemAdi}` }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Şube</span>
        <FormAcilirSecim
          aria-label="Şube"
          value={form.subeId}
          onChange={(subeId) => onChange(subeDegistir(form, subeId, oturumSecenekleri))}
          secenekler={subeListe.map((s) => ({ value: s.id, label: `${s.subeKodu} — ${s.subeAdi}` }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Depo</span>
        <FormAcilirSecim
          aria-label="Depo"
          value={form.depoId}
          onChange={(depoId) => onChange({ ...form, depoId })}
          secenekler={depoListe.map((d) => ({ value: d.id, label: `${d.depoKodu} — ${d.depoAdi}` }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Kasa</span>
        <FormAcilirSecim
          aria-label="Kasa"
          value={form.kasaId}
          onChange={(kasaId) => onChange({ ...form, kasaId })}
          secenekler={kasaListe.map((k) => ({ value: k.id, label: `${k.kasaKodu} — ${k.kasaAdi}` }))}
        />
      </label>
      <label
        className={`${alanSinifi} ${
          formIci
            ? eski
              ? 'ap-kullanici-editor-alan--pin'
              : 'ap-kullanici-yeni-alan--pin'
            : 'ap-kullanici-oturum-alan--pin'
        }`}
      >
        <span className={etiketSinifi}>PIN</span>
        <input
          className={inputSinifi}
          placeholder="—"
          value={form.pin}
          onChange={(e) => onChange({ ...form, pin: e.target.value })}
          maxLength={20}
          autoComplete="off"
        />
      </label>
    </>
  );

  if (formIci) {
    return (
      <div className={satirSinifi} role="group" aria-label="Oturum bağlamı">
        {alanlar}
      </div>
    );
  }

  return (
    <div className="ap-kullanici-oturum-cubuk" role="group" aria-label="Oturum bağlamı">
      <span className="ap-kullanici-oturum-cubuk-baslik">Oturum</span>
      <div className={satirSinifi}>{alanlar}</div>
    </div>
  );
}
