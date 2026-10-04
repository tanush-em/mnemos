import type {
  AgentRecallResponse,
  GraphData,
  HistoryEntry,
  Memory,
  MemoryCreate,
  MemoryDetail,
  MemoryStats,
  MemoryStatus,
  MemoryType,
} from "@/types/memory";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function getMemories(params?: {
  memory_type?: MemoryType;
  status?: MemoryStatus;
}): Promise<Memory[]> {
  const qs = new URLSearchParams();
  if (params?.memory_type) qs.set("memory_type", params.memory_type);
  if (params?.status) qs.set("status", params.status);
  const suffix = qs.toString() ? `?${qs}` : "";
  return request<Memory[]>(`/api/memories${suffix}`);
}

export function getMemoryStats(): Promise<MemoryStats> {
  return request<MemoryStats>("/api/memories/stats");
}

export function searchMemories(q: string): Promise<Memory[]> {
  return request<Memory[]>(`/api/memories/search?q=${encodeURIComponent(q)}`);
}

export function getMemory(id: string): Promise<MemoryDetail> {
  return request<MemoryDetail>(`/api/memories/${id}`);
}

export function getMemoryHistory(id: string): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>(`/api/memories/${id}/history`);
}

export function createMemory(payload: MemoryCreate): Promise<Memory> {
  return request<Memory>("/api/memories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteMemory(id: string): Promise<void> {
  return request<void>(`/api/memories/${id}`, { method: "DELETE" });
}

export function getGraph(): Promise<GraphData> {
  return request<GraphData>("/api/graph");
}

export function agentRecall(query: string): Promise<AgentRecallResponse> {
  return request<AgentRecallResponse>("/api/agent/recall", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function agentRemember(payload: MemoryCreate): Promise<Memory> {
  return request<Memory>("/api/agent/remember", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function agentForget(memoryId: string): Promise<Memory> {
  return request<Memory>("/api/agent/forget", {
    method: "POST",
    body: JSON.stringify({ memory_id: memoryId }),
  });
}

export function agentHistory(memoryId: string): Promise<{ memory_id: string; history: HistoryEntry[] }> {
  return request(`/api/agent/history`, {
    method: "POST",
    body: JSON.stringify({ memory_id: memoryId }),
  });
}

export { API_URL };
