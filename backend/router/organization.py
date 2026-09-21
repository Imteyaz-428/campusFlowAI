from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import (
    get_current_user,
    require_role,
)

from core.enums import UserRole

from crud.organization import (
    delete_organization,
    get_organization_by_id,
    update_organization,
)

from dependencies.database import get_db

from models.user import User

from schemas.organization import (
    OrganizationResponse,
    OrganizationUpdate,
)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)



# ORGANIZATION CREATION

#
# There is intentionally NO public POST /organizations/ endpoint.
#
# The first organization administrator is created through:
#
#     POST /auth/signup
#
# That flow creates:
#
#     Organization
#          ↓
#     First ADMIN
#          ↓
#     JWT
#
# This prevents an organization from existing without an
# administrator account.
#
# After login, the first ADMIN can create additional:
#
#     ADMIN
#     TEACHER
#
# accounts through:
#
#     POST /users/
#
# Students are handled through the admission workflow.




# LIST CURRENT ORGANIZATION


@router.get(
    "/",
    response_model=list[OrganizationResponse],
)
def get_all_organizations(
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Return the organization belonging to the authenticated ADMIN.

    This endpoint is intentionally organization-scoped.

    It does NOT return organizations belonging to other tenants.
    """

    organization = get_organization_by_id(
        db=db,
        organization_id=current_admin.organization_id,
    )

    return [organization]



# GET ORGANIZATION


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
)
def get_organization(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return an organization.

    Any authenticated user may access their own organization.

    Cross-organization access is rejected.
    """

    if current_user.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You cannot access another organization's data."
            ),
        )

    return get_organization_by_id(
        db=db,
        organization_id=organization_id,
    )



# UPDATE ORGANIZATION


@router.put(
    "/{organization_id}",
    response_model=OrganizationResponse,
)
def update_org(
    organization_id: int,
    organization_update: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Update the authenticated ADMIN's organization.

    ADMIN only.

    An ADMIN cannot modify another organization's information.
    """

    # ------------------------------------------------------------
    # ORGANIZATION OWNERSHIP CHECK
    # ------------------------------------------------------------

    if current_admin.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You cannot modify another organization."
            ),
        )

    return update_organization(
        db=db,
        organization_id=organization_id,
        organization_update=organization_update,
    )



# DELETE ORGANIZATION


@router.delete(
    "/{organization_id}",
    status_code=status.HTTP_200_OK,
)
def delete_org(
    organization_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Delete the authenticated ADMIN's organization.

    ADMIN only.

    An ADMIN cannot delete another organization's data.

    The database/CRUD layer will reject deletion if related
    campus records still prevent the operation.
    """

    # ------------------------------------------------------------
    # ORGANIZATION OWNERSHIP CHECK
    # ------------------------------------------------------------

    if current_admin.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You cannot delete another organization."
            ),
        )

    return delete_organization(
        db=db,
        organization_id=organization_id,
    )