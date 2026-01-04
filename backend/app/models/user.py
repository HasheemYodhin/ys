from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = Field(default="Employee", description="Employer or Employee")
    profile_photo: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[str] = None
    bio: Optional[str] = None
    emergency_contact: Optional[str] = None
    # New fields
    bank_details: Optional[dict] = None # {account_name, account_number, bank_name, ifsc}
    education: Optional[list] = None # [{degree, institution, year}]
    social_links: Optional[dict] = None # {linkedin, twitter, website}
    two_factor_enabled: bool = False
    password_reset_requested: bool = False
    is_active: bool = True
    is_superuser: bool = False
    is_online: bool = False
    current_status: str = "offline"  # online, offline, in-call, idle
    last_seen: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[str] = None
    bio: Optional[str] = None
    emergency_contact: Optional[str] = None
    bank_details: Optional[dict] = None
    education: Optional[list] = None
    social_links: Optional[dict] = None
    two_factor_enabled: Optional[bool] = None
    password_reset_requested: Optional[bool] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class UserInDB(UserBase):
    hashed_password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
