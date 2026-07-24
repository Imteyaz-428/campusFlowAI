from fastapi import APIRouter, Depends, status,HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.security import create_access_token
from core.dependencies import get_current_user,require_role, UserRole
from dependencies.database import get_db
from crud.user import create_user, get_users,get_user_by_id,update_user, delete_user, authenticate_user
from schemas.user import UserCreate, UserResponse,UserUpdate
from schemas.auth import Token
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User


from crud.auth import signup
from schemas.auth import SignupRequest, Token
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from dependencies.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/signup", response_model=Token)
def signup_user(
    data: SignupRequest,
    db: Session = Depends(get_db)
):
    return signup(
        db=db,
        data=data
    )
    
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = authenticate_user(
    db,
    form_data.username,
    form_data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role.value,
            "email": user.email,
            "organization_id": user.organization_id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):

    return current_user
