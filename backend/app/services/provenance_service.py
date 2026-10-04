from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.models.relation import MemoryRelation, RelationType
from app.schemas.memory import ProvenanceOut, RelatedMemoryOut


def get_provenance(memory: Memory) -> ProvenanceOut:
    return ProvenanceOut(
        source=memory.source,
        source_type=memory.source_type,
        recorded_by="Mnemos Memory Engine",
        created_at=memory.created_at,
        evidence=memory.source,
    )


def get_related_memories(db: Session, memory_id: str) -> list[RelatedMemoryOut]:
    relations = db.execute(
        select(MemoryRelation).where(
            or_(
                MemoryRelation.source_memory_id == memory_id,
                MemoryRelation.target_memory_id == memory_id,
            )
        )
    ).scalars().all()

    related: list[RelatedMemoryOut] = []
    for rel in relations:
        if rel.source_memory_id == memory_id:
            other_id = rel.target_memory_id
            direction = "outgoing"
        else:
            other_id = rel.source_memory_id
            direction = "incoming"

        other = db.get(Memory, other_id)
        if other is None:
            continue

        related.append(
            RelatedMemoryOut(
                id=other.id,
                content=other.content,
                memory_type=other.memory_type,
                status=other.status,
                relation_type=rel.relation_type.value,
                direction=direction,
            )
        )
    return related


def get_non_supersede_related(db: Session, memory_id: str) -> list[RelatedMemoryOut]:
    return [
        r
        for r in get_related_memories(db, memory_id)
        if r.relation_type != RelationType.SUPERSEDES.value
    ]
