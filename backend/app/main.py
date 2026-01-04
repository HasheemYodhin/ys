from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # Moved import to top
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
from bson import ObjectId

# Import Routes
from .routes import auth
from app.routes import employees, payroll, attendance, recruitment, finance, cms, leaves, dashboard, chat

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")


from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env

app = FastAPI(title="YS HR Management System", version="1.0.0")

# CORS setup
# Allow specific origins for development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "capacitor://localhost",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Socket.IO setup for real-time chat
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)
app.sio = sio

# Wrap FastAPI app with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

DB_NAME = "ys_hr_db"

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    app.database = app.mongodb_client[DB_NAME]
    try:
        await app.database.command("ping")
        print(f"Successfully connected to MongoDB at {MONGO_URL}")
    except Exception as e:
        print(f"CRITICAL: Could not connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

from jose import JWTError, jwt
from app.auth_utils import SECRET_KEY, ALGORITHM
from datetime import datetime

# Global state for tracking online users
online_users = {} # user_id -> sid
sid_to_user = {}  # sid -> user_id

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth=None):
    print(f"Client connecting: {sid}")
    token = None
    if auth:
        token = auth.get('token')
    
    if not token:
        print(f"Connection rejected for {sid}: No token")
        return False

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub_id") or payload.get("sub") # support both
        if not user_id:
            return False
        
        # Mark user as online in DB
        if hasattr(app, 'database'):
            from bson import ObjectId
            try:
                # payload.get("sub") is usually email or id. Let's find user.
                user = await app.database["users"].find_one({"email": payload.get("sub")})
                if user:
                    user_id_str = str(user["_id"])
                    online_users[user_id_str] = sid
                    sid_to_user[sid] = user_id_str
                    
                    await app.database["users"].update_one(
                        {"_id": user["_id"]},
                        {"$set": {"is_online": True, "current_status": "online", "last_seen": datetime.utcnow().isoformat()}}
                    )
                    
                    # Notify others
                    await sio.emit('status_update', {
                        "user_id": user_id_str,
                        "is_online": True,
                        "current_status": "online",
                        "last_seen": datetime.utcnow().isoformat()
                    })
                    print(f"User {user['full_name']} connected ({sid})")
            except Exception as e:
                print(f"Error marking user online: {e}")

    except JWTError:
        print(f"Connection rejected for {sid}: Invalid token")
        return False

@sio.event
async def disconnect(sid):
    user_id = sid_to_user.get(sid)
    if user_id:
        print(f"Client disconnected: {sid} (User: {user_id})")
        if user_id in online_users:
            del online_users[user_id]
        del sid_to_user[sid]
        
        # Mark as offline in DB
        if hasattr(app, 'database'):
            from bson import ObjectId
            try:
                await app.database["users"].update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"is_online": False, "current_status": "offline", "last_seen": datetime.utcnow().isoformat()}}
                )
                await sio.emit('status_update', {
                    "user_id": user_id,
                    "is_online": False,
                    "current_status": "offline",
                    "last_seen": datetime.utcnow().isoformat()
                })
            except Exception as e:
                print(f"Error marking user offline: {e}")

@sio.event
async def join_conversation(sid, data):
    """Join a conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id:
        await sio.enter_room(sid, conversation_id)
        print(f"Client {sid} joined conversation {conversation_id}")

@sio.event
async def leave_conversation(sid, data):
    """Leave a conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id:
        await sio.leave_room(sid, conversation_id)
        print(f"Client {sid} left conversation {conversation_id}")

@sio.event
async def send_message(sid, data):
    """Broadcast message to conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id:
        await sio.emit('new_message', data, room=conversation_id)
        print(f"Message sent to conversation {conversation_id}")

@sio.event
async def typing(sid, data):
    """Broadcast typing indicator"""
    conversation_id = data.get('conversation_id')
    user_name = data.get('user_name')
    if conversation_id:
        await sio.emit('user_typing', {'user_name': user_name, 'conversation_id': conversation_id}, room=conversation_id, skip_sid=sid)

@sio.event
async def update_status(sid, data):
    """Manually update user status (online, idle, in-call)"""
    user_id = sid_to_user.get(sid)
    new_status = data.get('status')
    if user_id and new_status in ['online', 'idle', 'in-call', 'offline']:
        await app.database["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"current_status": new_status}}
        )
        await sio.emit('status_update', {
            "user_id": user_id,
            "is_online": new_status != 'offline',
            "current_status": new_status,
            "last_seen": datetime.utcnow().isoformat()
        })

# WebRTC Signaling Events
@sio.event
async def call_user(sid, data):
    """Relay call offer to target user"""
    target_id = data.get('target_id')
    target_sid = online_users.get(target_id)
    if target_sid:
        caller_id = sid_to_user.get(sid)
        await sio.emit('call_incoming', {
            'caller_id': caller_id,
            'caller_name': data.get('caller_name'),
            'offer': data.get('offer'),
            'type': data.get('type')
        }, to=target_sid)

@sio.event
async def answer_call(sid, data):
    """Relay call answer to original caller"""
    target_id = data.get('target_id')
    target_sid = online_users.get(target_id)
    if target_sid:
        await sio.emit('call_answered', {
            'answer': data.get('answer')
        }, to=target_sid)

@sio.event
async def ice_candidate(sid, data):
    """Relay ICE candidates between peers"""
    target_id = data.get('target_id')
    target_sid = online_users.get(target_id)
    if target_sid:
        await sio.emit('ice_candidate', {
            'candidate': data.get('candidate')
        }, to=target_sid)

@sio.event
async def end_call(sid, data):
    """Notify other party that call ended"""
    target_id = data.get('target_id')
    target_sid = online_users.get(target_id)
    if target_sid:
        await sio.emit('call_ended', to=target_sid)

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(payroll.router, prefix="/payroll", tags=["payroll"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
app.include_router(leaves.router, prefix="/leaves", tags=["leaves"])
app.include_router(recruitment.router, prefix="/recruitment", tags=["recruitment"])
app.include_router(finance.router, prefix="/finance", tags=["finance"])
app.include_router(cms.router, prefix="/cms", tags=["cms"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Register Reports Router
from app.routes import reports
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Welcome to YS HR Management System API"}
