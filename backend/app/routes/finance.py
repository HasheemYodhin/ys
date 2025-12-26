from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..database import get_database
from ..models.finance import LeaveRequest, LeaveResponse, ExpenseRequest, ExpenseResponse
from bson import ObjectId

router = APIRouter()

@router.post("/leaves", response_model=LeaveResponse)
async def create_leave(leave: LeaveRequest, db=Depends(get_database)):
    leave_dict = leave.dict()
    result = await db["leaves"].insert_one(leave_dict)
    leave_dict["id"] = str(result.inserted_id)
    return leave_dict

@router.get("/leaves", response_model=List[LeaveResponse])
async def get_leaves(db=Depends(get_database)):
    leaves = await db["leaves"].find().to_list(100)
    for l in leaves:
        l["id"] = str(l["_id"])
    return leaves

@router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseRequest, db=Depends(get_database)):
    exp_dict = expense.dict()
    result = await db["expenses"].insert_one(exp_dict)
    exp_dict["id"] = str(result.inserted_id)
    return exp_dict

@router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(db=Depends(get_database)):
    expenses = await db["expenses"].find().to_list(100)
    for e in expenses:
        e["id"] = str(e["_id"])
    return expenses
