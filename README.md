# Review Kantin

Sistem Review Kantin: **backend** REST API (Express + Drizzle + SQL Server) dan **frontend** React (TypeScript).

## Teknologi

| Bagian | Teknologi |
|---|---|
| Backend | Node.js, Express 5, TypeScript (tsx), Drizzle ORM, SQL Server, JWT, Zod |
| Frontend | React 18, TypeScript, Vite, React Router 6 |
| Integrasi HTTP | **Axios** (instance + interceptor JWT) |

## Struktur

```
review-kantin-api/
├── src/                 # backend Express
├── scripts/seed.ts      # seed akun uji
├── frontend/            # aplikasi React
│   └── src/
│       ├── api/         # client axios, endpoint auth & stalls, parser error
│       ├── context/     # AuthContext (login/role), ToastContext
│       ├── components/  # Navbar, ProtectedRoute, StallCard, dll
│       └── pages/       # daftar, detail, form, login, register, profil
└── .env.example
```

## Instalasi & menjalankan

Prasyarat: Node.js 18+, SQL Server yang sudah berisi database dari Tugas 2.

### 1. Backend

```bash
npm install
cp .env.example .env        # lalu isi DB_USER, DB_PASSWORD, JWT_SECRET, dst.
npx tsx scripts/seed.ts     # membuat akun uji
npm run dev                 # http://localhost:3000
```

Dokumentasi API (Swagger): http://localhost:3000/docs

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # opsional, default sudah benar
npm run dev                 # http://localhost:5173
```

Buka http://localhost:5173 (backend harus sudah jalan).

## Konfigurasi environment

**Backend (`.env`)**

| Variabel | Keterangan |
|---|---|
| `PORT` | Port backend (default 3000) |
| `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Koneksi SQL Server |
| `JWT_SECRET` | Secret penanda JWT (isi string acak yang panjang) |
| `JWT_EXPIRES_IN` | Masa berlaku token, mis. `1d` |
| `CORS_ORIGIN` | Origin frontend yang diizinkan (pisahkan koma), default `http://localhost:5173` |

**Frontend (`frontend/.env`)**

| Variabel | Keterangan |
|---|---|
| `VITE_API_URL` | Base URL API. Default `/api` (diteruskan Vite ke `http://localhost:3000`). Bisa diisi alamat penuh, mis. `http://localhost:3000/api` |

> `.env` tidak ikut di-commit. Hanya `.env.example` (tanpa nilai rahasia) yang ada di repository.

## Akun uji

Jalankan `npx tsx scripts/seed.ts`. Password semua akun: `password123`.

| Email | Role |
|---|---|
| admin@test.com | admin |
| owner1@test.com | owner |
| owner2@test.com | owner |
| customer@test.com | customer |

Registrasi lewat aplikasi selalu menghasilkan role `customer`.

## Hak akses di frontend

| Role | Hak akses |
|---|---|
| Publik (belum login) | Lihat daftar & detail warung, registrasi, login |
| Customer | Sama dengan publik + halaman profil; tidak ada menu kelola warung |
| Owner | Tambah warung, ubah **warung miliknya sendiri** |
| Admin | Tambah, ubah semua, dan **hapus** warung |

Tampilan hanya mengikuti aturan; keputusan akhir selalu di backend (401 / 403).

## Endpoint yang dipakai frontend

| Fitur | Endpoint |
|---|---|
| Daftar warung (search, filter, sort, pagination) | `GET /api/stalls` |
| Detail warung | `GET /api/stalls/:id` |
| Tambah / Ubah / Hapus | `POST` / `PUT` / `DELETE /api/stalls[/:id]` |
| Registrasi | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Info pengguna | `GET /api/auth/me` |

Logout: backend memakai JWT stateless tanpa endpoint logout, sehingga logout dilakukan dengan menghapus token di klien.

## Catatan Tugas 3 (Backend)

Validasi (Zod), format error seragam, dan autentikasi JWT dengan role `admin` / `owner` / `customer` sudah tersedia di backend.
