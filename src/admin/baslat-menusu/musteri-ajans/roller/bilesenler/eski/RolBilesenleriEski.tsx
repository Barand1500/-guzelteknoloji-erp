import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import {
  YETKI_ETIKETLERI,
  tumSayfalarMi,
  type ModulTanimi,
  type RolTanimi,
  type YetkiKodu,
  type YetkiTanimi,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import {
  rolModulErisimSayisi,
  rolModulYetkiSayisi,
  rolModulYetkileri,
  rolTopluYetkiDurumu,
  rolYetkiBirlestir,
  yetkiUygunPrefixler,
  type TopluYetkiDurumu,
} from '@/admin/baslat-menusu/musteri-ajans/roller/rolYardimci';

const SISTEM_ROL_KODLARI = new Set([
  'YONETICI',
  'SUPER_ADMIN',
  'AJANS_ADMIN',
  'MUSTERI_ADMIN',
  'EDITOR',
  'SEO_EDITOR',
  'GORUNTULEME',
]);

const SAYFA_OZET_LIMIT = 4;

export function rolSilinebilirMi(rol: RolTanimi): boolean {
  if (SISTEM_ROL_KODLARI.has(rol.kod)) return false;
  return rol.sistemRolu !== true;
}

function topluHucreMetni(durum: TopluYetkiDurumu): string {
  if (durum === 'hepsi') return '✓';
  if (durum === 'karisik') return '−';
  return '—';
}

interface RolMatrisiProps {
  roller: RolTanimi[];
  yetkiler: YetkiTanimi[];
  aktifModul: ModulTanimi;
  topluModuller?: readonly ModulTanimi[];
  duzenlenebilir?: boolean;
  onYetkiToggle?: (rolKod: string, modulPrefix: string, yetkiKod: YetkiKodu) => void;
}

export function RolMatrisi({
  roller,
  yetkiler,
  aktifModul,
  topluModuller,
  duzenlenebilir,
  onYetkiToggle,
}: RolMatrisiProps) {
  const tumSayfalar = tumSayfalarMi(aktifModul.prefix);
  const gercekModuller = (topluModuller ?? []).filter((m) => !tumSayfalarMi(m.prefix));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
      <div className="border-b border-slate-700 px-4 py-3">
        <div className="text-sm font-semibold text-white">
          {aktifModul.ikon ? `${aktifModul.ikon} ` : ''}
          {aktifModul.ad}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          {tumSayfalar
            ? 'İşaretlenen yetki uygun tüm sayfalara uygulanır. Sayfalar arası fark varsa “−” görünür.'
            : aktifModul.kategori ?? null}
        </div>
      </div>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900/50">
            <th className="px-4 py-3 font-semibold text-white">Rol</th>
            {yetkiler.map((y) => (
              <th key={y.kod} className="px-3 py-3 text-center text-xs font-medium text-slate-400">
                {y.etiket}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roller.map((rol) => {
            const superAdmin = korunmusRolMu(rol.kod);
            const hucreDuzenlenebilir = duzenlenebilir && !superAdmin;
            const modulYetkiler = tumSayfalar
              ? null
              : rolModulYetkileri(rol, aktifModul.prefix);
            return (
              <tr key={rol.kod} className="border-b border-slate-700/60 hover:bg-slate-750/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{rol.baslik}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{rol.aciklama}</div>
                </td>
                {yetkiler.map((y) => {
                  const durum: TopluYetkiDurumu = tumSayfalar
                    ? rolTopluYetkiDurumu(rol, yetkiUygunPrefixler(y.kod, gercekModuller), y.kod)
                    : modulYetkiler!.includes(y.kod)
                      ? 'hepsi'
                      : 'hicbiri';
                  const varMi = durum === 'hepsi';
                  const karisik = durum === 'karisik';
                  const aktifSinif = varMi
                    ? 'bg-green-500/25 text-green-400 hover:bg-green-500/35'
                    : karisik
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      : 'text-slate-600 hover:bg-slate-700/80 hover:text-slate-400';

                  return (
                    <td key={y.kod} className="px-3 py-3 text-center">
                      {hucreDuzenlenebilir ? (
                        <button
                          type="button"
                          onClick={() => onYetkiToggle?.(rol.kod, aktifModul.prefix, y.kod)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${aktifSinif}`}
                          title={
                            tumSayfalar
                              ? durum === 'hepsi'
                                ? 'Tüm sayfalardan kaldır'
                                : durum === 'karisik'
                                  ? 'Eksik sayfalara da ekle'
                                  : 'Tüm sayfalara ver'
                              : varMi
                                ? 'Yetkiyi kaldır'
                                : 'Yetki ver'
                          }
                          aria-pressed={varMi}
                        >
                          {tumSayfalar ? topluHucreMetni(durum) : varMi ? '✓' : '—'}
                        </button>
                      ) : varMi ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                          ✓
                        </span>
                      ) : karisik ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                          −
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center text-slate-600">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface RolKartlariProps {
  roller: RolTanimi[];
  moduller: ModulTanimi[];
  seciliKod: string | null;
  duzenlenebilir?: boolean;
  onSec?: (rol: RolTanimi) => void;
  onDuzenle?: (rol: RolTanimi) => void;
}

export function RolKartlari({
  roller,
  moduller,
  seciliKod,
  duzenlenebilir,
  onSec,
  onDuzenle,
}: RolKartlariProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {roller.map((rol) => {
        const secili = seciliKod === rol.kod;
        const birlesik = rolYetkiBirlestir(rol);
        const erisimli = moduller.filter((m) => rolModulYetkileri(rol, m.prefix).length > 0);
        const goster = erisimli.slice(0, SAYFA_OZET_LIMIT);
        const kalan = Math.max(0, erisimli.length - goster.length);

        return (
          <div
            key={rol.kod}
            className={`relative rounded-xl border bg-slate-800 p-5 transition-colors ${
              secili
                ? 'border-violet-500 ring-2 ring-violet-500/35'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => onSec?.(rol)}
              disabled={!duzenlenebilir}
              className={`w-full text-left ${duzenlenebilir ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <h3 className="pr-8 text-base font-semibold text-white">{rol.baslik}</h3>
              <p className="mt-1 text-xs text-slate-500">{rol.kod}</p>
              {rol.aciklama ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{rol.aciklama}</p>
              ) : null}

              <div className="mt-4 space-y-3">
                {birlesik.length === 0 ? (
                  <span className="text-xs text-amber-400/90">Henüz sayfa yetkisi yok</span>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {birlesik.map((y) => (
                        <span
                          key={y}
                          className="rounded-md bg-slate-700/90 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                        >
                          {YETKI_ETIKETLERI[y] ?? y.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {goster.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {goster.map((modul) => (
                          <span
                            key={modul.prefix}
                            className="rounded-md border border-slate-600/80 px-2 py-0.5 text-[10px] text-slate-400"
                          >
                            {modul.ad}
                          </span>
                        ))}
                        {kalan > 0 && (
                          <span className="rounded-md border border-dashed border-slate-600/80 px-2 py-0.5 text-[10px] text-slate-500">
                            +{kalan} sayfa
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className="mt-4 text-[11px] font-medium text-slate-500">
                {rolModulErisimSayisi(rol)} sayfa · {rolModulYetkiSayisi(rol)} yetki
              </p>
            </button>
            {duzenlenebilir && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuzenle?.(rol);
                }}
                className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Rolü düzenle"
                aria-label={`${rol.baslik} düzenle`}
              >
                ✏️
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
