import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    client = AsyncIOMotorClient("mongodb://127.0.0.1:27017")
    db = client["ys_hr_db"]
    
    users = await db["users"].find().to_list(100)
    
    print(f"\n{'='*60}")
    print(f"Total users in database: {len(users)}")
    print(f"{'='*60}\n")
    
    for i, user in enumerate(users, 1):
        print(f"{i}. Name: {user.get('name', 'N/A')}")
        print(f"   Email: {user.get('email', 'N/A')}")
        print(f"   Role: {user.get('role', 'Employee')}")
        print(f"   ID: {str(user['_id'])}")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
