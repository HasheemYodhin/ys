import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pprint

async def debug_employees():
    uri = "mongodb://127.0.0.1:27017"
    client = AsyncIOMotorClient(uri)
    db = client["ys_hr_db"]
    employees = db["employees"]
    
    print("--- Inspecting Employees Collection ---")
    async for doc in employees.find():
        print(f"ID: {doc.get('_id')}")
        pprint.pprint(doc)
        print("-" * 20)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(debug_employees())
