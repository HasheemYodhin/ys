from pydantic import BaseModel, EmailStr
from datetime import date
try:
    class Test(BaseModel):
        email: EmailStr
        d: date

    t = Test(email="test@example.com", d="2025-12-27")
    print("VALIDATION_SUCCESS")
except Exception as e:
    print(f"VALIDATION_FAIL: {e}")
