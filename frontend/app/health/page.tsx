"use client";

import { useEffect, useState } from "react";
import { EvaluationSnapshot } from "@/components/dashboard/EvaluationSnapshot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemoryStats } from "@/lib/api";
import type { MemoryStats } from "@/types/memory";

export default function HealthPage() {
  const [stats, setStats] = useState<MemoryStats | null>(null);

  useEffect(() => {
    getMemoryStats().then(setStats);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Memory Health</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Live store counts plus demo evaluation metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          ["Total", stats?.total],
          ["Current", stats?.current],
          ["Superseded", stats?.superseded],
          ["Archived", stats?.archived],
          ["Semantic", stats?.semantic],
          ["Episodic", stats?.episodic],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-normal uppercase tracking-wider text-zinc-500">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl text-zinc-100">{value ?? "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EvaluationSnapshot />
    </div>
  );
}
