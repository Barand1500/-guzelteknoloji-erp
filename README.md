# Güzel Teknoloji ERP

**Türkçe** · [English](#english)

Kurumsal ERP admin paneli — React + Vite frontend, Express + Prisma + MySQL backend.

Canlı site: [erp.guzelteknoloji.com](https://erp.guzelteknoloji.com)

---

## Proje yapısı

```
ERP/
├── src/              # Frontend kaynak kodu (React + TypeScript)
├── public/           # Statik dosyalar (geliştirme)
├── frontend/         # Vite build çıktısı (nginx document root)
├── backend/          # API (Express + Prisma)
│   ├── src/
│   ├── prisma/
│   └── .env          # Sunucuda — git'e eklenmez
├── deploy.sh         # Sunucu deploy scripti
└── package.json      # Frontend bağımlılıkları
```

| Klasör | Açıklama |
|--------|----------|
| `src/` | Admin panel arayüzü, modüller, DataGrid bileşenleri |
| `frontend/` | `npm run build` sonrası oluşan statik site |
| `backend/` | REST API, kimlik doğrulama, veritabanı işlemleri |
| `node_modules/` | Bağımlılıklar — silmeyin, `npm install` ile oluşur |

---

## Geliştirme (yerel)

### Gereksinimler

- Node.js 20+
- MySQL 8+

### Frontend

```bash
npm install
npm run dev
```

Tarayıcı: http://localhost:5174

### Backend

```bash
cd backend
cp .env.example .env   # DATABASE_URL ve JWT_SECRET düzenleyin
npm install
npm run dev
```

API: http://localhost:3007/api/health

### Veritabanı

```bash
cd backend
npm run db:push    # şemayı uygula
npm run db:seed    # varsayılan firma, roller, admin
```

---

## Başlat menüsü

- **Müşteri / Ajans:** Kullanıcılar, Roller
- **Sistem:** Ayarlar, Sekme Yönetimi, Kısayol Ayarları
- **Gizli:** Loglar, Veri Yedekleme
- **Demo:** DataGrid örneği → `/gt-admin/datagrid-demo`

Varsayılan açılış: **Kullanıcılar** (`/gt-admin/kullanicilar`)

---

## Production deploy

Sunucu klasör yapısı (CloudPanel):

```
~/htdocs/erp.guzelteknoloji.com/
├── deploy.sh
├── repo/        ← git clone
├── frontend/    ← nginx burayı sunar
└── backend/     ← PM2 + .env
```

```bash
cd ~/htdocs/erp.guzelteknoloji.com
./deploy.sh
```

**Nginx (502 hatası için zorunlu):** CloudPanel → Site → Vhost → Nginx Directives içine `nginx-api.conf.example` dosyasındaki `location /api` bloğunu ekleyin.

**CloudPanel Node.js (3007):** Site ayarlarındaki Node.js uygulamasını **kapatın**. ERP API yalnızca **PM2 (`erp-api`)** ile çalışır. CloudPanel Node.js ve PM2 aynı portu (3007) kullanırsa `EADDRINUSE` oluşur; tarayıcıda Kısayol Ayarları `Endpoint bulunamadi` hatası verir (eski backend process kalır).

**Kısayol 404 / EADDRINUSE onarımı:**

```bash
# 1) CloudPanel → Site → Node.js uygulamasını durdurun
cd ~/htdocs/erp.guzelteknoloji.com/backend
bash scripts/sunucu-api-duzelt.sh
```

**İlk kurulum (PM2 yoksa önce bunu yapın):**

```bash
cd ~/htdocs/erp.guzelteknoloji.com
cp repo/backend/.env.example backend/.env   # DATABASE_URL, JWT_SECRET doldurun
./deploy.sh                                 # PM2 yoksa deploy otomatik kurar
# veya sadece PM2: cd backend && bash scripts/pm2-kur.sh
pm2 startup                                 # bir kez — reboot sonrasi otomatik baslat
pm2 save
```

**Sorun giderme:**

```bash
cd ~/htdocs/erp.guzelteknoloji.com
FRONTEND_MOCK_AUTH=0 ./deploy.sh
cd backend && bash scripts/sunucu-baglanti.sh
```

Varsayılan admin (seed sonrası): `ADMIN` / `eRc241016!`

İlk kurulum ve nginx ayarları için `deploy.sh` ve `nginx-api.conf.example` dosyalarına bakın.

---

## Teknolojiler

| Katman | Stack |
|--------|-------|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| Backend | Express, Prisma, MySQL, JWT |
| Deploy | PM2, Nginx, CloudPanel |

---

## English

Corporate ERP admin panel — React + Vite frontend, Express + Prisma + MySQL backend.

Live: [erp.guzelteknoloji.com](https://erp.guzelteknoloji.com)

### Project structure

| Folder | Purpose |
|--------|---------|
| `src/` | Admin UI source code |
| `frontend/` | Production build output (`npm run build`) |
| `backend/` | REST API, auth, database |
| `public/` | Static assets for local dev |

### Local development

**Frontend**

```bash
npm install
npm run dev
```

Open http://localhost:5174

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API health check: http://localhost:3006/api/health

**Database**

```bash
cd backend
npm run db:push
npm run db:seed
```

### Production deploy

```bash
cd ~/htdocs/erp.guzelteknoloji.com
./deploy.sh
```

See comments at the top of `deploy.sh` for first-time setup and nginx configuration.

### Tech stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS 4
- **Backend:** Express, Prisma, MySQL, JWT
- **Ops:** PM2, Nginx, CloudPanel

---

## Lisans

Özel proje — Güzel Teknoloji.
