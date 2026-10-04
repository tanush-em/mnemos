"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { name: "Recall Accuracy", value: 94.2 },
  { name: "Conflict Resolution", value: 91.8 },
  { name: "Temporal Consistency", value: 96.1 },
  { name: "Provenance Coverage", value: 88.7 },
];

export function EvaluationSnapshot({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Evaluation Snapshot</CardTitle>
            <CardDescription>
              Demo metrics for portfolio presentation — not scientifically evaluated.
            </CardDescription>
          </div>
          <span className="rounded border border-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            seeded
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          {metrics.map((m) => (
            <div key={m.name} className="rounded-md border border-zinc-800/80 bg-zinc-900/40 p-3">
              <div className="font-mono text-xl text-zinc-100">{m.value}%</div>
              <div className="mt-1 text-xs text-zinc-500">{m.name}</div>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={48}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#52525b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
