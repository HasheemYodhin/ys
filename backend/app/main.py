from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Import Routes
from .routes import auth
from app.routes import employees, payroll, attendance, recruitment, finance, cms, leaves, dashboard

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")

app = FastAPI(title="YS HR Management System", version="1.0.0")

# CORS setup
# Allow all origins for development to avoid localhost vs 127.0.0.1 blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "ys_hr_db"

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    app.database = app.mongodb_client[DB_NAME]
    try:
        await app.database.command("ping")
        print(f"Successfully connected to MongoDB at {MONGO_URL}")
    except Exception as e:
        print(f"CRITICAL: Could not connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(payroll.router, prefix="/payroll", tags=["payroll"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
app.include_router(leaves.router, prefix="/leaves", tags=["leaves"])
app.include_router(recruitment.router, prefix="/recruitment", tags=["recruitment"])
app.include_router(finance.router, prefix="/finance", tags=["finance"])
app.include_router(cms.router, prefix="/cms", tags=["cms"])

app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Register Reports Router
from app.routes import reports
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Welcome to YS HR Management System API"}
