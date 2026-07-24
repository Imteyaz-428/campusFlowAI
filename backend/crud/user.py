from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.user import User
from models.organization import Organization
from schemas.user import UserCreate,UserUpdate
from core.security import hash_password,verify_password

def create_user(db: Session,user: UserCreate,organization_id: int):
   
        
    existing_user = (db.query(User) .filter(User.email == user.email) .first())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists."
        )
        
    db_user = User(
    name=user.name,
    email=user.email,
    password=hash_password(user.password),
    role=user.role,
    organization_id=organization_id)
    
    
    db.add(db_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists."
        )

    db.refresh(db_user)
    return db_user



def get_users(
    db: Session,
    organization_id: int
):
    return (
        db.query(User)
        .filter(User.organization_id == organization_id)
        .all()
    )

def get_user_by_id(db: Session, user_id: int):

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return user




def update_user(db: Session, user_id: int,user_update: UserUpdate):
    
    db_user = (db.query(User).filter(User.id == user_id).first())

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    update_data = user_update.model_dump(exclude_unset=True)
    if "email" in update_data:
        existing_user = ( db.query(User).filter(User.email == update_data["email"]).first())
        if ( existing_user and  existing_user.id != user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists."
            ) 
        
    if "organization_id" in update_data:

        organization = (
            db.query(Organization)
            .filter(
                Organization.id == update_data["organization_id"]
            )
            .first()
        )

        if organization is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found."
            )
            
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists."
        )
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):

    user = (db.query(User).filter(User.id == user_id) .first())

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully."
    }
    


def authenticate_user(db, email, password):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user