from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.memory import Memory, MemoryStatus
from app.models.relation import MemoryRelation, RelationType
from app.schemas.memory import HistoryEntry
from app.services.id_utils import new_id


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def apply_supersession(
    db: Session,
    new_memory: Memory,
    supersedes_id: str,
) -> MemoryRelation | None:
    """Mark old memory SUPERSEDED, set valid_until, create SUPERSEDES relation."""
    old = db.get(Memory, supersedes_id)
    if old is None:
        return None

    now = _utcnow()
    old.status = MemoryStatus.SUPERSEDED
    old.valid_until = new_memory.valid_from or now
    new_memory.status = MemoryStatus.CURRENT

    relation = MemoryRelation(
        id=new_id("rel"),
        source_memory_id=new_memory.id,
        target_memory_id=old.id,
        relation_type=RelationType.SUPERSEDES,
    )
    db.add(relation)
    return relation


def get_history(db: Session, memory_id: str) -> list[HistoryEntry]:
    """Walk SUPERSEDES chain both directions and return chronological history."""
    memory = db.get(Memory, memory_id)
    if memory is None:
        return []

    # Walk backward: memories this one supersedes
    chain: list[Memory] = [memory]
    current = memory
    seen: set[str] = {memory.id}

    while True:
        rel = db.execute(
            select(MemoryRelation).where(
                MemoryRelation.source_memory_id == current.id,
                MemoryRelation.relation_type == RelationType.SUPERSEDES,
            )
        ).scalar_one_or_none()
        if rel is None or rel.target_memory_id in seen:
            break
        older = db.get(Memory, rel.target_memory_id)
        if older is None:
            break
        chain.insert(0, older)
        seen.add(older.id)
        current = older

    # Walk forward: memories that supersede this one
    current = memory
    while True:
        rel = db.execute(
            select(MemoryRelation).where(
                MemoryRelation.target_memory_id == current.id,
                MemoryRelation.relation_type == RelationType.SUPERSEDES,
            )
        ).scalar_one_or_none()
        if rel is None or rel.source_memory_id in seen:
            break
        newer = db.get(Memory, rel.source_memory_id)
        if newer is None:
            break
        chain.append(newer)
        seen.add(newer.id)
        current = newer

    entries: list[HistoryEntry] = []
    for i, mem in enumerate(chain):
        relation = None
        if i > 0:
            relation = "SUPERSEDES"
        entries.append(
            HistoryEntry(
                id=mem.id,
                content=mem.content,
                memory_type=mem.memory_type,
                status=mem.status,
                confidence=mem.confidence,
                valid_from=mem.valid_from,
                valid_until=mem.valid_until,
                relation=relation,
            )
        )
    return entries


def get_supersedes(db: Session, memory_id: str) -> Memory | None:
    rel = db.execute(
        select(MemoryRelation).where(
            MemoryRelation.source_memory_id == memory_id,
            MemoryRelation.relation_type == RelationType.SUPERSEDES,
        )
    ).scalar_one_or_none()
    if rel is None:
        return None
    return db.get(Memory, rel.target_memory_id)


def get_superseded_by(db: Session, memory_id: str) -> Memory | None:
    rel = db.execute(
        select(MemoryRelation).where(
            MemoryRelation.target_memory_id == memory_id,
            MemoryRelation.relation_type == RelationType.SUPERSEDES,
        )
    ).scalar_one_or_none()
    if rel is None:
        return None
    return db.get(Memory, rel.source_memory_id)
