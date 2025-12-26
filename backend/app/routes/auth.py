from fastapi import APIRouter, HTTPException, status, Depends
from ..models.user import UserCreate, UserLogin, UserResponse, UserInDB
from ..auth_utils import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
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
        **user.dict(),
        hashed_password=hashed_password
    )
    
    # Insert
    new_user = await db["users"].insert_one(user_in_db.dict())
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
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
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user
