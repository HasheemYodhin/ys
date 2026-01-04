# Running the Backend with Chat Support

To run the backend with WebSocket/Socket.IO support for real-time chat, you need to run the `socket_app` instead of the regular `app`.

## Option 1: Update the uvicorn command (Recommended)

Instead of:
```bash
uvicorn app.main:app --reload
```

Run:
```bash
uvicorn app.main:socket_app --reload
```

## Option 2: Create a run script

Create a file `run.py` in the backend directory:

```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:socket_app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

Then run:
```bash
python run.py
```

## Verification

Once the server is running, you should see:
- "Successfully connected to MongoDB at mongodb://127.0.0.1:27017"
- Socket.IO logs when clients connect/disconnect

The server will be available at:
- REST API: http://localhost:8000
- WebSocket: ws://localhost:8000/socket.io/
- API Docs: http://localhost:8000/docs
