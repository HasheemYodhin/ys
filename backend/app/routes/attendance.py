from fastapi import APIRouter, Body, Request, HTTPException
from typing import List
from app.models.attendance import AttendanceRecord, AttendanceAction
from datetime import datetime, date

router = APIRouter()

@router.post("/checkin", response_description="Employee Check-in", response_model=AttendanceRecord)
async def check_in(request: Request, payload: AttendanceAction = Body(...)):
    today = date.today().isoformat()
    
    # Check if already checked in
    existing = await request.app.database["attendance"].find_one({
        "employee_id": payload.employee_id,
        "date": today
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in for today")

    # Fetch employee name robustly
    emp = await request.app.database["employees"].find_one({"_id": payload.employee_id})
    if not emp:
        from bson import ObjectId
        try:
            emp = await request.app.database["employees"].find_one({"_id": ObjectId(payload.employee_id)})
        except:
            pass

    if not emp:
         raise HTTPException(status_code=404, detail="Employee not found")

    new_record = {
        "employee_id": str(emp["_id"]),
        "employee_name": f"{emp['first_name']} {emp['last_name']}",
        "date": today,
        "check_in": datetime.utcnow(),
        "status": "Present",
        "work_hours": 0.0
    }
    
    result = await request.app.database["attendance"].insert_one(new_record)
    created_record = await request.app.database["attendance"].find_one({"_id": result.inserted_id})
    created_record["_id"] = str(created_record["_id"])
    return created_record

@router.post("/checkout", response_description="Employee Check-out", response_model=AttendanceRecord)
async def check_out(request: Request, payload: AttendanceAction = Body(...)):
    today = date.today().isoformat()
    
    # Support both string and ObjectId for employee_id lookup
    record = await request.app.database["attendance"].find_one({
        "employee_id": str(payload.employee_id),
        "date": today
    })
    
    if not record:
        from bson import ObjectId
        try:
            record = await request.app.database["attendance"].find_one({
                "employee_id": ObjectId(payload.employee_id),
                "date": today
            })
        except:
            pass

    if not record:
        raise HTTPException(status_code=400, detail="No check-in record found for today")
        
    check_out_time = datetime.utcnow()
    
    # Calculate hours
    check_in_time = record["check_in"]
    duration = check_out_time - check_in_time
    hours = duration.total_seconds() / 3600
    
    await request.app.database["attendance"].update_one(
        {"_id": record["_id"]},
        {"$set": {"check_out": check_out_time, "work_hours": round(hours, 2)}}
    )
    
    updated_record = await request.app.database["attendance"].find_one({"_id": record["_id"]})
    updated_record["_id"] = str(updated_record["_id"])
    return updated_record

@router.get("/", response_description="List attendance history", response_model=List[AttendanceRecord])
async def list_attendance(request: Request):
    attendance_list = []
    cursor = request.app.database["attendance"].find().sort("date", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        attendance_list.append(document)
    return attendance_list
