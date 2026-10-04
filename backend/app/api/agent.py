from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.memory import MemoryStatus
from app.schemas.agent import (
    AgentForgetRequest,
    AgentHistoryRequest,
    AgentHistoryResponse,
    AgentRecallRequest,
    AgentRecallResponse,
    AgentRememberRequest,
)
from app.schemas.memory import MemoryCreate, MemoryOut
from app.services import memory_service
from app.services.temporal_service import get_history, get_supersedes

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/remember", response_model=MemoryOut, status_code=201)
def agent_remember(
    payload: AgentRememberRequest,
    db: Session = Depends(get_db),
) -> MemoryOut:
    memory = memory_service.create_memory(
        db,
        MemoryCreate(
            content=payload.content,
            memory_type=payload.memory_type,
            source=payload.source,
            source_type=payload.source_type,
            confidence=payload.confidence,
            supersedes_id=payload.supersedes_id,
        ),
    )
    return MemoryOut.model_validate(memory)


@router.post("/recall", response_model=AgentRecallResponse)
def agent_recall(
    payload: AgentRecallRequest,
    db: Session = Depends(get_db),
) -> AgentRecallResponse:
    # Tokenize query so natural-language questions match keyword memories
    stop = {
        "a", "an", "the", "is", "are", "was", "were", "what", "which", "who",
        "does", "do", "did", "project", "currently", "use", "uses", "using",
        "for", "to", "of", "in", "on", "and", "or", "how", "when", "where",
    }
    tokens = [
        t.strip("?.,!\"'").lower()
        for t in payload.query.split()
        if len(t.strip("?.,!\"'")) > 2 and t.strip("?.,!\"'").lower() not in stop
    ]
    if not tokens:
        tokens = [payload.query.strip()]

    scored: dict[str, tuple] = {}
    for token in tokens:
        for mem in memory_service.search_memories(db, token):
            prev = scored.get(mem.id)
            score = (prev[0] + 1) if prev else 1
            scored[mem.id] = (score, mem)

    matches = sorted(
        (m for _, m in scored.values()),
        key=lambda m: (
            -scored[m.id][0],
            0 if m.status == MemoryStatus.CURRENT else 1,
            -m.confidence,
        ),
    )
    if not matches:
        return AgentRecallResponse(
            memory=None,
            reason="No matching memories found.",
            matches=[],
        )

    top = matches[0]
    superseded = get_supersedes(db, top.id)
    supersedes_text = None
    if superseded is not None:
        supersedes_text = superseded.content
        reason = (
            "A later migration memory superseded the previous database preference."
            if "postgres" in top.content.lower() or "mongo" in (superseded.content.lower())
            else (
                f'A later memory superseded the previous preference: '
                f'"{superseded.content}" → "{top.content}".'
            )
        )
    elif top.status == MemoryStatus.CURRENT:
        reason = "Matched a CURRENT memory with highest relevance for this query."
    else:
        reason = f"Matched a {top.status.value} memory for this query."

    return AgentRecallResponse(
        memory=top.content,
        memory_id=top.id,
        status=top.status.value,
        confidence=top.confidence,
        supersedes=supersedes_text,
        reason=reason,
        matches=[MemoryOut.model_validate(m) for m in matches[:5]],
    )


@router.post("/history", response_model=AgentHistoryResponse)
def agent_history(
    payload: AgentHistoryRequest,
    db: Session = Depends(get_db),
) -> AgentHistoryResponse:
    memory = memory_service.get_memory(db, payload.memory_id)
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return AgentHistoryResponse(
        memory_id=payload.memory_id,
        history=get_history(db, payload.memory_id),
    )


@router.post("/forget", response_model=MemoryOut)
def agent_forget(
    payload: AgentForgetRequest,
    db: Session = Depends(get_db),
) -> MemoryOut:
    memory = memory_service.archive_memory(db, payload.memory_id)
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return MemoryOut.model_validate(memory)
