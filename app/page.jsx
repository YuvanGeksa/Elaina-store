import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass-strong rounded-3xl p-8 max-w-xl w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Elaina - Store</h1>
        <p className="mt-2 text-sm text-white/70">
          Dashboard admin + Telegram bot webhook + Pakasir webhook.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="glass rounded-2xl px-4 py-2 text-sm hover:bg-white/15 transition" href="/admin">
            Open Admin
          </Link>
          <a className="glass rounded-2xl px-4 py-2 text-sm hover:bg-white/15 transition" href="/health">
            Health
          </a>
        </div>
        <p className="mt-6 text-xs text-white/60">
          Tips: Setelah deploy, set Telegram webhook ke <code>/api/telegram</code> dan Pakasir webhook ke <code>/api/pakasir</code>.
        </p>
      </div>
    </main>
  );
}
