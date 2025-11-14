#!/bin/bash

# MusicMu Vercel Serverless - Stop Script
# Stops both backend and frontend servers

echo "🛑 Stopping MusicMu Vercel Serverless..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if running in tmux
SESSION="musicmu-vercel"
if tmux has-session -t $SESSION 2>/dev/null; then
    echo "Killing tmux session '$SESSION'..."
    tmux kill-session -t $SESSION
    echo "✅ Tmux session killed"
else
    # Kill by PID files
    if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo "Killing backend (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
        fi
        rm "$SCRIPT_DIR/.backend.pid"
    fi
    
    if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "Killing frontend (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
        fi
        rm "$SCRIPT_DIR/.frontend.pid"
    fi
    
    echo "✅ Servers stopped"
fi

# Also kill any node processes on those ports
echo "Checking for processes on ports 4001 and 4173..."
lsof -ti:4001 | xargs kill -9 2>/dev/null && echo "  Killed process on port 4001"
lsof -ti:4173 | xargs kill -9 2>/dev/null && echo "  Killed process on port 4173"

echo "✅ All done"
