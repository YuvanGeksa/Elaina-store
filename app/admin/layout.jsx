export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50">
        <div className="glass border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/10 grid place-items-center border border-white/10">
                ⚡
              </div>
              <div>
                <div className="text-sm text-white/70">Admin Dashboard</div>
                <div className="text-base font-semibold tracking-tight">
                  Elaina - Store
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a className="glass rounded-2xl px-3 py-2 text-sm hover:bg-white/15 transition" href="/admin/products">Products</a>
              <a className="glass rounded-2xl px-3 py-2 text-sm hover:bg-white/15 transition" href="/admin/scripts">Scripts</a>
              <a className="glass rounded-2xl px-3 py-2 text-sm hover:bg-white/15 transition" href="/admin/settings">Settings</a>
              <a className="glass rounded-2xl px-3 py-2 text-sm hover:bg-white/15 transition" href="/api/admin/logout">Logout</a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
