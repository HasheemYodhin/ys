from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.database import get_database
from datetime import date

router = APIRouter()

@router.get("/summary", response_description="Get System Summary Report")
async def get_system_summary(db=Depends(get_database)) -> Dict[str, Any]:
    today = date.today().isoformat()

    # 1. Employee Stats
    total_employees = await db["employees"].count_documents({})
    
    # Department distribution
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    dept_counts = await db["employees"].aggregate(pipeline).to_list(None)
    departments = {d["_id"]: d["count"] for d in dept_counts if d["_id"]}

    # 2. Leave Stats
    pending_leaves = await db["leaves"].count_documents({"status": "Pending"})
    approved_leaves = await db["leaves"].count_documents({"status": "Approved"})
    
    # 3. Recruitment Stats
    active_jobs = await db["jobs"].count_documents({"status": "Active"})
    total_candidates = await db["candidates"].count_documents({})
    
    # 4. Attendance (Present Today)
    present_today = await db["attendance"].count_documents({"date": today, "status": "Present"})

    return {
        "employees": {
            "total": total_employees,
            "by_department": departments
        },
        "leaves": {
            "pending": pending_leaves,
            "approved_total": approved_leaves
        },
        "recruitment": {
            "active_jobs": active_jobs,
            "total_candidates": total_candidates
        },
        "attendance": {
            "present_today": present_today
        },
        "generated_at": today
    }
