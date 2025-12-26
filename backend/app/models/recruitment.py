from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class JobPosting(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    title: str
    department: str
    location: str
    type: str # Full-time, Part-time, Contract
    description: Optional[str] = None
    status: str = "Open" # Open, Closed, Draft
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Candidate(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    job_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    resume_link: Optional[str] = None
    status: str = "New" # New, Screening, Interview, Offered, Hired, Rejected
    applied_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
