export type MemoryType = "SEMANTIC" | "EPISODIC" | "PROCEDURAL";
export type MemoryStatus = "CURRENT" | "SUPERSEDED" | "ARCHIVED";
export type RelationType =
  | "SUPERSEDES"
  | "RELATED_TO"
  | "DERIVED_FROM"
  | "CONTRADICTS"
  | "SUPPORTS";

export interface Memory {
  id: string;
  content: string;
  memory_type: MemoryType;
  status: MemoryStatus;
  confidence: number;
  source: string;
  source_type: string;
  created_at: string;
  valid_from: string;
  valid_until: string | null;
}

export interface Provenance {
  source: string;
  source_type: string;
  recorded_by: string;
  created_at: string;
  evidence: string | null;
}

export interface RelatedMemory {
  id: string;
  content: string;
  memory_type: MemoryType;
  status: MemoryStatus;
  relation_type: string;
  direction: string;
}

export interface HistoryEntry {
  id: string;
  content: string;
  memory_type: MemoryType;
  status: MemoryStatus;
  confidence: number;
  valid_from: string;
  valid_until: string | null;
  relation: string | null;
}

export interface MemoryDetail extends Memory {
  provenance: Provenance;
  related: RelatedMemory[];
  superseded_by: Memory | null;
  supersedes: Memory | null;
  history: HistoryEntry[];
}

export interface MemoryStats {
  total: number;
  semantic: number;
  episodic: number;
  procedural: number;
  current: number;
  superseded: number;
  archived: number;
}

export interface MemoryCreate {
  content: string;
  memory_type?: MemoryType | null;
  confidence?: number;
  source?: string;
  source_type?: string;
  supersedes_id?: string | null;
}

export interface GraphNode {
  id: string;
  label: string;
  memory_type: MemoryType;
  status: MemoryStatus;
  confidence: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation_type: RelationType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AgentRecallResponse {
  memory: string | null;
  memory_id: string | null;
  status: string | null;
  confidence: number | null;
  supersedes: string | null;
  reason: string | null;
  matches: Memory[];
}
