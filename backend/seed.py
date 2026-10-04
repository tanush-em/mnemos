"""Standalone seed script. Prefer automatic seeding via init_db() on API startup."""

from sqlalchemy import delete, select

from app.database import Base, SessionLocal, engine
from app.models.memory import Memory
from app.models.relation import MemoryRelation
from app.seed_data import seed_database


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        existing = list(db.execute(select(Memory)).scalars().all())
        if existing:
            print(f"Clearing {len(existing)} existing memories...")
            db.execute(delete(MemoryRelation))
            db.execute(delete(Memory))
            db.commit()
        seed_database(db)
        total = len(list(db.execute(select(Memory)).scalars().all()))
        print(f"Seeded {total} memories.")


if __name__ == "__main__":
    main()
