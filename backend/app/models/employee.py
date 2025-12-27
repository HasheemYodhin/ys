from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
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

class EmployeeBase(BaseModel):
    employee_id: Optional[str] = Field(default=None, description="Unique Employee ID")
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    role: str = Field(..., description="Job Title")
    department: str
    status: str = Field(default="Active", description="Active, On Leave, Terminated")
    date_of_joining: date
    relieving_date: Optional[date] = None
    salary: float

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class EmployeeCreate(EmployeeBase):
    password: Optional[str] = None

class EmployeeUpdate(BaseModel):
    employee_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[float] = None
    password: Optional[str] = None
    relieving_date: Optional[date] = None

class Employee(EmployeeBase):
    id: str = Field(default_factory=str, alias="_id")
