import { DEMO_SIPARIS_OZET } from './demoVeri';

export function SiparisOzetKartlari() {
  const o = DEMO_SIPARIS_OZET;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="ap-panel-kart">
        <div className="ap-panel-kart-icerik">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="ap-heading text-sm font-bold">Sipariş Bilgileri</h3>
          </div>
          <dl className="dg-ozet-liste space-y-2 text-sm">
            <OzetSatir etiket="Sipariş No" deger={o.siparisNo} />
            <OzetSatir etiket="Sipariş Tarihi" deger={o.siparisTarihi} />
            <OzetSatir etiket="Sipariş Veren" deger={`${o.siparisVeren.ad} · ${o.siparisVeren.telefon}`} />
            <div className="flex items-center justify-between gap-2">
              <dt className="ap-muted">Sipariş Durumu</dt>
              <dd>
                <span className="dg-etiket dg-etiket--mor">🕐 {o.durum}</span>
              </dd>
            </div>
            <OzetSatir etiket="Ödeme Şekli" deger={o.odeme} />
            <div className="pt-1">
              <dt className="ap-muted text-xs">Sipariş Tutarı</dt>
              <dd className="ap-heading mt-0.5 text-2xl font-bold" style={{ color: 'var(--ap-accent)' }}>
                {o.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ap-panel-kart">
        <div className="ap-panel-kart-icerik">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">👤</span>
            <h3 className="ap-heading text-sm font-bold">Müşteri Bilgileri</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <OzetSatir etiket="M. Tipi" deger={o.musteri.tip} />
            <OzetSatir etiket="M. Kodu" deger={o.musteri.kod} />
            <OzetSatir etiket="Ünvan" deger={o.musteri.unvan} vurgu />
            <OzetSatir etiket="Telefon" deger={o.musteri.telefon} />
            <OzetSatir etiket="E-Posta" deger={o.musteri.eposta} />
            <OzetSatir etiket="T.C. Kimlik No" deger={o.musteri.tc} />
          </dl>
        </div>
      </div>

      <div className="ap-panel-kart">
        <div className="ap-panel-kart-icerik">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h3 className="ap-heading text-sm font-bold">Teslimat Bilgileri</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="ap-muted mb-1 text-xs font-semibold uppercase tracking-wide">Teslimat Adresi</p>
              <p className="ap-heading font-medium">{o.teslimat.adres}</p>
              <p className="ap-muted">{o.teslimat.ilceIl}</p>
            </div>
            <div>
              <p className="ap-muted mb-1 text-xs font-semibold uppercase tracking-wide">Fatura Adresi</p>
              <p className="ap-heading font-medium">{o.fatura.adres}</p>
              <p className="ap-muted">{o.fatura.ilceIl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OzetSatir({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="ap-muted shrink-0">{etiket}</dt>
      <dd className={`text-right${vurgu ? ' ap-heading font-semibold' : ''}`}>{deger}</dd>
    </div>
  );
}
