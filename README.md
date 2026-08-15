# 🛒 Sistem Point of Sale (POS) 

Sistem Point of Sale (POS) modern, sederhana, dan informatif yang dirancang untuk pelaku usaha retail dan F&B skala kecil-menengah (UMKM). Aplikasi ini mendukung pencatatan transaksi super cepat, manajemen stok otomatis, integrasi diskon/promo, serta laporan bisnis *real-time*.

## Fitur Utama

*   **Kasir Cepat & Responsif:** Transaksi lancar dengan mode *cart*, *barcode scanner*, dan perhitungan kembalian otomatis.
*   **Multi-Metode Pembayaran:** Mendukung pembayaran Cash, Debit, Credit, QRIS, dan E-Wallet (termasuk *Split Payment*).
*   **Manajemen Inventori Otomatis:** Pemotongan stok otomatis saat transaksi dan fitur penyesuaian stok (*Stock Adjustment*) lengkap dengan riwayat pergerakan.
*   **Role-Based Access Control (RBAC):** Terintegrasi dengan Spatie Permission untuk hak akses spesifik (Owner, Admin, Kasir).
*   **Manajemen Shift Kasir:** Buka/tutup shift dengan rekonsiliasi kas awal dan akhir yang transparan.
*   **Diskon & Loyalitas:** Mendukung promo per-item atau transaksi, serta pengumpulan poin loyalitas pelanggan.
*   **Dashboard & Pelaporan:** Analitik penjualan, produk terlaris, dan performa kasir secara *real-time*.

## Tech Stack

**Backend (API):**
*   [Laravel 11](https://laravel.com/) (PHP Framework)
*   [Sanctum](https://laravel.com/docs/sanctum) (API Authentication)
*   [Spatie Permission](https://spatie.be/docs/laravel-permission) (RBAC)
*   MySQL (Database)

**Frontend (SPA):**
*   [Vue 3](https://vuejs.org/) (Composition API)
*   [Vue Router](https://router.vuejs.org/) (Routing)
*   [Pinia](https://pinia.vuejs.org/) (State Management)
*   [Axios](https://axios-http.com/) (HTTP Client)
*   TypeScript

---

## ⚙️ Cara Instalasi (Local Development)

### Prasyarat
Pastikan sistem Anda sudah terinstal:
*   PHP ^8.5
*   Composer
*   Node.js & npm
*   MySQL

### Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone [https://github.com/Ipul-hash/POS](https://github.com/Ipul-hash/POS)
   cd POS

   
2. Setup Backend (Laravel)
Bash
# Install dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate app key
php artisan key:generate


3. Konfigurasi Database
Buka file .env dan sesuaikan koneksi database Anda:

Code snippet
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database_pos
DB_USERNAME=root
DB_PASSWORD=

# Gunakan file atau cookie untuk session (Khusus API)
SESSION_DRIVER=file

4. Migrasi & Dummy Data (Seeder)
Jalankan perintah ini untuk membuat struktur tabel dan mengisi data awal (termasuk Roles Spatie dan user default).

php artisan migrate --seed

5. Setup Frontend (Vue 3)

Bash
# Install dependensi Node
npm install

# Jalankan Vite dev server
npm run dev

6. Jalankan Laravel Server
Buka tab terminal baru dan jalankan:

Bash
php artisan serve

🔐 Default Login (Dummy Data)Gunakan kredensial berikut untuk mencoba aplikasi (semua password default adalah password)
Admin = owner@nusantara.com password
Kasir = kasir@nusantara.com password
