import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminAramaKutusu } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  BELGE_NEVILERI_GUNCELLENDI,
  BELGE_YON_SECENEKLERI,
  belgeNeviEkle,
  belgeNeviGuncelle,
  belgeNeviSil,
  belgeNevileriGetir,
  belgeYonEtiketi,
  type BelgeNevi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import {
  OT_SAYFA_SECENEKLERI,
  OtIslemButonlari,
  OtSayfalama,
  otSayfaDilimleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtListeOrtak';
import { OtOutlinedAcilir, OtOutlinedGirdi } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';
import { belgeTurEtiketi, type BelgeTur, type BelgeYon } from '@/admin/baslat-menusu/erp/belgeler/tipler';

const TUR_SECENEKLERI = (['SIPARIS', 'IRSALIYE', 'FATURA', 'IADE'] as BelgeTur[]).map((t) => ({
  value: t,
  label: belgeTurEtiketi(t),
}));

const YON_SECENEKLERI = BELGE_YON_SECENEKLERI;

export function BelgeNevileriListeSayfasi() {
  const [liste, setListe] = useState<BelgeNevi[]>(() => belgeNevileriGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<BelgeNevi | null>(null);
  const [silinecek, setSilinecek] = useState<BelgeNevi | null>(null);
  const [adi, setAdi] = useState('');
  const [yon, setYon] = useState<BelgeYon>('ALIS');
  const [varsayilanTur, setVarsayilanTur] = useState<BelgeTur>('FATURA');
  const [hata, setHata] = useState('');

  const yenile = useCallback(() => setListe(belgeNevileriGetir()), []);

  useEffect(() => {
    const h = () => yenile();
    window.addEventListener(BELGE_NEVILERI_GUNCELLENDI, h);
    return () => window.removeEventListener(BELGE_NEVILERI_GUNCELLENDI, h);
  }, [yenile]);

  useEffect(() => {
    if (!modalAcik) return;
    setHata('');
    setAdi(duzenlenen?.adi ?? '');
    setYon(duzenlenen?.yon ?? 'ALIS');
    setVarsayilanTur(duzenlenen?.varsayilanTur ?? 'FATURA');
  }, [modalAcik, duzenlenen]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter(
      (t) =>
        t.adi.toLocaleLowerCase('tr').includes(q) ||
        t.kod.toLocaleLowerCase('tr').includes(q) ||
        t.yon.toLocaleLowerCase('tr').includes(q)
    );
  }, [liste, arama]);

  useEffect(() => setSayfa(1), [arama, sayfaBoyutu]);

  const { toplamSayfa, guvenliSayfa, baslangic, kayitlar, bitis } = otSayfaDilimleri(
    filtrelenen,
    sayfa,
    sayfaBoyutu
  );

  function kaydet(e: FormEvent) {
    e.preventDefault();
    if (duzenlenen) {
      if (
        !belgeNeviGuncelle(duzenlenen.id, {
          adi,
          yon: duzenlenen.sabit ? duzenlenen.yon : yon,
          varsayilanTur,
          aktif: true,
        })
      ) {
        setHata('Güncellenemedi. Ad / kod benzersiz olmalı.');
        return;
      }
    } else if (!belgeNeviEkle({ adi, yon, varsayilanTur, aktif: true })) {
      setHata('Eklenemedi. Ad / kod benzersiz olmalı.');
      return;
    }
    yenile();
    setModalAcik(false);
  }

  return (
    <div className="ot-pb-sayfa">
      <div className="ot-pb-kontroller">
        <label className="ot-pb-sayfa-boyutu">
          <select
            value={sayfaBoyutu}
            onChange={(e) => setSayfaBoyutu(Number(e.target.value))}
            className="ap-input"
          >
            {OT_SAYFA_SECENEKLERI.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ap-muted text-sm">veri göster</span>
        </label>
        <div className="ot-pb-kontroller-sag">
          <div className="ot-pb-arama">
            <AdminAramaKutusu deger={arama} onChange={setArama} placeholder="Ara" />
          </div>
          <button
            type="button"
            className="ot-btn-ekle"
            onClick={() => {
              setDuzenlenen(null);
              setModalAcik(true);
            }}
          >
            + Ekle
          </button>
        </div>
      </div>

      <div className="ot-pb-tablo-sarici">
        <table className="ot-pb-tablo">
          <thead>
            <tr>
              <th>Adı</th>
              <th>Belge türü</th>
              <th>Varsayılan tür</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.length === 0 ? (
              <tr>
                <td colSpan={4} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              kayitlar.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.adi}
                    {t.sabit ? <span className="ap-muted text-xs"> · sabit</span> : null}
                  </td>
                  <td>{belgeYonEtiketi(t.yon)}</td>
                  <td>{belgeTurEtiketi(t.varsayilanTur)}</td>
                  <td className="ot-pb-islem-td">
                    <OtIslemButonlari
                      onDuzenle={() => {
                        setDuzenlenen(t);
                        setModalAcik(true);
                      }}
                      onSil={
                        t.sabit
                          ? undefined
                          : () => {
                              setSilinecek(t);
                            }
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OtSayfalama
        baslangic={baslangic}
        bitis={bitis}
        toplam={filtrelenen.length}
        guvenliSayfa={guvenliSayfa}
        toplamSayfa={toplamSayfa}
        onSayfa={setSayfa}
      />

      <SistemModal
        acik={modalAcik}
        onKapat={() => setModalAcik(false)}
        baslik={duzenlenen ? 'Belge Nevi Düzenle' : 'Yeni Belge Nevi'}
        genislik="sm"
        footer={
          <SistemModalAksiyonlar>
            <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setModalAcik(false)}>
              Vazgeç
            </button>
            <button type="submit" form="belge-nevi-form" className="ap-btn-primary rounded-lg px-4 py-2 text-sm">
              Kaydet
            </button>
          </SistemModalAksiyonlar>
        }
      >
        <form id="belge-nevi-form" className="flex flex-col gap-3" onSubmit={kaydet}>
          <OtOutlinedGirdi
            etiket="Adı"
            deger={adi}
            onChange={setAdi}
            disabled={Boolean(duzenlenen?.sabit)}
            zorunlu
          />
          <OtOutlinedAcilir
            etiket="Belge türü (Giriş / Çıkış)"
            deger={yon}
            secenekler={YON_SECENEKLERI}
            onChange={(v) => setYon(v as BelgeYon)}
            disabled={Boolean(duzenlenen?.sabit)}
          />
          <OtOutlinedAcilir
            etiket="Varsayılan belge türü"
            deger={varsayilanTur}
            secenekler={TUR_SECENEKLERI}
            onChange={(v) => setVarsayilanTur(v as BelgeTur)}
          />
          {hata ? <p className="text-sm text-red-500">{hata}</p> : null}
          {duzenlenen?.sabit ? (
            <p className="ap-muted text-xs">Sabit nevilerin adı ve yönü değiştirilemez.</p>
          ) : null}
        </form>
      </SistemModal>

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) belgeNeviSil(silinecek.id);
          setSilinecek(null);
          yenile();
        }}
        baslik="Bu belge nevi silinsin mi?"
        hedefMetin={silinecek?.adi ?? ''}
        ariaLabel="Belge nevi silme onayı"
      />
    </div>
  );
}
