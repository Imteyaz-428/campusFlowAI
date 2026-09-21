from sqlalchemy import Column, Integer, String, UniqueConstraint
from database.database import Base


class SequenceCounter(Base):
    """
    Backs deterministic, race-safe ID generation (application numbers,
    admission numbers, roll numbers) per organization, per key, per year.

    Never generate these numbers in application code with a simple
    SELECT COUNT(*) + 1 — that has a race condition under concurrent
    requests. This table uses INSERT ... ON CONFLICT DO UPDATE, which
    takes a row-level lock and is safe under concurrency.
    """

    __tablename__ = "sequence_counters"

    id = Column(Integer, primary_key=True, index=True)

    organization_id = Column(Integer, nullable=False, index=True)

    sequence_key = Column(String(100), nullable=False)

    year = Column(Integer, nullable=False)

    last_value = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint(
            "organization_id", "sequence_key", "year",
            name="uq_sequence_counters_org_key_year"
        ),
    )