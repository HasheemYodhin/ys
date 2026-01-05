import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

async def check_mongo():
    try:
        client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB")
        return True
    except Exception as e:
        print(f"ERROR: Could not connect to MongoDB: {e}")
        return False

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    success = loop.run_until_complete(check_mongo())
    sys.exit(0 if success else 1)
