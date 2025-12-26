from fastapi import APIRouter, Body, Request, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
from app.models.employee import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()

@router.post("/", response_description="Add new employee", response_model=Employee)
async def create_employee(request: Request, employee: EmployeeCreate = Body(...)):
    employee_data = jsonable_encoder(employee)
    new_employee = await request.app.database["employees"].insert_one(employee_data)
    created_employee = await request.app.database["employees"].find_one({"_id": new_employee.inserted_id})
    
    if created_employee:
        created_employee["_id"] = str(created_employee["_id"])
        
    return created_employee

@router.get("/", response_description="List all employees", response_model=List[Employee])
async def list_employees(request: Request):
    employees = []
    cursor = request.app.database["employees"].find()
    async for document in cursor:
        # Map _id to id handling
        if "_id" in document:
            document["_id"] = str(document["_id"])
        employees.append(document)
    return employees

@router.get("/{id}", response_description="Get a single employee", response_model=Employee)
async def show_employee(id: str, request: Request):
    if (employee := await request.app.database["employees"].find_one({"_id": id})) is not None:
        employee["_id"] = str(employee["_id"])
        return employee
        
    # Try ObjectId convert
    from bson import ObjectId
    try:
        obj_id = ObjectId(id)
        if (employee := await request.app.database["employees"].find_one({"_id": obj_id})) is not None:
            employee["_id"] = str(employee["_id"])
            return employee
    except:
        pass
        
    raise HTTPException(status_code=404, detail=f"Employee {id} not found")

@router.delete("/{id}", response_description="Delete an employee")
async def delete_employee(id: str, request: Request):
    # Try direct string find
    delete_result = await request.app.database["employees"].delete_one({"_id": id})
    
    if delete_result.deleted_count == 1:
        return {"message": "Employee deleted successfully"}

    # Try ObjectId conversion
    from bson import ObjectId
    try:
        obj_id = ObjectId(id)
        delete_result = await request.app.database["employees"].delete_one({"_id": obj_id})
        if delete_result.deleted_count == 1:
            return {"message": "Employee deleted successfully"}
    except:
        pass

    raise HTTPException(status_code=404, detail=f"Employee {id} not found")
