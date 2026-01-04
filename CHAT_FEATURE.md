# Real-Time Chat Feature

## Overview
A Microsoft Teams-like real-time chat feature has been implemented in the YS HR Management System. This feature allows employees and employers to communicate in real-time through direct messages and group chats.

## Features

### ✨ Key Features
- **Real-time messaging** using WebSocket (Socket.IO)
- **Direct messages** between users
- **Group chats** support
- **Typing indicators** to show when someone is typing
- **Message history** with timestamps
- **Read receipts** tracking
- **User search** to find and start conversations
- **Conversation list** with last message preview
- **Modern UI** similar to Microsoft Teams

### 🎨 UI Components
- **Conversations Sidebar**: Shows all active conversations with search functionality
- **Chat Area**: Main messaging interface with message bubbles
- **Message Input**: Rich input area with emoji and attachment buttons
- **New Chat Modal**: Interface to start new conversations with team members

## Technical Implementation

### Backend (Python/FastAPI)
1. **Models** (`backend/app/models/chat.py`):
   - `Message`: Individual chat messages
   - `Conversation`: Chat conversations (direct or group)
   - `MessageCreate`: DTO for creating messages
   - `ConversationCreate`: DTO for creating conversations

2. **Routes** (`backend/app/routes/chat.py`):
   - `GET /chat/conversations`: Get all conversations for current user
   - `GET /chat/conversations/{id}/messages`: Get messages for a conversation
   - `POST /chat/conversations`: Create a new conversation
   - `POST /chat/messages`: Send a message
   - `GET /chat/users`: Get all users to start a chat with
   - `DELETE /chat/messages/{id}`: Delete a message

3. **WebSocket Events** (`backend/app/main.py`):
   - `connect`: Client connection
   - `disconnect`: Client disconnection
   - `join_conversation`: Join a conversation room
   - `leave_conversation`: Leave a conversation room
   - `send_message`: Broadcast message to room
   - `typing`: Broadcast typing indicator

### Frontend (React)
1. **Chat Page** (`frontend/src/pages/ChatPage.jsx`):
   - Full-featured chat interface
   - Socket.IO client integration
   - Real-time message updates
   - Typing indicators
   - Conversation management

2. **Sidebar Integration** (`frontend/src/components/Layout/Sidebar.jsx`):
   - Added Chat navigation item with MessageCircle icon
   - Available for both Employer and Employee roles

3. **Routing** (`frontend/src/App.jsx`):
   - Added `/chat` route to protected routes

## Installation

### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `python-socketio`: WebSocket support
- `aiofiles`: Async file operations

### Frontend Dependencies
```bash
cd frontend
npm install
```

New dependencies added:
- `socket.io-client`: WebSocket client

## Usage

### Starting a New Chat
1. Click the **Chat** item in the sidebar
2. Click the **+** button in the chat sidebar
3. Select a user from the list
4. Start messaging!

### Sending Messages
1. Select a conversation from the list
2. Type your message in the input field
3. Press Enter or click the Send button
4. Messages are delivered in real-time to all participants

### Features in Action
- **Real-time delivery**: Messages appear instantly for all participants
- **Typing indicators**: See when someone is typing
- **Message history**: Scroll through past messages
- **Search**: Find conversations quickly

## Database Collections

### conversations
```javascript
{
  _id: ObjectId,
  type: "direct" | "group",
  name: String (optional, for group chats),
  participants: [String], // Array of user IDs
  created_at: DateTime,
  updated_at: DateTime,
  last_message: String,
  last_message_time: DateTime
}
```

### messages
```javascript
{
  _id: ObjectId,
  conversation_id: String,
  sender_id: String,
  sender_name: String,
  content: String,
  timestamp: DateTime,
  read_by: [String], // Array of user IDs who read the message
  edited: Boolean,
  deleted: Boolean
}
```

## Future Enhancements
- File attachments
- Emoji picker
- Message reactions
- Message editing
- Voice/video calls
- Message search
- Notifications for new messages
- Online/offline status
- Message forwarding
- Group chat management (add/remove members)

## Troubleshooting

### WebSocket Connection Issues
If you experience connection issues:
1. Ensure the backend is running on `http://localhost:8000`
2. Check that Socket.IO is properly initialized
3. Verify CORS settings allow WebSocket connections

### Messages Not Appearing
1. Check browser console for errors
2. Verify you're authenticated (token in localStorage)
3. Ensure you're a participant in the conversation
4. Check MongoDB connection

## Security Considerations
- All chat endpoints require authentication
- Users can only see conversations they're part of
- Messages are validated on the server
- Soft delete for messages (preserves history)
