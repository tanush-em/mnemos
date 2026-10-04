from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.memory import MemoryStatus, MemoryType
from app.schemas.memory import (
    HistoryEntry,
    MemoryCreate,
    MemoryDetailOut,
    MemoryOut,
    MemoryStats,
    MemoryUpdate,
)
from app.services import memory_service
from app.services.temporal_service import get_history

router = APIRouter(prefix="/api/memories", tags=["memories"])


@router.get("", response_model=list[MemoryOut])
def list_memories(
    memory_type: MemoryType | None = None,
    status: MemoryStatus | None = None,
    db: Session = Depends(get_db),
) -> list[MemoryOut]:
    memories = memory_service.list_memories(db, memory_type=memory_type, status=status)
    return [MemoryOut.model_validate(m) for m in memories]


@router.get("/stats", response_model=MemoryStats)
def memory_stats(db: Session = Depends(get_db)) -> MemoryStats:
    return memory_service.get_stats(db)


@router.get("/search", response_model=list[MemoryOut])
def search_memories(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[MemoryOut]:
    memories = memory_service.search_memories(db, q)
    return [MemoryOut.model_validate(m) for m in memories]


@router.get("/{memory_id}", response_model=MemoryDetailOut)
def get_memory(memory_id: str, db: Session = Depends(get_db)) -> MemoryDetailOut:
    detail = memory_service.get_memory_detail(db, memory_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return detail


@router.get("/{memory_id}/history", response_model=list[HistoryEntry])
def memory_history(memory_id: str, db: Session = Depends(get_db)) -> list[HistoryEntry]:
    memory = memory_service.get_memory(db, memory_id)
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return get_history(db, memory_id)


@router.post("", response_model=MemoryOut, status_code=201)
def create_memory(payload: MemoryCreate, db: Session = Depends(get_db)) -> MemoryOut:
    memory = memory_service.create_memory(db, payload)
    return MemoryOut.model_validate(memory)


@router.patch("/{memory_id}", response_model=MemoryOut)
def update_memory(
    memory_id: str,
    payload: MemoryUpdate,
    db: Session = Depends(get_db),
) -> MemoryOut:
    memory = memory_service.update_memory(db, memory_id, payload)
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return MemoryOut.model_validate(memory)


@router.delete("/{memory_id}", status_code=204)
def delete_memory(memory_id: str, db: Session = Depends(get_db)) -> None:
    ok = memory_service.delete_memory(db, memory_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Memory not found")
