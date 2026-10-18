# Indotek Pro

Platform manajemen konstruksi untuk PT. Indotek Karya Nusantara. Frontend React, TypeScript, Vite, Tailwind CSS, PWA; backend Supabase.

## Prasyarat

- Node.js 22 atau lebih baru dan npm
- Project Supabase
- Akun Vercel untuk deployment

## Menjalankan lokal

1. Pasang dependensi: `npm install`
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari **Supabase Dashboard → Project Settings → API**. Gunakan publishable/anon key, jangan pernah masukkan `service_role` key ke frontend.
4. Jalankan migrasi SQL sesuai urutan di **Supabase Dashboard → SQL Editor**:
   - `supabase/migrations/20261017000000_init_schema.sql`
   - `supabase/migrations/20261017000001_fase2_rab_laporan_kurvas.sql`
   - `supabase/migrations/20261018000000_auth_org_onboarding.sql`
5. Jalankan `npm run dev`; buka URL yang ditampilkan Vite (default `http://localhost:3000`).

Project Supabase harus mengaktifkan Email Auth. Dengan kredensial Supabase terkonfigurasi, aplikasi meminta login/daftar email dan kata sandi; jika konfirmasi email aktif, konfirmasi email sebelum masuk. Setelah login, buat organisasi. Migrasi onboarding membuat profil dan membership owner secara atomik lewat RPC terautentikasi. Seed SQL menyediakan paket langganan; data demo lokal tidak sama dengan data tenant Supabase.

## Pemeriksaan

- `npm run lint` — pemeriksaan TypeScript
- `npm run build` — build produksi termasuk service worker PWA

## Deploy ke Vercel

1. Push repository ke Git provider, lalu import repository di Vercel.
2. Atur framework preset **Vite** dan root directory ke folder project ini.
3. Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di **Project Settings → Environment Variables** untuk Preview dan Production.
4. Deploy. `vercel.json` mengarahkan rute SPA ke `index.html`; build menghasilkan manifest dan service worker PWA.
5. Uji deployment: login, pemilihan organisasi, serta CRUD proyek dengan akun terotorisasi.

## Struktur penting

- `src/features/` — tampilan fitur
- `src/services/` — akses data
- `src/lib/supabase.ts` — klien Supabase
- `supabase/migrations/` — skema, RLS, dan migrasi fitur
- `public/` — aset PWA

Aplikasi mendukung konfigurasi Supabase melalui environment. Mode demo lokal memakai localStorage dan data contoh; jangan gunakan mode demo untuk data produksi.