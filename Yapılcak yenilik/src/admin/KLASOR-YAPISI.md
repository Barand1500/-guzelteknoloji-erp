# Admin klasor yapisi

Klasor adlari Turkce mantikla, ASCII karakter (i, s, g, u, o, c yok).

## Baslat menusu sayfalari

| Menu | Klasor |
|------|--------|
| Kullanicilar | `baslat-menusu/musteri-ajans/kullanicilar/` |
| Roller ve Yetkiler | `baslat-menusu/musteri-ajans/roller/` |
| Ayarlar | `baslat-menusu/sistem/ayarlar/` |
| Sekme Yonetimi | `baslat-menusu/sistem/sekme-yonetimi/` |
| Kisayol Ayarlari | `baslat-menusu/sistem/kisayol-ayarlari/` |

Her modul klasorunde:
- `sayfa.tsx` — ana sayfa bileseni
- `bilesenler/` — o sayfaya ozel UI parcalari
- `api.ts` — sunucu istekleri (varsa)
- `yardimci.ts` — modul mantigi / ayarlar (varsa)

## Gizli moduller (footer vb.)

| Modul | Klasor |
|-------|--------|
| Log Takibi | `gizli-moduller/loglar/` |
| Veri Yedekleme | `gizli-moduller/veri-yedekleme/` |

## Kabuk (cerceve)

`kabuk/` — layout, baslat menusu UI, sekme cubugu, aksiyon cubugu, bildirim/log panelleri.

## Ortak

- `ortak/` — tum modullerde kullanilan admin bilesenleri
- `ortak/api/` — paylasilan API katmani
- `ortak/tipler/` — paylasilan TypeScript tipleri
- `veri/` — menu tanimlari, rehber verisi

## Proje geneli

| Klasor | Icerik |
|--------|--------|
| `baglamlar/` | React context'ler |
| `kancalar/` | Custom hook'lar |
| `formlar/` | Ortak form bilesenleri |
| `araclar/` | Yardimci fonksiyonlar |
| `dil/` | Panel cevirileri |
| `yapilandirma/` | Uygulama ayarlari |
| `stiller/` | CSS dosyalari |

## Build ciktisi

`npm run build` komutu derlenmis dosyalari `frontend/` klasorune yazar (eski `dist` yerine).
