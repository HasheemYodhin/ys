from fastapi import APIRouter, Request, Depends
from datetime import date
from typing import Dict, Any

router = APIRouter()

@router.get("/stats", response_description="Get Dashboard Statistics")
async def get_dashboard_stats(request: Request) -> Dict[str, Any]:
    db = request.app.database
    today = date.today().isoformat()
    
    # 1. Total Employees
    total_employees = await db["employees"].count_documents({})
    
    # 2. Attendance Stats (Today)
    present_count = 0
    absent_count = 0
    on_leave_today = 0
    
    # We can do this with aggregation or python loop. Loop is fine for small scale.
    # Actually, counting directly is faster if we trust the "status" field in attendance.
    
    present_count = await db["attendance"].count_documents({"date": today, "status": "Present"})
    
    # "Absent" is tricky because they might not have a record yet.
    # Usually, Absent = Total - Present - On Leave.
    # Unless we create "Absent" records for everyone at start of day.
    # For now, let's assume Absent = Total - Present (ignoring On Leave for a second).
    
    # But we also have "On Leave" status in Employee collection OR Attendance.
    # Let's count "On Leave" from Attendance record if status is "On Leave".
    attendance_on_leave = await db["attendance"].count_documents({"date": today, "status": "On Leave"})
    
    # Also check Employee status "On Leave" (long term leave)
    employee_on_leave = await db["employees"].count_documents({"status": "On Leave"})
    
    # Combine leave counts (trying not to double count if logic handled elsewhere)
    # For this dashboard, let's use the explicit "On Leave" count from employees for the big card,
    # and attendance On leave for the breakdown.
    
    real_on_leave = max(attendance_on_leave, employee_on_leave)
    
    # Absent logic
    # Absent = Total - Present - Real On Leave
    absent_count = total_employees - present_count - real_on_leave
    if absent_count < 0: absent_count = 0
    
    # 3. Active Jobs (Mock for now, or check recruitment collection if exists)
    # Checking if "jobs" collection exists?
    # db["recruitment"]? Let's check main.py imports... recruitment router exists.
    # Let's try to count "jobs" collection if it exists, else return mock.
    active_jobs = await db["jobs"].count_documents({"status": "Active"})
    
    return {
        "total_employees": total_employees,
        "active_jobs": active_jobs, 
        "on_leave": real_on_leave,
        "performance": 94, # Mock for now
        "attendance": {
            "present": present_count,
            "absent": absent_count,
            "on_leave": real_on_leave
        }
    }
