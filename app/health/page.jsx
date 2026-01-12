export default function Health() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="glass rounded-3xl p-6">
        <div className="text-lg font-semibold">OK</div>
        <div className="mt-1 text-sm text-white/70">
          Server is running.
        </div>
      </div>
    </main>
  );
}
