from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Job(BaseModel):
    title: str
    department: str
    location: str
    type: str  # Full-time, Part-time, Remote
    description: str
    requirements: List[str]
    posted_at: datetime = datetime.now()

class JobResponse(Job):
    id: str

class ContactSubmission(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    submitted_at: datetime = datetime.now()

class ContactResponse(ContactSubmission):
    id: str
