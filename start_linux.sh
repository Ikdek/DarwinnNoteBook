#!/bin/bash
echo "Starting Darwin..."

# Backend
cd Darwin.Back
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi
python3 -m flask run --port 5000 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Frontend
cd ../Darwin
npm install
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo "Both services are running in the background."
echo "Press CTRL+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait
