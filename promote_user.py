import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def promote_user(email):
    uri = "mongodb://127.0.0.1:27017"
    client = AsyncIOMotorClient(uri)
    db = client["ys_hr_db"]
    users = db["users"]
    
    result = await users.update_one(
        {"email": email},
        {"$set": {"role": "Employer"}}
    )
    
    if result.modified_count > 0:
        print(f"SUCCESS: User {email} promoted to Employer.")
    else:
        print(f"FAILED: User {email} not found or already Employer.")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(promote_user("dummy@gmail.com"))
