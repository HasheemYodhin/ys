from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class LeaveStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class LeaveType(str, Enum):
    ANNUAL = "Annual Leave"
    SICK = "Sick Leave"
    CASUAL = "Casual Leave"
    MATERNITY = "Maternity Leave"
    PATERNITY = "Paternity Leave"

class LeaveRequestBase(BaseModel):
    leave_type: LeaveType
    start_date: str
    end_date: str
    reason: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: LeaveStatus
    comment: Optional[str] = None

class LeaveRequestResponse(LeaveRequestBase):
    id: str = Field(alias="_id")
    user_id: str
    employee_name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    profile_photo: Optional[str] = None
    status: LeaveStatus
    applied_on: str
    comment: Optional[str] = None

    class Config:
        populate_by_name = True
