import type {
  KullaniciFormDegeri,
  KullaniciOturumYetkisi,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
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
  const subeListe = firmaSubeleri(subeler, form.firmaId);
  const depoListe = subeDepolari(depolar, form.subeId);
  const kasaListe = subeKasalari(kasalar, form.subeId);
  const atanmisFirmaIdleri = new Set(form.oturumYetkileri.map((y) => y.firmaId));
  const atanmisFirmalar = firmalar.filter((f) => atanmisFirmaIdleri.has(f.id));
  const varsayilanDonemListe = firmaDonemleri(donemler, form.firmaId).filter((d) =>
    form.oturumYetkileri.some((y) => y.firmaId === form.firmaId && y.donemId === d.id)
  );

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

  function yetkileriUygula(yeniYetkiler: KullaniciOturumYetkisi[]) {
    const varsayilanHalaGecerli = yeniYetkiler.some(
      (y) => y.firmaId === form.firmaId && y.donemId === form.donemId
    );
    if (varsayilanHalaGecerli) {
      onChange({ ...form, oturumYetkileri: yeniYetkiler });
      return;
    }

    const ilk = yeniYetkiler[0];
    if (!ilk) {
      onChange({
        ...form,
        oturumYetkileri: [],
        firmaId: '',
        donemId: '',
        subeId: '',
        depoId: '',
        kasaId: '',
      });
      return;
    }

    const firmaAyarli = firmaDegistir(form, ilk.firmaId, oturumSecenekleri);
    onChange({
      ...firmaAyarli,
      oturumYetkileri: yeniYetkiler,
      donemId: ilk.donemId,
    });
  }

  function yetkiDegistir(firmaId: string, donemId: string, secili: boolean) {
    const anahtar = (y: KullaniciOturumYetkisi) =>
      y.firmaId === firmaId && y.donemId === donemId;
    const yeniYetkiler = secili
      ? form.oturumYetkileri.some(anahtar)
        ? form.oturumYetkileri
        : [...form.oturumYetkileri, { firmaId, donemId }]
      : form.oturumYetkileri.filter((y) => !anahtar(y));
    yetkileriUygula(yeniYetkiler);
  }

  function firmaEkle(firmaId: string) {
    if (!firmaId || atanmisFirmaIdleri.has(firmaId)) return;

    const ilkDonem = firmaDonemleri(donemler, firmaId)[0];
    if (!ilkDonem) return;

    const yeniYetkiler = [...form.oturumYetkileri, { firmaId, donemId: ilkDonem.id }];
    if (!form.firmaId) {
      const firmaAyarli = firmaDegistir(form, firmaId, oturumSecenekleri);
      onChange({
        ...firmaAyarli,
        oturumYetkileri: yeniYetkiler,
        donemId: ilkDonem.id,
      });
      return;
    }
    onChange({ ...form, oturumYetkileri: yeniYetkiler });
  }

  function varsayilanFirmaDegistir(firmaId: string) {
    const donemId =
      form.oturumYetkileri.find((y) => y.firmaId === firmaId)?.donemId ?? '';
    onChange({
      ...firmaDegistir(form, firmaId, oturumSecenekleri),
      donemId,
    });
  }

  const eklenebilirFirmalar = firmalar.filter((f) => !atanmisFirmaIdleri.has(f.id));

  const yetkiAlani = (
    <div className="ap-kullanici-oturum-yetkileri">
      <div className="ap-kullanici-oturum-yetkileri-baslik">
        <span>Firma / Dönem Yetkileri</span>
        <div className="ap-kullanici-oturum-yetkileri-baslik-sag">
          <small>
            {atanmisFirmalar.length} firma · {form.oturumYetkileri.length} dönem
          </small>
          {eklenebilirFirmalar.length > 0 && (
            <div className="ap-kullanici-oturum-firma-ekle">
              <FormAcilirSecim
                aria-label="Firma ekle"
                value=""
                onChange={(firmaId) => {
                  if (firmaId) firmaEkle(firmaId);
                }}
                secenekler={[
                  { value: '', label: 'Firma ekle…' },
                  ...eklenebilirFirmalar.map((f) => ({
                    value: f.id,
                    label: `${f.firmaKodu} — ${f.firmaAdi}`,
                  })),
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {atanmisFirmalar.length === 0 ? (
        <p className="ap-kullanici-oturum-yetki-bos">
          Yetki için yukarıdan firma ekleyin; firmanın dönemleri burada listelenir.
        </p>
      ) : (
        <div className="ap-kullanici-oturum-yetki-listesi">
          {atanmisFirmalar.map((firma) => {
            const firmaDonemListe = firmaDonemleri(donemler, firma.id);
            return (
              <fieldset key={firma.id} className="ap-kullanici-oturum-yetki-grup">
                <legend>
                  {firma.firmaKodu} — {firma.firmaAdi}
                </legend>
                <div className="ap-kullanici-oturum-donemler">
                  {firmaDonemListe.map((donem) => {
                    const secili = form.oturumYetkileri.some(
                      (y) => y.firmaId === firma.id && y.donemId === donem.id
                    );
                    const varsayilan =
                      form.firmaId === firma.id && form.donemId === donem.id;
                    return (
                      <label
                        key={donem.id}
                        className={`ap-kullanici-oturum-donem${secili ? ' ap-kullanici-oturum-donem--secili' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={secili}
                          onChange={(e) =>
                            yetkiDegistir(firma.id, donem.id, e.target.checked)
                          }
                        />
                        <span>
                          {donem.donemKodu} — {donem.donemAdi}
                        </span>
                        {varsayilan && <b>Default</b>}
                      </label>
                    );
                  })}
                  {firmaDonemListe.length === 0 && (
                    <small className="ap-kullanici-oturum-yetki-uyari">Aktif dönem yok</small>
                  )}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );

  const alanlar = (
    <>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Default Firma</span>
        <FormAcilirSecim
          aria-label="Default firma"
          value={form.firmaId}
          onChange={varsayilanFirmaDegistir}
          secenekler={atanmisFirmalar.map((f) => ({ value: f.id, label: `${f.firmaKodu} — ${f.firmaAdi}` }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Default Dönem</span>
        <FormAcilirSecim
          aria-label="Default dönem"
          value={form.donemId}
          onChange={(donemId) => onChange({ ...form, donemId })}
          secenekler={varsayilanDonemListe.map((d) => ({ value: d.id, label: `${d.donemKodu} — ${d.donemAdi}` }))}
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
      <>
        {yetkiAlani}
        <div className={satirSinifi} role="group" aria-label="Varsayılan oturum bağlamı">
          {alanlar}
        </div>
      </>
    );
  }

  return (
    <div className="ap-kullanici-oturum-cubuk" role="group" aria-label="Oturum bağlamı">
      <span className="ap-kullanici-oturum-cubuk-baslik">Oturum</span>
      <div className="ap-kullanici-oturum-cubuk-icerik">
        {yetkiAlani}
        <div className={satirSinifi}>{alanlar}</div>
      </div>
    </div>
  );
}
