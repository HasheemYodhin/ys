from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class Message(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(default=None, alias="_id")
    conversation_id: str
    sender_id: str
    sender_name: str
    content: Optional[str] = None
    attachments: List[dict] = []  # List of {url, type, name}
    message_type: str = "text"  # text, image, video, file, audio, poll, event
    metadata: Optional[dict] = None  # For poll options, event details, etc.
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read_by: List[str] = []
    edited: bool = False
    deleted: bool = False


class Conversation(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(default=None, alias="_id")
    type: str  # "direct" or "group"
    name: Optional[str] = None  # For group chats
    participants: List[str]  # List of user IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None


class MessageCreate(BaseModel):
    conversation_id: str
    content: Optional[str] = None
    attachments: List[dict] = []  # List of {url, type, name}
    message_type: str = "text"
    metadata: Optional[dict] = None


class ConversationCreate(BaseModel):
    type: str  # "direct" or "group"
    name: Optional[str] = None
    participants: List[str]  # List of user IDs

