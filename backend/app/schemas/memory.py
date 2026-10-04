from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.memory import MemoryStatus, MemoryType


class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=1)
    memory_type: MemoryType | None = None
    status: MemoryStatus = MemoryStatus.CURRENT
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    source: str = "Conversation"
    source_type: str = "user"
    valid_from: datetime | None = None
    supersedes_id: str | None = None


class MemoryUpdate(BaseModel):
    content: str | None = None
    memory_type: MemoryType | None = None
    status: MemoryStatus | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    source: str | None = None
    source_type: str | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    content: str
    memory_type: MemoryType
    status: MemoryStatus
    confidence: float
    source: str
    source_type: str
    created_at: datetime
    valid_from: datetime
    valid_until: datetime | None = None


class MemoryStats(BaseModel):
    total: int
    semantic: int
    episodic: int
    procedural: int
    current: int
    superseded: int
    archived: int


class HistoryEntry(BaseModel):
    id: str
    content: str
    memory_type: MemoryType
    status: MemoryStatus
    confidence: float
    valid_from: datetime
    valid_until: datetime | None = None
    relation: str | None = None


class ProvenanceOut(BaseModel):
    source: str
    source_type: str
    recorded_by: str = "Mnemos Memory Engine"
    created_at: datetime
    evidence: str | None = None


class RelatedMemoryOut(BaseModel):
    id: str
    content: str
    memory_type: MemoryType
    status: MemoryStatus
    relation_type: str
    direction: str


class MemoryDetailOut(MemoryOut):
    provenance: ProvenanceOut
    related: list[RelatedMemoryOut] = []
    superseded_by: MemoryOut | None = None
    supersedes: MemoryOut | None = None
    history: list[HistoryEntry] = []
