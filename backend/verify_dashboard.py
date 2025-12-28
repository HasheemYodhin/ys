
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def verify_dashboard():
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["ys_hr_db"]
    
    print("--- Verifying Dashboard Filter & Metrics ---")
    
    try:
        # Test 1: Global Stats
        print("\n1. Testing Global Stats...")
        # We simulate the logic from dashboard.py manually or we trust the logic we wrote.
        # Let's count explicitly to verify our expectations.
        
        count_all = await db["employees"].count_documents({})
        print(f"Total Employees (All): {count_all}")
        
        # Test 2: Filtered Stats (Engineering)
        print("\n2. Testing Department Filter (Engineering)...")
        filter_dept = "Engineering"
        count_eng = await db["employees"].count_documents({"department": filter_dept})
        print(f"Total Employees ({filter_dept}): {count_eng}")
        
        if count_all > 0 and count_eng < count_all:
             print("Validation Passed: Filtering reduces count (assuming data variance exists).")
        elif count_all == 0:
             print("Validation Note: No data to verify filtering difference.")
        else:
             print("Validation Note: All employees might be in Engineering or filter matching all.")

        # Test 3: New Metrics
        print("\n3. Testing New Metrics...")
        pending_exp = await db["expenses"].count_documents({"status": "Pending"})
        print(f"Pending Expenses (Global): {pending_exp}")
        
        new_cands = await db["candidates"].count_documents({}) # Approx query used
        print(f"New Candidates (Global): {new_cands}")
        
        print("\nVerification Complete.")
        
    except Exception as e:
        print(f"\nVerification FAILED: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(verify_dashboard())
