from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"



class SignupRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=100)
    organization_slug: str = Field(min_length=2, max_length=100)

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=5, max_length=100)