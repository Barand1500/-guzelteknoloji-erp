import type {
  KullaniciFormDegeri,
  KullaniciOturumYetkisi,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import {
  firmaDonemleri,
  firmaSubeleri,
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
  const atanmisFirmaIdleri = [...new Set(form.oturumYetkileri.map((y) => y.firmaId))];
  const seciliDonemIdleri = form.oturumYetkileri.map((y) => y.donemId);
  const seciliSubeIdleri = form.subeIds.length
    ? form.subeIds
    : form.subeId
      ? [form.subeId]
      : [];
  const seciliDepoIdleri = form.depoIds.length
    ? form.depoIds
    : form.depoId
      ? [form.depoId]
      : [];
  const seciliKasaIdleri = form.kasaIds.length
    ? form.kasaIds
    : form.kasaId
      ? [form.kasaId]
      : [];

  const donemSecenekleri = donemler.filter((d) => atanmisFirmaIdleri.includes(d.firmaId));
  const subeSecenekleri = subeler.filter((s) => atanmisFirmaIdleri.includes(s.firmaId));
  const depoSecenekleri = depolar.filter((d) => seciliSubeIdleri.includes(d.subeId));
  const kasaSecenekleri = kasalar.filter((k) => seciliSubeIdleri.includes(k.subeId));

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

  function baglamUygula(
    yetkiler: KullaniciOturumYetkisi[],
    subeIds: string[],
    depoIds: string[],
    kasaIds: string[]
  ) {
    const firmaId =
      (form.firmaId && yetkiler.some((y) => y.firmaId === form.firmaId)
        ? form.firmaId
        : yetkiler[0]?.firmaId) ?? '';
    const donemId =
      (firmaId &&
        yetkiler.find((y) => y.firmaId === firmaId && y.donemId === form.donemId)?.donemId) ||
      yetkiler.find((y) => y.firmaId === firmaId)?.donemId ||
      yetkiler[0]?.donemId ||
      '';
    const gecerliSubeler = subeIds.filter((id) =>
      subeler.some(
        (s) =>
          s.id === id &&
          (yetkiler.length === 0 || yetkiler.some((y) => y.firmaId === s.firmaId))
      )
    );
    const subeId =
      (form.subeId && gecerliSubeler.includes(form.subeId) ? form.subeId : gecerliSubeler[0]) ?? '';
    const gecerliDepolar = depoIds.filter((id) =>
      depolar.some((d) => d.id === id && (!subeId || gecerliSubeler.includes(d.subeId)))
    );
    const depoId =
      (form.depoId && gecerliDepolar.includes(form.depoId) ? form.depoId : gecerliDepolar[0]) ?? '';
    const gecerliKasalar = kasaIds.filter((id) =>
      kasalar.some((k) => k.id === id && (!subeId || gecerliSubeler.includes(k.subeId)))
    );
    const kasaId =
      (form.kasaId && gecerliKasalar.includes(form.kasaId) ? form.kasaId : gecerliKasalar[0]) ?? '';

    onChange({
      ...form,
      oturumYetkileri: yetkiler,
      firmaId,
      donemId,
      subeId,
      depoId,
      kasaId,
      subeIds: gecerliSubeler,
      depoIds: gecerliDepolar,
      kasaIds: gecerliKasalar,
    });
  }

  function firmalariDegistir(firmaIds: string[]) {
    const onceki = new Set(atanmisFirmaIdleri);
    const sonraki = new Set(firmaIds);
    let yetkiler = form.oturumYetkileri.filter((y) => sonraki.has(y.firmaId));

    for (const firmaId of firmaIds) {
      if (onceki.has(firmaId)) continue;
      const ilkDonem = firmaDonemleri(donemler, firmaId)[0];
      if (ilkDonem) yetkiler = [...yetkiler, { firmaId, donemId: ilkDonem.id }];
    }

    const subeIds = form.subeIds.filter((id) =>
      subeler.some((s) => s.id === id && sonraki.has(s.firmaId))
    );
    const depoIds = form.depoIds.filter((id) =>
      depolar.some((d) => d.id === id && subeIds.includes(d.subeId))
    );
    const kasaIds = form.kasaIds.filter((id) =>
      kasalar.some((k) => k.id === id && subeIds.includes(k.subeId))
    );

    // Yeni firmalar için ilk şube/depo/kasa ekle
    for (const firmaId of firmaIds) {
      if (onceki.has(firmaId)) continue;
      const subeId = firmaSubeleri(subeler, firmaId)[0]?.id;
      if (subeId && !subeIds.includes(subeId)) {
        subeIds.push(subeId);
        const depoId = subeDepolari(depolar, subeId)[0]?.id;
        const kasaId = subeKasalari(kasalar, subeId)[0]?.id;
        if (depoId && !depoIds.includes(depoId)) depoIds.push(depoId);
        if (kasaId && !kasaIds.includes(kasaId)) kasaIds.push(kasaId);
      }
    }

    baglamUygula(yetkiler, subeIds, depoIds, kasaIds);
  }

  function donemleriDegistir(donemIds: string[]) {
    const yetkiler: KullaniciOturumYetkisi[] = [];
    for (const donemId of donemIds) {
      const donem = donemler.find((d) => d.id === donemId);
      if (!donem || !atanmisFirmaIdleri.includes(donem.firmaId)) continue;
      yetkiler.push({ firmaId: donem.firmaId, donemId: donem.id });
    }
    baglamUygula(yetkiler, seciliSubeIdleri, seciliDepoIdleri, seciliKasaIdleri);
  }

  function subeleriDegistir(subeIds: string[]) {
    const onceki = new Set(seciliSubeIdleri);
    const depoIds = form.depoIds.filter((id) =>
      depolar.some((d) => d.id === id && subeIds.includes(d.subeId))
    );
    const kasaIds = form.kasaIds.filter((id) =>
      kasalar.some((k) => k.id === id && subeIds.includes(k.subeId))
    );
    for (const subeId of subeIds) {
      if (onceki.has(subeId)) continue;
      const depoId = subeDepolari(depolar, subeId)[0]?.id;
      const kasaId = subeKasalari(kasalar, subeId)[0]?.id;
      if (depoId && !depoIds.includes(depoId)) depoIds.push(depoId);
      if (kasaId && !kasaIds.includes(kasaId)) kasaIds.push(kasaId);
    }
    baglamUygula(form.oturumYetkileri, subeIds, depoIds, kasaIds);
  }

  const alanlar = (
    <>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Firma</span>
        <FormAcilirSecim
          coklu
          aria-label="Firma"
          values={atanmisFirmaIdleri}
          onChangeCoklu={firmalariDegistir}
          secenekler={firmalar.map((f) => ({
            value: f.id,
            label: `${f.firmaKodu} — ${f.firmaAdi}`,
          }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Dönem</span>
        <FormAcilirSecim
          coklu
          aria-label="Dönem"
          values={seciliDonemIdleri}
          onChangeCoklu={donemleriDegistir}
          secenekler={donemSecenekleri.map((d) => ({
            value: d.id,
            label: `${d.donemKodu} — ${d.donemAdi}`,
          }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Şube</span>
        <FormAcilirSecim
          coklu
          aria-label="Şube"
          values={seciliSubeIdleri}
          onChangeCoklu={subeleriDegistir}
          secenekler={subeSecenekleri.map((s) => ({
            value: s.id,
            label: `${s.subeKodu} — ${s.subeAdi}`,
          }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Depo</span>
        <FormAcilirSecim
          coklu
          aria-label="Depo"
          values={seciliDepoIdleri}
          onChangeCoklu={(depoIds) =>
            baglamUygula(form.oturumYetkileri, seciliSubeIdleri, depoIds, seciliKasaIdleri)
          }
          secenekler={depoSecenekleri.map((d) => ({
            value: d.id,
            label: `${d.depoKodu} — ${d.depoAdi}`,
          }))}
        />
      </label>
      <label className={alanSinifi}>
        <span className={etiketSinifi}>Kasa</span>
        <FormAcilirSecim
          coklu
          aria-label="Kasa"
          values={seciliKasaIdleri}
          onChangeCoklu={(kasaIds) =>
            baglamUygula(form.oturumYetkileri, seciliSubeIdleri, seciliDepoIdleri, kasaIds)
          }
          secenekler={kasaSecenekleri.map((k) => ({
            value: k.id,
            label: `${k.kasaKodu} — ${k.kasaAdi}`,
          }))}
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
      <div className="ap-kullanici-oturum-cubuk-icerik">
        <div className={satirSinifi}>{alanlar}</div>
      </div>
    </div>
  );
}
