import requests
import json

# Test if backend is running and responding
BASE_URL = "http://localhost:8000"

print("Testing backend endpoints...")
print("=" * 60)

# Test 1: Root endpoint
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"✓ Root endpoint: {response.status_code}")
    print(f"  Response: {response.json()}")
except Exception as e:
    print(f"✗ Root endpoint failed: {e}")

print()

# Test 2: Check if chat routes are registered
try:
    response = requests.get(f"{BASE_URL}/docs")
    print(f"✓ API docs available at: {BASE_URL}/docs")
except Exception as e:
    print(f"✗ API docs failed: {e}")

print()
print("=" * 60)
print("\nIf you see errors above, the backend is NOT running correctly.")
print("Make sure to run:")
print("  cd backend")
print("  .\\venv\\Scripts\\python -m uvicorn app.main:socket_app --reload")
