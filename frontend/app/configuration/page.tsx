import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rows = [
  ["Engine", "Mnemos Memory Engine"],
  ["Persistence", "SQLite"],
  ["Classifier", "Rule-based (no LLM dependency)"],
  ["Temporal logic", "Deterministic supersession"],
  ["Agent interface", "Lightweight MCP-style REST tools"],
  ["Default agent", "default-agent"],
  ["API base", process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"],
];

export default function ConfigurationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Configuration</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Static POC configuration — no runtime auth or multi-tenant settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-800/80">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
            >
              <span className="text-zinc-500">{label}</span>
              <span className="font-mono text-xs text-zinc-200">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
