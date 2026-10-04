"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ConfidenceBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/memories/MemoryBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemory } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { MemoryDetail } from "@/types/memory";

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    getMemory(params.id)
      .then(setMemory)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [params.id]);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-300">{error}</div>
    );
  }

  if (!memory) {
    return <div className="p-6 font-mono text-xs text-zinc-500">Loading memory…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        href="/memories"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to memories
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-zinc-50">{memory.content}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <TypeBadge type={memory.memory_type} />
          <StatusBadge status={memory.status} />
          <ConfidenceBadge value={memory.confidence} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Temporal State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Valid from" value={formatDate(memory.valid_from)} />
            <Row label="Valid until" value={formatDate(memory.valid_until)} />
            {memory.supersedes && (
              <div>
                <div className="mb-1 text-xs text-zinc-500">Previously</div>
                <Link
                  href={`/memories/${memory.supersedes.id}`}
                  className="text-zinc-200 underline-offset-2 hover:underline"
                >
                  {memory.supersedes.content}
                </Link>
                <div className="mt-1 font-mono text-[10px] text-zinc-600">
                  SUPERSEDED · {formatDate(memory.supersedes.valid_until)}
                </div>
              </div>
            )}
            {memory.superseded_by && (
              <div>
                <div className="mb-1 text-xs text-zinc-500">Superseded by</div>
                <Link
                  href={`/memories/${memory.superseded_by.id}`}
                  className="text-zinc-200 underline-offset-2 hover:underline"
                >
                  {memory.superseded_by.content}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Source" value={memory.provenance.source} />
            <Row label="Source type" value={memory.provenance.source_type} />
            <Row label="Recorded by" value={memory.provenance.recorded_by} />
            <Row label="Evidence" value={memory.provenance.evidence || "—"} />
            <Row label="Recorded" value={formatDate(memory.provenance.created_at)} />
          </CardContent>
        </Card>
      </div>

      {memory.history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Temporal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {memory.history.map((entry, idx) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex w-6 flex-col items-center">
                    <div
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        entry.status === "CURRENT" ? "bg-emerald-400" : "bg-zinc-600"
                      }`}
                    />
                    {idx < memory.history.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-zinc-800" />
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      {formatDate(entry.valid_from)}
                    </div>
                    <Link
                      href={`/memories/${entry.id}`}
                      className="mt-1 block text-sm text-zinc-100 hover:underline"
                    >
                      {entry.content}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <StatusBadge status={entry.status} />
                      {entry.relation && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                          <ArrowRight className="h-3 w-3" />
                          {entry.relation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {memory.supersedes && memory.status === "CURRENT" && (
              <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-xs text-zinc-400">
                {memory.supersedes.content.split(".")[0]} → SUPERSEDED → {memory.content.split(".")[0]}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {memory.related.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Memories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {memory.related.map((rel) => (
              <Link
                key={`${rel.id}-${rel.relation_type}`}
                href={`/memories/${rel.id}`}
                className="flex items-start justify-between gap-3 rounded-md border border-zinc-800/80 px-3 py-2 transition-colors hover:bg-zinc-900/50"
              >
                <div>
                  <div className="text-sm text-zinc-100">{rel.content}</div>
                  <div className="mt-1 flex gap-1.5">
                    <TypeBadge type={rel.memory_type} />
                    <StatusBadge status={rel.status} />
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                  {rel.relation_type}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
