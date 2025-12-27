import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_mongo():
    uri = "mongodb://127.0.0.1:27017"
    print(f"Testing connection to: {uri}")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB via 127.0.0.1")
    except Exception as e:
        print(f"FAILED: Could not connect to {uri}. Error: {e}")

    uri_local = "mongodb://localhost:27017"
    print(f"Testing connection to: {uri_local}")
    try:
        client = AsyncIOMotorClient(uri_local, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB via localhost")
    except Exception as e:
        print(f"FAILED: Could not connect to {uri_local}. Error: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_mongo())
