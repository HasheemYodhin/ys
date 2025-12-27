from fastapi import APIRouter, Body, Request, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
from app.models.employee import Employee, EmployeeCreate, EmployeeUpdate
from app.auth_utils import get_password_hash

router = APIRouter()



@router.post("/", response_description="Add new employee", response_model=Employee)
async def create_employee(request: Request, employee: EmployeeCreate = Body(...)):
    employee_data = jsonable_encoder(employee)
    
    # Handle User Creation if password is provided
    password = employee_data.pop("password", None)
    if password:
        # Check if user exists
        existing_user = await request.app.database["users"].find_one({"email": employee.email})
        if not existing_user:
            hashed_password = get_password_hash(password)
            user_doc = {
                "email": employee.email,
                "full_name": f"{employee.first_name} {employee.last_name}",
                "role": "Employee", # Default to Employee role for new hires
                "hashed_password": hashed_password,
                "is_active": True,
                "department": employee.department,
                "joining_date": str(employee.date_of_joining),
                "designation": employee.role
            }
            await request.app.database["users"].insert_one(user_doc)
            
    # Continue creating employee record
    new_employee = await request.app.database["employees"].insert_one(employee_data)
    created_employee = await request.app.database["employees"].find_one({"_id": new_employee.inserted_id})
    
    if created_employee:
        created_employee["_id"] = str(created_employee["_id"])
        
    return created_employee

@router.get("/", response_description="List all employees", response_model=List[Employee])
async def list_employees(request: Request):
    try:
        employees = []
        cursor = request.app.database["employees"].find()
        async for document in cursor:
            # Map _id to id handling
            if "_id" in document:
                document["_id"] = str(document["_id"])
            employees.append(document)
        return employees
    except Exception as e:
        import traceback
        with open("backend_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise e

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


@router.put("/{id}", response_description="Update an employee", response_model=Employee)
async def update_employee(id: str, request: Request, employee: EmployeeUpdate = Body(...)):
    employee_data = {k: v for k, v in employee.dict().items() if v is not None}
    
    if len(employee_data) >= 1:
        # Handle User Update if relevant fields are changed
        password = employee_data.pop("password", None)
        
        # We need the current employee record to get the email (primary key for user)
        # Try direct string find
        current_employee = await request.app.database["employees"].find_one({"_id": id})
        if not current_employee:
             from bson import ObjectId
             try:
                 current_employee = await request.app.database["employees"].find_one({"_id": ObjectId(id)})
             except:
                 pass
        
        if current_employee:
            user_update_data = {}
            if password:
                user_update_data["hashed_password"] = get_password_hash(password)
            
            # Update name if changed
            if "first_name" in employee_data or "last_name" in employee_data:
                fname = employee_data.get("first_name", current_employee.get("first_name"))
                lname = employee_data.get("last_name", current_employee.get("last_name"))
                user_update_data["full_name"] = f"{fname} {lname}"
                
            # Update designation if role changed
            if "role" in employee_data:
                user_update_data["designation"] = employee_data["role"]
            
            # Update department if changed
            if "department" in employee_data:
                user_update_data["department"] = employee_data["department"]
            
            if user_update_data:
                # Find user by email (assuming email doesn't change for now, or if it does, handle that separately)
                # If email changes, we'd need to update the user's email too.
                current_email = current_employee.get("email")
                if "email" in employee_data:
                     user_update_data["email"] = employee_data["email"]
                
                await request.app.database["users"].update_one(
                    {"email": current_email},
                    {"$set": user_update_data}
                )

        # Update Employee Record
        # Try direct string find
        update_result = await request.app.database["employees"].update_one(
            {"_id": id}, {"$set": employee_data}
        )
        
        if update_result.matched_count == 0:
             # Try ObjectId
             from bson import ObjectId
             try:
                update_result = await request.app.database["employees"].update_one(
                    {"_id": ObjectId(id)}, {"$set": employee_data}
                )
             except:
                pass

    if (employee := await request.app.database["employees"].find_one({"_id": id})) is not None:
        employee["_id"] = str(employee["_id"])
        return employee
        
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
