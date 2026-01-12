# Elaina - Store (Telegram Bot + Pakasir + Admin Dashboard)

## Fitur Utama
- Telegram bot UI: /start kirim thumbnail + caption + reply keyboard menu
- Buy Panel: pilih egg (JavaScript/Python) -> minta username -> kirim QRIS -> auto deliver setelah paid
- Buy Admin Panel: minta username -> QRIS -> auto deliver
- Buy Reseller: QRIS -> kirim link grup
- Buy Script: list script dari DB -> QRIS -> kirim file ZIP
- Admin Dashboard (iOS glass style):
  - set harga (langsung aktif)
  - upload script ZIP (langsung muncul di bot)
  - setting bot name/dev name/group link/base URL
- Pakasir webhook + verifikasi status via transactiondetail
- Auto-expire: pending order yang lewat expired_at akan otomatis fail + hapus QRIS (Vercel Cron /api/cron/cleanup)

---

## 1) Edit config.js
Wajib isi:
- mongodb.uri
- telegram.botToken
- pakasir.slug + pakasir.apiKey
- (opsional) pterodactyl.* kalau mau auto provision panel

> Kalau kamu edit core secrets di config.js (token/api key) lalu deploy ke Vercel, perubahan butuh redeploy.

## 2) Install & Run
```bash
npm install
npm run dev
```
Buka:
- http://localhost:3000/admin/login

## 3) Set Webhook Telegram (WAJIB untuk Vercel)
Ganti:
- BOT_TOKEN
- DOMAIN

Buka di browser:
```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<DOMAIN>/api/telegram
```

Cek:
```
https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

## 4) Set Webhook Pakasir
Di dashboard Proyek Pakasir, isi Webhook URL:
- https://<DOMAIN>/api/pakasir

## 5) Vercel Cron (Auto cleanup expired)
Sudah disiapkan di vercel.json:
- setiap 5 menit panggil /api/cron/cleanup

---

## Admin Login
Username & password ada di config.js:
- config.admin.username
- config.admin.password

---

## Catatan Teknis
- Semua caption pakai parse_mode HTML Telegram.
- Untuk menghapus QRIS & pending image saat sukses/gagal, message_id disimpan di MongoDB.
- Script ZIP disimpan di MongoDB GridFS (bucket `scripts`).

Good luck 🚀
