import type { RefObject } from 'react';
import { korunmusRolMu } from '@/admin/ortak/panelRolYardimci';
import { tooltipMetni } from '@/araclar/tooltipMetni';
import {
  YETKI_ETIKETLERI,
  type RolTanimi,
  type YetkiKodu,
  type YetkiTanimi,
} from '@/admin/baslat-menusu/musteri-ajans/roller/api';

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

interface RolMatrisiProps {
  roller: RolTanimi[];
  yetkiler: YetkiTanimi[];
  duzenlenebilir?: boolean;
  yeniRolKodlari?: ReadonlySet<string>;
  sarmalRef?: RefObject<HTMLDivElement | null>;
  onYetkiToggle?: (rolKod: string, yetkiKod: YetkiKodu) => void;
  onRolAlanDegis?: (rolKod: string, alan: 'baslik' | 'aciklama', deger: string) => void;
  onRolBaslikBlur?: (rolKod: string, baslik: string) => void;
  onYeniRolIptal?: (rolKod: string) => void;
}

export function RolMatrisi({
  roller,
  yetkiler,
  duzenlenebilir,
  yeniRolKodlari,
  sarmalRef,
  onYetkiToggle,
  onRolAlanDegis,
  onRolBaslikBlur,
  onYeniRolIptal,
}: RolMatrisiProps) {
  const sonYeniKod = yeniRolKodlari ? [...yeniRolKodlari].at(-1) : undefined;

  return (
    <div className="ap-roller-matris-sarmal" ref={sarmalRef}>
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
                  const varMi = rol.yetkiler.includes(y.kod);
                  const sinif = `ap-roller-yetki-hucre ap-roller-yetki--${y.kod}${varMi ? ' ap-roller-yetki-hucre--aktif' : ''}${!hucreDuzenlenebilir ? ' ap-roller-yetki-hucre--salt' : ''}`;

                  if (hucreDuzenlenebilir) {
                    return (
                      <td key={y.kod}>
                        <button
                          type="button"
                          onClick={() => onYetkiToggle?.(rol.kod, y.kod)}
                          className={sinif}
                          title={tooltipMetni(varMi ? 'Yetkiyi kaldır' : 'Yetki ver')}
                          aria-pressed={varMi}
                          aria-label={`${rol.baslik} — ${y.etiket}`}
                        >
                          {varMi ? '✓' : '·'}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={y.kod}>
                      <span className={sinif} aria-hidden>
                        {varMi ? '✓' : '·'}
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
  seciliKod: string | null;
  duzenlenebilir?: boolean;
  yeniKartKodlari?: ReadonlySet<string>;
  onSec?: (rol: RolTanimi) => void;
  onDuzenle?: (rol: RolTanimi) => void;
  onRolAlanDegis?: (rolKod: string, alan: 'baslik' | 'aciklama', deger: string) => void;
  onRolBaslikBlur?: (rolKod: string, baslik: string) => void;
  onYeniRolIptal?: (rolKod: string) => void;
}

export function RolKartlari({
  roller,
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
                  {rol.yetkiler.map((y) => (
                    <span key={y} className={`ap-roller-yetki-etiket ap-roller-yetki-etiket--${y}`}>
                      {YETKI_IKONLARI[y]} {YETKI_ETIKETLERI[y] ?? y.replace(/_/g, ' ')}
                    </span>
                  ))}
                  <span className="ap-roller-kart-sayi">Yetkileri matristen işaretleyin</span>
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
              <div>
                <h3 className="ap-roller-kart-baslik">{rol.baslik}</h3>
                <div className="ap-roller-rol-kod">{rol.kod}</div>
              </div>
              {rol.aciklama && <p className="ap-roller-kart-aciklama">{rol.aciklama}</p>}
              <div className="ap-roller-kart-alt">
                {sistemRolu && (
                  <span className="ap-roller-sistem-rozet">
                    <span aria-hidden>🔒</span> Sistem
                  </span>
                )}
                {rol.yetkiler.map((y) => (
                  <span key={y} className={`ap-roller-yetki-etiket ap-roller-yetki-etiket--${y}`}>
                    {YETKI_IKONLARI[y]} {YETKI_ETIKETLERI[y] ?? y.replace(/_/g, ' ')}
                  </span>
                ))}
                <span className="ap-roller-kart-sayi">{rol.yetkiler.length} yetki</span>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
