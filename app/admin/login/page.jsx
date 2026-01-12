"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(j?.error || "Login gagal");
      return;
    }
    window.location.href = "/admin/products";
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-white/70">
          Username & password hardcode di <code>config.js</code>.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/40"
            placeholder="Username"
            value={username}
            onChange={(e) => setU(e.target.value)}
          />
          <input
            type="password"
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/40"
            placeholder="Password"
            value={password}
            onChange={(e) => setP(e.target.value)}
          />
          {err ? <div className="text-sm text-red-300">{err}</div> : null}
          <button className="glass w-full rounded-2xl px-4 py-3 text-sm hover:bg-white/15 transition">
            Login
          </button>
        </form>

        <div className="mt-6 text-xs text-white/60">
          Setelah login, kamu bisa atur harga & upload script ZIP.
        </div>
      </div>
    </main>
  );
}
