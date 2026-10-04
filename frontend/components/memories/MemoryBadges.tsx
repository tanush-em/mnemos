import { Badge } from "@/components/ui/badge";
import { confidencePct } from "@/lib/utils";
import type { MemoryStatus, MemoryType } from "@/types/memory";

const typeVariant = {
  SEMANTIC: "semantic",
  EPISODIC: "episodic",
  PROCEDURAL: "procedural",
} as const;

const statusVariant = {
  CURRENT: "current",
  SUPERSEDED: "superseded",
  ARCHIVED: "archived",
} as const;

export function TypeBadge({ type }: { type: MemoryType }) {
  return <Badge variant={typeVariant[type]}>{type}</Badge>;
}

export function StatusBadge({ status }: { status: MemoryStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}

export function ConfidenceBadge({ value }: { value: number }) {
  return <Badge variant="default">{confidencePct(value)}</Badge>;
}
