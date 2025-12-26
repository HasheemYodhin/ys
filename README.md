# YS HR Management System

This project is a premium HR Management System consisting of a Python FastAPI backend and a Node.js/React frontend.

## Prerequisites

- **Python 3.10+**
- **Node.js 16+** & **npm**
- **MongoDB**

## 🚀 Quick Start Guide

### 1. Start the Database (MongoDB)
Since MongoDB must be running for the backend to work, you can start it locally with this command (assuming MongoDB 8.2 is installed):

```powershell
mkdir data\db
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "data\db"
```
*Keep this terminal open.*

### 2. Start the Backend (API)
Open a **new terminal**:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The Backend API will run at `http://localhost:8000` (Docs: `/docs`).

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

## Troubleshooting

- **"Target machine actively refused it"**: This means MongoDB is not running. Run step 1.
- **Frontend Blank Screen**: Check the console for errors. Ensure all dependencies are installed.
- **Login Issues**: By default, the system is currently configured to treat all users as Admins for testing purposes.
