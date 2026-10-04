import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MemoryType(str, enum.Enum):
    SEMANTIC = "SEMANTIC"
    EPISODIC = "EPISODIC"
    PROCEDURAL = "PROCEDURAL"


class MemoryStatus(str, enum.Enum):
    CURRENT = "CURRENT"
    SUPERSEDED = "SUPERSEDED"
    ARCHIVED = "ARCHIVED"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Memory(Base):
    __tablename__ = "memories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    memory_type: Mapped[MemoryType] = mapped_column(
        Enum(MemoryType), nullable=False, default=MemoryType.SEMANTIC
    )
    status: Mapped[MemoryStatus] = mapped_column(
        Enum(MemoryStatus), nullable=False, default=MemoryStatus.CURRENT
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.9)
    source: Mapped[str] = mapped_column(String(255), nullable=False, default="Conversation")
    source_type: Mapped[str] = mapped_column(String(128), nullable=False, default="user")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    valid_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    outgoing_relations = relationship(
        "MemoryRelation",
        foreign_keys="MemoryRelation.source_memory_id",
        back_populates="source_memory",
        cascade="all, delete-orphan",
    )
    incoming_relations = relationship(
        "MemoryRelation",
        foreign_keys="MemoryRelation.target_memory_id",
        back_populates="target_memory",
        cascade="all, delete-orphan",
    )
