import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RelationType(str, enum.Enum):
    SUPERSEDES = "SUPERSEDES"
    RELATED_TO = "RELATED_TO"
    DERIVED_FROM = "DERIVED_FROM"
    CONTRADICTS = "CONTRADICTS"
    SUPPORTS = "SUPPORTS"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MemoryRelation(Base):
    __tablename__ = "memory_relations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    source_memory_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("memories.id", ondelete="CASCADE"), nullable=False
    )
    target_memory_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("memories.id", ondelete="CASCADE"), nullable=False
    )
    relation_type: Mapped[RelationType] = mapped_column(Enum(RelationType), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    source_memory = relationship(
        "Memory", foreign_keys=[source_memory_id], back_populates="outgoing_relations"
    )
    target_memory = relationship(
        "Memory", foreign_keys=[target_memory_id], back_populates="incoming_relations"
    )
