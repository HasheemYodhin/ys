import uvicorn
import os
import sys

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("="*60)
    print("STARTING YS HR BACKEND WITH CHAT SUPPORT")
    print("="*60)
    print("• Host: http://127.0.0.1:8000")
    print("• Mode: WebSocket + REST API")
    print("• App:  socket_app")
    print("-" * 60)
    
    # Run uvicorn programmatically
    # equivalent to: uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(
        "app.main:socket_app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
