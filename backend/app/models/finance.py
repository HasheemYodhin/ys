from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LeaveRequest(BaseModel):
    employee_id: str
    leave_type: str  # Paid, Unpaid, Sick, etc.
    start_date: datetime
    end_date: datetime
    reason: str
    status: str = "Pending"  # Pending, Approved, Rejected
    applied_on: datetime = datetime.now()

class LeaveResponse(LeaveRequest):
    id: str

class ExpenseRequest(BaseModel):
    employee_id: str
    category: str  # Travel, Food, Supplies, etc.
    amount: float
    date: datetime
    description: str
    status: str = "Pending"  # Pending, Approved, Rejected
    receipt_url: Optional[str] = None
    applied_on: datetime = datetime.now()

class ExpenseResponse(ExpenseRequest):
    id: str
