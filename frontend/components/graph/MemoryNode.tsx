"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MemoryStatus, MemoryType } from "@/types/memory";

export type MemoryNodeData = {
  label: string;
  memory_type: MemoryType;
  status: MemoryStatus;
  confidence: number;
};

const typeColor: Record<MemoryType, string> = {
  SEMANTIC: "border-sky-700/70 bg-sky-950/40",
  EPISODIC: "border-amber-700/70 bg-amber-950/40",
  PROCEDURAL: "border-emerald-700/70 bg-emerald-950/40",
};

export function MemoryNode({ data, selected }: NodeProps & { data: MemoryNodeData }) {
  return (
    <div
      className={`min-w-[160px] max-w-[200px] rounded-lg border px-3 py-2 shadow-lg ${
        typeColor[data.memory_type]
      } ${selected ? "ring-1 ring-zinc-300" : ""} ${
        data.status === "SUPERSEDED" ? "opacity-60" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-500 !w-2 !h-2" />
      <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
        {data.memory_type}
      </div>
      <div className="mt-1 text-xs leading-snug text-zinc-100">{data.label}</div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] text-zinc-500">
        <span>{data.status}</span>
        <span>{Math.round(data.confidence * 100)}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-500 !w-2 !h-2" />
    </div>
  );
}
