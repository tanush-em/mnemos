"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { EvaluationSnapshot } from "@/components/dashboard/EvaluationSnapshot";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { Input } from "@/components/ui/input";
import { getMemories, getMemoryStats, searchMemories } from "@/lib/api";
import type { Memory, MemoryStats } from "@/types/memory";

export default function OverviewPage() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([getMemoryStats(), getMemories()]);
      setStats(s);
      setMemories(m.slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query.trim()) {
        const m = await getMemories();
        setMemories(m.slice(0, 8));
        return;
      }
      const m = await searchMemories(query.trim());
      setMemories(m.slice(0, 12));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const statCards = [
    { label: "Memories", value: stats?.total ?? "—" },
    { label: "Semantic", value: stats?.semantic ?? "—" },
    { label: "Episodic", value: stats?.episodic ?? "—" },
    { label: "Procedural", value: stats?.procedural ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Persistent memory layer for AI agents — temporal state, provenance, and current truth.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4"
          >
            <div className="font-mono text-2xl text-zinc-50">{card.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories…"
            className="pl-9"
          />
        </div>
        <AddMemoryModal onCreated={load} />
      </div>

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}. Is the backend running on port 8000?
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">
            {query.trim() ? "Search results" : "Recent memories"}
          </h2>
          <span className="font-mono text-[10px] text-zinc-600">
            {loading ? "loading…" : `${memories.length} shown`}
          </span>
        </div>
        <div className="space-y-2">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
          {!loading && memories.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
              No memories found.
            </div>
          )}
        </div>
      </div>

      <EvaluationSnapshot compact />
    </div>
  );
}
