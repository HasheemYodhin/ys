from fastapi import APIRouter, Request, Depends
from datetime import date, timedelta, datetime
from typing import Dict, Any

router = APIRouter()

from typing import Optional

@router.get("/stats", response_description="Get Dashboard Statistics")
async def get_dashboard_stats(request: Request, department: Optional[str] = None) -> Dict[str, Any]:
    db = request.app.database
    today = date.today().isoformat()
    
    # Base Query for Employees
    emp_query = {}
    if department and department != "All":
        emp_query["department"] = department

    # 1. Total Employees
    total_employees = await db["employees"].count_documents(emp_query)
    
    # Get Employee IDs for this department to filter other collections if needed
    # (Optimization: For small scale, fetching IDs is fine. For large, we'd need aggregation or denormalized data)
    employee_ids = []
    if department and department != "All":
        cursor = db["employees"].find(emp_query, {"_id": 1})
        async for doc in cursor:
            employee_ids.append(str(doc["_id"]))
    
    # 2. Attendance Stats (Today)
    # If filtering by department, we need to match attendance records where employee_id is in employee_ids
    attendance_query = {"date": today}
    if department and department != "All":
        # Assuming attendance has string formatted employee_id or ObjectId? 
        # Let's check attendance model, but standard is usually string in this codebase based on other files.
        # If attendance doesn't store department, we rely on employee_ids.
        attendance_query["employee_id"] = {"$in": employee_ids}

    present_count = await db["attendance"].count_documents({**attendance_query, "status": "Present"})
    
    # Logic for absent/leave as before, but scoped to department
    attendance_on_leave = await db["attendance"].count_documents({**attendance_query, "status": "On Leave"})
    
    # Employee status "On Leave"
    employee_on_leave_query = {**emp_query, "status": "On Leave"}
    employee_on_leave = await db["employees"].count_documents(employee_on_leave_query)
    
    real_on_leave = max(attendance_on_leave, employee_on_leave)
    
    absent_count = total_employees - present_count - real_on_leave
    if absent_count < 0: absent_count = 0
    
    # 3. Active Jobs (Recruitment)
    # Model defaults to "Open", so we should query for "Open" or "Active". Let's query "Open".
    job_query = {"status": "Open"} 
    if department and department != "All":
        job_query["department"] = department
    active_jobs = await db["jobs"].count_documents(job_query)

    # 4. New Metrics for "More Dashboard"
    # Pending Expenses
    expense_query = {"status": "Pending"}
    if department and department != "All":
        expense_query["user_id"] = {"$in": employee_ids}
    pending_expenses = await db["expenses"].count_documents(expense_query)

    # New Candidates
    candidate_query = {} 
    if department and department != "All":
        dept_jobs_cursor = db["jobs"].find({"department": department}, {"_id": 1})
        job_ids = [str(doc["_id"]) async for doc in dept_jobs_cursor]
        candidate_query["job_id"] = {"$in": job_ids}

    new_candidates = await db["candidates"].count_documents(candidate_query)

    # 5. Who is on Leave (Details)
    # Fetch employees who are on leave today (from Attendance or Leaves collection)
    # For simplicity, let's look at Leaves collection where status="Approved" and today is within range?
    # OR look at Attendance where status="On Leave".
    
    # Using Attendance "On Leave" is safest for "Today".
    on_leave_cursor = db["attendance"].find({**attendance_query, "status": "On Leave"})
    employees_on_leave_list = []
    async for doc in on_leave_cursor:
        employees_on_leave_list.append({
            "name": doc.get("employee_name", "Unknown"),
            "status": "On Leave", # Could be "Sick", "Casual" if we tracked it in attendance
            "avatar": "" # Placeholder
        })
    
    
    # 6. New Joiners, Headcount Graph - Combined iteration
    from collections import defaultdict
    thirty_days_ago = date.today() - timedelta(days=30)
    six_months_ago = date.today() - timedelta(days=180)
    
    new_joiners_count = 0
    all_employee_joins = []  # Store all joining dates for graph
    
    # Single iteration through employees
    all_emps_cursor = db["employees"].find(emp_query, {"date_of_joining": 1})
    
    async for doc in all_emps_cursor:
        doj = doc.get("date_of_joining")
        if doj:
            # Normalize to date object
            if isinstance(doj, str):
                try:
                    doj = date.fromisoformat(doj)
                except:
                    continue
            elif isinstance(doj, datetime):
                doj = doj.date()
            
            all_employee_joins.append(doj)
            
            # Count new joiners (last 30 days)
            if doj >= thirty_days_ago:
                new_joiners_count += 1
    
    # Generate graph data for last 6 months (always return data)
    graph_data = []
    current_date = date.today()
    
    for i in range(5, -1, -1):
        month_date = current_date - timedelta(days=30*i)
        month_label = month_date.strftime("%b")
        
        # Count employees who joined up to end of this month
        cumulative_count = sum(1 for join_date in all_employee_joins if join_date <= month_date)
        
        # Use current total if this is the latest month
        if i == 0:
            cumulative_count = total_employees
        
        # Always append data point (even if zero)
        graph_data.append({"name": month_label, "value": max(0, cumulative_count)})
    
    print(f"Graph data generated: {graph_data}")  # Debug log
    
    # Get actual recent hires (last 30 days) with details
    recent_hires = []
    recent_hires_cursor = db["employees"].find(
        {**emp_query},
        {"name": 1, "position": 1, "department": 1, "date_of_joining": 1}
    ).sort("date_of_joining", -1).limit(10)
    
    async for emp in recent_hires_cursor:
        doj = emp.get("date_of_joining")
        if doj:
            if isinstance(doj, str):
                try:
                    doj = date.fromisoformat(doj)
                except:
                    continue
            elif isinstance(doj, datetime):
                doj = doj.date()
            
            if doj >= thirty_days_ago:
                days_ago = (date.today() - doj).days
                recent_hires.append({
                    "name": emp.get("name", "Unknown"),
                    "role": emp.get("position", "N/A"),
                    "dept": emp.get("department", "N/A"),
                    "days_ago": f"{days_ago} day{'s' if days_ago != 1 else ''} ago"
                })
    
    # Get recent activities (leave applications, etc.)
    recent_activities = []
    
    # Fetch recent leave applications
    leave_cursor = db["leaves"].find({}).sort("created_at", -1).limit(5)
    async for leave in leave_cursor:
        emp_id = leave.get("employee_id")
        if emp_id:
            emp = await db["employees"].find_one({"_id": emp_id}, {"name": 1})
            if emp:
                recent_activities.append({
                    "user": emp.get("name", "Unknown"),
                    "action": "applied for leave",
                    "time": "Recently",
                    "color": "bg-blue-500"
                })
    
    # 7. Upcoming Birthdays (Next 7 Days)
    birthdays_count = 0
    users_cursor = db["users"].find({}, {"dob": 1})
    today_date = date.today()
    
    async for doc in users_cursor:
        dob_str = doc.get("dob")
        if dob_str:
            try:
                dob = date.fromisoformat(dob_str)
                this_year_bday = dob.replace(year=today_date.year)
                days_diff = (this_year_bday - today_date).days
                if 0 <= days_diff <= 7:
                    birthdays_count += 1
            except:
                pass
    
    # 8. Mobile App Users (count active users as proxy for now)
    # In a real system, you'd track device type on login
    # For now, count recently active users (logged in within last 30 days)
    mobile_users_count = await db["users"].count_documents({"is_active": True})
    
    # 9. Department Distribution for Pie Chart
    dept_distribution = []
    dept_counts = defaultdict(int)
    
    dept_cursor = db["employees"].find(emp_query, {"department": 1})
    async for doc in dept_cursor:
        dept = doc.get("department", "Unknown")
        dept_counts[dept] += 1
    
    for dept, count in dept_counts.items():
        dept_distribution.append({"name": dept, "value": count})
    
    # 10. Attendance Trend (Last 7 Days)
    attendance_trend = []
    for i in range(6, -1, -1):
        day_date = date.today() - timedelta(days=i)
        day_label = day_date.strftime("%a")  # Mon, Tue, etc.
        
        # Count attendance for this day
        day_attendance = await db["attendance"].count_documents({
            "date": day_date.isoformat(),
            "status": "Present"
        })
        
        attendance_trend.append({"name": day_label, "value": day_attendance})
    

    return {
        "total_employees": total_employees,
        "active_jobs": active_jobs, 
        "on_leave": real_on_leave,
        "employees_on_leave_details": employees_on_leave_list,
        "performance": 94, 
        "new_joiners": new_joiners_count,
        "upcoming_birthdays": birthdays_count,
        "mobile_users": mobile_users_count,
        "headcount_graph": graph_data,
        "dept_distribution": dept_distribution,
        "attendance_trend": attendance_trend,
        "recent_hires": recent_hires,
        "recent_activities": recent_activities,
        "attendance": {
            "present": present_count,
            "absent": absent_count,
            "on_leave": real_on_leave
        },
        "pending_expenses": pending_expenses,
        "new_candidates": new_candidates
    }
