"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import {
  ConfidenceBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/memories/MemoryBadges";
import { Input } from "@/components/ui/input";
import { getMemories } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Memory, MemoryStatus, MemoryType } from "@/types/memory";

type Filter = "ALL" | MemoryType | MemoryStatus;

const filters: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SEMANTIC", label: "Semantic" },
  { id: "EPISODIC", label: "Episodic" },
  { id: "PROCEDURAL", label: "Procedural" },
  { id: "CURRENT", label: "Current" },
  { id: "SUPERSEDED", label: "Superseded" },
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setMemories(await getMemories());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      if (filter !== "ALL") {
        if (
          (filter === "SEMANTIC" || filter === "EPISODIC" || filter === "PROCEDURAL") &&
          m.memory_type !== filter
        ) {
          return false;
        }
        if (
          (filter === "CURRENT" || filter === "SUPERSEDED" || filter === "ARCHIVED") &&
          m.status !== filter
        ) {
          return false;
        }
      }
      if (query.trim()) {
        return m.content.toLowerCase().includes(query.toLowerCase());
      }
      return true;
    });
  }, [memories, filter, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Memories</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse, filter, and inspect the agent memory store.
          </p>
        </div>
        <AddMemoryModal onCreated={load} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by content…"
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                filter === f.id
                  ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/80">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Valid from</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr
                key={m.id}
                className="border-b border-zinc-800/60 transition-colors hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3">
                  <Link href={`/memories/${m.id}`} className="text-zinc-100 hover:underline">
                    {m.content}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <TypeBadge type={m.memory_type} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBadge value={m.confidence} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {formatDate(m.valid_from)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">No memories match.</div>
        )}
      </div>
    </div>
  );
}
