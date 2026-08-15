# PRD — Sistem POS (Point of Sale) Single Outlet

> Dokumen ini ditulis untuk dikonsumsi oleh AI coding assistant (Cursor / Windsurf / Claude Code / dsb.) sebagai spesifikasi acuan pengembangan. Format sengaja ringkas, terstruktur, dan langsung actionable.

**Versi:** 1.0 · **Tanggal:** 14 Agustus 2026 · **Tipe:** Single-outlet (1 toko, banyak kasir)

---

## 1. Ringkasan Produk

Aplikasi kasir (POS) untuk toko/usaha retail atau F&B skala kecil-menengah dengan **1 outlet**. Fokus: transaksi cepat, stok akurat otomatis, dan dashboard/laporan yang informatif. Bukan aplikasi multi-cabang — semua data terikat pada satu toko.

**Prinsip desain:**
- Kasir harus bisa menyelesaikan 1 transaksi dalam < 3 langkah.
- Setiap penjualan otomatis mengurangi stok (dicatat di `stock_movements`).
- Dashboard owner harus menjawab "bagaimana toko saya hari ini?" dalam 1 layar.
- Mendukung mode **offline-first** di sisi kasir dengan sinkronisasi saat online kembali.

---

## 2. Target Pengguna & Role

| Role | Akses |
|---|---|
| `owner` | Akses penuh, termasuk laporan, pengaturan toko, manajemen pengguna |
| `admin` | Kelola produk, stok, diskon, pelanggan, laporan (tanpa hapus akun owner) |
| `kasir` | Hanya transaksi kasir, buka/tutup shift, lihat stok (read-only) |

Implementasikan sebagai **RBAC** sederhana: kolom `role_id` di tabel `users` + tabel `roles` berisi JSON permission.

---

## 3. Tech Stack (Rekomendasi — silakan disesuaikan)

- **Frontend:** React (Vite) + Tailwind — responsif untuk desktop & tablet kasir
- **Backend:** REST API (Node.js/Express atau Laravel) + JWT auth
- **Database:** PostgreSQL atau MySQL (relasional, wajib mendukung transaction/ACID untuk proses checkout)
- **Cache (opsional):** Redis untuk mempercepat query dashboard
- **File storage:** Object storage (S3-compatible) untuk gambar produk & logo toko

---

## 4. Fitur (Checklist Implementasi)

### Fase 1 — MVP
- [ ] Auth: login email+password & login PIN cepat untuk kasir
- [ ] CRUD produk & kategori (dengan gambar, SKU, barcode)
- [ ] Stok real-time per produk + auto-deduct saat transaksi
- [ ] Alert stok menipis (berdasarkan `min_stock`)
- [ ] Transaksi kasir: cari produk (nama/barcode/scan), keranjang, checkout
- [ ] Multi metode pembayaran per transaksi (cash, debit, credit, QRIS, e-wallet) — **split payment**
- [ ] Kalkulasi kembalian otomatis untuk pembayaran tunai
- [ ] Dashboard ringkas: total penjualan hari ini, jumlah transaksi, laba kotor

### Fase 2
- [ ] Diskon: per produk & per transaksi, dengan periode aktif
- [ ] Manajemen pelanggan + poin loyalitas
- [ ] Cetak struk (printer thermal 58/80mm) & kirim struk digital (email/WA)

### Fase 3
- [ ] Buka/tutup shift kasir + rekonsiliasi kas (selisih kas awal vs akhir vs sistem)
- [ ] Laporan lanjutan: produk terlaris, performa per kasir, tren penjualan

### Fase 4
- [ ] Audit log seluruh aksi penting (create/update/delete/void)
- [ ] Ekspor laporan ke Excel/PDF
- [ ] Optimasi performa (index database, caching dashboard)

---

## 5. Skema Database

> Semua tabel pakai `id BIGINT PK AUTO_INCREMENT` (kecuali disebutkan lain) dan `created_at TIMESTAMP DEFAULT now()`.

```sql
-- Peran & pengguna
CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,           -- owner, admin, kasir
  permissions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  pin VARCHAR(255),                            -- hashed PIN, untuk login cepat kasir
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Profil toko (single row, karena hanya 1 outlet)
CREATE TABLE store_profile (
  id BIGINT PRIMARY KEY,                        -- selalu 1
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  logo_url VARCHAR(255),
  updated_at TIMESTAMP
);

-- Produk
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT REFERENCES categories(id),
  sku VARCHAR(50) UNIQUE NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  name VARCHAR(150) NOT NULL,
  unit VARCHAR(20) DEFAULT 'pcs',
  cost_price DECIMAL(14,2) DEFAULT 0,
  sell_price DECIMAL(14,2) NOT NULL,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Stok
CREATE TABLE inventories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNIQUE NOT NULL REFERENCES products(id),  -- 1 baris per produk
  quantity INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  updated_at TIMESTAMP
);

CREATE TABLE stock_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL REFERENCES products(id),
  type ENUM('in','out','adjustment') NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(30),                  -- 'transaction' | 'manual'
  reference_id BIGINT,
  note VARCHAR(255),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Pelanggan
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100),
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Diskon & promo
CREATE TABLE discounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('percentage','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  applies_to ENUM('product','transaction') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Shift kasir
CREATE TABLE shifts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cashier_id BIGINT NOT NULL REFERENCES users(id),
  opening_balance DECIMAL(14,2) NOT NULL,
  closing_balance DECIMAL(14,2),
  opened_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP
);

-- Transaksi
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(30) UNIQUE NOT NULL,
  cashier_id BIGINT NOT NULL REFERENCES users(id),
  customer_id BIGINT REFERENCES customers(id),
  shift_id BIGINT REFERENCES shifts(id),
  subtotal DECIMAL(14,2) NOT NULL,
  discount_total DECIMAL(14,2) DEFAULT 0,
  tax_total DECIMAL(14,2) DEFAULT 0,
  grand_total DECIMAL(14,2) NOT NULL,
  status ENUM('paid','void','refunded') DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE transaction_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id),
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(14,2) NOT NULL,                 -- harga satuan saat transaksi (snapshot)
  discount DECIMAL(14,2) DEFAULT 0,
  subtotal DECIMAL(14,2) NOT NULL                -- quantity * price - discount
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id),
  method ENUM('cash','debit','credit','qris','ewallet') NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  reference_no VARCHAR(100),
  paid_at TIMESTAMP DEFAULT now()
);

-- Audit
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id),
  action VARCHAR(50) NOT NULL,                   -- create | update | delete | void
  entity VARCHAR(50) NOT NULL,                   -- product | transaction | ...
  entity_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

**Relasi kunci:**
`roles 1—N users` · `categories 1—N products` · `products 1—1 inventories` · `products 1—N stock_movements` · `products 1—N transaction_items` · `customers 1—N transactions` · `shifts 1—N transactions` · `transactions 1—N transaction_items` · `transactions 1—N payments` · `users 1—N audit_logs`

**Catatan implementasi penting:**
- Checkout (`POST /transactions`) harus **1 database transaction**: insert `transactions` + `transaction_items` + `payments` + update `inventories.quantity` + insert `stock_movements`, semua atau tidak sama sekali (rollback jika gagal).
- `payments.amount` bisa lebih dari satu baris per `transaction_id` untuk mendukung split payment; total `SUM(payments.amount)` harus sama dengan `transactions.grand_total`.

---

## 6. API Endpoints

Prefix: `/api/v1`. Auth: `Authorization: Bearer <JWT>` (kecuali endpoint login). Response standar:
```json
{ "success": true, "data": {}, "message": "" }
```

### Auth
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | Publik | Login email+password atau PIN kasir |
| POST | `/auth/logout` | Auth | Invalidasi token |
| POST | `/auth/refresh` | Auth | Refresh access token |
| GET | `/auth/me` | Auth | Profil user login |

### Users & Roles
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/users` | admin/owner | List pengguna |
| POST | `/users` | admin/owner | Tambah pengguna |
| GET | `/users/{id}` | admin/owner | Detail pengguna |
| PUT | `/users/{id}` | admin/owner | Update pengguna |
| DELETE | `/users/{id}` | owner | Nonaktifkan pengguna |
| GET | `/roles` | admin/owner | List peran & permission |

### Profil Toko
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/store-profile` | auth | Ambil profil toko |
| PUT | `/store-profile` | owner | Update profil toko |

### Produk & Kategori
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/categories` | auth | List kategori |
| POST | `/categories` | admin | Tambah kategori |
| PUT | `/categories/{id}` | admin | Update kategori |
| DELETE | `/categories/{id}` | admin | Hapus kategori |
| GET | `/products` | auth | List produk (search, filter kategori, by barcode) |
| POST | `/products` | admin | Tambah produk |
| GET | `/products/{id}` | auth | Detail produk |
| PUT | `/products/{id}` | admin | Update produk |
| DELETE | `/products/{id}` | admin | Nonaktifkan produk |
| GET | `/products/{id}/stock` | auth | Cek stok produk |

### Inventori
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/inventories` | auth | List stok semua produk |
| GET | `/inventories/low-stock` | auth | Produk dengan stok < `min_stock` |
| POST | `/inventories/adjust` | admin | Penyesuaian stok manual |
| GET | `/inventories/movements` | admin | Riwayat pergerakan stok |

### Pelanggan
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/customers` | auth | List pelanggan |
| POST | `/customers` | auth | Tambah pelanggan |
| GET | `/customers/{id}` | auth | Detail + riwayat transaksi |
| PUT | `/customers/{id}` | auth | Update pelanggan |

### Diskon
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/discounts` | auth | List diskon aktif |
| POST | `/discounts` | admin | Tambah diskon |
| PUT | `/discounts/{id}` | admin | Update diskon |
| DELETE | `/discounts/{id}` | admin | Hapus diskon |

### Shift Kasir
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/shifts/open` | kasir | Buka shift + saldo awal |
| POST | `/shifts/{id}/close` | kasir | Tutup shift + rekonsiliasi kas |
| GET | `/shifts/{id}` | auth | Detail shift & ringkasan transaksi |

### Transaksi & Pembayaran (Inti POS)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/transactions` | kasir | Buat transaksi (checkout) |
| GET | `/transactions` | auth | List transaksi (filter tanggal/kasir/status) |
| GET | `/transactions/{id}` | auth | Detail transaksi + item |
| POST | `/transactions/{id}/void` | admin | Batalkan transaksi |
| POST | `/transactions/{id}/refund` | admin | Refund |
| POST | `/transactions/{id}/payments` | kasir | Tambah pembayaran (split payment) |
| GET | `/transactions/{id}/receipt` | auth | Data struk untuk cetak/kirim |

### Dashboard & Laporan
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/reports/dashboard-summary` | auth | Ringkasan hari ini (omzet, transaksi, laba kotor) |
| GET | `/reports/sales` | auth | Laporan penjualan per periode |
| GET | `/reports/best-seller` | auth | Produk terlaris |
| GET | `/reports/inventory` | auth | Nilai stok & pergerakan |
| GET | `/reports/cashier-performance` | admin/owner | Performa per kasir |
| GET | `/reports/export` | admin/owner | Ekspor laporan (Excel/PDF) |

---

## 7. Non-Functional Requirements

- Checkout diproses < 1 detik; dashboard termuat < 2 detik
- Password/PIN di-hash (bcrypt), JWT untuk auth, HTTPS wajib
- Mode offline-first di kasir: transaksi disimpan lokal lalu disinkronkan saat online
- Semua perubahan stok & transaksi harus tercatat dengan jejak waktu + pelaku (auditable)
- Kasir baru bisa menyelesaikan transaksi pertama dalam < 5 menit pelatihan

---

## 8. Struktur Folder yang Disarankan (contoh Node.js/Express)

```
/src
  /modules
    /auth
    /users
    /products
    /inventory
    /customers
    /discounts
    /shifts
    /transactions
    /reports
  /middlewares       (auth, rbac, error-handler)
  /db                (migrations, seeders, models)
  /utils
  app.js
/frontend
  /src
    /pages           (Login, POS/Kasir, Products, Inventory, Reports, Settings)
    /components
    /hooks
    /services        (api client)
```

---

## 9. Urutan Pengembangan yang Disarankan untuk AI Agent

1. Setup project (backend + frontend scaffold, koneksi DB, migration semua tabel di atas)
2. Implementasi Auth (login, JWT, RBAC middleware)
3. Modul Produk & Kategori (CRUD)
4. Modul Inventori (stok + stock_movements + low-stock alert)
5. Modul Transaksi (checkout, split payment, auto-deduct stok) — **modul paling kritis**
6. Modul Dashboard/Laporan dasar
7. Modul Diskon & Pelanggan
8. Modul Shift Kasir
9. Cetak struk + audit log
10. Polish UI kasir (kecepatan input, shortcut keyboard, scan barcode)