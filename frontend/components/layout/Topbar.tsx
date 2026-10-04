export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-100">Mnemos</span>
        <span className="text-zinc-700">·</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
          Memory Engine
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </span>
      </div>
      <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-xs text-zinc-400">
        Agent: default-agent
      </div>
    </header>
  );
}
