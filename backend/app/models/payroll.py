from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class SalaryStructure(BaseModel):
    basic_salary: float
    hra: float = 0.0
    special_allowance: float = 0.0
    medical_allowance: float = 0.0
    pf_deduction: float = 0.0
    professional_tax: float = 0.0
    tds: float = 0.0

class PayrollRecord(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    employee_id: str
    employee_name: str
    month: str # e.g., "November 2024"
    year: int
    basic_salary: float
    total_allowances: float
    total_deductions: float
    net_salary: float
    status: str = "Processed" # Processed, Paid
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class PayrollGenerateRequest(BaseModel):
    month: str
    year: int
