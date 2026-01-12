"use client";

import { useEffect, useState } from "react";

export default function ScriptsPage() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/scripts");
    const j = await res.json();
    setList(j.scripts || []);
  }

  useEffect(() => { load(); }, []);

  async function upload(e) {
    e.preventDefault();
    setMsg("");
    if (!file) return setMsg("Pilih file ZIP dulu.");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("displayName", displayName);
    fd.append("price", price);

    const res = await fetch("/api/admin/scripts", { method: "POST", body: fd });
    const j = await res.json().catch(() => null);
    if (!res.ok) return setMsg(j?.error || "Upload gagal");
    setMsg("✅ Upload sukses");
    setFile(null);
    setDisplayName("");
    setPrice("");
    await load();
  }

  async function remove(id) {
    const res = await fetch(`/api/admin/scripts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-6">
        <div className="text-sm text-white/60">Scripts</div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload Script ZIP</h1>
        <p className="mt-1 text-sm text-white/60">
          Bot akan menampilkan list script ini di menu <b>Buy Script</b>. Hanya menerima <code>.zip</code>.
        </p>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <form onSubmit={upload} className="space-y-3">
          <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <input
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/40"
            placeholder="Nama tampil (opsional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/40"
            placeholder="Harga (opsional, kalau kosong pakai default)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button className="glass rounded-2xl px-4 py-2 text-sm hover:bg-white/15 transition">
            Upload
          </button>
          {msg ? <div className="text-sm text-white/70">{msg}</div> : null}
        </form>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <div className="text-sm font-medium">List Script</div>
        <div className="mt-3 space-y-2">
          {list.length === 0 ? (
            <div className="text-sm text-white/60">Belum ada script.</div>
          ) : (
            list.map((s) => (
              <div key={s._id} className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{s.displayName}</div>
                  <div className="text-xs text-white/60">{s.filename} • price: {s.price ?? "default"}</div>
                </div>
                <button onClick={() => remove(s._id)} className="glass rounded-2xl px-3 py-2 text-xs hover:bg-white/15 transition">
                  Disable
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
