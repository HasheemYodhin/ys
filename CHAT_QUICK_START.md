# Quick Start: Real-Time Chat Feature

## 🎯 Overview
The chat feature provides Microsoft Teams-like real-time messaging capabilities for your HR system.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```powershell
cd backend
.\venv\Scripts\pip.exe install python-socketio aiofiles
```

### Step 2: Install Frontend Dependencies
```powershell
cd frontend
npm install socket.io-client
```

### Step 3: Start Backend with WebSocket Support
```powershell
cd backend
# Make sure MongoDB is running first!
uvicorn app.main:socket_app --reload
```

**⚠️ Important:** Use `socket_app` not `app`!

### Step 4: Start Frontend
```powershell
cd frontend
npm run dev
```

### Step 5: Test the Chat
1. Open browser to `http://localhost:5173`
2. Login with your credentials
3. Click **"Chat"** in the sidebar
4. Click the **"+"** button
5. Select a user to chat with
6. Send a message!

## 📱 Using the Chat

### Starting a Conversation
1. Click the **+** button in the chat sidebar
2. Select a user from the list
3. A new conversation will be created
4. Start typing and press Enter to send

### Sending Messages
- Type your message in the input field
- Press **Enter** or click the **Send** button
- Messages are delivered instantly via WebSocket

### Features Available
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Message history
- ✅ Search conversations
- ✅ Read receipts
- ✅ Timestamps

## 🧪 Testing Real-Time Features

### Test with Two Users
1. Open two browser windows (or use incognito)
2. Login as different users in each window
3. Start a chat between them
4. Send messages - they should appear instantly!
5. Try typing - you'll see typing indicators

### Verify WebSocket Connection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. You should see a connection to `localhost:8000/socket.io/`
5. Status should be "101 Switching Protocols"

## 🔍 Troubleshooting

### Chat Not Appearing in Sidebar
- **Check:** Is the frontend running?
- **Fix:** Restart the frontend with `npm run dev`

### Can't Send Messages
- **Check:** Is backend running with `socket_app`?
- **Fix:** Restart backend: `uvicorn app.main:socket_app --reload`

### Messages Not Appearing in Real-Time
- **Check:** WebSocket connection in DevTools Network tab
- **Fix:** Ensure no firewall blocking port 8000
- **Fix:** Check browser console for errors

### "Connection Failed" Error
- **Check:** Backend is running on port 8000
- **Check:** MongoDB is running
- **Fix:** Restart all services in order: MongoDB → Backend → Frontend

### No Users to Chat With
- **Check:** Are there other users in the database?
- **Fix:** Create more users via signup or use `debug_users.py`

## 📊 Verify Installation

Run these checks to ensure everything is working:

### 1. Check Backend Dependencies
```powershell
cd backend
.\venv\Scripts\pip.exe list | Select-String "socketio"
```
Should show: `python-socketio` and `python-engineio`

### 2. Check Frontend Dependencies
```powershell
cd frontend
npm list socket.io-client
```
Should show: `socket.io-client@4.8.1` (or similar)

### 3. Check API Endpoints
Visit: `http://localhost:8000/docs`
Look for `/chat/*` endpoints in the API documentation

### 4. Check Database Collections
After sending a message, check MongoDB:
```javascript
// In MongoDB shell or Compass
use ys_hr_db
db.conversations.find()
db.messages.find()
```

## 🎨 UI Components

### Conversations Sidebar (Left)
- List of all your conversations
- Search bar to find conversations
- **+** button to start new chats
- Last message preview
- Timestamps

### Chat Area (Right)
- Message history
- Real-time message delivery
- Typing indicators
- Message input with emoji/attachment buttons
- User avatars and names

## 💡 Tips

1. **Multiple Conversations:** You can have multiple conversations open - just click between them in the sidebar

2. **Search:** Use the search bar to quickly find conversations by user name

3. **Timestamps:** Hover over messages to see exact timestamps

4. **Keyboard Shortcuts:** Press Enter to send, Shift+Enter for new line (if implemented)

5. **Real-Time Updates:** Keep the tab open to receive messages instantly

## 🔐 Security Notes

- All chat endpoints require authentication
- Users can only see their own conversations
- Messages are stored securely in MongoDB
- WebSocket connections are authenticated
- Deleted messages are soft-deleted (preserved in DB)

## 📚 Additional Resources

- **Full Documentation:** See `CHAT_FEATURE.md`
- **Implementation Details:** See `CHAT_IMPLEMENTATION_SUMMARY.md`
- **Backend Guide:** See `backend/RUNNING_WITH_CHAT.md`
- **Architecture Diagram:** See generated image in artifacts

## ✅ Success Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] MongoDB running
- [ ] Backend running with `socket_app`
- [ ] Frontend running
- [ ] Can see Chat in sidebar
- [ ] Can start new conversation
- [ ] Can send and receive messages
- [ ] Messages appear in real-time
- [ ] Typing indicators work

## 🎉 You're Ready!

If all checks pass, you now have a fully functional real-time chat system! Start messaging with your team!

---

**Need Help?** Check the troubleshooting section or review the full documentation in `CHAT_FEATURE.md`.
