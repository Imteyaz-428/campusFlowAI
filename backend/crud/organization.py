from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.organization import Organization

from schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)



# CREATE ORGANIZATION


def create_organization(
    db: Session,
    organization: OrganizationCreate,
):
    """
    Create a new organization.

    The organization is flushed but not committed here.

    This allows the caller to continue using the same transaction
    when creating the initial ADMIN account.
    """

    normalized_name = (
        organization.name
        .strip()
    )

    normalized_slug = (
        organization.slug
        .strip()
        .lower()
    )

    # ------------------------------------------------------------
    # CHECK DUPLICATE SLUG
    # ------------------------------------------------------------

    existing_organization = (
        db.query(Organization)
        .filter(
            Organization.slug == normalized_slug
        )
        .first()
    )

    if existing_organization:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organization slug already exists.",
        )

    # ------------------------------------------------------------
    # CREATE ORGANIZATION
    # ------------------------------------------------------------

    db_organization = Organization(
        name=normalized_name,
        slug=normalized_slug,
    )

    db.add(db_organization)

    try:
        db.flush()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organization already exists.",
        )

    db.refresh(db_organization)

    return db_organization



# GET ORGANIZATIONS


def get_organizations(
    db: Session,
):
    """
    Return all organizations.

    This function should only be exposed through an appropriately
    protected administrative endpoint.
    """

    return (
        db.query(Organization)
        .order_by(
            Organization.id.desc()
        )
        .all()
    )



# GET ORGANIZATION BY ID


def get_organization_by_id(
    db: Session,
    organization_id: int,
):
    """
    Get an organization by ID.
    """

    organization = (
        db.query(Organization)
        .filter(
            Organization.id == organization_id
        )
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found.",
        )

    return organization



# UPDATE ORGANIZATION


def update_organization(
    db: Session,
    organization_id: int,
    organization_update: OrganizationUpdate,
):
    """
    Update organization information.
    """

    organization = get_organization_by_id(
        db=db,
        organization_id=organization_id,
    )

    update_data = organization_update.model_dump(
        exclude_unset=True
    )

    # ------------------------------------------------------------
    # NORMALIZE VALUES
    # ------------------------------------------------------------

    if "name" in update_data:
        update_data["name"] = (
            update_data["name"]
            .strip()
        )

    if "slug" in update_data:
        update_data["slug"] = (
            update_data["slug"]
            .strip()
            .lower()
        )

        existing_organization = (
            db.query(Organization)
            .filter(
                Organization.slug == update_data["slug"],
                Organization.id != organization_id,
            )
            .first()
        )

        if existing_organization:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organization slug already exists.",
            )

    # ------------------------------------------------------------
    # APPLY UPDATE
    # ------------------------------------------------------------

    for key, value in update_data.items():
        setattr(
            organization,
            key,
            value,
        )

    # ------------------------------------------------------------
    # SAVE
    # ------------------------------------------------------------

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organization update violates a database constraint.",
        )

    db.refresh(organization)

    return organization



# DELETE ORGANIZATION


def delete_organization(
    db: Session,
    organization_id: int,
):
    """
    Delete an organization.

    Database foreign-key relationships may prevent deletion when
    the organization still has users, students, documents, etc.
    """

    organization = get_organization_by_id(
        db=db,
        organization_id=organization_id,
    )

    db.delete(organization)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Organization cannot be deleted because "
                "it still contains related campus data."
            ),
        )

    return {
        "message": "Organization deleted successfully."
    }