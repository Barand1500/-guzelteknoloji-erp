import { useMemo, useState } from 'react';
import type {
  AdminDepo,
  AdminFirma,
  AdminKasa,
  AdminSube,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import type { TanimModalHedef } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitModal';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

type DuzenleHoverHedef = Extract<TanimModalHedef, { mod: 'duzenle' }>;

interface FirmalarPaneliProps {
  firmalar: AdminFirma[];
  subeler: AdminSube[];
  depolar: AdminDepo[];
  kasalar: AdminKasa[];
  yatayKart?: boolean;
  eklemeVar: boolean;
  duzenlemeVar: boolean;
  silmeVar: boolean;
  onKayitHover?: (hedef: DuzenleHoverHedef | null) => void;
  onFirmaEkle: () => void;
  onFirmaDuzenle: (f: AdminFirma) => void;
  onFirmaSil: (f: AdminFirma) => void;
  onSubeEkle: (firmaId: string) => void;
  onSubeDuzenle: (s: AdminSube) => void;
  onSubeSil: (s: AdminSube) => void;
  onDepoEkle: (firmaId: string, subeId: string) => void;
  onKasaEkle: (firmaId: string, subeId: string) => void;
  onDepoDuzenle: (d: AdminDepo) => void;
  onKasaDuzenle: (k: AdminKasa) => void;
  onDepoSil: (d: AdminDepo) => void;
  onKasaSil: (k: AdminKasa) => void;
}

export function FirmalarPaneli({
  firmalar,
  subeler,
  depolar,
  kasalar,
  yatayKart = false,
  eklemeVar,
  duzenlemeVar,
  silmeVar,
  onKayitHover,
  onFirmaEkle,
  onFirmaDuzenle,
  onFirmaSil,
  onSubeEkle,
  onSubeDuzenle,
  onSubeSil,
  onDepoEkle,
  onKasaEkle,
  onDepoDuzenle,
  onKasaDuzenle,
  onDepoSil,
  onKasaSil,
}: FirmalarPaneliProps) {
  const [sorgu, setSorgu] = useState('');
  const [acikFirmaIdler, setAcikFirmaIdler] = useState<Set<string>>(() => new Set());
  const [acikSubeIdler, setAcikSubeIdler] = useState<Set<string>>(() => new Set());

  const filtreli = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase('tr');
    if (!q) return firmalar;
    return firmalar.filter(
      (f) =>
        f.firmaAdi.toLocaleLowerCase('tr').includes(q) ||
        f.firmaKodu.toLocaleLowerCase('tr').includes(q)
    );
  }, [firmalar, sorgu]);

  const subeByFirma = useMemo(() => {
    const m = new Map<string, AdminSube[]>();
    for (const s of subeler) {
      const liste = m.get(s.firmaId) ?? [];
      liste.push(s);
      m.set(s.firmaId, liste);
    }
    return m;
  }, [subeler]);

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

  function toggleFirma(id: string) {
    setAcikFirmaIdler((onceki) => {
      const sonraki = new Set(onceki);
      if (sonraki.has(id)) sonraki.delete(id);
      else sonraki.add(id);
      return sonraki;
    });
  }

  function toggleSube(id: string) {
    setAcikSubeIdler((onceki) => {
      const sonraki = new Set(onceki);
      if (sonraki.has(id)) sonraki.delete(id);
      else sonraki.add(id);
      return sonraki;
    });
  }

  return (
    <div className="ap-tanimlar-hiyerarsi">
      <div className="ap-tanimlar-hiyerarsi-ust">
        <input
          type="search"
          className="ap-tanimlar-hiyerarsi-arama"
          placeholder="Firma ara…"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          aria-label="Firma ara"
        />
        {eklemeVar ? (
          <button
            type="button"
            className="ap-tanimlar-ekle-tus ap-tanimlar-ekle-tus--birincil"
            onClick={onFirmaEkle}
            title="Yeni firma"
          >
            + Firma
          </button>
        ) : null}
      </div>

      {filtreli.length === 0 ? (
        <p className="ap-tanimlar-firma-bos">
          {firmalar.length === 0 ? 'Henüz firma yok — + Firma ile ekleyin' : 'Firma bulunamadı'}
        </p>
      ) : (
        <ul className={`ap-tanimlar-sube-liste${yatayKart ? ' ap-tanimlar-sube-liste--yatay' : ''}`}>
          {filtreli.map((f) => {
            const firmaAcik = yatayKart || acikFirmaIdler.has(f.id);
            const firmaSubeleri = subeByFirma.get(f.id) ?? [];
            const firmaHover: DuzenleHoverHedef = { tip: 'firma', mod: 'duzenle', kayit: f };
            return (
              <li
                key={f.id}
                className={`ap-tanimlar-sube-kart${yatayKart ? ' ap-tanimlar-sube-kart--yatay' : ''}${!f.aktif ? ' ap-tanimlar-sube-kart--pasif' : ''}`}
                title={duzenlemeVar ? 'G: düzenle' : undefined}
                onMouseEnter={() => onKayitHover?.(firmaHover)}
                onMouseLeave={() => onKayitHover?.(null)}
              >
                <div className="ap-tanimlar-sube-satir">
                  {!yatayKart ? (
                    <button
                      type="button"
                      className="ap-tanimlar-sube-ac"
                      onClick={() => toggleFirma(f.id)}
                      aria-expanded={firmaAcik}
                      title={firmaAcik ? 'Daralt' : 'Şubeleri göster'}
                    >
                      <span aria-hidden>{firmaAcik ? '▾' : '▸'}</span>
                    </button>
                  ) : null}
                  <div className="ap-tanimlar-sube-bilgi">
                    <span className="ap-tanimlar-sube-ad">{f.firmaAdi}</span>
                    <span className="ap-tanimlar-sube-meta">
                      {f.firmaKodu}
                      {!f.aktif ? ' · Pasif' : ''}
                      {firmaSubeleri.length > 0 ? ` · ${firmaSubeleri.length} şube` : ''}
                    </span>
                  </div>
                  <div className="ap-tanimlar-sube-aksiyon">
                    <div className="ap-tanimlar-ekle-grup">
                      {eklemeVar && f.aktif ? (
                        <button
                          type="button"
                          className="ap-tanimlar-satir-alt-tus"
                          onClick={() => onSubeEkle(f.id)}
                        >
                          + Şube
                        </button>
                      ) : null}
                    </div>
                    <div className="ap-tanimlar-ikon-grup">
                      {duzenlemeVar ? (
                        <button
                          type="button"
                          className="ap-tanimlar-ikon-tus"
                          title="Düzenle"
                          aria-label={`${f.firmaAdi} düzenle`}
                          onClick={() => onFirmaDuzenle(f)}
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
                          aria-label={`${f.firmaAdi} sil`}
                          onClick={() => onFirmaSil(f)}
                        >
                          <DgIkon ad="sil" />
                        </button>
                      ) : (
                        <span className="ap-tanimlar-ikon-bos" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>

                {firmaAcik ? (
                  <div className="ap-tanimlar-sube-alt">
                    {firmaSubeleri.length === 0 ? (
                      <p className="ap-tanimlar-sube-alt-bos">Şube yok — + Şube ile ekleyin</p>
                    ) : (
                      firmaSubeleri.map((s) => {
                        const subeAcik = yatayKart || acikSubeIdler.has(s.id);
                        const subeDepolari = depoBySube.get(s.id) ?? [];
                        const subeKasalari = kasaBySube.get(s.id) ?? [];
                        const altSayi = subeDepolari.length + subeKasalari.length;
                        const subeHover: DuzenleHoverHedef = {
                          tip: 'sube',
                          mod: 'duzenle',
                          kayit: s,
                        };
                        return (
                          <div
                            key={s.id}
                            className={`ap-tanimlar-firma-sube${!s.aktif ? ' ap-tanimlar-alt-satir--pasif' : ''}`}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              onKayitHover?.(subeHover);
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              onKayitHover?.(firmaHover);
                            }}
                          >
                            <div className="ap-tanimlar-alt-satir ap-tanimlar-alt-satir--ust">
                              {!yatayKart ? (
                                <button
                                  type="button"
                                  className="ap-tanimlar-sube-ac"
                                  onClick={() => toggleSube(s.id)}
                                  aria-expanded={subeAcik}
                                  title={subeAcik ? 'Daralt' : 'Depo / kasa göster'}
                                >
                                  <span aria-hidden>{subeAcik ? '▾' : '▸'}</span>
                                </button>
                              ) : null}
                              <span className="ap-tanimlar-alt-tip">Şube</span>
                              <span className="ap-tanimlar-alt-ad">
                                {s.subeAdi}
                                <span className="ap-tanimlar-alt-kod">
                                  {s.subeKodu}
                                  {altSayi > 0 ? ` · ${altSayi}` : ''}
                                </span>
                              </span>
                              <span className="ap-tanimlar-alt-aksiyon">
                                <span className="ap-tanimlar-ekle-grup">
                                  {eklemeVar && f.aktif && s.aktif ? (
                                    <>
                                      <button
                                        type="button"
                                        className="ap-tanimlar-satir-alt-tus"
                                        onClick={() => onDepoEkle(f.id, s.id)}
                                      >
                                        + Depo
                                      </button>
                                      <button
                                        type="button"
                                        className="ap-tanimlar-satir-alt-tus"
                                        onClick={() => onKasaEkle(f.id, s.id)}
                                      >
                                        + Kasa
                                      </button>
                                    </>
                                  ) : null}
                                </span>
                                <span className="ap-tanimlar-ikon-grup">
                                  {duzenlemeVar ? (
                                    <button
                                      type="button"
                                      className="ap-tanimlar-ikon-tus"
                                      title="Düzenle"
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
                                      onClick={() => onSubeSil(s)}
                                    >
                                      <DgIkon ad="sil" />
                                    </button>
                                  ) : (
                                    <span className="ap-tanimlar-ikon-bos" aria-hidden />
                                  )}
                                </span>
                              </span>
                            </div>

                            {subeAcik ? (
                              <div className="ap-tanimlar-firma-sube-alt">
                                {subeDepolari.length === 0 && subeKasalari.length === 0 ? (
                                  <p className="ap-tanimlar-sube-alt-bos">
                                    Depo / kasa yok
                                  </p>
                                ) : (
                                  <>
                                    {subeDepolari.map((d) => (
                                      <div
                                        key={d.id}
                                        className={`ap-tanimlar-alt-satir${!d.aktif ? ' ap-tanimlar-alt-satir--pasif' : ''}`}
                                        onMouseEnter={(e) => {
                                          e.stopPropagation();
                                          onKayitHover?.({
                                            tip: 'depo',
                                            mod: 'duzenle',
                                            kayit: d,
                                          });
                                        }}
                                        onMouseLeave={(e) => {
                                          e.stopPropagation();
                                          onKayitHover?.(subeHover);
                                        }}
                                      >
                                        <span className="ap-tanimlar-alt-tip">Depo</span>
                                        <span className="ap-tanimlar-alt-ad">
                                          {d.depoAdi}
                                          <span className="ap-tanimlar-alt-kod">{d.depoKodu}</span>
                                        </span>
                                        <span className="ap-tanimlar-alt-aksiyon">
                                          <span className="ap-tanimlar-ekle-grup" />
                                          <span className="ap-tanimlar-ikon-grup">
                                            {duzenlemeVar ? (
                                              <button
                                                type="button"
                                                className="ap-tanimlar-ikon-tus"
                                                onClick={() => onDepoDuzenle(d)}
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
                                    {subeKasalari.map((k) => (
                                      <div
                                        key={k.id}
                                        className={`ap-tanimlar-alt-satir${!k.aktif ? ' ap-tanimlar-alt-satir--pasif' : ''}`}
                                        onMouseEnter={(e) => {
                                          e.stopPropagation();
                                          onKayitHover?.({
                                            tip: 'kasa',
                                            mod: 'duzenle',
                                            kayit: k,
                                          });
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
                                          <span className="ap-tanimlar-alt-kod">{k.kasaKodu}</span>
                                        </span>
                                        <span className="ap-tanimlar-alt-aksiyon">
                                          <span className="ap-tanimlar-ekle-grup" />
                                          <span className="ap-tanimlar-ikon-grup">
                                            {duzenlemeVar ? (
                                              <button
                                                type="button"
                                                className="ap-tanimlar-ikon-tus"
                                                onClick={() => onKasaDuzenle(k)}
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
                                  </>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
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
