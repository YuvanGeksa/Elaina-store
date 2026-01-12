"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/settings");
    const j = await res.json();
    setData(j);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: data.app, reseller: data.reseller, baseUrl: data.baseUrl }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) return setMsg(j?.error || "Gagal menyimpan");
    setMsg("✅ Tersimpan (langsung aktif)");
  }

  if (!data) return <div className="glass rounded-3xl p-6">Loading…</div>;

  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-6">
        <div className="text-sm text-white/60">Settings</div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan Tampilan Bot</h1>
        <p className="mt-1 text-sm text-white/60">
          Di sini untuk hal yang aman diubah tanpa redeploy (nama bot, dev, link reseller, base URL).
        </p>

        <div className="mt-4 glass rounded-2xl p-4 text-sm text-white/70">
          <b>⚠️ Peringatan Redeploy:</b> Secret seperti <code>BOT_TOKEN</code>, <code>PAKASIR_API_KEY</code>, <code>PTERO_API_KEY</code>, dll
          secara default dibaca dari <code>config.js</code>. Jika kamu mengubahnya di file, perlu redeploy Vercel.
          <br />
          <b>Tips:</b> Kamu bisa pakai <b>DB override</b> juga (fitur dapat ditambah) agar tidak perlu redeploy.
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <Field label="Bot Name" value={data.app.botName} onChange={(v) => setData({ ...data, app: { ...data.app, botName: v } })} />
        <Field label="Developer Name" value={data.app.developerName} onChange={(v) => setData({ ...data, app: { ...data.app, developerName: v } })} />
        <Field label="Reseller Group Link" value={data.reseller.groupLink} onChange={(v) => setData({ ...data, reseller: { ...data.reseller, groupLink: v } })} />
        <Field label="Base URL (opsional, untuk gambar)" value={data.baseUrl || ""} onChange={(v) => setData({ ...data, baseUrl: v })} />

        <div className="pt-2 flex items-center gap-3">
          <button onClick={save} className="glass rounded-2xl px-4 py-2 text-sm hover:bg-white/15 transition">
            Save
          </button>
          {msg ? <div className="text-sm text-white/70">{msg}</div> : null}
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <div className="text-sm font-medium">Current Core Secrets (config.js)</div>
        <div className="mt-3 text-xs text-white/60 space-y-2">
          <div>Telegram Bot Token: <code>{mask(data.core.telegramToken)}</code></div>
          <div>Pakasir Slug: <code>{data.core.pakasirSlug}</code></div>
          <div>Pakasir API Key: <code>{mask(data.core.pakasirApiKey)}</code></div>
          <div>Pterodactyl Panel URL: <code>{data.core.pteroUrl}</code></div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{label}</div>
      <input
        className="glass rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/40"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function mask(s) {
  if (!s) return "-";
  const str = String(s);
  if (str.length <= 6) return "******";
  return str.slice(0, 3) + "******" + str.slice(-3);
}
