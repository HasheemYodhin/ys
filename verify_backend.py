import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Attempting to import app.main...")
    from app import main
    print("IMPORT_SUCCESS")
except Exception as e:
    print("IMPORT_FAILED")
    import traceback
    traceback.print_exc()
