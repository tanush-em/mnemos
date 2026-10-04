"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMemory } from "@/lib/api";
import type { MemoryType } from "@/types/memory";

function classifyClient(content: string): MemoryType {
  const text = content.toLowerCase();
  if (
    /previous|yesterday|failed|incident|rollback|revealed|caused/.test(text)
  ) {
    return "EPISODIC";
  }
  if (
    /repository uses|run this|requires|workflow|stored in|pull requests|services use/.test(
      text
    )
  ) {
    return "PROCEDURAL";
  }
  return "SEMANTIC";
}

interface AddMemoryModalProps {
  onCreated?: () => void;
  trigger?: React.ReactNode;
}

export function AddMemoryModal({ onCreated, trigger }: AddMemoryModalProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [memoryType, setMemoryType] = useState<MemoryType>("SEMANTIC");
  const [manualType, setManualType] = useState(false);
  const [source, setSource] = useState("Conversation");
  const [sourceType, setSourceType] = useState("user");
  const [confidence, setConfidence] = useState(90);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggested = useMemo(() => classifyClient(content), [content]);

  useEffect(() => {
    if (!manualType && content) {
      setMemoryType(suggested);
    }
  }, [suggested, manualType, content]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createMemory({
        content: content.trim(),
        memory_type: memoryType,
        source,
        source_type: sourceType,
        confidence: confidence / 100,
      });
      setOpen(false);
      setContent("");
      setManualType(false);
      setConfidence(90);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save memory");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
          <DialogDescription>
            Persist a new memory into the agent memory store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Memory</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="User prefers PostgreSQL…"
              rows={3}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Type</Label>
              {!manualType && content && (
                <span className="font-mono text-[10px] text-zinc-500">
                  auto → {suggested}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {(["SEMANTIC", "EPISODIC", "PROCEDURAL"] as MemoryType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setMemoryType(t);
                    setManualType(true);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    memoryType === t
                      ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Source type</Label>
              <Input
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Confidence</Label>
              <span className="font-mono text-xs text-zinc-400">{confidence}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-zinc-300"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? "Saving…" : "Save Memory"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
