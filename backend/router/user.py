from fastapi import APIRouter, Depends, status,HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.security import create_access_token
from core.dependencies import get_current_user,require_role, UserRole
from dependencies.database import get_db
from crud.user import create_user, get_users,get_user_by_id,update_user, delete_user, authenticate_user,change_password
from schemas.user import UserCreate, UserResponse,UserUpdate,ChangePassword
from schemas.auth import Token
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.ADMIN))
):
    return create_user(
        db=db,
        user=user,
        organization_id=current_admin.organization_id
    )
    
@router.get("/", response_model=List[UserResponse])
def get_all_users( db: Session = Depends(get_db), current_admin: User = Depends(require_role(UserRole.ADMIN))):

    return get_users(
    db=db,
    organization_id=current_admin.organization_id
)


@router.put("/change-password", status_code=status.HTTP_200_OK)
def update_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return change_password(
        db=db,
        user=current_user,
        current_password=data.current_password,
        new_password=data.new_password,
    )
    
@router.put( "/{user_id}",response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_existing_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    
    if (current_user.role.value != "admin" and current_user.id != user_id ):
        raise HTTPException(
            status_code=403,
            detail="You can only update your own profile."
        )
    
    return update_user(
        db=db,
        user_id=user_id,
        user_update=user_update
    )
    

@router.delete( "/{user_id}", status_code=status.HTTP_200_OK)
def delete_existing_user( user_id: int,db: Session = Depends(get_db),current_user: User = Depends(require_role(UserRole.ADMIN))):
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )
    return delete_user(
        db=db,
        user_id=user_id
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


    
@router.get( "/{user_id}",response_model=UserResponse,status_code=status.HTTP_200_OK)

def get_user(user_id: int,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )
    if user.organization_id != current_user.organization_id:

        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )
    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    return user



