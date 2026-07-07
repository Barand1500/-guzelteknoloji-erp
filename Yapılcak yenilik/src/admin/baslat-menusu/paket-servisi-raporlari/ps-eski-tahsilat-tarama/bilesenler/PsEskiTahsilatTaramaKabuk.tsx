import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { TahsilatTaramaAltCubuk } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/bilesenler/TahsilatTaramaAltCubuk';
import { TahsilatTaramaModuPanel } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/bilesenler/TahsilatTaramaModuPanel';
import { TahsilatTaramaTablosu } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/bilesenler/TahsilatTaramaTablosu';
import { TahsilatTarihAraligiPanel } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/bilesenler/TahsilatTarihAraligiPanel';
import {
  aralikKaydir,
  bosTahsilatFiltre,
  modaGoreAralik,
  type TahsilatTaramaFiltre,
  type TahsilatTaramaModu,
} from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';
import { tahsilatlariFiltrele } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/yardimci';
import { SubeDepartmanModal } from '@/admin/baslat-menusu/raporlar/satis-ortak/bilesenler/SubeDepartmanModal';
import type { SatisRaporFiltre } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function subeEtiketi(filtre: TahsilatTaramaFiltre) {
  const parcalar: string[] = [];
  if (filtre.sube) parcalar.push(filtre.sube);
  if (filtre.departman) parcalar.push(filtre.departman);
  return parcalar.join(' · ');
}

function modalFiltreDonustur(filtre: TahsilatTaramaFiltre): SatisRaporFiltre {
  return {
    baslangic: `${filtre.baslangic}T00:00`,
    bitis: `${filtre.bitis}T23:59`,
    urun: '',
    urunGrubu: '',
    sube: filtre.sube,
    departman: filtre.departman,
  };
}

export function PsEskiTahsilatTaramaKabuk() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [filtre, setFiltre] = useState<TahsilatTaramaFiltre>(() => bosTahsilatFiltre('haftalik'));
  const [subeModalAcik, setSubeModalAcik] = useState(false);
  const [modalFiltre, setModalFiltre] = useState<SatisRaporFiltre>(() =>
    modalFiltreDonustur(bosTahsilatFiltre('haftalik'))
  );

  const satirlar = useMemo(() => tahsilatlariFiltrele(filtre), [filtre]);

  const modDegistir = useCallback(
    (mod: TahsilatTaramaModu) => {
      const referans = new Date(`${filtre.baslangic}T12:00:00`);
      const aralik = modaGoreAralik(mod, referans);
      setFiltre((onceki) => ({ ...onceki, mod, ...aralik }));
      basariBildir(`${mod === 'gunluk' ? 'Günlük' : mod === 'haftalik' ? 'Haftalık' : 'Aylık'} tarama modu seçildi.`);
    },
    [filtre.baslangic, basariBildir]
  );

  const donemKaydir = useCallback(
    (yon: -1 | 1) => {
      const aralik = aralikKaydir(filtre.mod, filtre.baslangic, yon);
      setFiltre((onceki) => ({ ...onceki, ...aralik }));
    },
    [filtre.mod, filtre.baslangic]
  );

  const yazdir = useCallback(() => {
    window.print();
  }, []);

  const subeModalAc = useCallback(() => {
    setModalFiltre(modalFiltreDonustur(filtre));
    setSubeModalAcik(true);
  }, [filtre]);

  const subeUygula = useCallback(() => {
    setFiltre((onceki) => ({
      ...onceki,
      sube: modalFiltre.sube,
      departman: modalFiltre.departman,
    }));
    setSubeModalAcik(false);
    basariBildir('Şube / departman filtresi uygulandı.');
  }, [modalFiltre, basariBildir]);

  useModulAksiyonlari({ guncelle: yazdir }, { guncelle: true });

  const donemMetni = useMemo(() => {
    const bas = new Date(`${filtre.baslangic}T12:00:00`);
    const bit = new Date(`${filtre.bitis}T12:00:00`);
    const fmt = new Intl.DateTimeFormat('tr-TR');
    return `${fmt.format(bas)} — ${fmt.format(bit)}`;
  }, [filtre.baslangic, filtre.bitis]);

  return (
    <AdminModulKabuk
      baslik="Eski Tahsilat Tarama"
      aciklama="Geçmiş tahsilat kayıtlarını günlük, haftalık veya aylık dönemlerde tarayın"
      onizleGoster={false}
    >
      <div className="ap-tahsilat-tarama-sayfa">
        <div className="ap-tahsilat-tarama-ust">
          <TahsilatTaramaModuPanel mod={filtre.mod} onModDegistir={modDegistir} />
          <TahsilatTarihAraligiPanel
            mod={filtre.mod}
            baslangic={filtre.baslangic}
            bitis={filtre.bitis}
            onBaslangicDegistir={(baslangic) => setFiltre((f) => ({ ...f, baslangic }))}
            onBitisDegistir={(bitis) => setFiltre((f) => ({ ...f, bitis }))}
            onGeri={() => donemKaydir(-1)}
            onIleri={() => donemKaydir(1)}
          />
        </div>

        <AdminPanelKarti baslik="Eski Tahsilatlar" altBaslik={`${donemMetni} · ${satirlar.length} personel`}>
          <TahsilatTaramaTablosu satirlar={satirlar} />

          <TahsilatTaramaAltCubuk subeEtiket={subeEtiketi(filtre)} onSubeDepartman={subeModalAc} />
        </AdminPanelKarti>
      </div>

      <SubeDepartmanModal
        acik={subeModalAcik}
        filtre={modalFiltre}
        onChange={setModalFiltre}
        onKapat={() => setSubeModalAcik(false)}
        onUygula={subeUygula}
      />
    </AdminModulKabuk>
  );
}
