# Jalin.AI — Admin Panel + Super Admin (Fase 3)

UI Vue 3 + Tailwind buat kelola platform tanpa `curl`. Terhubung ke **RAG service
(Fase 2)** buat manajemen toko/dokumen/widget, dan baca status **Gateway (Fase 1)**.

## Fitur

- **Login** admin token (verifikasi ke RAG `/admin/tenants`).
- **Dashboard (Super Admin)**: jumlah toko, provider AI aktif, model tersedia, buat toko baru.
- **Detail Toko (Admin)**:
  - 📄 Upload PDF FAQ (drag-less, langsung ke-index) + list & hapus dokumen
  - 🎨 Editor tampilan widget (judul/warna/sapaan) + **preview live**
  - 💬 Uji chatbot inline (tanya → jawaban RAG + sumber)
  - 🔌 Snippet embed siap tempel

## Jalanin

Butuh **RAG (Fase 2, :8090)** dan idealnya **Gateway (Fase 1, :8080)** jalan dulu.

```bash
cd jalinai-panel
cp .env.example .env      # arahkan VITE_RAG_URL / VITE_GATEWAY_URL kalau beda
npm install
npm run dev               # http://localhost:5173
```

Login pakai `ADMIN_TOKEN` dari RAG service (default `jln-admin-dev`).

## Build produksi

```bash
npm run build             # hasil di dist/ (static, bisa taruh di cPanel/Netlify/dll)
```

Panel ini **static SPA** — nggak butuh Node runtime, jadi cocok di hosting static
mana pun; cukup arahkan `VITE_RAG_URL` ke RAG service produksi.

## Belum termasuk (masuk Fase 4)

Manajemen **pricing** & **API key pelanggan** + **tracking token** — itu bagian
Fase 4 (Pricing & Token System) yang butuh persistence + payment (Midtrans/Xendit).
Panel ini fokus ke manajemen toko/FAQ/widget yang backend-nya sudah siap.
