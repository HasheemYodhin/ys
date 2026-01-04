@echo off
echo Starting YS HR Backend...
echo.
cd /d "%~dp0"

if exist venv\Scripts\python.exe (
    echo Activating virtual environment...
    .\venv\Scripts\python.exe run_server.py
) else (
    echo Virtual environment not found! Using global python...
    python run_server.py
)

pause
