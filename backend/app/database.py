import os
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_default_db = Path(__file__).resolve().parent.parent / "mnemos.db"
DB_PATH = Path(os.environ.get("MNEMOS_DB_PATH", str(_default_db)))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = f"sqlite:///{DB_PATH}"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models so metadata is registered
    from app.models import Memory, MemoryRelation  # noqa: F401
    from app.seed_data import seed_database

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing = db.execute(select(Memory).limit(1)).scalar_one_or_none()
        if existing is None:
            seed_database(db)
