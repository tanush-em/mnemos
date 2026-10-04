from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.memory import Memory, MemoryStatus, MemoryType
from app.models.relation import MemoryRelation
from app.schemas.memory import (
    MemoryCreate,
    MemoryDetailOut,
    MemoryOut,
    MemoryStats,
    MemoryUpdate,
)
from app.services.classifier import classify_memory
from app.services.id_utils import new_id
from app.services.provenance_service import get_non_supersede_related, get_provenance
from app.services.temporal_service import (
    apply_supersession,
    get_history,
    get_superseded_by,
    get_supersedes,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def list_memories(
    db: Session,
    memory_type: MemoryType | None = None,
    status: MemoryStatus | None = None,
) -> list[Memory]:
    stmt = select(Memory).order_by(Memory.valid_from.desc())
    if memory_type is not None:
        stmt = stmt.where(Memory.memory_type == memory_type)
    if status is not None:
        stmt = stmt.where(Memory.status == status)
    return list(db.execute(stmt).scalars().all())


def get_memory(db: Session, memory_id: str) -> Memory | None:
    return db.get(Memory, memory_id)


def search_memories(db: Session, query: str) -> list[Memory]:
    pattern = f"%{query.strip()}%"
    stmt = (
        select(Memory)
        .where(
            or_(
                Memory.content.ilike(pattern),
                Memory.source.ilike(pattern),
            )
        )
        .order_by(Memory.valid_from.desc())
    )
    return list(db.execute(stmt).scalars().all())


def create_memory(db: Session, payload: MemoryCreate) -> Memory:
    memory_type = payload.memory_type or classify_memory(payload.content)
    now = _utcnow()
    memory = Memory(
        id=new_id("mem"),
        content=payload.content.strip(),
        memory_type=memory_type,
        status=payload.status,
        confidence=payload.confidence,
        source=payload.source,
        source_type=payload.source_type,
        created_at=now,
        valid_from=payload.valid_from or now,
        valid_until=None,
    )
    db.add(memory)
    db.flush()

    if payload.supersedes_id:
        apply_supersession(db, memory, payload.supersedes_id)

    db.commit()
    db.refresh(memory)
    return memory


def update_memory(db: Session, memory_id: str, payload: MemoryUpdate) -> Memory | None:
    memory = db.get(Memory, memory_id)
    if memory is None:
        return None

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(memory, key, value)

    db.commit()
    db.refresh(memory)
    return memory


def delete_memory(db: Session, memory_id: str) -> bool:
    memory = db.get(Memory, memory_id)
    if memory is None:
        return False
    # Delete relations first (cascade should handle, but be explicit for SQLite)
    relations = db.execute(
        select(MemoryRelation).where(
            or_(
                MemoryRelation.source_memory_id == memory_id,
                MemoryRelation.target_memory_id == memory_id,
            )
        )
    ).scalars().all()
    for rel in relations:
        db.delete(rel)
    db.delete(memory)
    db.commit()
    return True


def archive_memory(db: Session, memory_id: str) -> Memory | None:
    memory = db.get(Memory, memory_id)
    if memory is None:
        return None
    memory.status = MemoryStatus.ARCHIVED
    memory.valid_until = memory.valid_until or _utcnow()
    db.commit()
    db.refresh(memory)
    return memory


def get_stats(db: Session) -> MemoryStats:
    total = db.scalar(select(func.count()).select_from(Memory)) or 0
    semantic = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.memory_type == MemoryType.SEMANTIC)
    ) or 0
    episodic = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.memory_type == MemoryType.EPISODIC)
    ) or 0
    procedural = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.memory_type == MemoryType.PROCEDURAL)
    ) or 0
    current = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.status == MemoryStatus.CURRENT)
    ) or 0
    superseded = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.status == MemoryStatus.SUPERSEDED)
    ) or 0
    archived = db.scalar(
        select(func.count()).select_from(Memory).where(Memory.status == MemoryStatus.ARCHIVED)
    ) or 0
    return MemoryStats(
        total=total,
        semantic=semantic,
        episodic=episodic,
        procedural=procedural,
        current=current,
        superseded=superseded,
        archived=archived,
    )


def get_memory_detail(db: Session, memory_id: str) -> MemoryDetailOut | None:
    memory = db.get(Memory, memory_id)
    if memory is None:
        return None

    base = MemoryOut.model_validate(memory)
    supersedes = get_supersedes(db, memory_id)
    superseded_by = get_superseded_by(db, memory_id)

    return MemoryDetailOut(
        **base.model_dump(),
        provenance=get_provenance(memory),
        related=get_non_supersede_related(db, memory_id),
        superseded_by=MemoryOut.model_validate(superseded_by) if superseded_by else None,
        supersedes=MemoryOut.model_validate(supersedes) if supersedes else None,
        history=get_history(db, memory_id),
    )


def get_graph(db: Session) -> dict:
    from app.schemas.graph import GraphEdge, GraphNode, GraphOut

    memories = list_memories(db)
    relations = list(db.execute(select(MemoryRelation)).scalars().all())

    # Prefer memories that participate in relations for a cleaner demo graph
    related_ids = {r.source_memory_id for r in relations} | {r.target_memory_id for r in relations}
    nodes_src = [m for m in memories if m.id in related_ids] or memories[:20]

    nodes = [
        GraphNode(
            id=m.id,
            label=m.content if len(m.content) <= 48 else m.content[:45] + "…",
            memory_type=m.memory_type,
            status=m.status,
            confidence=m.confidence,
        )
        for m in nodes_src
    ]
    edges = [
        GraphEdge(
            id=r.id,
            source=r.source_memory_id,
            target=r.target_memory_id,
            relation_type=r.relation_type,
        )
        for r in relations
        if r.source_memory_id in {n.id for n in nodes}
        and r.target_memory_id in {n.id for n in nodes}
    ]
    return GraphOut(nodes=nodes, edges=edges)
