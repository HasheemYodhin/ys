from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.routes.auth import get_current_user
from app.models.leave import (
    LeaveRequestCreate, 
    LeaveRequestResponse, 
    LeaveRequestUpdate,
    LeaveStatus
)

router = APIRouter()

@router.post("/", response_model=LeaveRequestResponse)
async def create_leave_request(
    leave_in: LeaveRequestCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    leave_dict = leave_in.dict()
    leave_dict.update({
        "user_id": str(current_user["_id"]),
        "employee_name": current_user.get("full_name", current_user.get("name", "Unknown")),
        "status": LeaveStatus.PENDING,
        "applied_on": datetime.now().strftime("%Y-%m-%d"),
        "comment": None
    })
    
    result = await db["leaves"].insert_one(leave_dict)
    new_leave = await db["leaves"].find_one({"_id": result.inserted_id})
    new_leave["_id"] = str(new_leave["_id"])
    return new_leave

@router.get("/", response_model=List[LeaveRequestResponse])
async def get_leaves(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    query = {}
    if current_user.get("role") != "Employer":
        query = {"user_id": str(current_user["_id"])}
    
    cursor = db["leaves"].find(query)
    leaves = await cursor.to_list(length=100)
    for leave in leaves:
        leave["_id"] = str(leave["_id"])
    return leaves

@router.put("/{leave_id}", response_model=LeaveRequestResponse)
async def update_leave_status(
    leave_id: str,
    leave_up: LeaveRequestUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") != "Employer":
        raise HTTPException(status_code=403, detail="Only employers can approve/reject leaves")
    
    await db["leaves"].update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": leave_up.dict(exclude_unset=True)}
    )
    
    updated_leave = await db["leaves"].find_one({"_id": ObjectId(leave_id)})
    if not updated_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    updated_leave["_id"] = str(updated_leave["_id"])
    return updated_leave
