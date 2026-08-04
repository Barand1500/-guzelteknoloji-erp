import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import { BaslatMenuIkon } from '@/admin/kabuk/baslat-menusu/baslatMenuIkonlar';
import { modulBul } from '@/admin/veri/adminMenuYapisi';
import { useAuth } from '@/baglamlar/AuthContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import { tooltipMetni } from '@/araclar/tooltipMetni';

interface FavoriSayfalarPaneliProps {
  acik: boolean;
  onKapat: () => void;
  focusModulId?: string;
  onModulAc: (modulId: string) => void;
}

function YildizIkon({ dolu }: { dolu: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9 6.75 19.7l1-5.85L3.5 9.7l5.9-.9L12 3.5z"
        fill={dolu ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriSayfalarPaneli({
  acik,
  onKapat,
  focusModulId,
  onModulAc,
}: FavoriSayfalarPaneliProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useAksiyonCubuguPanelSync(acik, panelRef);
  const { t } = usePanelDil();
  const { kullanici, hizliErisimKaydet } = useAuth();
  const kayitli = kullanici?.tercihler?.dashboardHizliErisim;
  const [favoriler, setFavoriler] = useState<string[]>(() => kayitli ?? []);
  const [suruklenenId, setSuruklenenId] = useState<string | null>(null);
  const [hedefId, setHedefId] = useState<string | null>(null);

  useEffect(() => {
    setFavoriler(kayitli ?? []);
  }, [kayitli]);

  useEffect(() => {
    if (!acik) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKapat();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [acik, onKapat]);

  useEffect(() => {
    if (!acik) return;
    const disari = (e: MouseEvent) => {
      const wrap = panelRef.current?.closest('.ap-favori-sayfalar-wrap');
      if (wrap && !wrap.contains(e.target as Node)) onKapat();
    };
    document.addEventListener('mousedown', disari);
    return () => document.removeEventListener('mousedown', disari);
  }, [acik, onKapat]);

  async function kaydet(ids: string[]) {
    setFavoriler(ids);
    try {
      await hizliErisimKaydet(ids);
    } catch {
      setFavoriler(kullanici?.tercihler?.dashboardHizliErisim ?? []);
    }
  }

  const aktifModul = focusModulId ? modulBul(focusModulId) : undefined;
  const aktifFavori = Boolean(aktifModul && favoriler.includes(aktifModul.id));

  function favoriToggle(modulId: string) {
    if (favoriler.includes(modulId)) {
      void kaydet(favoriler.filter((id) => id !== modulId));
    } else {
      void kaydet([...favoriler, modulId]);
    }
  }

  function tasi(kaynakId: string, hedefModulId: string) {
    if (kaynakId === hedefModulId) return;
    const onceki = [...favoriler];
    const from = onceki.indexOf(kaynakId);
    const to = onceki.indexOf(hedefModulId);
    if (from < 0 || to < 0) return;
    onceki.splice(from, 1);
    onceki.splice(to, 0, kaynakId);
    void kaydet(onceki);
  }

  function birAdimTasi(modulId: string, yon: -1 | 1) {
    const i = favoriler.indexOf(modulId);
    const j = i + yon;
    if (i < 0 || j < 0 || j >= favoriler.length) return;
    const kopya = [...favoriler];
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
    void kaydet(kopya);
  }

  function onDragStart(e: DragEvent, id: string) {
    setSuruklenenId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function onDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== hedefId) setHedefId(id);
  }

  function onDrop(e: DragEvent, id: string) {
    e.preventDefault();
    const kaynak = e.dataTransfer.getData('text/plain') || suruklenenId;
    if (kaynak) tasi(kaynak, id);
    setSuruklenenId(null);
    setHedefId(null);
  }

  function onDragEnd() {
    setSuruklenenId(null);
    setHedefId(null);
  }

  if (!acik) return null;

  const favoriModuller = favoriler
    .map((id) => modulBul(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div
      ref={panelRef}
      className="ap-favori-panel ap-favori-panel--kenarlik-anim"
      role="dialog"
      aria-label="Favori sayfalar"
    >
      <div className="ap-favori-panel-baslik">
        <h3>Favori Sayfalar</h3>
        <button
          type="button"
          className="ap-favori-panel-kapat"
          onClick={onKapat}
          title={tooltipMetni('Kapat')}
          aria-label="Kapat"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {aktifModul ? (
        <div className="ap-favori-aktif">
          <BaslatMenuIkon modulId={aktifModul.id} boyut={16} />
          <span className="ap-favori-aktif-ad" title={t(`modul.${aktifModul.id}`, aktifModul.baslik)}>
            {t(`modul.${aktifModul.id}`, aktifModul.baslik)}
          </span>
          <button
            type="button"
            className={`ap-favori-yildiz${aktifFavori ? ' ap-favori-yildiz--aktif' : ''}`}
            onClick={() => favoriToggle(aktifModul.id)}
            title={tooltipMetni(aktifFavori ? 'Favorilerden çıkar' : 'Favorilere ekle')}
            aria-label={aktifFavori ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            aria-pressed={aktifFavori}
          >
            <YildizIkon dolu={aktifFavori} />
          </button>
        </div>
      ) : (
        <p className="ap-favori-aktif-bos">Açık bir sayfa yok</p>
      )}

      <div className="ap-favori-liste-baslik">Favoriler</div>
      <div className="ap-favori-liste">
        {favoriModuller.length === 0 ? (
          <p className="ap-favori-bos">Henüz favori yok. Üstteki yıldız ile ekleyin.</p>
        ) : (
          <ul className="ap-favori-liste-ul">
            {favoriModuller.map((modul, index) => {
              const ad = t(`modul.${modul.id}`, modul.baslik);
              return (
                <li
                  key={modul.id}
                  className={`ap-favori-satir${suruklenenId === modul.id ? ' ap-favori-satir--surukleniyor' : ''}${
                    hedefId === modul.id && suruklenenId !== modul.id ? ' ap-favori-satir--hedef' : ''
                  }`}
                  draggable
                  onDragStart={(e) => onDragStart(e, modul.id)}
                  onDragOver={(e) => onDragOver(e, modul.id)}
                  onDrop={(e) => onDrop(e, modul.id)}
                  onDragEnd={onDragEnd}
                >
                  <span className="ap-favori-surukle" title={tooltipMetni('Sürükle')} aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <circle cx="9" cy="7" r="1.25" />
                      <circle cx="15" cy="7" r="1.25" />
                      <circle cx="9" cy="12" r="1.25" />
                      <circle cx="15" cy="12" r="1.25" />
                      <circle cx="9" cy="17" r="1.25" />
                      <circle cx="15" cy="17" r="1.25" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    className="ap-favori-satir-ac"
                    onClick={() => {
                      onModulAc(modul.id);
                      onKapat();
                    }}
                  >
                    <BaslatMenuIkon modulId={modul.id} boyut={15} />
                    <span className="ap-favori-satir-ad">{ad}</span>
                  </button>
                  <div className="ap-favori-sira">
                    <button
                      type="button"
                      className="ap-favori-sira-btn"
                      disabled={index === 0}
                      onClick={() => birAdimTasi(modul.id, -1)}
                      title={tooltipMetni('Yukarı')}
                      aria-label={`${ad} yukarı`}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="ap-favori-sira-btn"
                      disabled={index === favoriModuller.length - 1}
                      onClick={() => birAdimTasi(modul.id, 1)}
                      title={tooltipMetni('Aşağı')}
                      aria-label={`${ad} aşağı`}
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    type="button"
                    className="ap-favori-yildiz ap-favori-yildiz--aktif ap-favori-yildiz--kucuk"
                    onClick={() => favoriToggle(modul.id)}
                    title={tooltipMetni('Favorilerden çıkar')}
                    aria-label={`${ad} favorilerden çıkar`}
                  >
                    <YildizIkon dolu />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
