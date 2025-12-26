from fastapi import APIRouter, Body, Request, HTTPException
from typing import List
from app.models.payroll import PayrollRecord, PayrollGenerateRequest
from app.models.employee import Employee
from datetime import datetime

router = APIRouter()

@router.post("/generate", response_description="Generate payroll for a month", response_model=List[PayrollRecord])
async def generate_payroll(request: Request, payload: PayrollGenerateRequest = Body(...)):
    # 1. Fetch all Active Employees
    cursor = request.app.database["employees"].find({"status": "Active"})
    employees = await cursor.to_list(length=1000)
    
    generated_records = []
    
    for emp in employees:
        # Simplistic Salary Calculation Logic
        # In a real app, this would use the SalaryStructure model linked to the employee
        annual_salary = emp.get("salary", 0)
        monthly_gross = annual_salary / 12
        
        # Standard Assumptions for Demo
        basic = monthly_gross * 0.5
        hra = monthly_gross * 0.2
        special = monthly_gross * 0.3
        
        pf = basic * 0.12
        pt = 200 # Flat PT
        tds = monthly_gross * 0.1 # Flat 10% TDS for demo
        
        total_deductions = pf + pt + tds
        net_salary = monthly_gross - total_deductions
        
        record = {
            "employee_id": str(emp["_id"]),
            "employee_name": f"{emp['first_name']} {emp['last_name']}",
            "month": payload.month,
            "year": payload.year,
            "basic_salary": round(basic, 2),
            "total_allowances": round(hra + special, 2),
            "total_deductions": round(total_deductions, 2),
            "net_salary": round(net_salary, 2),
            "status": "Processed",
            "generated_at": datetime.utcnow()
        }
        
        # Insert or Update
        await request.app.database["payroll"].update_one(
            {"employee_id": record["employee_id"], "month": payload.month, "year": payload.year},
            {"$set": record},
            upsert=True
        )
        
        # Fetch the complete object to return
        saved_record = await request.app.database["payroll"].find_one(
            {"employee_id": record["employee_id"], "month": payload.month, "year": payload.year}
        )
        saved_record["_id"] = str(saved_record["_id"])
        generated_records.append(saved_record)

    return generated_records

@router.get("/", response_description="List payroll history", response_model=List[PayrollRecord])
async def list_payroll(request: Request):
    payroll_list = []
    cursor = request.app.database["payroll"].find().sort("generated_at", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        payroll_list.append(document)
    return payroll_list
