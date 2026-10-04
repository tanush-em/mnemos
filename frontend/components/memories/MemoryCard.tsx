import Link from "next/link";
import {
  ConfidenceBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/memories/MemoryBadges";
import { formatDate } from "@/lib/utils";
import type { Memory } from "@/types/memory";

export function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <Link
      href={`/memories/${memory.id}`}
      className="block rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            memory.status === "CURRENT"
              ? "bg-emerald-400"
              : memory.status === "SUPERSEDED"
                ? "bg-zinc-500"
                : "bg-zinc-700"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-100">{memory.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={memory.memory_type} />
            <StatusBadge status={memory.status} />
            <ConfidenceBadge value={memory.confidence} />
            <span className="ml-auto font-mono text-[10px] text-zinc-600">
              {formatDate(memory.valid_from)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
