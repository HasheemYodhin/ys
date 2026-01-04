import os
from dotenv import load_dotenv, find_dotenv

print(f"Current CWD: {os.getcwd()}")
env_path = find_dotenv()
print(f"Docs found .env at: {env_path}")

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")

if gemini_key:
    print(f"GEMINI_API_KEY: Found (Length: {len(gemini_key)})")
else:
    print("GEMINI_API_KEY: Missing")

if google_key:
    print(f"GOOGLE_API_KEY: Found (Length: {len(google_key)})")
else:
    print("GOOGLE_API_KEY: Missing")
