"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/products");
    const j = await res.json();
    setData(j);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing: data.pricing }),
    });
    const j = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) return setMsg(j?.error || "Gagal menyimpan");
    setMsg("✅ Tersimpan (langsung aktif)");
  }

  if (!data) {
    return <div className="glass rounded-3xl p-6">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-6">
        <div className="text-sm text-white/60">Pricing</div>
        <h1 className="text-2xl font-semibold tracking-tight">Harga Produk</h1>
        <p className="mt-1 text-sm text-white/60">
          Harga yang diubah di sini akan disimpan ke MongoDB (override) dan langsung dipakai bot tanpa redeploy.
        </p>
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <Field label="Buy Panel" value={data.pricing.buyPanel} onChange={(v) => setData({ ...data, pricing: { ...data.pricing, buyPanel: v } })} />
        <Field label="Buy Admin Panel" value={data.pricing.buyAdminPanel} onChange={(v) => setData({ ...data, pricing: { ...data.pricing, buyAdminPanel: v } })} />
        <Field label="Buy Reseller" value={data.pricing.buyReseller} onChange={(v) => setData({ ...data, pricing: { ...data.pricing, buyReseller: v } })} />
        <Field label="Buy Script (Default)" value={data.pricing.buyScriptDefault} onChange={(v) => setData({ ...data, pricing: { ...data.pricing, buyScriptDefault: v } })} />

        <div className="pt-2 flex items-center gap-3">
          <button disabled={saving} onClick={save} className="glass rounded-2xl px-4 py-2 text-sm hover:bg-white/15 transition disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          {msg ? <div className="text-sm text-white/70">{msg}</div> : null}
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
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="angka, contoh 22000"
      />
    </div>
  );
}
