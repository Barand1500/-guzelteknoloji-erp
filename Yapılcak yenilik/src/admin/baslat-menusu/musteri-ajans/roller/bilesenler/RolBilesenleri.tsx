import { YETKI_ETIKETLERI, type RolTanimi, type YetkiKodu, type YetkiTanimi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

const SISTEM_ROL_KODLARI = new Set([
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
  duzenlenebilir?: boolean;
  onYetkiToggle?: (rolKod: string, yetkiKod: YetkiKodu) => void;
}

export function RolMatrisi({ roller, yetkiler, duzenlenebilir, onYetkiToggle }: RolMatrisiProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
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
            const superAdmin = rol.kod === 'SUPER_ADMIN';
            const hucreDuzenlenebilir = duzenlenebilir && !superAdmin;
            return (
              <tr key={rol.kod} className="border-b border-slate-700/60 hover:bg-slate-750/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{rol.baslik}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{rol.aciklama}</div>
                </td>
                {yetkiler.map((y) => {
                  const varMi = rol.yetkiler.includes(y.kod);
                  return (
                    <td key={y.kod} className="px-3 py-3 text-center">
                      {hucreDuzenlenebilir ? (
                        <button
                          type="button"
                          onClick={() => onYetkiToggle?.(rol.kod, y.kod)}
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
                        <span className="inline-flex h-6 w-6 items-center justify-center text-slate-600">—</span>
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
  seciliKod: string | null;
  duzenlenebilir?: boolean;
  onSec?: (rol: RolTanimi) => void;
  onDuzenle?: (rol: RolTanimi) => void;
}

export function RolKartlari({ roller, seciliKod, duzenlenebilir, onSec, onDuzenle }: RolKartlariProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roller.map((rol) => {
        const secili = seciliKod === rol.kod;
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
              <div className="mt-3 flex flex-wrap gap-1">
                {rol.yetkiler.map((y) => (
                  <span
                    key={y}
                    className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                  >
                    {YETKI_ETIKETLERI[y] ?? y.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
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
