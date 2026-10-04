"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge, TypeBadge } from "@/components/memories/MemoryBadges";
import { getMemories } from "@/lib/api";
import { formatMonth } from "@/lib/utils";
import type { Memory, MemoryType } from "@/types/memory";

type Filter = "ALL" | MemoryType;

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    getMemories().then(setMemories);
  }, []);

  const groups = useMemo(() => {
    const filtered =
      filter === "ALL"
        ? memories
        : memories.filter((m) => m.memory_type === filter);

    const sorted = [...filtered].sort(
      (a, b) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime()
    );

    const map = new Map<string, Memory[]>();
    for (const m of sorted) {
      const key = formatMonth(m.valid_from);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [memories, filter]);

  const supersededLookup = useMemo(() => {
    // Annotate when a later CURRENT memory exists for similar topics via status
    return new Set(memories.filter((m) => m.status === "SUPERSEDED").map((m) => m.id));
  }, [memories]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Memory Timeline</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Chronological view of how agent knowledge evolved.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["ALL", "SEMANTIC", "EPISODIC", "PROCEDURAL"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              filter === f
                ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="relative space-y-8 border-l border-zinc-800 pl-6">
        {groups.map(([month, items]) => (
          <section key={month}>
            <div className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-zinc-600 bg-zinc-950" />
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
              {month}
            </h2>
            <div className="mt-3 space-y-3">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3"
                >
                  <Link
                    href={`/memories/${m.id}`}
                    className="text-sm text-zinc-100 hover:underline"
                  >
                    {m.content}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={m.memory_type} />
                    <StatusBadge status={m.status} />
                  </div>
                  {supersededLookup.has(m.id) && (
                    <div className="mt-2 font-mono text-[10px] text-zinc-500">
                      ↓ later superseded
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
