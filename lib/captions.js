export function startCaption(settings) {
  return `<b>✨ ${escapeHtml(settings.app.botName)} ✨</b>
<i>Auto Buy • Fast Delivery • Aman & Terpercaya</i>

Selamat datang di <b>${escapeHtml(settings.app.botName)}</b>.
Kami menyediakan layanan pembelian otomatis untuk kebutuhan panel, reseller, VPS, dan script bot.

<b>📦 Layanan Tersedia:</b>
• <b>Server Panel</b> — panel siap pakai untuk bot / app
• <b>Admin Panel</b> — akses admin panel pterodactyl
• <b>Reseller Panel</b> — join grup reseller resmi
• <b>Script Bot</b> — beli & download script siap pakai

<b>⚡ Cara Pembelian:</b>
1. Pilih produk melalui tombol menu
2. Lakukan pembayaran via QRIS
3. Produk akan dikirim otomatis setelah pembayaran berhasil

<b>👨‍💻 Developer:</b> <code>${escapeHtml(settings.app.developerName)}</code>`;
}

export function chooseEggCaption() {
  return `<b>🛒 Buy Server Panel</b>

Silakan pilih <b>bahasa panel</b> yang ingin kamu gunakan.
Pilihan ini menentukan jenis server yang akan dibuat untuk kamu.

<b>🧩 Pilihan Tersedia:</b>
• <b>JavaScript</b> — cocok untuk bot Node.js
• <b>Python</b> — cocok untuk bot & automation Python

<i>Setelah memilih bahasa, bot akan meminta username panel kamu.</i>`;
}

export function askPanelUsernameCaption() {
  return `<b>✍️ Masukkan Username Panel</b>

Silakan ketik <b>username panel</b> yang ingin kamu gunakan.
Username akan digunakan untuk login ke panel pterodactyl.

<b>📌 Ketentuan:</b>
• Tanpa spasi
• Gunakan huruf & angka
• Username bersifat unik

<i>Contoh:</i> <code>elaina_panel</code>`;
}

export function askAdminUsernameCaption() {
  return `<b>👑 Buy Admin Panel</b>

Silakan ketik <b>username admin panel</b> yang kamu inginkan.
Akun ini akan memiliki <b>akses admin</b> ke panel pterodactyl.

<b>⚠️ Perhatian:</b>
Akses admin bersifat sensitif. Harap gunakan dengan bijak.

<i>Contoh:</i> <code>admin_elaina</code>`;
}

export function scriptsCaption() {
  return `<b>📦 Buy Script Bot</b>

Silakan pilih <b>script</b> yang tersedia di bawah ini.
Script akan dikirim otomatis dalam bentuk file setelah pembayaran berhasil.

<b>📌 Catatan:</b>
• Script siap pakai
• File dikirim langsung oleh bot`;
}

export function pendingCaption() {
  return `<b>⏳ Menyiapkan Pembayaran</b>

Mohon tunggu sebentar.
Sistem sedang menyiapkan QRIS untuk pesanan kamu.`;
}

export function qrisCaption(orderId, amount) {
  return `<b>📲 Pembayaran QRIS</b>

Silakan lakukan pembayaran menggunakan <b>QRIS</b> di bawah ini.

<b>🧾 Detail Pesanan:</b>
• <b>Order ID:</b> <code>${escapeHtml(orderId)}</code>
• <b>Total Bayar:</b> <code>Rp ${formatIDR(amount)}</code>

<b>📌 Petunjuk Pembayaran:</b>
1. Scan QRIS menggunakan aplikasi e-wallet / mobile banking
2. Pastikan nominal pembayaran <b>sesuai</b>
3. Selesaikan pembayaran hingga status <b>BERHASIL</b>

<i>⚡ Setelah pembayaran berhasil, sistem akan otomatis memverifikasi dan mengirim produk ke chat ini.</i>`;
}

export function failCaption() {
  return `<b>❌ Pembayaran Gagal</b>

Pembayaran kamu tidak berhasil atau telah dibatalkan.

<b>📌 Penyebab umum:</b>
• QRIS expired
• Pembayaran dibatalkan
• Nominal tidak sesuai

Silakan lakukan pemesanan ulang melalui menu bot.`;
}

export function successCaption() {
  return `<b>✅ Pembayaran Berhasil</b>

Terima kasih!
Pembayaran kamu telah berhasil diverifikasi oleh sistem.

<b>📦 Pesanan sedang diproses</b>
Mohon tunggu sebentar, produk akan segera dikirim otomatis.`;
}

export function panelDeliverCaption(settings, data) {
  return `<b>🎉 Server Panel Berhasil Dibuat</b>

Berikut detail akun panel kamu:

<b>🌐 URL Panel:</b>
<a href="${escapeHtml(settings.pterodactyl.panelUrl)}">${escapeHtml(settings.pterodactyl.panelUrl)}</a>
<b>👤 Username:</b> <code>${escapeHtml(data.username)}</code>
<b>🔑 Password:</b> <code>${escapeHtml(data.password)}</code>
<b>🧩 Egg:</b> <code>${escapeHtml(data.eggName)}</code>

<b>📌 Catatan:</b>
Simpan data ini dengan baik dan jangan dibagikan ke orang lain.`;
}

export function adminDeliverCaption(settings, data) {
  return `<b>👑 Admin Panel Aktif</b>

<b>🌐 URL Panel:</b>
<a href="${escapeHtml(settings.pterodactyl.panelUrl)}">${escapeHtml(settings.pterodactyl.panelUrl)}</a>
<b>👤 Username:</b> <code>${escapeHtml(data.username)}</code>
<b>🔑 Password:</b> <code>${escapeHtml(data.password)}</code>

<i>Saran:</i> Setelah login, segera ganti password.`;
}

export function resellerDeliverCaption(groupLink) {
  return `<b>🤝 Reseller Access</b>

Silakan join grup reseller di link berikut:
<a href="${escapeHtml(groupLink)}">Klik untuk join grup</a>`;
}

export function scriptDeliverCaption(settings) {
  return `<b>📦 Script Siap Didownload</b>
Berikut file script kamu. Terima kasih sudah membeli di <b>${escapeHtml(settings.app.botName)}</b> ✨`;
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatIDR(amount) {
  try {
    return Number(amount).toLocaleString("id-ID");
  } catch {
    return String(amount);
  }
}
