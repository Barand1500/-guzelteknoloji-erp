import { useMemo, useState } from 'react';
import type { AdminDepo, AdminKasa, AdminSube } from '@/admin/baslat-menusu/tanimlar/tipler';
import type { TanimModalHedef } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitModal';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

type DuzenleHoverHedef = Extract<TanimModalHedef, { mod: 'duzenle' }>;

interface SubelerPaneliProps {
  subeler: AdminSube[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
  yatayKart?: boolean;
  firmaAdi?: string;
  eklemeVar: boolean;
  duzenlemeVar: boolean;
  silmeVar: boolean;
  firmaPasif: boolean;
  onKayitHover?: (hedef: DuzenleHoverHedef | null) => void;
  onSubeEkle: () => void;
  onSubeDuzenle: (s: AdminSube) => void;
  onSubeSil: (s: AdminSube) => void;
  onDepoEkle: (subeId: string) => void;
  onKasaEkle: (subeId: string) => void;
  onDepoDuzenle: (d: AdminDepo) => void;
  onKasaDuzenle: (k: AdminKasa) => void;
  onDepoSil: (d: AdminDepo) => void;
  onKasaSil: (k: AdminKasa) => void;
}

export function SubelerPaneli({
  subeler,
  depolar,
  kasalar,
  yatayKart = false,
  firmaAdi,
  eklemeVar,
  duzenlemeVar,
  silmeVar,
  firmaPasif,
  onKayitHover,
  onSubeEkle,
  onSubeDuzenle,
  onSubeSil,
  onDepoEkle,
  onKasaEkle,
  onDepoDuzenle,
  onKasaDuzenle,
  onDepoSil,
  onKasaSil,
}: SubelerPaneliProps) {
  const [sorgu, setSorgu] = useState('');
  const [acikIdler, setAcikIdler] = useState<Set<string>>(() => new Set());

  const filtreli = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase('tr');
    if (!q) return subeler;
    return subeler.filter(
      (s) =>
        s.subeAdi.toLocaleLowerCase('tr').includes(q) ||
        s.subeKodu.toLocaleLowerCase('tr').includes(q)
    );
  }, [subeler, sorgu]);

  const depoBySube = useMemo(() => {
    const m = new Map<string, AdminDepo[]>();
    for (const d of depolar) {
      const liste = m.get(d.subeId) ?? [];
      liste.push(d);
      m.set(d.subeId, liste);
    }
    return m;
  }, [depolar]);

  const kasaBySube = useMemo(() => {
    const m = new Map<string, AdminKasa[]>();
    for (const k of kasalar) {
      const liste = m.get(k.subeId) ?? [];
      liste.push(k);
      m.set(k.subeId, liste);
    }
    return m;
  }, [kasalar]);

  function acikMi(id: string) {
    return yatayKart || acikIdler.has(id);
  }

  function toggle(id: string) {
    setAcikIdler((onceki) => {
      const sonraki = new Set(onceki);
      if (sonraki.has(id)) sonraki.delete(id);
      else sonraki.add(id);
      return sonraki;
    });
  }

  const ekleKapali = !eklemeVar || firmaPasif;

  return (
    <div className="ap-tanimlar-hiyerarsi">
      <div className="ap-tanimlar-hiyerarsi-ust">
        <input
          type="search"
          className="ap-tanimlar-hiyerarsi-arama"
          placeholder="Şube ara…"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          aria-label="Şube ara"
        />
        {eklemeVar ? (
          <button
            type="button"
            className="ap-tanimlar-ekle-tus ap-tanimlar-ekle-tus--birincil"
            disabled={firmaPasif}
            onClick={onSubeEkle}
            title={firmaPasif ? 'Pasif firmaya şube eklenemez' : 'Yeni şube'}
          >
            Yeni Şube
          </button>
        ) : null}
      </div>

      {filtreli.length === 0 ? (
        <p className="ap-tanimlar-firma-bos">
          {subeler.length === 0 ? 'Bu firmada şube yok — Yeni Şube ile ekleyin' : 'Şube bulunamadı'}
        </p>
      ) : (
        <ul className={`ap-tanimlar-sube-liste${yatayKart ? ' ap-tanimlar-sube-liste--yatay' : ''}`}>
          {filtreli.map((s) => {
            const acik = acikMi(s.id);
            const subeDepolari = depoBySube.get(s.id) ?? [];
            const subeKasalari = kasaBySube.get(s.id) ?? [];
            const altSayi = subeDepolari.length + subeKasalari.length;
            const subeHover: DuzenleHoverHedef = { tip: 'sube', mod: 'duzenle', kayit: s };
            return (
              <li
                key={s.id}
                className={`ap-tanimlar-sube-kart${yatayKart ? ' ap-tanimlar-sube-kart--yatay' : ''}${!s.aktif ? ' ap-tanimlar-sube-kart--pasif' : ''}`}
                title={duzenlemeVar ? 'G: düzenle' : undefined}
                onMouseEnter={() => onKayitHover?.(subeHover)}
                onMouseLeave={() => onKayitHover?.(null)}
              >
                <div className="ap-tanimlar-sube-satir">
                  {!yatayKart ? (
                    <button
                      type="button"
                      className="ap-tanimlar-sube-ac"
                      onClick={() => toggle(s.id)}
                      aria-expanded={acik}
                      title={acik ? 'Daralt' : 'Depo / kasa göster'}
                    >
                      <span aria-hidden>{acik ? '▾' : '▸'}</span>
                    </button>
                  ) : null}
                  <div className="ap-tanimlar-sube-bilgi">
                    {firmaAdi ? (
                      <>
                        <span className="ap-tanimlar-sube-ad">{firmaAdi}</span>
                        <span className="ap-tanimlar-sube-meta">
                          {s.subeAdi}
                          {s.subeKodu ? ` · (${s.subeKodu})` : ''}
                          {!s.aktif ? ' · Pasif' : ''}
                          {altSayi > 0 ? ` · ${altSayi} kayıt` : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="ap-tanimlar-sube-ad">{s.subeAdi}</span>
                        <span className="ap-tanimlar-sube-meta">
                          {s.subeKodu ? `(${s.subeKodu})` : ''}
                          {!s.aktif ? ' · Pasif' : ''}
                          {altSayi > 0 ? ` · ${altSayi} kayıt` : ''}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="ap-tanimlar-sube-aksiyon">
                    <div className="ap-tanimlar-ekle-grup">
                      {/* Liste: üstte; yatay kart: depo/kasa satır çizgisinde */}
                      {!yatayKart && !ekleKapali && s.aktif ? (
                        <>
                          <button
                            type="button"
                            className="ap-tanimlar-satir-alt-tus"
                            onClick={() => onDepoEkle(s.id)}
                          >
                            + Depo
                          </button>
                          <button
                            type="button"
                            className="ap-tanimlar-satir-alt-tus"
                            onClick={() => onKasaEkle(s.id)}
                          >
                            + Kasa
                          </button>
                        </>
                      ) : null}
                    </div>
                    <div className="ap-tanimlar-ikon-grup">
                      {duzenlemeVar ? (
                        <button
                          type="button"
                          className="ap-tanimlar-ikon-tus"
                          title="Düzenle"
                          aria-label={`${s.subeAdi} düzenle`}
                          onClick={() => onSubeDuzenle(s)}
                        >
                          <DgIkon ad="duzenle" />
                        </button>
                      ) : (
                        <span className="ap-tanimlar-ikon-bos" aria-hidden />
                      )}
                      {silmeVar ? (
                        <button
                          type="button"
                          className="ap-tanimlar-ikon-tus ap-tanimlar-ikon-tus--tehlike"
                          title="Sil"
                          aria-label={`${s.subeAdi} sil`}
                          onClick={() => onSubeSil(s)}
                        >
                          <DgIkon ad="sil" />
                        </button>
                      ) : (
                        <span className="ap-tanimlar-ikon-bos" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>

                {acik ? (
                  <div className="ap-tanimlar-sube-alt">
                    {subeDepolari.length === 0 && subeKasalari.length === 0 ? (
                      yatayKart && !ekleKapali && s.aktif ? (
                        <div className="ap-tanimlar-alt-aksiyon ap-tanimlar-alt-aksiyon--ekle">
                          <button
                            type="button"
                            className="ap-tanimlar-satir-alt-tus"
                            onClick={() => onDepoEkle(s.id)}
                          >
                            + Depo
                          </button>
                          <button
                            type="button"
                            className="ap-tanimlar-satir-alt-tus"
                            onClick={() => onKasaEkle(s.id)}
                          >
                            + Kasa
                          </button>
                        </div>
                      ) : (
                        <p className="ap-tanimlar-sube-alt-bos">
                          {!ekleKapali && s.aktif
                            ? 'Depo / kasa yok — yukarıdan ekleyin'
                            : 'Depo / kasa yok'}
                        </p>
                      )
                    ) : (
                      <>
                        {subeDepolari.map((d, depoIdx) => (
                          <div
                            key={d.id}
                            className={`ap-tanimlar-alt-satir${!d.aktif ? ' ap-tanimlar-alt-satir--pasif' : ''}`}
                            title={duzenlemeVar ? 'G: düzenle' : undefined}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              onKayitHover?.({ tip: 'depo', mod: 'duzenle', kayit: d });
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              onKayitHover?.(subeHover);
                            }}
                          >
                            <span className="ap-tanimlar-alt-tip">Depo</span>
                            <span className="ap-tanimlar-alt-ad">
                              {d.depoAdi}
                              <span className="ap-tanimlar-alt-kod">({d.depoKodu})</span>
                            </span>
                            <span
                              className={`ap-tanimlar-alt-aksiyon${
                                yatayKart
                                  ? ' ap-tanimlar-cizgi-aksiyon ap-tanimlar-cizgi-aksiyon--satir'
                                  : ''
                              }`}
                            >
                              <span className="ap-tanimlar-ekle-grup">
                                {yatayKart && !ekleKapali && s.aktif && depoIdx === 0 ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-satir-alt-tus"
                                    onClick={() => onDepoEkle(s.id)}
                                  >
                                    + Depo
                                  </button>
                                ) : null}
                              </span>
                              <span className="ap-tanimlar-ikon-grup">
                                {duzenlemeVar ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-ikon-tus"
                                    onClick={() => onDepoDuzenle(d)}
                                    title="Düzenle"
                                    aria-label={`${d.depoAdi} düzenle`}
                                  >
                                    <DgIkon ad="duzenle" />
                                  </button>
                                ) : (
                                  <span className="ap-tanimlar-ikon-bos" aria-hidden />
                                )}
                                {silmeVar ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-ikon-tus ap-tanimlar-ikon-tus--tehlike"
                                    onClick={() => onDepoSil(d)}
                                    title="Sil"
                                    aria-label={`${d.depoAdi} sil`}
                                  >
                                    <DgIkon ad="sil" />
                                  </button>
                                ) : (
                                  <span className="ap-tanimlar-ikon-bos" aria-hidden />
                                )}
                              </span>
                            </span>
                          </div>
                        ))}
                        {subeKasalari.map((k, kasaIdx) => (
                          <div
                            key={k.id}
                            className={`ap-tanimlar-alt-satir${!k.aktif ? ' ap-tanimlar-alt-satir--pasif' : ''}`}
                            title={duzenlemeVar ? 'G: düzenle' : undefined}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              onKayitHover?.({ tip: 'kasa', mod: 'duzenle', kayit: k });
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              onKayitHover?.(subeHover);
                            }}
                          >
                            <span className="ap-tanimlar-alt-tip ap-tanimlar-alt-tip--kasa">
                              Kasa
                            </span>
                            <span className="ap-tanimlar-alt-ad">
                              {k.kasaAdi}
                              <span className="ap-tanimlar-alt-kod">({k.kasaKodu})</span>
                            </span>
                            <span
                              className={`ap-tanimlar-alt-aksiyon${
                                yatayKart
                                  ? ' ap-tanimlar-cizgi-aksiyon ap-tanimlar-cizgi-aksiyon--satir'
                                  : ''
                              }`}
                            >
                              <span className="ap-tanimlar-ekle-grup">
                                {yatayKart && !ekleKapali && s.aktif && kasaIdx === 0 ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-satir-alt-tus"
                                    onClick={() => onKasaEkle(s.id)}
                                  >
                                    + Kasa
                                  </button>
                                ) : null}
                              </span>
                              <span className="ap-tanimlar-ikon-grup">
                                {duzenlemeVar ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-ikon-tus"
                                    onClick={() => onKasaDuzenle(k)}
                                    title="Düzenle"
                                    aria-label={`${k.kasaAdi} düzenle`}
                                  >
                                    <DgIkon ad="duzenle" />
                                  </button>
                                ) : (
                                  <span className="ap-tanimlar-ikon-bos" aria-hidden />
                                )}
                                {silmeVar ? (
                                  <button
                                    type="button"
                                    className="ap-tanimlar-ikon-tus ap-tanimlar-ikon-tus--tehlike"
                                    onClick={() => onKasaSil(k)}
                                    title="Sil"
                                    aria-label={`${k.kasaAdi} sil`}
                                  >
                                    <DgIkon ad="sil" />
                                  </button>
                                ) : (
                                  <span className="ap-tanimlar-ikon-bos" aria-hidden />
                                )}
                              </span>
                            </span>
                          </div>
                        ))}
                        {yatayKart && !ekleKapali && s.aktif && subeDepolari.length === 0 ? (
                          <div className="ap-tanimlar-alt-aksiyon ap-tanimlar-alt-aksiyon--ekle">
                            <button
                              type="button"
                              className="ap-tanimlar-satir-alt-tus"
                              onClick={() => onDepoEkle(s.id)}
                            >
                              + Depo
                            </button>
                          </div>
                        ) : null}
                        {yatayKart && !ekleKapali && s.aktif && subeKasalari.length === 0 ? (
                          <div className="ap-tanimlar-alt-aksiyon ap-tanimlar-alt-aksiyon--ekle">
                            <button
                              type="button"
                              className="ap-tanimlar-satir-alt-tus"
                              onClick={() => onKasaEkle(s.id)}
                            >
                              + Kasa
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
