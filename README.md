# YS HR Management System

This project is a premium HR Management System consisting of a Python FastAPI backend and a Node.js/React frontend.

## 📂 Project Structure

- **`/backend`**: Python FastAPI application (API, logic, database models).
- **`/frontend`**: React application using Vite (User Interface).
- **`/admin`**: Admin panel implementation.
- **`/data`**: MongoDB data storage (created locally).
- **root scripts**: Utility scripts for database management and debugging.

## Prerequisites

- **Python 3.10+**
- **Node.js 16+** & **npm**
- **MongoDB** (Server 8.2 or compatible)

## 🚀 Quick Start Guide

### 1. Start the Database (MongoDB)
The backend requires a running MongoDB instance. Start it locally using the following command (adjust the path if your version differs):

```powershell
# Create data directory if it doesn't exist
mkdir data\db

# Start MongoDB pointing to the local data folder
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "data\db"
```
> **Note:** Keep this terminal open. If it closes, the database stops.

### 2. Start the Backend (API)
Open a **new terminal**:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The Backend API will run at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Start the Frontend (Employee Portal)
Open a **new terminal**:

```powershell
cd frontend
npm install
npm run dev
```
The Frontend will run at `http://localhost:5173`.

### 4. Admin Panel (Optional)
Open a **new terminal**:

```powershell
cd admin
npm install
npm run dev
```

## 🛠 Utility Scripts

The root directory contains several Python scripts to help managing the application:

- **`check_mongo_connection.py`**: Verifies that your local MongoDB instance is reachable.
- **`debug_users.py`**: Prints a list of all users in the database with their roles and IDs.
- **`promote_user.py`**: Promotes a user to the "Employer" role. 
  - *Usage:* Edit the file to set the target email, then run `python promote_user.py`.
- **`debug_db.py`**: General database debugging tool.

## Troubleshooting

- **"[WinError 10061] No connection could be made..."**: MongoDB is not running. Run Step 1.
- **Frontend Blank Screen**: Check the browser console (F12) for errors.
- **Login Issues**: Use `debug_users.py` to check registered users. If you need an admin/employer account, use `promote_user.py` to upgrade an existing user.
