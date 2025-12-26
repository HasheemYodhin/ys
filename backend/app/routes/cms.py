from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..database import get_database
from ..models.cms import Job, JobResponse, ContactSubmission, ContactResponse
from bson import ObjectId

router = APIRouter()

# Careers / Job Openings
@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(db=Depends(get_database)):
    jobs = await db["jobs"].find().to_list(100)
    for j in jobs:
        j["id"] = str(j["_id"])
    return jobs

@router.post("/jobs", response_model=JobResponse)
async def create_job(job: Job, db=Depends(get_database)):
    job_dict = job.dict()
    result = await db["jobs"].insert_one(job_dict)
    job_dict["id"] = str(result.inserted_id)
    return job_dict

# Contact Form
@router.post("/contact", response_model=ContactResponse)
async def submit_contact(submission: ContactSubmission, db=Depends(get_database)):
    sub_dict = submission.dict()
    result = await db["contact_submissions"].insert_one(sub_dict)
    sub_dict["id"] = str(result.inserted_id)
    return sub_dict
