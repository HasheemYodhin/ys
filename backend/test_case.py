
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_case_sensitivity():
    MONGO_URL = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["ys_hr_db"]
    
    email_exact = "Raees@gmail.com"
    email_lower = "raees@gmail.com"
    
    user_exact = await db["users"].find_one({"email": email_exact})
    print(f"Query '{email_exact}': {'Found' if user_exact else 'Not Found'}")
    
    user_lower = await db["users"].find_one({"email": email_lower})
    print(f"Query '{email_lower}': {'Found' if user_lower else 'Not Found'}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_case_sensitivity())
