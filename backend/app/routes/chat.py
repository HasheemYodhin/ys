from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from ..models.chat import Message, Conversation, MessageCreate, ConversationCreate
from .auth import get_current_user
import asyncio
from ..services.ai_service import ai_service

router = APIRouter()



# Helper for AI Response
async def handle_ai_response(conversation_id, user_message, app):
    """Simulate AI thinking and response"""
    try:
        # Simulate thinking delay
        await asyncio.sleep(1)
        
        # Emit typing event
        await app.sio.emit('user_typing', {
            'user_name': 'YS AI', 
            'conversation_id': conversation_id
        }, room=conversation_id)
        
        # Simulate typing/generation delay
        await asyncio.sleep(1.5)
        
        # Generate Response
        response_text = ai_service.generate_response(user_message)
        
        # Create AI Message
        ai_msg = {
            "conversation_id": conversation_id,
            "sender_id": "YS_AI_BOT", 
            "sender_name": "YS AI",
            "content": response_text,
            "attachments": [],
            "message_type": "text",
            "metadata": {"is_ai": True},
            "timestamp": datetime.utcnow(),
            "read_by": [],
            "edited": False,
            "deleted": False
        }
        
        # Insert into DB
        result = await app.database["messages"].insert_one(ai_msg)
        ai_msg["_id"] = str(result.inserted_id)
        ai_msg["timestamp"] = ai_msg["timestamp"].isoformat()
        
        # Emit New Message
        await app.sio.emit('new_message', ai_msg, room=conversation_id)
        
        # Update conversation
        await app.database["conversations"].update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {
                "last_message": response_text, 
                "last_message_time": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
    except Exception as e:
        print(f"Error in AI handler: {e}")

# Get all conversations for current user
@router.get("/conversations")
async def get_conversations(request: Request, current_user: dict = Depends(get_current_user)):
    """Get all conversations for the current user"""
    user_id = str(current_user["_id"])
    
    conversations = await request.app.database["conversations"].find({
        "participants": user_id
    }).sort("updated_at", -1).to_list(100)
    
    # Convert ObjectId to string and get participant details
    result = []
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
        
        # Get participant details
        # Get participant details
        if conv.get("type") == "ai":
             conv["participants_data"] = [{
                 "id": "YS_AI_BOT", 
                 "name": "YS AI",
                 "email": "ai@yshr.com",
                 "role": "AI Assistant",
                 "profile_photo": None, # Frontend will handle AI icon
                 "is_online": True,
                 "current_status": "online"
             }]
             result.append(conv)
             continue

        participant_ids = [pid for pid in conv["participants"] if pid != user_id]
        participants_data = []
        
        for pid in participant_ids:
            user = await request.app.database["users"].find_one({"_id": ObjectId(pid)})
            if user:
                display_name = user.get("full_name") or user.get("name") or user.get("email", "Unknown")
                participants_data.append({
                    "id": str(user["_id"]),
                    "name": display_name,
                    "email": user.get("email", ""),
                    "role": user.get("role", "Employee"),
                    "profile_photo": user.get("profile_photo"),
                    "is_online": user.get("is_online", False),
                    "current_status": user.get("current_status", "offline"),
                    "last_seen": user.get("last_seen")
                })
        
        conv["participants_data"] = participants_data
        result.append(conv)
    
    return result


# Get messages for a conversation
@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get messages for a specific conversation"""
    user_id = str(current_user["_id"])
    
    # Verify user is part of conversation
    conversation = await request.app.database["conversations"].find_one({
        "_id": ObjectId(conversation_id),
        "participants": user_id
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get messages
    messages = await request.app.database["messages"].find({
        "conversation_id": conversation_id,
        "deleted": False
    }).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Convert ObjectId to string and reverse to show oldest first
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    
    messages.reverse()
    
    # Mark messages as read
    await request.app.database["messages"].update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id}
        },
        {"$addToSet": {"read_by": user_id}}
    )
    
    return messages


# Create a new conversation
@router.post("/conversations")
async def create_conversation(
    conversation: ConversationCreate,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a new conversation"""
    user_id = str(current_user["_id"])
    
    # Add current user to participants if not already included
    if user_id not in conversation.participants:
        conversation.participants.append(user_id)
    
    # For direct messages, check if conversation already exists
    existing = None # Initialize existing to None
    if conversation.type == "direct" and len(conversation.participants) == 2:
        existing = await request.app.database["conversations"].find_one({
        "participants": {"$all": conversation.participants, "$size": len(conversation.participants)},
        "type": conversation.type
    })
    
    # Allow AI chat creation if type matches
    if conversation.type == 'ai':
        # Check if user already has an AI chat
        existing_ai = await request.app.database["conversations"].find_one({
            "participants": user_id,
            "type": "ai"
        })
        if existing_ai:
            existing_ai["_id"] = str(existing_ai["_id"])
            return existing_ai
            
        conv_dict = {
            "type": "ai",
            "name": "YS AI",
            "participants": [user_id], # Only user is a real participant
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_message": "Hello! I am YS AI. How can I help you?",
            "last_message_time": datetime.utcnow()
        }
        result = await request.app.database["conversations"].insert_one(conv_dict)
        new_conv = await request.app.database["conversations"].find_one({"_id": result.inserted_id})
        new_conv["_id"] = str(new_conv["_id"])
        return new_conv

    
    if existing and conversation.type == 'direct':
        existing["_id"] = str(existing["_id"])
        return existing
    
    # Create new conversation
    conv_dict = conversation.dict()
    conv_dict["created_at"] = datetime.utcnow()
    conv_dict["updated_at"] = datetime.utcnow()
    
    result = await request.app.database["conversations"].insert_one(conv_dict)
    
    new_conv = await request.app.database["conversations"].find_one({"_id": result.inserted_id})
    new_conv["_id"] = str(new_conv["_id"])
    
    return new_conv


from fastapi import APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid

# ... imports ...

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files to serve uploads
# Note: In main.py, you should mount this: app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

import aiofiles

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload a file for chat attachment (Async)"""
    print(f"DEBUG: Received upload request for file: {file.filename}, content_type: {file.content_type}")
    try:
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        print(f"DEBUG: Saving to {file_path}")
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            while content := await file.read(1024 * 1024):  # Read 1MB chunks
                await out_file.write(content)
            
        print(f"DEBUG: File saved successfully. URL: http://localhost:8000/uploads/{file_name}")
            
        # Return URL
        return {
            "url": f"http://localhost:8000/uploads/{file_name}",
            "name": file.filename,
            "type": file.content_type
        }
    except Exception as e:
        print(f"DEBUG: Error during upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Send a message
@router.post("/messages")
async def send_message(
    message: MessageCreate,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Send a message in a conversation"""
    user_id = str(current_user["_id"])
    
    # Must have content OR attachments
    if not message.content and not message.attachments:
        raise HTTPException(status_code=400, detail="Message must have content or attachments")
    
    # Verify user is part of conversation
    conversation = await request.app.database["conversations"].find_one({
        "_id": ObjectId(message.conversation_id),
        "participants": user_id
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create message
    msg_dict = {
        "conversation_id": message.conversation_id,
        "sender_id": user_id,
        "sender_name": current_user.get("full_name") or current_user.get("name") or current_user.get("email", "Unknown"),
        "content": message.content or "", # Ensure string even if empty
        "attachments": message.attachments,
        "message_type": message.message_type,
        "metadata": message.metadata,
        "timestamp": datetime.utcnow(),
        "read_by": [user_id],
        "edited": False,
        "deleted": False
    }
    
    result = await request.app.database["messages"].insert_one(msg_dict)
    
    # Update conversation's last message
    last_msg_text = message.content
    if not last_msg_text:
        if message.message_type == 'image':
            last_msg_text = "Sent an image"
        elif message.message_type == 'video':
            last_msg_text = "Sent a video"
        elif message.message_type == 'audio':
            last_msg_text = "Sent a voice message"
        elif message.message_type == 'file':
            last_msg_text = "Sent a file"
        elif message.attachments:
            last_msg_text = "Sent an attachment"
        else:
            last_msg_text = "New message"
        
    await request.app.database["conversations"].update_one(
        {"_id": ObjectId(message.conversation_id)},
        {
            "$set": {
                "last_message": last_msg_text,
                "last_message_time": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    new_msg = await request.app.database["messages"].find_one({"_id": result.inserted_id})
    new_msg["_id"] = str(new_msg["_id"])
    
    # Trigger AI if applicable
    if conversation.get("type") == "ai":
        asyncio.create_task(handle_ai_response(
            message.conversation_id,
            message.content,
            request.app
        ))

    return new_msg

@router.post("/messages/{message_id}/vote")
async def vote_poll(
    message_id: str,
    option_id: int,  # The index of the option
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Vote on a poll message"""
    user_id = str(current_user["_id"])
    
    # 1. Get the message
    message = await request.app.database["messages"].find_one({"_id": ObjectId(message_id)})
    if not message or message.get("message_type") != "poll":
        raise HTTPException(status_code=400, detail="Invalid poll message")
    
    metadata = message.get("metadata", {})
    options = metadata.get("options", [])
    
    # 2. Logic: Remove previous vote if any, add new vote
    # Using a simple logic: Toggle or Switch vote. Let's assume Switch.
    
    updated_options = []
    for idx, opt in enumerate(options):
        votes = opt.get("votes", [])
        if user_id in votes:
            votes.remove(user_id) # Remove old vote
        
        if idx == option_id:
            votes.append(user_id) # Add new vote
            
        opt["votes"] = votes
        updated_options.append(opt)
    
    metadata["options"] = updated_options
    
    # 3. Update DB
    await request.app.database["messages"].update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"metadata": metadata}}
    )
    
    # 4. Return updated message
    updated_msg = await request.app.database["messages"].find_one({"_id": ObjectId(message_id)})
    updated_msg["_id"] = str(updated_msg["_id"])
    
    # 5. Emit Socket Event (So everyone sees the vote update in real-time)
    sio = request.app.state.sio
    await sio.emit('message_update', updated_msg)
    
    return updated_msg


# Get all users for starting a chat
@router.get("/users")
async def get_users(request: Request, current_user: dict = Depends(get_current_user)):
    """Get all users to start a chat with"""
    user_id = str(current_user["_id"])
    
    users = await request.app.database["users"].find({
        "_id": {"$ne": ObjectId(user_id)}
    }).to_list(100)
    
    result = []
    for user in users:
        # Determine display name: full_name -> name -> email
        display_name = user.get("full_name") or user.get("name") or user.get("email", "Unknown User")
        
        result.append({
            "id": str(user["_id"]),
            "name": display_name,
            "email": user.get("email", ""),
            "role": user.get("role", "Employee"),
            "profile_photo": user.get("profile_photo"),
            "is_online": user.get("is_online", False),
            "current_status": user.get("current_status", "offline"),
            "last_seen": user.get("last_seen")
        })
    
    return result


# Delete a message
@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Delete a message (soft delete)"""
    user_id = str(current_user["_id"])
    
    message = await request.app.database["messages"].find_one({
        "_id": ObjectId(message_id),
        "sender_id": user_id
    })
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or unauthorized")
    
    await request.app.database["messages"].update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"deleted": True, "content": "This message was deleted"}}
    )
    
    return {"message": "Message deleted successfully"}
