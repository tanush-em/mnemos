"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  agentForget,
  agentHistory,
  agentRecall,
  agentRemember,
} from "@/lib/api";

const tools = [
  { name: "remember", description: "Store a new memory" },
  { name: "recall", description: "Retrieve relevant memories" },
  { name: "history", description: "Retrieve temporal memory history" },
  { name: "forget", description: "Archive a memory" },
];

const examples: Record<string, object> = {
  recall: {
    tool: "recall",
    query: "What database does the project currently use?",
  },
  remember: {
    tool: "remember",
    content: "User prefers dark-mode dashboards for ops tooling.",
    confidence: 0.9,
  },
  history: {
    tool: "history",
    memory_id: "mem_postgres",
  },
  forget: {
    tool: "forget",
    memory_id: "mem_sem_09",
  },
};

export default function AgentPage() {
  const [tool, setTool] = useState("recall");
  const [requestText, setRequestText] = useState(JSON.stringify(examples.recall, null, 2));
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  function selectTool(name: string) {
    setTool(name);
    setRequestText(JSON.stringify(examples[name], null, 2));
    setResponseText("");
  }

  async function run() {
    setLoading(true);
    setResponseText("");
    try {
      const payload = JSON.parse(requestText);
      let result: unknown;
      if (payload.tool === "recall" || tool === "recall") {
        result = await agentRecall(payload.query);
      } else if (payload.tool === "remember" || tool === "remember") {
        result = await agentRemember({
          content: payload.content,
          confidence: payload.confidence,
          memory_type: payload.memory_type,
          source: payload.source || "Agent",
          source_type: payload.source_type || "agent",
          supersedes_id: payload.supersedes_id,
        });
      } else if (payload.tool === "history" || tool === "history") {
        result = await agentHistory(payload.memory_id);
      } else if (payload.tool === "forget" || tool === "forget") {
        result = await agentForget(payload.memory_id);
      } else {
        throw new Error("Unknown tool");
      }
      setResponseText(JSON.stringify(result, null, 2));
    } catch (err) {
      setResponseText(
        JSON.stringify(
          { error: err instanceof Error ? err.message : "Request failed" },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Agent Memory Interface</h1>
        <p className="mt-1 text-sm text-zinc-500">
          MCP-style conceptual tools backed by real FastAPI endpoints.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {tools.map((t) => (
          <button
            key={t.name}
            onClick={() => selectTool(t.name)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              tool === t.name
                ? "border-zinc-500 bg-zinc-900"
                : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
            }`}
          >
            <div className="font-mono text-sm text-zinc-100">● {t.name}</div>
            <div className="mt-1 text-xs text-zinc-500">{t.description}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Edit the JSON payload and execute.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              rows={14}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
            <Button onClick={run} disabled={loading}>
              {loading ? "Running…" : "Execute"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>Live response from the Mnemos API.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="min-h-[280px] overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              {responseText || "// response will appear here"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
