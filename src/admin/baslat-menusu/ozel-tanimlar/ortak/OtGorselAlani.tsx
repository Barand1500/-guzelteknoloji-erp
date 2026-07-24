import { useRef, useState, type DragEvent } from 'react';

/** Dosya seç / sürükle-bırak / link ile görsel */
export function OtGorselAlani({
  deger,
  onChange,
}: {
  deger: string;
  onChange: (url: string) => void;
}) {
  const dosyaRef = useRef<HTMLInputElement>(null);
  const [surukle, setSurukle] = useState(false);
  const [link, setLink] = useState('');
  const [hata, setHata] = useState('');

  function dosyaOku(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHata('Yalnızca görsel dosyası seçilebilir.');
      return;
    }
    if (file.size > 800_000) {
      setHata('Görsel en fazla 800 KB olabilir.');
      return;
    }
    setHata('');
    const okuyucu = new FileReader();
    okuyucu.onload = () => {
      if (typeof okuyucu.result === 'string') onChange(okuyucu.result);
    };
    okuyucu.readAsDataURL(file);
  }

  function birak(e: DragEvent) {
    e.preventDefault();
    setSurukle(false);
    dosyaOku(e.dataTransfer.files?.[0]);
  }

  function linkUygula() {
    const u = link.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u) && !u.startsWith('data:image/')) {
      setHata('Geçerli bir http(s) veya data:image bağlantısı girin.');
      return;
    }
    setHata('');
    onChange(u);
    setLink('');
  }

  return (
    <div className="ot-gorsel">
      {deger ? (
        <div className="ot-gorsel-onizleme">
          <img src={deger} alt="" className="ot-gorsel-img" />
          <button type="button" className="ot-gorsel-kaldir" onClick={() => onChange('')}>
            Kaldır
          </button>
        </div>
      ) : (
        <div
          className={`ot-gorsel-drop${surukle ? ' ot-gorsel-drop-aktif' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setSurukle(true);
          }}
          onDragLeave={() => setSurukle(false)}
          onDrop={birak}
          onClick={() => dosyaRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              dosyaRef.current?.click();
            }
          }}
        >
          <p className="ot-gorsel-drop-baslik">Görsel seçin veya sürükleyip bırakın</p>
          <p className="ot-gorsel-drop-alt">PNG, JPG, SVG · en fazla 800 KB</p>
        </div>
      )}

      <input
        ref={dosyaRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          dosyaOku(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="ot-gorsel-link-satir">
        <input
          className="ot-pb-girdi"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="veya görsel linki yapıştırın (https://…)"
          aria-label="Görsel linki"
        />
        <button type="button" className="ot-gorsel-link-btn" onClick={linkUygula} disabled={!link.trim()}>
          Ekle
        </button>
      </div>

      {hata ? <p className="ot-form-hata">{hata}</p> : null}
    </div>
  );
}
