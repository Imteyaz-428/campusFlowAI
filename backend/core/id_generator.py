from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import Session


def _get_next_sequence(
    db: Session,
    organization_id: int,
    sequence_key: str,
    year: int
) -> int:
    """
    Atomically increments and returns the next value for a given
    (organization, sequence_key, year) counter.

    Uses INSERT ... ON CONFLICT DO UPDATE ... RETURNING, which is
    race-safe under Postgres row-level locking — two concurrent
    requests cannot receive the same number.
    """

    result = db.execute(
        text(
            """
            INSERT INTO sequence_counters
                (organization_id, sequence_key, year, last_value)
            VALUES
                (:organization_id, :sequence_key, :year, 1)
            ON CONFLICT (organization_id, sequence_key, year)
            DO UPDATE SET
                last_value = sequence_counters.last_value + 1
            RETURNING last_value
            """
        ),
        {
            "organization_id": organization_id,
            "sequence_key": sequence_key,
            "year": year,
        },
    )

    return result.scalar()


def generate_application_number(
    db: Session,
    organization_id: int,
    year: int | None = None
) -> str:
    year = year or datetime.utcnow().year

    seq = _get_next_sequence(
        db, organization_id, "application_number", year
    )

    return f"APP-{year}-{seq:05d}"


def generate_admission_number(
    db: Session,
    organization_id: int,
    year: int | None = None
) -> str:
    year = year or datetime.utcnow().year

    seq = _get_next_sequence(
        db, organization_id, "admission_number", year
    )

    return f"ADM-{year}-{seq:05d}"


def generate_roll_number(
    db: Session,
    organization_id: int,
    department_code: str,
    year: int | None = None
) -> str:
    year = year or datetime.utcnow().year
    yy = str(year)[-2:]

    # Sequence is scoped per department per year, e.g. roll_CSE_2026,
    # so CSE and ECE each get their own 001, 002, 003...
    seq = _get_next_sequence(
        db, organization_id, f"roll_{department_code.upper()}", year
    )

    return f"{department_code.upper()}{yy}-{seq:03d}"

def generate_ticket_number(
    db: Session,
    organization_id: int,
    year: int | None = None
) -> str:
    """
    Generate a unique ticket number scoped to an organization and year.

    Example:
        TKT-2026-00001
        TKT-2026-00002
    """

    year = year or datetime.utcnow().year

    seq = _get_next_sequence(
        db,
        organization_id,
        "ticket_number",
        year,
    )

    return f"TKT-{year}-{seq:05d}"