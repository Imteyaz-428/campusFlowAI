from pydantic import BaseModel, Field, EmailStr
from typing import Optional,Literal
from core.enums import UserRole
from schemas.organization import OrganizationInfo



class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field( min_length=8, max_length=100)
    role: UserRole = Field(description="User role")
    
    
    
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    organization: OrganizationInfo

    class Config:
        from_attributes = True    
        
        
        
class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=30)
    role: Optional[UserRole] = None
    
    

