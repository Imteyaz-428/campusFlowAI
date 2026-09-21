from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from dependencies.database import get_db
from core.dependencies import get_current_admin

from models.user import User

from schemas.dashboard import DashboardOverviewResponse

from crud.dashboard import get_dashboard_overview


router = APIRouter(
    prefix="/campus/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse,
)
def dashboard_overview(
    current_admin: User = Depends(
        get_current_admin
    ),
    db: Session = Depends(get_db),
):
    """
    Get real-time dashboard statistics for the
    authenticated administrator's organization.
    """

    return get_dashboard_overview(
        db=db,
        organization_id=current_admin.organization_id,
    )