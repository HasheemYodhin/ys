import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pprint

async def debug_users():
    uri = "mongodb://127.0.0.1:27017"
    client = AsyncIOMotorClient(uri)
    db = client["ys_hr_db"]
    users = db["users"]
    
    print("--- Inspecting Users Collection ---")
    async for doc in users.find():
        print(f"ID: {doc.get('_id')} | Email: {doc.get('email')} | Role: {doc.get('role')}")
        pprint.pprint(doc)
        print("-" * 20)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(debug_users())
