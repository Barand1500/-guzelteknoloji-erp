import type { RefObject } from 'react';
import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import { tooltipMetni } from '@/araclar/tooltipMetni';
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

const YETKI_IKONLARI: Record<YetkiKodu, string> = {
  goruntuleme: '👁',
  ekleme: '➕',
  duzenleme: '✏️',
  silme: '🗑',
  kullanici_yonetimi: '👥',
};

/** Açık temada net kontrast — CSS cascade/HMR sorunlarına karşı inline */
const YETKI_ETIKET_STIL: Record<
  YetkiKodu,
  { background: string; color: string; border: string }
> = {
  goruntuleme: { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd' },
  ekleme: { background: '#dcfce7', color: '#14532d', border: '1px solid #86efac' },
  duzenleme: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' },
  silme: { background: '#fee2e2', color: '#7f1d1d', border: '1px solid #fca5a5' },
  kullanici_yonetimi: { background: '#f3e8ff', color: '#581c87', border: '1px solid #d8b4fe' },
};

const SAYFA_OZET_LIMIT = 4;

export function rolSilinebilirMi(rol: RolTanimi): boolean {
  if (SISTEM_ROL_KODLARI.has(rol.kod)) return false;
  return rol.sistemRolu !== true;
}

export function rolSistemRoluMu(rol: RolTanimi): boolean {
  return rol.sistemRolu === true || SISTEM_ROL_KODLARI.has(rol.kod);
}

export function rolTaslakMi(kod: string): boolean {
  return kod.startsWith('TASLAK_');
}

function topluHucreMetni(durum: TopluYetkiDurumu): string {
  if (durum === 'hepsi') return '✓';
  if (durum === 'karisik') return '−';
  return '·';
}

function topluTooltip(durum: TopluYetkiDurumu): string {
  if (durum === 'hepsi') return 'Tüm sayfalardan kaldır';
  if (durum === 'karisik') return 'Eksik sayfalara da ekle';
  return 'Tüm sayfalara ver';
}

interface RolMatrisiProps {
  roller: RolTanimi[];
  yetkiler: YetkiTanimi[];
  aktifModul: ModulTanimi;
  /** Toplu (“Tüm sayfalar”) modunda hücre durumu için gerçek sayfalar */
  topluModuller?: readonly ModulTanimi[];
  duzenlenebilir?: boolean;
  yeniRolKodlari?: ReadonlySet<string>;
  sarmalRef?: RefObject<HTMLDivElement | null>;
  onYetkiToggle?: (rolKod: string, modulPrefix: string, yetkiKod: YetkiKodu) => void;
  onRolAlanDegis?: (rolKod: string, alan: 'baslik' | 'aciklama', deger: string) => void;
  onRolBaslikBlur?: (rolKod: string, baslik: string) => void;
  onYeniRolIptal?: (rolKod: string) => void;
}

export function RolMatrisi({
  roller,
  yetkiler,
  aktifModul,
  topluModuller,
  duzenlenebilir,
  yeniRolKodlari,
  sarmalRef,
  onYetkiToggle,
  onRolAlanDegis,
  onRolBaslikBlur,
  onYeniRolIptal,
}: RolMatrisiProps) {
  const sonYeniKod = yeniRolKodlari ? [...yeniRolKodlari].at(-1) : undefined;
  const tumSayfalar = tumSayfalarMi(aktifModul.prefix);
  const gercekModuller = (topluModuller ?? []).filter((m) => !tumSayfalarMi(m.prefix));

  return (
    <div className="ap-roller-matris-sarmal" ref={sarmalRef}>
      <div
        className={`ap-roller-modul-baslik-kapsul${tumSayfalar ? ' ap-roller-modul-baslik-kapsul--toplu' : ''}`}
      >
        {!tumSayfalar ? (
          <span className="ap-roller-modul-baslik-ikon" aria-hidden>
            {aktifModul.ikon ?? '📄'}
          </span>
        ) : null}
        <div>
          <div className="ap-roller-modul-baslik-ad">{aktifModul.ad}</div>
          {!tumSayfalar && aktifModul.kategori ? (
            <div className="ap-roller-modul-baslik-kategori">{aktifModul.kategori}</div>
          ) : null}
        </div>
      </div>

      <table className="ap-roller-matris">
        <thead>
          <tr>
            <th>Rol</th>
            {yetkiler.map((y) => (
              <th key={y.kod}>
                <span className="ap-roller-matris-yetki-baslik">
                  <span className="ap-roller-matris-yetki-ikon" aria-hidden>
                    {YETKI_IKONLARI[y.kod]}
                  </span>
                  {y.etiket}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roller.map((rol) => {
            const superAdmin = korunmusRolMu(rol.kod);
            const sistemRolu = rolSistemRoluMu(rol);
            const yeniSatir = yeniRolKodlari?.has(rol.kod) ?? false;
            const hucreDuzenlenebilir = duzenlenebilir && !superAdmin;
            const modulYetkiler = tumSayfalar
              ? null
              : rolModulYetkileri(rol, aktifModul.prefix);

            return (
              <tr
                key={rol.kod}
                className={yeniSatir ? 'ap-roller-matris-satir--yeni' : undefined}
              >
                <td className="ap-roller-matris-rol-hucre">
                  {yeniSatir && duzenlenebilir ? (
                    <div className="ap-roller-yeni-satir-alanlar">
                      <div className="ap-roller-yeni-satir-ust">
                        <span className="ap-roller-yeni-etiket">Yeni rol</span>
                        <button
                          type="button"
                          className="ap-roller-yeni-iptal"
                          onClick={() => onYeniRolIptal?.(rol.kod)}
                          title={tooltipMetni('Satırı kaldır')}
                          aria-label="Yeni rol satırını kaldır"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        className="ap-roller-yeni-input"
                        placeholder="Rol adı"
                        value={rol.baslik}
                        onChange={(e) => onRolAlanDegis?.(rol.kod, 'baslik', e.target.value)}
                        onBlur={(e) => onRolBaslikBlur?.(rol.kod, e.target.value)}
                        autoFocus={yeniSatir && rol.kod === sonYeniKod}
                      />
                      <input
                        className="ap-roller-yeni-input ap-roller-yeni-input--kucuk"
                        placeholder="Kısa açıklama (isteğe bağlı)"
                        value={rol.aciklama}
                        onChange={(e) => onRolAlanDegis?.(rol.kod, 'aciklama', e.target.value)}
                      />
                      <div className="ap-roller-rol-kod">
                        {rol.kod.startsWith('TASLAK_')
                          ? rol.baslik.trim()
                            ? 'Enter veya alan dışına tıklayınca kod oluşur'
                            : 'Rol adını yazın — kod otomatik oluşur'
                          : rol.kod}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ap-roller-rol-ad">{rol.baslik}</div>
                      <div className="ap-roller-rol-kod">{rol.kod}</div>
                      {rol.aciklama && <div className="ap-roller-rol-aciklama">{rol.aciklama}</div>}
                      {sistemRolu && (
                        <span className="ap-roller-sistem-rozet">
                          <span aria-hidden>🔒</span> Sistem rolü
                        </span>
                      )}
                    </>
                  )}
                </td>
                {yetkiler.map((y) => {
                  const durum: TopluYetkiDurumu = tumSayfalar
                    ? rolTopluYetkiDurumu(rol, yetkiUygunPrefixler(y.kod, gercekModuller), y.kod)
                    : modulYetkiler!.includes(y.kod)
                      ? 'hepsi'
                      : 'hicbiri';
                  const varMi = durum === 'hepsi';
                  const karisik = durum === 'karisik';
                  const sinif = [
                    'ap-roller-yetki-hucre',
                    `ap-roller-yetki--${y.kod}`,
                    varMi ? 'ap-roller-yetki-hucre--aktif' : '',
                    karisik ? 'ap-roller-yetki-hucre--karisik' : '',
                    !hucreDuzenlenebilir ? 'ap-roller-yetki-hucre--salt' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  if (hucreDuzenlenebilir) {
                    return (
                      <td key={y.kod}>
                        <button
                          type="button"
                          onClick={() => onYetkiToggle?.(rol.kod, aktifModul.prefix, y.kod)}
                          className={sinif}
                          title={tooltipMetni(
                            tumSayfalar
                              ? topluTooltip(durum)
                              : varMi
                                ? 'Yetkiyi kaldır'
                                : 'Yetki ver'
                          )}
                          aria-pressed={varMi}
                          aria-label={`${rol.baslik} — ${aktifModul.ad} — ${y.etiket}`}
                        >
                          {tumSayfalar ? topluHucreMetni(durum) : varMi ? '✓' : '·'}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={y.kod}>
                      <span className={sinif} aria-hidden>
                        {tumSayfalar ? topluHucreMetni(durum) : varMi ? '✓' : '·'}
                      </span>
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
  yeniKartKodlari?: ReadonlySet<string>;
  onSec?: (rol: RolTanimi) => void;
  onDuzenle?: (rol: RolTanimi) => void;
  onRolAlanDegis?: (rolKod: string, alan: 'baslik' | 'aciklama', deger: string) => void;
  onRolBaslikBlur?: (rolKod: string, baslik: string) => void;
  onYeniRolIptal?: (rolKod: string) => void;
}

function kartSayfaOzeti(rol: RolTanimi, moduller: ModulTanimi[]) {
  const erisimli = moduller.filter((modul) => rolModulYetkileri(rol, modul.prefix).length > 0);
  const goster = erisimli.slice(0, SAYFA_OZET_LIMIT);
  const kalan = Math.max(0, erisimli.length - goster.length);
  return { goster, kalan, birlesik: rolYetkiBirlestir(rol) };
}

export function RolKartlari({
  roller,
  moduller,
  seciliKod,
  duzenlenebilir,
  yeniKartKodlari,
  onSec,
  onDuzenle,
  onRolAlanDegis,
  onRolBaslikBlur,
  onYeniRolIptal,
}: RolKartlariProps) {
  const sonYeniKod = yeniKartKodlari ? [...yeniKartKodlari].at(-1) : undefined;

  return (
    <div className="ap-roller-kart-grid">
      {roller.map((rol) => {
        const secili = seciliKod === rol.kod;
        const sistemRolu = rolSistemRoluMu(rol);
        const yeniKart = yeniKartKodlari?.has(rol.kod) ?? false;
        const { goster, kalan, birlesik } = kartSayfaOzeti(rol, moduller);

        if (yeniKart && duzenlenebilir) {
          return (
            <article
              key={rol.kod}
              className="ap-roller-kart ap-roller-kart--yeni ap-roller-kart--secili"
            >
              <div className="ap-roller-kart-ust-bar">
                <button
                  type="button"
                  className="ap-roller-yeni-iptal"
                  onClick={() => onYeniRolIptal?.(rol.kod)}
                  title={tooltipMetni('Kartı kaldır')}
                  aria-label="Yeni rol kartını kaldır"
                >
                  ✕
                </button>
              </div>
              <div className="ap-roller-kart-icerik ap-roller-kart-icerik--form">
                <span className="ap-roller-yeni-etiket">Yeni rol</span>
                <input
                  className="ap-roller-yeni-input ap-roller-yeni-input--kart-baslik"
                  placeholder="Rol adı"
                  value={rol.baslik}
                  onChange={(e) => onRolAlanDegis?.(rol.kod, 'baslik', e.target.value)}
                  onBlur={(e) => onRolBaslikBlur?.(rol.kod, e.target.value)}
                  autoFocus={rol.kod === sonYeniKod}
                />
                <textarea
                  className="ap-roller-yeni-input ap-roller-yeni-input--kart-aciklama"
                  placeholder="Kısa açıklama (isteğe bağlı)"
                  rows={3}
                  value={rol.aciklama}
                  onChange={(e) => onRolAlanDegis?.(rol.kod, 'aciklama', e.target.value)}
                />
                <div className="ap-roller-rol-kod">
                  {rol.kod.startsWith('TASLAK_')
                    ? rol.baslik.trim()
                      ? 'Alan dışına tıklayınca kod oluşur'
                      : 'Rol adını yazın — kod otomatik oluşur'
                    : rol.kod}
                </div>
                <div className="ap-roller-kart-alt">
                  <span className="ap-roller-kart-sayi">
                    Matristen sayfa bazlı yetkileri işaretleyin
                  </span>
                </div>
              </div>
            </article>
          );
        }

        return (
          <article
            key={rol.kod}
            className={`ap-roller-kart ${secili ? 'ap-roller-kart--secili' : ''}`}
          >
            <div className="ap-roller-kart-ust-bar">
              {duzenlenebilir && (
                <button
                  type="button"
                  onClick={() => onDuzenle?.(rol)}
                  className="ap-roller-kart-duzenle"
                  title={tooltipMetni('Rolü düzenle')}
                  aria-label={`${rol.baslik} düzenle`}
                >
                  ✏️
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSec?.(rol)}
              disabled={!duzenlenebilir}
              className="ap-roller-kart-icerik"
            >
              <div className="ap-roller-kart-ust-blok">
                <h3 className="ap-roller-kart-baslik">{rol.baslik}</h3>
                <div className="ap-roller-rol-kod">{rol.kod}</div>
                {sistemRolu && (
                  <span className="ap-roller-sistem-rozet">
                    <span aria-hidden>🔒</span> Sistem
                  </span>
                )}
              </div>
              {rol.aciklama && <p className="ap-roller-kart-aciklama">{rol.aciklama}</p>}
              <div className="ap-roller-kart-alt">
                {birlesik.length === 0 ? (
                  <span className="ap-roller-kart-sayi ap-roller-kart-sayi--uyari">
                    Henüz sayfa yetkisi yok
                  </span>
                ) : (
                  <>
                    <div className="ap-roller-kart-yetki-satir">
                      {birlesik.map((y) => (
                        <span
                          key={y}
                          className={`ap-roller-yetki-etiket ap-roller-yetki-etiket--${y}`}
                          style={YETKI_ETIKET_STIL[y]}
                        >
                          {YETKI_ETIKETLERI[y]}
                        </span>
                      ))}
                    </div>
                    {goster.length > 0 && (
                      <div className="ap-roller-kart-sayfa-satir">
                        {goster.map((modul) => (
                          <span key={modul.prefix} className="ap-roller-kart-sayfa-chip">
                            {modul.ikon ? `${modul.ikon} ` : ''}
                            {modul.ad}
                          </span>
                        ))}
                        {kalan > 0 && (
                          <span className="ap-roller-kart-sayfa-chip ap-roller-kart-sayfa-chip--daha">
                            +{kalan} sayfa
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
                <span className="ap-roller-kart-sayi">
                  {rolModulErisimSayisi(rol)} sayfa · {rolModulYetkiSayisi(rol)} yetki
                </span>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
