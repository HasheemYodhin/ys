from fastapi import APIRouter, HTTPException, status, Depends
from ..models.user import UserCreate, UserLogin, UserResponse, UserInDB, UserUpdate, PasswordResetRequest, PasswordResetConfirm
from ..auth_utils import get_password_hash, verify_password, create_access_token, create_reset_token, verify_reset_token, SECRET_KEY, ALGORITHM
from ..database import get_database
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from jose import JWTError, jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=UserResponse)
async def create_user(user: UserCreate, db=Depends(get_database)):
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        **user.dict(exclude={"password"}),
        hashed_password=hashed_password
    )
    
    # Insert
    new_user = await db["users"].insert_one(user_in_db.dict())
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    if created_user:
        created_user["_id"] = str(created_user["_id"])
    return created_user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_database)):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    if "_id" in current_user:
        current_user["_id"] = str(current_user["_id"])
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    # Filter out None values to only update provided fields
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    if update_data:
        await db["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    updated_user = await db["users"].find_one({"_id": current_user["_id"]})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db=Depends(get_database)):
    user = await db["users"].find_one({"email": {"$regex": f"^{request.email}$", "$options": "i"}})
    if not user:
        # For security, don't reveal if user exists. 
        # But for this dev phase, we might want to know.
        # Let's return success anyway.
        return {"message": "If this email is registered, a reset link has been sent."}
    
    token = create_reset_token(request.email)
    # MOCK EMAIL SENDING
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    print(f"RESET LINK FOR {request.email}: {reset_link}")
    
    return {
        "message": "Reset link generated (check server console for dev)",
        "reset_link": reset_link # Returning in body for easy testing as per plan
    }

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm, db=Depends(get_database)):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(request.new_password)
    
    await db["users"].update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Password updated successfully"}

@router.post("/request-password-reset")
async def request_password_reset(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_reset_requested": True}}
    )
    # Mocking notification to employer
    print(f"NOTIFICATION: User {current_user['email']} requested a password reset.")
    return {"message": "Reset request sent to your employer"}

@router.post("/toggle-2fa")
async def toggle_2fa(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    new_status = not current_user.get("two_factor_enabled", False)
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"two_factor_enabled": new_status}}
    )
    return {
        "message": f"2FA {'enabled' if new_status else 'disabled'} successfully",
        "two_factor_enabled": new_status
    }

@router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") != "Employer":
        return [] # Non-employers don't see system-wide alerts
        
    notifications = []
    
    # 1. Password Reset Requests
    reset_requests = await db["users"].find(
        {"password_reset_requested": True}
    ).to_list(length=100)
    
    for req in reset_requests:
        notifications.append({
            "id": str(req["_id"]),
            "type": "password_reset",
            "user_name": req.get("full_name") or req.get("name") or req.get("email"),
            "email": req.get("email"),
            "message": f"Requested a password reset",
            "created_at": "Just now" # Could be enhanced with timestamps
        })
        
    # 2. Mock System Updates for demo
    notifications.append({
        "id": "sys_1",
        "type": "system",
        "user_name": "System",
        "email": "admin@ys.com",
        "message": "The annual HR compliance policy has been updated for 2026.",
        "created_at": "2 hours ago"
    })
        
    return notifications

@router.post("/notifications/{user_id}/resolve")
async def resolve_notification(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") != "Employer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from bson import ObjectId
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_reset_requested": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or already resolved")
        
    return {"message": "Notification resolved successfully"}

