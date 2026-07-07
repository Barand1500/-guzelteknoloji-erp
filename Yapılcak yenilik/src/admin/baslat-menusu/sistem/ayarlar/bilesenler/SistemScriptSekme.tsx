import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { ScriptKodAlani } from '@/formlar/ScriptKodAlani';

export function SistemScriptSekme({
  form,
  onChange,
}: {
  form: SistemAyarlariForm;
  onChange: (f: SistemAyarlariForm) => void;
}) {
  const script = form.scriptAyarlari;

  function guncelle(parcalar: Partial<typeof script>) {
    onChange({ ...form, scriptAyarlari: { ...script, ...parcalar } });
  }

  return (
    <div className="ap-script-ayarlari space-y-8">
      <ScriptKodAlani
        baslik="Google Analytics Kodunuz"
        aciklama="Google Analytics kodunuzu buraya yazınız."
        deger={script.googleAnalytics}
        onChange={(v) => guncelle({ googleAnalytics: v })}
      />
      <ScriptKodAlani
        baslik="Header Scripti"
        aciklama="head etiketleri arasına yerleştirmek istediğiniz kodları buraya yazınız."
        deger={script.headerScript}
        onChange={(v) => guncelle({ headerScript: v })}
      />
      <ScriptKodAlani
        baslik="Body Etiketi Sonrası Scripti"
        aciklama="body etiketi açıldıktan hemen sonraki alana yerleştirmek istediğiniz kodları buraya yazınız."
        deger={script.bodyAcilisScript}
        onChange={(v) => guncelle({ bodyAcilisScript: v })}
      />
      <ScriptKodAlani
        baslik="Footer Scripti"
        aciklama="body etiketi kapanmadan hemen önce yerleştirmek istediğiniz kodları buraya yazınız."
        deger={script.footerScript}
        onChange={(v) => guncelle({ footerScript: v })}
      />
    </div>
  );
}
