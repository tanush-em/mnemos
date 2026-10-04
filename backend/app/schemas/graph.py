from pydantic import BaseModel

from app.models.memory import MemoryStatus, MemoryType
from app.models.relation import RelationType


class GraphNode(BaseModel):
    id: str
    label: str
    memory_type: MemoryType
    status: MemoryStatus
    confidence: float


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation_type: RelationType


class GraphOut(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
