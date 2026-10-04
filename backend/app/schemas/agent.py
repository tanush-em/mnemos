from pydantic import BaseModel, Field

from app.models.memory import MemoryType
from app.schemas.memory import HistoryEntry, MemoryOut


class AgentRememberRequest(BaseModel):
    content: str = Field(..., min_length=1)
    memory_type: MemoryType | None = None
    source: str = "Agent"
    source_type: str = "agent"
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    supersedes_id: str | None = None


class AgentRecallRequest(BaseModel):
    query: str = Field(..., min_length=1)


class AgentRecallResponse(BaseModel):
    memory: str | None = None
    memory_id: str | None = None
    status: str | None = None
    confidence: float | None = None
    supersedes: str | None = None
    reason: str | None = None
    matches: list[MemoryOut] = []


class AgentForgetRequest(BaseModel):
    memory_id: str


class AgentHistoryRequest(BaseModel):
    memory_id: str


class AgentHistoryResponse(BaseModel):
    memory_id: str
    history: list[HistoryEntry]
