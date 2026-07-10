import { useCallback, useEffect, useMemo, useState } from 'react';

import {

  depoSil,

  donemSil,

  firmaSil,

  depolariGetir,

  donemleriGetir,

  firmalariGetir,

  kasaSil,

  kasalariGetir,

  subeSil,

  subeleriGetir,

  type TanimSilModu,

} from '@/admin/baslat-menusu/tanimlar/api';

import { DepoSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DepoSekme';

import { DonemSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/DonemSekme';

import { FirmaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/FirmaSekme';

import { KasaSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/KasaSekme';

import { SubeSekme } from '@/admin/baslat-menusu/tanimlar/bilesenler/SubeSekme';

import { TanimBagliSilOnayModal } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimBagliSilOnayModal';

import {

  TanimDurumRozeti,

  TanimKayitTablosu,

} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';

import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';

import { firmaEtiketi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFirmaSecici';

import {

  tanimBaglantiOzeti,

  tanimHedefMetni,


} from '@/admin/baslat-menusu/tanimlar/araclar/tanimBaglilari';

import type {

  AdminDepo,

  AdminDonem,

  AdminFirma,

  AdminKasa,

  AdminSube,

  TanimSekmeId,

} from '@/admin/baslat-menusu/tanimlar/tipler';

import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';

import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';

import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';

import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';



interface TanimKayitlarOzetiProps {

  onKurulumBaslat: () => void;

}



type DuzenleHedef = { tip: TanimSekmeId; id: string };



type SilmeHedef =

  | { tip: 'firma'; kayit: AdminFirma }

  | { tip: 'sube'; kayit: AdminSube }

  | { tip: 'depo'; kayit: AdminDepo }

  | { tip: 'kasa'; kayit: AdminKasa }

  | { tip: 'donem'; kayit: AdminDonem };



export function TanimKayitlarOzeti({ onKurulumBaslat }: TanimKayitlarOzetiProps) {

  const { firmaBagliPasifMi, subeBagliPasifMi } = useTanimFirmaDurumu();

  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();

  const [yukleniyor, setYukleniyor] = useState(true);

  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);

  const [subeler, setSubeler] = useState<AdminSube[]>([]);

  const [depolar, setDepolar] = useState<AdminDepo[]>([]);

  const [kasalar, setKasalar] = useState<AdminKasa[]>([]);

  const [donemler, setDonemler] = useState<AdminDonem[]>([]);

  const [duzenle, setDuzenle] = useState<DuzenleHedef | null>(null);

  const [silme, setSilme] = useState<SilmeHedef | null>(null);

  const [siliniyor, setSiliniyor] = useState(false);



  const veriSeti = useMemo(

    () => ({ firmalar, subeler, depolar, kasalar, donemler }),

    [firmalar, subeler, depolar, kasalar, donemler]

  );



  const yukle = useCallback(async () => {

    setYukleniyor(true);

    try {

      const [f, s, d, k, dn] = await Promise.all([

        firmalariGetir(),

        subeleriGetir(),

        depolariGetir(),

        kasalariGetir(),

        donemleriGetir(),

      ]);

      setFirmalar(f);

      setSubeler(s);

      setDepolar(d);

      setKasalar(k);

      setDonemler(dn);

    } finally {

      setYukleniyor(false);

    }

  }, []);



  useEffect(() => {

    void yukle();

  }, [yukle]);



  const duzenleKapat = useCallback(() => {

    setDuzenle(null);

    void yukle();

  }, [yukle]);



  const silmeAc = useCallback((hedef: SilmeHedef) => {

    setSilme(hedef);

  }, []);



  const silmeKapat = useCallback(() => {

    if (siliniyor) return;

    setSilme(null);

  }, [siliniyor]);



  const aktifBaglanti = useMemo(() => {

    if (!silme) return null;

    return tanimBaglantiOzeti(silme.tip, silme.kayit.id, veriSeti);

  }, [silme, veriSeti]);



  const silmeUygula = useCallback(

    async (mod?: TanimSilModu) => {

      if (!silme) return;

      setSiliniyor(true);

      try {

        const { tip, kayit } = silme;

        if (tip === 'firma') await firmaSil(kayit.id, mod);

        else if (tip === 'sube') await subeSil(kayit.id, mod);

        else if (tip === 'depo') await depoSil(kayit.id);

        else if (tip === 'kasa') await kasaSil(kayit.id);

        else await donemSil(kayit.id);



        const hedef = tanimHedefMetni(tip, kayit);

        if (mod === 'pasif') {

          basariBildir(`${hedef} ve bağlı kayıtlar pasif yapıldı.`);

        } else {

          basariBildir(`${hedef} silindi.`);

        }

        setSilme(null);

        await yukle();

      } catch (err) {

        hataBildir(err instanceof Error ? err.message : 'Silme başarısız');

      } finally {

        setSiliniyor(false);

      }

    },

    [silme, basariBildir, hataBildir, yukle]

  );



  const silmeOnayla = useCallback(() => {

    void silmeUygula();

  }, [silmeUygula]);



  const bagliSilOnayla = useCallback(

    (mod: TanimSilModu) => {

      void silmeUygula(mod);

    },

    [silmeUygula]

  );



  if (yukleniyor) return <TanimYukleniyor />;



  if (duzenle?.tip === 'firma') {

    return <FirmaSekme gomuluDuzenle={{ id: duzenle.id, onKapat: duzenleKapat }} />;

  }

  if (duzenle?.tip === 'sube') {

    return <SubeSekme gomuluDuzenle={{ id: duzenle.id, onKapat: duzenleKapat }} />;

  }

  if (duzenle?.tip === 'depo') {

    return <DepoSekme gomuluDuzenle={{ id: duzenle.id, onKapat: duzenleKapat }} />;

  }

  if (duzenle?.tip === 'kasa') {

    return <KasaSekme gomuluDuzenle={{ id: duzenle.id, onKapat: duzenleKapat }} />;

  }

  if (duzenle?.tip === 'donem') {

    return <DonemSekme gomuluDuzenle={{ id: duzenle.id, onKapat: duzenleKapat }} />;

  }



  const silmeHedefMetni = silme ? tanimHedefMetni(silme.tip, silme.kayit) : '';

  const bagliSilGoster =

    !!silme &&

    (silme.tip === 'firma' || silme.tip === 'sube') &&

    !!aktifBaglanti?.bagliVar;



  return (

    <>

      <div className="ap-tanimlar-ozet">

        <div className="ap-tanimlar-ozet-ust">

          <p className="ap-tanimlar-ozet-aciklama">

            Tüm tanımlarınızı tek ekranda görüntüleyin. Düzenlemek için satıra tıklayın.

          </p>

          <button type="button" className="ap-tanimlar-yeni-ekle" onClick={onKurulumBaslat}>

            <span aria-hidden>+</span>

            Yeni Kurulum Başlat

          </button>

        </div>



        <div className="ap-tanimlar-ozet-tablolar">

          <TanimKayitTablosu

            baslik="Firmalar"

            kayitlar={firmalar}

            aramaMetni={(k) => `${k.firmaKodu} ${k.firmaAdi} ${k.vergiNo}`}

            pasifMi={(k) => !k.aktif}

            onSatirTikla={(k) => setDuzenle({ tip: 'firma', id: k.id })}

            onSil={(k) => silmeAc({ tip: 'firma', kayit: k })}

            kolonlar={[

              {

                id: 'kod',

                baslik: 'Kod',

                hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.firmaKodu}</span>,

              },

              { id: 'ad', baslik: 'Firma Adı', hucre: (k) => k.firmaAdi },

              { id: 'vergi', baslik: 'Vergi No', hucre: (k) => k.vergiNo || '—' },

              { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },

              {

                id: 'guncelleme',

                baslik: 'Güncelleme',

                sinif: 'ap-tanimlar-tablo-tarih',

                hucre: (k) => tarihSaatFormatla(k.guncelleme),

              },

            ]}

          />



          <TanimKayitTablosu

            baslik="Şubeler"

            kayitlar={subeler}

            aramaMetni={(k) =>

              `${k.subeKodu} ${k.subeAdi} ${k.il} ${k.ilce} ${firmaEtiketi(firmalar, k.firmaId)}`

            }

            pasifMi={(k) => firmaBagliPasifMi(k.aktif, k.firmaId)}

            onSatirTikla={(k) => setDuzenle({ tip: 'sube', id: k.id })}

            onSil={(k) => silmeAc({ tip: 'sube', kayit: k })}

            kolonlar={[

              {

                id: 'kod',

                baslik: 'Kod',

                hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.subeKodu}</span>,

              },

              { id: 'ad', baslik: 'Şube Adı', hucre: (k) => k.subeAdi },

              {

                id: 'firma',

                baslik: 'Firma',

                hucre: (k) => firmaEtiketi(firmalar, k.firmaId),

              },

              {

                id: 'konum',

                baslik: 'Konum',

                hucre: (k) => [k.il, k.ilce].filter(Boolean).join(' / ') || '—',

              },

              { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },

              {

                id: 'guncelleme',

                baslik: 'Güncelleme',

                sinif: 'ap-tanimlar-tablo-tarih',

                hucre: (k) => tarihSaatFormatla(k.guncelleme),

              },

            ]}

          />



          <TanimKayitTablosu

            baslik="Depolar"

            kayitlar={depolar}

            aramaMetni={(k) => `${k.depoKodu} ${k.depoAdi} ${k.subeKodu ?? ''} ${k.subeAdi ?? ''}`}

            pasifMi={(k) => subeBagliPasifMi(k.aktif, k.subeId)}

            onSatirTikla={(k) => setDuzenle({ tip: 'depo', id: k.id })}

            onSil={(k) => silmeAc({ tip: 'depo', kayit: k })}

            kolonlar={[

              {

                id: 'kod',

                baslik: 'Kod',

                hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.depoKodu}</span>,

              },

              { id: 'ad', baslik: 'Depo Adı', hucre: (k) => k.depoAdi },

              {

                id: 'sube',

                baslik: 'Şube',

                hucre: (k) =>

                  k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : '—',

              },

              { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },

              {

                id: 'guncelleme',

                baslik: 'Güncelleme',

                sinif: 'ap-tanimlar-tablo-tarih',

                hucre: (k) => tarihSaatFormatla(k.guncelleme),

              },

            ]}

          />



          <TanimKayitTablosu

            baslik="Kasalar"

            kayitlar={kasalar}

            aramaMetni={(k) => `${k.kasaKodu} ${k.kasaAdi} ${k.paraBirimi}`}

            pasifMi={(k) => subeBagliPasifMi(k.aktif, k.subeId)}

            onSatirTikla={(k) => setDuzenle({ tip: 'kasa', id: k.id })}

            onSil={(k) => silmeAc({ tip: 'kasa', kayit: k })}

            kolonlar={[

              {

                id: 'kod',

                baslik: 'Kod',

                hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.kasaKodu}</span>,

              },

              { id: 'ad', baslik: 'Kasa Adı', hucre: (k) => k.kasaAdi },

              { id: 'pb', baslik: 'Para Birimi', hucre: (k) => k.paraBirimi },

              {

                id: 'sube',

                baslik: 'Şube',

                hucre: (k) =>

                  k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : '—',

              },

              { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },

              {

                id: 'guncelleme',

                baslik: 'Güncelleme',

                sinif: 'ap-tanimlar-tablo-tarih',

                hucre: (k) => tarihSaatFormatla(k.guncelleme),

              },

            ]}

          />



          <TanimKayitTablosu

            baslik="Dönemler"

            kayitlar={donemler}

            aramaMetni={(k) => `${k.donemKodu} ${k.donemAdi}`}

            pasifMi={(k) => firmaBagliPasifMi(k.aktif, k.firmaId)}

            onSatirTikla={(k) => setDuzenle({ tip: 'donem', id: k.id })}

            onSil={(k) => silmeAc({ tip: 'donem', kayit: k })}

            kolonlar={[

              {

                id: 'kod',

                baslik: 'Kod',

                hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.donemKodu}</span>,

              },

              { id: 'ad', baslik: 'Dönem Adı', hucre: (k) => k.donemAdi },

              { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },

              {

                id: 'guncelleme',

                baslik: 'Güncelleme',

                sinif: 'ap-tanimlar-tablo-tarih',

                hucre: (k) => tarihSaatFormatla(k.guncelleme),

              },

            ]}

          />

        </div>

      </div>



      {bagliSilGoster && aktifBaglanti ? (

        <TanimBagliSilOnayModal

          acik

          onKapat={silmeKapat}

          onOnayla={bagliSilOnayla}

          hedefMetin={silmeHedefMetni}

          bagliOzet={aktifBaglanti.ozetSatirlari}

        />

      ) : (

        <SilmeOnayModal

          acik={!!silme && !bagliSilGoster}

          onKapat={silmeKapat}

          onOnayla={silmeOnayla}

          hedefMetin={silmeHedefMetni}

        />

      )}

    </>

  );

}


