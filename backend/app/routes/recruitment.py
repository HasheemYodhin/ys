from fastapi import APIRouter, Body, Request, HTTPException
from typing import List
from app.models.recruitment import JobPosting, Candidate
from datetime import datetime

router = APIRouter()

# --- Job Postings ---

@router.post("/jobs", response_description="Create a new job posting", response_model=JobPosting)
async def create_job(request: Request, job: JobPosting = Body(...)):
    job_dict = job.dict(by_alias=True, exclude=["id", "created_at"])
    job_dict["created_at"] = datetime.utcnow()
    
    result = await request.app.database["jobs"].insert_one(job_dict)
    created_job = await request.app.database["jobs"].find_one({"_id": result.inserted_id})
    created_job["_id"] = str(created_job["_id"])
    return created_job

@router.get("/jobs", response_description="List all job postings", response_model=List[JobPosting])
async def list_jobs(request: Request):
    jobs = []
    cursor = request.app.database["jobs"].find().sort("created_at", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        jobs.append(document)
    return jobs

# --- Candidates ---

@router.post("/candidates", response_description="Add a candidate", response_model=Candidate)
async def add_candidate(request: Request, candidate: Candidate = Body(...)):
    candidate_dict = candidate.dict(by_alias=True, exclude=["id", "applied_at"])
    candidate_dict["applied_at"] = datetime.utcnow()
    
    result = await request.app.database["candidates"].insert_one(candidate_dict)
    created_candidate = await request.app.database["candidates"].find_one({"_id": result.inserted_id})
    created_candidate["_id"] = str(created_candidate["_id"])
    return created_candidate

@router.get("/candidates", response_description="List candidates", response_model=List[Candidate])
async def list_candidates(request: Request, job_id: str = None):
    candidates = []
    query = {"job_id": job_id} if job_id else {}
    cursor = request.app.database["candidates"].find(query).sort("applied_at", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        candidates.append(document)
    return candidates
