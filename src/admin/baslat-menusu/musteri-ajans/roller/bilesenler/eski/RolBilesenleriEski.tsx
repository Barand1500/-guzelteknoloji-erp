import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import {
  YETKI_ETIKETLERI,
  type ModulTanimi,
  type RolTanimi,
  type YetkiKodu,
  type YetkiTanimi,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import {
  rolModulErisimSayisi,
  rolModulYetkiSayisi,
  rolModulYetkileri,
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

export function rolSilinebilirMi(rol: RolTanimi): boolean {
  if (SISTEM_ROL_KODLARI.has(rol.kod)) return false;
  return rol.sistemRolu !== true;
}

interface RolMatrisiProps {
  roller: RolTanimi[];
  yetkiler: YetkiTanimi[];
  aktifModul: ModulTanimi;
  duzenlenebilir?: boolean;
  onYetkiToggle?: (rolKod: string, modulPrefix: string, yetkiKod: YetkiKodu) => void;
}

export function RolMatrisi({
  roller,
  yetkiler,
  aktifModul,
  duzenlenebilir,
  onYetkiToggle,
}: RolMatrisiProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
      <div className="border-b border-slate-700 px-4 py-3">
        <div className="text-sm font-semibold text-white">
          {aktifModul.ikon ? `${aktifModul.ikon} ` : ''}
          {aktifModul.ad}
        </div>
        {aktifModul.kategori ? (
          <div className="mt-0.5 text-xs text-slate-500">{aktifModul.kategori}</div>
        ) : null}
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
            const modulYetkiler = rolModulYetkileri(rol, aktifModul.prefix);
            return (
              <tr key={rol.kod} className="border-b border-slate-700/60 hover:bg-slate-750/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{rol.baslik}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{rol.aciklama}</div>
                </td>
                {yetkiler.map((y) => {
                  const varMi = modulYetkiler.includes(y.kod);
                  return (
                    <td key={y.kod} className="px-3 py-3 text-center">
                      {hucreDuzenlenebilir ? (
                        <button
                          type="button"
                          onClick={() => onYetkiToggle?.(rol.kod, aktifModul.prefix, y.kod)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                            varMi
                              ? 'bg-green-500/25 text-green-400 hover:bg-green-500/35'
                              : 'text-slate-600 hover:bg-slate-700/80 hover:text-slate-400'
                          }`}
                          title={varMi ? 'Yetkiyi kaldır' : 'Yetki ver'}
                          aria-pressed={varMi}
                        >
                          {varMi ? '✓' : '—'}
                        </button>
                      ) : varMi ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                          ✓
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roller.map((rol) => {
        const secili = seciliKod === rol.kod;
        const ozet = moduller
          .map((modul) => ({
            modul,
            yetkiler: rolModulYetkileri(rol, modul.prefix),
          }))
          .filter((o) => o.yetkiler.length > 0);

        return (
          <div
            key={rol.kod}
            className={`relative rounded-lg border bg-slate-800 p-4 transition-colors ${
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
              <h3 className="pr-8 font-semibold text-white">{rol.baslik}</h3>
              <p className="mt-1 text-xs text-slate-500">{rol.kod}</p>
              <p className="mt-2 text-sm text-slate-400">{rol.aciklama}</p>
              <div className="mt-3 space-y-2">
                {ozet.length === 0 ? (
                  <span className="text-xs text-amber-400/90">Henüz sayfa yetkisi yok</span>
                ) : (
                  ozet.map(({ modul, yetkiler: yListe }) => (
                    <div key={modul.prefix}>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {modul.ad}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {yListe.map((y) => (
                          <span
                            key={y}
                            className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                          >
                            {YETKI_ETIKETLERI[y] ?? y.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
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
