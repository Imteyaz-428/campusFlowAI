from typing import Optional

from pydantic import BaseModel, Field



# CREATE ORGANIZATION


class OrganizationCreate(BaseModel):
    """
    Schema used when creating a new college/organization.
    """

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )



# ORGANIZATION RESPONSE


class OrganizationResponse(BaseModel):
    """
    Public/API representation of an organization.
    """

    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True



# UPDATE ORGANIZATION


class OrganizationUpdate(BaseModel):
    """
    Fields that can be updated by an authorized administrator.
    """

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    slug: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )



# ORGANIZATION INFO


class OrganizationInfo(BaseModel):
    """
    Compact organization information embedded inside UserResponse.
    """

    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True