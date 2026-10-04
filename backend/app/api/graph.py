from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.graph import GraphOut
from app.services import memory_service

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("", response_model=GraphOut)
def get_graph(db: Session = Depends(get_db)) -> GraphOut:
    return memory_service.get_graph(db)
