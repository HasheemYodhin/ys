
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def list_users():
    MONGO_URL = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["ys_hr_db"]
    users = await db["users"].find().to_list(100)
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"- {user.get('email', 'NO_EMAIL')} (Auth Provider: {user.get('provider', 'local')})")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users())
