from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class AttendanceRecord(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    employee_id: str
    employee_name: str
    department: Optional[str] = "N/A"
    date: str # YYYY-MM-DD
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str = "Absent" # Present, Absent, Half-Day
    work_hours: float = 0.0
    break_time: Optional[int] = 0
    location: Optional[str] = "Office"

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class AttendanceAction(BaseModel):
    employee_id: str
    timestamp: Optional[datetime] = None
