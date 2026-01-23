@echo off
echo Starting Darwin...

start "Darwin Backend" cmd /k "cd Darwin.Back && call .venv\Scripts\activate && python -m flask run --port 5000"
start "Darwin Frontend" cmd /k "cd Darwin && npm run dev"

echo Services started in new windows.
