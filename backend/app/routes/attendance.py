from fastapi import APIRouter, Body, Request, HTTPException
from typing import List
from app.models.attendance import AttendanceRecord, AttendanceAction
from datetime import datetime, date, timezone

router = APIRouter()

@router.post("/checkin", response_description="Employee Check-in", response_model=AttendanceRecord)
async def check_in(request: Request, payload: dict = Body(...)):
    today = date.today().isoformat()
    employee_id = payload.get("employee_id")
    location = payload.get("location", "Office")
    
    # Check if already checked in
    existing = await request.app.database["attendance"].find_one({
        "employee_id": employee_id,
        "date": today
    })
    
    # If exists and already checked in (no check_out), don't allow
    if existing and existing.get("check_out") is None:
        raise HTTPException(status_code=400, detail="Already checked in. Please check out first.")
    
    # If exists and checked out, allow new check-in (for breaks/lunch)
    if existing and existing.get("check_out") is not None:
        # Update existing record - set new check_in and clear check_out
        await request.app.database["attendance"].update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "check_in": datetime.now(timezone.utc),
                "check_out": None
            }}
        )
        updated_record = await request.app.database["attendance"].find_one({"_id": existing["_id"]})
        updated_record["_id"] = str(updated_record["_id"])
        return updated_record

    # Fetch employee details for new record
    emp = await request.app.database["employees"].find_one({"_id": employee_id})
    if not emp:
        from bson import ObjectId
        try:
            emp = await request.app.database["employees"].find_one({"_id": ObjectId(employee_id)})
        except:
            pass

    if not emp:
         raise HTTPException(status_code=404, detail="Employee not found")

    # Create new record
    new_record = {
        "employee_id": str(emp["_id"]),
        "employee_name": payload.get("employee_name") or f"{emp['first_name']} {emp['last_name']}",
        "department": emp.get("department", "N/A"),
        "date": today,
        "check_in": datetime.now(timezone.utc),
        "check_out": None,
        "status": "Present",
        "work_hours": 0.0,
        "break_time": 0,
        "location": location
    }
    
    result = await request.app.database["attendance"].insert_one(new_record)
    created_record = await request.app.database["attendance"].find_one({"_id": result.inserted_id})
    created_record["_id"] = str(created_record["_id"])
    return created_record

@router.post("/checkout", response_description="Employee Check-out", response_model=AttendanceRecord)
async def check_out(request: Request, payload: dict = Body(...)):
    today = date.today().isoformat()
    employee_id = payload.get("employee_id")
    
    # Support both string and ObjectId for employee_id lookup
    record = await request.app.database["attendance"].find_one({
        "employee_id": str(employee_id),
        "date": today
    })
    
    if not record:
        from bson import ObjectId
        try:
            record = await request.app.database["attendance"].find_one({
                "employee_id": ObjectId(employee_id),
                "date": today
            })
        except:
            pass

    if not record:
        raise HTTPException(status_code=400, detail="No check-in record found for today")
        
    check_out_time = datetime.now(timezone.utc)
    
    # Calculate hours - handle timezone-aware and timezone-naive datetimes
    check_in_time = record["check_in"]
    
    # If check_in is timezone-naive, make it timezone-aware (assume UTC)
    if isinstance(check_in_time, datetime):
        if check_in_time.tzinfo is None:
            check_in_time = check_in_time.replace(tzinfo=timezone.utc)
    else:
        # If it's a string, parse it
        try:
            check_in_time = datetime.fromisoformat(str(check_in_time))
            if check_in_time.tzinfo is None:
                check_in_time = check_in_time.replace(tzinfo=timezone.utc)
        except:
            raise HTTPException(status_code=400, detail="Invalid check-in time format")
    
    duration = check_out_time - check_in_time
    session_hours = round(duration.total_seconds() / 3600, 2)
    
    # Get existing work hours and add this session
    existing_work_hours = record.get("work_hours", 0.0)
    total_work_hours = round(existing_work_hours + session_hours, 2)
    
    # If total work hours >= 8, consider it a full day and set to 9 hours
    if total_work_hours >= 8:
        total_work_hours = 9.0
    
    # Calculate break time based on work hours (1 hour break for 9 hours)
    break_time = 60 if total_work_hours >= 9 else 30 if total_work_hours >= 4 else 0
    
    update_result = await request.app.database["attendance"].update_one(
        {"_id": record["_id"]},
        {"$set": {
            "check_out": check_out_time,
            "work_hours": total_work_hours,
            "break_time": break_time
        }}
    )
    
    updated_record = await request.app.database["attendance"].find_one({"_id": record["_id"]})
    updated_record["_id"] = str(updated_record["_id"])
    return updated_record

@router.get("/today/{employee_id}", response_description="Get today's attendance for employee")
async def get_today_attendance(request: Request, employee_id: str):
    today = date.today().isoformat()
    
    record = await request.app.database["attendance"].find_one({
        "employee_id": employee_id,
        "date": today
    })
    
    if not record:
        from bson import ObjectId
        try:
            record = await request.app.database["attendance"].find_one({
                "employee_id": ObjectId(employee_id),
                "date": today
            })
        except:
            pass
    
    if record:
        record["_id"] = str(record["_id"])
        return record
    
    return None

@router.get("/", response_description="List attendance history")
async def list_attendance(request: Request):
    attendance_list = []
    cursor = request.app.database["attendance"].find().sort("date", -1)
    async for document in cursor:
        # Skip records with invalid check_in format
        if "check_in" in document:
            check_in = document["check_in"]
            # Skip if check_in is just a time string like "09:00"
            if isinstance(check_in, str) and len(check_in) < 10:
                continue
            # Convert string to datetime if needed
            if isinstance(check_in, str):
                try:
                    document["check_in"] = datetime.fromisoformat(check_in)
                except:
                    continue
        
        # Same for check_out
        if "check_out" in document and document["check_out"]:
            check_out = document["check_out"]
            if isinstance(check_out, str) and len(check_out) < 10:
                document["check_out"] = None
            elif isinstance(check_out, str):
                try:
                    document["check_out"] = datetime.fromisoformat(check_out)
                except:
                    document["check_out"] = None
        
        # Add missing fields with defaults
        if "department" not in document:
            document["department"] = "N/A"
        if "break_time" not in document:
            document["break_time"] = 0
        if "location" not in document:
            document["location"] = "Office"
            
        document["_id"] = str(document["_id"])
        attendance_list.append(document)
    
    return attendance_list
@router.get("/today", response_description="List today's attendance", response_model=List[AttendanceRecord])
async def list_today_attendance(request: Request):
    today = date.today().isoformat()
    attendance_list = []
    cursor = request.app.database["attendance"].find({"date": today})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        attendance_list.append(document)
    return attendance_list
