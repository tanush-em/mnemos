"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  MarkerType,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MemoryNode, type MemoryNodeData } from "@/components/graph/MemoryNode";
import { getGraph } from "@/lib/api";
import type { GraphData } from "@/types/memory";

const nodeTypes = { memory: MemoryNode };

function layoutNodes(data: GraphData): Node[] {
  const cols = 4;
  return data.nodes.map((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: n.id,
      type: "memory",
      position: { x: col * 240, y: row * 140 },
      data: {
        label: n.label,
        memory_type: n.memory_type,
        status: n.status,
        confidence: n.confidence,
      } satisfies MemoryNodeData,
    };
  });
}

export default function GraphPage() {
  const router = useRouter();
  const [data, setData] = useState<GraphData | null>(null);

  useEffect(() => {
    getGraph().then(setData);
  }, []);

  const nodes = useMemo(() => (data ? layoutNodes(data) : []), [data]);
  const edges: Edge[] = useMemo(() => {
    if (!data) return [];
    return data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.relation_type,
      animated: e.relation_type === "SUPERSEDES",
      style: { stroke: "#52525b" },
      labelStyle: { fill: "#a1a1aa", fontSize: 9, fontFamily: "IBM Plex Mono" },
      labelBgStyle: { fill: "#09090b", fillOpacity: 0.9 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#71717a" },
    }));
  }, [data]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="border-b border-zinc-800/80 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-50">Knowledge Graph</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Relationships between memories — supersession, support, and derivation.
          Click a node to inspect.
        </p>
      </div>
      <div className="relative min-h-0 flex-1 bg-[#09090b]">
        {data ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => router.push(`/memories/${node.id}`)}
            colorMode="dark"
          >
            <Background color="#27272a" gap={20} />
            <Controls className="!bg-zinc-950 !border-zinc-800 !shadow-none" />
            <MiniMap
              className="!bg-zinc-950 !border-zinc-800"
              nodeColor="#3f3f46"
              maskColor="rgba(0,0,0,0.6)"
            />
          </ReactFlow>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-500">
            Loading graph…
          </div>
        )}
      </div>
    </div>
  );
}
