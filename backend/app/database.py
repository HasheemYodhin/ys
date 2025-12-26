import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "ys_hr_db"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def get_database():
    return db
