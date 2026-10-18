# DESIGN.md — Design System Indotek Pro

Sumber kebenaran **tampilan & interaksi**. Semua UI wajib memakai token dan pola di sini. Dilarang menulis warna/ukuran/bayangan ad-hoc di komponen fitur.

## 1. Karakter Visual

**Modern, bersih, elegan, tepercaya** — seperti SaaS premium (Linear/Stripe/Notion) namun bernuansa konstruksi: navy yang kokoh, aksen amber/oranye, whitespace lega, hierarki jelas. Data padat tetap terbaca. Tidak ramai, tidak norak, tanpa gradien berlebihan.

Prinsip:
1. **Kejelasan > dekorasi.** Setiap elemen punya fungsi.
2. **Konsisten.** Pola sama untuk hal sama.
3. **Mobile-first.** Dirancang dari 360px, lalu diperluas.
4. **Cepat dipindai.** Angka penting besar, label kecil & redup.
5. **Ramah lapangan.** Target sentuh besar, kontras tinggi, bisa dipakai satu tangan.

## 2. Design Tokens

Implementasi sebagai CSS variables di `:root` dan `.dark`, dipetakan ke Tailwind (`tailwind.config`). Komponen hanya memakai token semantik (mis. `bg-surface`, `text-muted`), bukan hex.

### 2.1 Warna Brand
| Token | Light | Dark | Pemakaian |
|---|---|---|---|
| `--primary-50` | `#EFF4FB` | — | latar tint |
| `--primary-100` | `#DCE7F6` | — | hover halus |
| `--primary-500` | `#2B5C9E` | `#5B8FD6` | link, fokus |
| `--primary-600` | `#1E4A85` | `#4A7DC4` | tombol primer hover |
| `--primary-700` | `#163A6A` | — | tombol primer aktif |
| `--primary-900` | `#0F2A4A` | — | sidebar, header gelap |
| `--accent-400` | `#FBBF24` | `#FBBF24` | highlight |
| `--accent-500` | `#F59E0B` | `#F59E0B` | aksen/CTA sekunder, FAB |
| `--accent-600` | `#D97706` | `#D97706` | aksen hover |

Tombol primer = `primary-700` (light) dengan teks putih. Aksen amber dipakai hemat (FAB, badge penting, grafik pendamping).

### 2.2 Netral & Permukaan
| Token | Light | Dark |
|---|---|---|
| `--bg` (latar halaman) | `#F6F7F9` | `#0B1220` |
| `--surface` (kartu) | `#FFFFFF` | `#111A2B` |
| `--surface-2` (nested/hover) | `#F1F3F6` | `#17223A` |
| `--border` | `#E3E7ED` | `#243049` |
| `--border-strong` | `#CBD2DC` | `#33425F` |
| `--text` | `#0F172A` | `#E8EDF5` |
| `--text-muted` | `#5B6676` | `#9AA7BD` |
| `--text-subtle` | `#8A94A6` | `#6F7C93` |

### 2.3 Warna Semantik
| Status | Fg | Bg tint (light) |
|---|---|---|
| Success | `#15803D` | `#E8F6EC` |
| Warning | `#B45309` | `#FEF3C7` |
| Danger | `#B91C1C` | `#FDECEC` |
| Info | `#1D4ED8` | `#E6EEFF` |
| Neutral | `#475569` | `#EEF1F5` |

Di dark mode gunakan tint transparan (`color/15`) di atas surface. Status **tidak boleh** hanya dibedakan warna: sertakan ikon atau teks.

### 2.4 Tipografi
- Font: **Plus Jakarta Sans** (utama) dengan fallback **Inter**, `system-ui`, sans-serif. Self-host / bundle via npm (`@fontsource`), **bukan CDN**.
- Angka tabular (`font-variant-numeric: tabular-nums`) untuk semua angka uang/volume di tabel.

| Peran | Ukuran / Line-height | Berat |
|---|---|---|
| Display (angka KPI) | 28–32 / 1.2 | 700 |
| H1 halaman | 24 / 1.3 | 700 |
| H2 seksi | 18 / 1.35 | 600 |
| H3 kartu | 16 / 1.4 | 600 |
| Body | 14 / 1.5 | 400 |
| Body-lg (mobile input) | 16 / 1.5 | 400 |
| Caption/label | 12 / 1.4 | 500 |

Input di mobile minimal 16px (mencegah zoom otomatis iOS).

### 2.5 Spasi, Radius, Bayangan
- Skala spasi: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 (kelipatan 4).
- Radius: `sm 6` (badge/input kecil), `md 10` (input/tombol), `lg 14` (kartu), `xl 20` (modal/sheet), `full` (avatar/pill).
- Bayangan (halus): `shadow-xs` (kartu), `shadow-sm` (dropdown), `shadow-md` (modal), `shadow-lg` (sheet mobile). Di dark mode kurangi bayangan, andalkan border.
- Container konten maks `1440px`; padding halaman 16 (mobile) / 24 (tablet) / 32 (desktop).

### 2.6 Z-index & Motion
- Z-index: base 0 · sticky 20 · sidebar 30 · dropdown 40 · modal 50 · toast 60.
- Durasi: 120ms (hover), 200ms (transisi umum), 300ms (sheet/drawer). Easing `cubic-bezier(.2,.8,.2,1)`.
- Hormati `prefers-reduced-motion`: matikan animasi non-esensial.

## 3. Layout & Navigasi

### 3.1 Desktop (≥ 1024px)
- **Sidebar kiri** 264px (dapat di-collapse ke 72px ikon saja), latar `primary-900`, teks terang, item aktif berlatar tint + penanda aksen amber di kiri.
- **Top bar** 64px: breadcrumb/judul, **pemilih proyek**, pencarian global (`Ctrl/Cmd+K` command palette), notifikasi, toggle tema, menu profil.
- Area konten dengan header halaman (judul, deskripsi singkat, aksi utama di kanan).

### 3.2 Tablet (640–1023px)
- Sidebar collapsed (ikon) default; konten 2 kolom bila perlu.

### 3.3 Mobile (< 640px)
- **Bottom navigation** 5 item maks: Beranda, Proyek, + (aksi cepat), Tugas/Approval, Menu. Tinggi 64px + safe-area.
- **FAB / aksi cepat** (warna aksen): Laporan Harian, Foto, Permintaan Material, Absensi.
- **Drawer/sheet** untuk menu lengkap dan filter.
- Header ringkas 56px dengan judul, tombol kembali, aksi utama.
- Tabel → **card list**; aksi sekunder via menu titik tiga atau swipe.
- Hormati safe-area (`env(safe-area-inset-*)`).

## 4. Komponen Inti (di `components/ui`)

Semua berbasis Radix + Tailwind, varian lewat `cva`.

- **Button:** `primary`, `secondary`, `outline`, `ghost`, `destructive`, `accent`; ukuran `sm 32 / md 40 / lg 48`; state loading (spinner, disable). Mobile target ≥ 44px.
- **Input/Textarea/Select/Combobox/DatePicker/NumberInput/CurrencyInput (Rp):** label di atas, helper text, error inline berwarna danger + ikon, prefix/suffix.
- **Checkbox, Radio, Switch, Tabs, Accordion, Tooltip, Popover, Dropdown Menu.**
- **Dialog/Modal** (desktop) & **Bottom Sheet** (mobile) dengan komponen adaptif yang sama.
- **Card:** padding 16/20, border `--border`, radius `lg`, `shadow-xs`.
- **Badge/StatusPill:** warna semantik + ikon kecil.
- **Avatar & AvatarGroup**, **Progress bar**, **Stepper** (alur approval), **Timeline** (aktivitas).
- **Toast** (sukses/error/info) — posisi kanan-atas desktop, atas tengah mobile.
- **Skeleton, EmptyState, ErrorState, ConfirmDialog.**
- **DataTable:** sort, filter, pencarian, pagination server-side, pilih kolom, density, ekspor, baris dapat dipilih; header sticky; di mobile jadi `CardList`.
- **KPI Card:** label kecil, angka Display, delta (▲/▼ + warna), sparkline opsional.
- **Chart (Recharts):** palet dari token (primary, accent, success, danger, neutral), sumbu halus, tooltip konsisten, legenda jelas; skema warna ramah buta warna.
- **FileUploader:** drag & drop, preview, progres, kompres gambar, status antrian offline.
- **SignaturePad**, **PhotoGrid** (galeri laporan lapangan), **GanttView**, **KurvaSChart**.
- **OfflineBanner & SyncIndicator:** pill status `Online`, `Offline`, `Menyinkronkan (n)`, `Gagal sinkron`.
- **InstallPrompt** PWA (Android) & panduan A2HS (iOS).

## 5. Pola Halaman

### 5.1 Struktur halaman standar
`PageHeader` (judul + deskripsi + aksi) → filter bar → konten (KPI / tabel / kartu) → footer aksi (bila form).

### 5.2 Daftar (List)
Pencarian + filter chip di atas, tabel/card list, pagination, aksi massal bila perlu. Empty state menyertakan ilustrasi ringan + CTA ("Buat proyek pertama").

### 5.3 Detail
Header entitas (nama, status pill, metadata utama, aksi), lalu **Tabs** untuk seksi. Di mobile tab bisa scroll horizontal.

### 5.4 Form
- Satu kolom di mobile; 2 kolom di desktop untuk form panjang, dikelompokkan dalam kartu bertajuk.
- Validasi inline saat blur & saat submit; ringkasan error bila banyak.
- Tombol aksi sticky di bawah pada mobile.
- **Autosave draft** untuk form panjang (laporan harian).
- Konfirmasi sebelum meninggalkan halaman bila ada perubahan belum disimpan.

### 5.5 State wajib di setiap halaman
1. **Loading:** skeleton yang meniru bentuk konten (bukan spinner penuh layar).
2. **Empty:** pesan membantu + CTA.
3. **Error:** pesan manusiawi + tombol "Coba lagi".
4. **Offline:** banner + fungsi yang tetap tersedia.
5. **Tidak berizin:** halaman 403 yang ramah, bukan layar kosong.

## 6. Konten & Microcopy (Bahasa Indonesia)

- Nada: jelas, sopan, singkat, aktif. Hindari jargon berlebih; pakai istilah industri yang umum (RAB, BOQ, SPK, termin, opname).
- Tombol berupa kata kerja: "Simpan", "Ajukan Approval", "Tambah Proyek", bukan "OK".
- Pesan error: apa yang terjadi + apa yang bisa dilakukan. Contoh: "Gagal menyimpan laporan. Periksa koneksi lalu coba lagi."
- Format:
  - Uang: `Rp 1.250.000` (titik ribuan); ringkas di KPI: `Rp 1,25 M`, `Rp 350 Jt`.
  - Persen: `42,5%`. Tanggal: `18 Okt 2026`; lengkap `Minggu, 18 Oktober 2026`. Waktu 24 jam `14:30` + zona (WIB/WITA/WIT).
  - Volume: angka + satuan (`125,50 m³`).

## 7. Status & Warna Domain

| Domain | Status → warna |
|---|---|
| Proyek | Perencanaan (info) · Berjalan (primary) · Selesai (success) · Ditunda (warning) · Dibatalkan (neutral) |
| Approval | Menunggu (warning) · Disetujui (success) · Ditolak (danger) · Draf (neutral) |
| Progres vs rencana | Di depan/sesuai (success) · Terlambat ringan (warning) · Terlambat berat (danger) |
| Prioritas | Rendah (neutral) · Sedang (info) · Tinggi (warning) · Kritis (danger) |

## 8. Dark Mode

- Ikuti preferensi sistem + toggle manual (tersimpan).
- Gunakan token dark di §2; hindari hitam murni (`#000`) dan putih murni besar.
- Periksa kontras grafik, badge, dan border di kedua tema.

## 9. Aksesibilitas

- Kontras teks ≥ 4.5:1 (besar ≥ 3:1). Indikator fokus terlihat (ring `primary-500` 2px + offset).
- Semua kontrol dapat dioperasikan dengan keyboard; urutan tab logis; `Esc` menutup modal.
- Label ARIA untuk ikon-saja; `aria-live` untuk toast & status sinkron.
- Target sentuh ≥ 44×44px di mobile. Jangan mengandalkan warna saja.
- Dukung zoom teks hingga 200% tanpa layout rusak.

## 10. PWA Visual

- `theme_color`: `#0F2A4A`; `background_color`: `#F6F7F9`; `display: standalone`.
- Ikon: 192, 512, **maskable** 512; Apple touch icon 180. Logo: huruf "I" / monogram "IP" di atas navy dengan aksen amber.
- Splash: logo di tengah, latar navy.
- Halaman `offline` bermerek, dengan tombol "Coba lagi".

## 11. Do & Don't

**Do**
- Gunakan komponen & token yang ada; buat komponen baru bila pola berulang ≥ 3 kali.
- Rata kanan angka di tabel, tabular-nums, header kolom jelas.
- Beri umpan balik instan (optimistic UI, toast).
- Uji di 360px, 768px, 1280px+ dan kedua tema.

**Don't**
- Hex/pixel ad-hoc di komponen fitur; font/ikon dari CDN.
- Modal bertumpuk; tabel lebar yang memaksa scroll horizontal tanpa kontainer.
- Warna sebagai satu-satunya pembeda status.
- Animasi berat atau memblokir interaksi.
- Menampilkan angka mentah tanpa format (`1250000`).

## 12. Checklist Review UI (per halaman)

- [ ] Memakai token & komponen design system
- [ ] Loading / empty / error / offline / 403 tersedia
- [ ] Mobile (360px) dan desktop (≥1280px) rapi
- [ ] Dark mode benar
- [ ] Format Rupiah/tanggal/volume benar
- [ ] Keyboard & fokus baik; kontras lulus
- [ ] Microcopy Bahasa Indonesia, tombol berupa kata kerja
