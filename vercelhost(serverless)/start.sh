#!/bin/bash

# MusicMu Vercel Serverless - Start Script
# Starts both backend and frontend in development mode

echo "🎵 Starting MusicMu Vercel Serverless..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check for .env files
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from .env.example..."
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
    echo "✅ Created backend/.env - please review and update if needed"
fi

if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from .env.example..."
    cp "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env"
    echo "✅ Created frontend/.env - please review and update if needed"
fi

# Load environment variables for display
source "$SCRIPT_DIR/backend/.env"
BACKEND_PORT=${PORT:-4001}
source "$SCRIPT_DIR/frontend/.env"
FRONTEND_PORT=4173  # Vite default from config

echo ""
echo "📋 Configuration:"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo ""

# Check if tmux is available
if command -v tmux &> /dev/null; then
    echo "Using tmux for multiple terminals..."
    
    # Create a new tmux session
    SESSION="musicmu-vercel"
    
    # Kill existing session if it exists
    tmux kill-session -t $SESSION 2>/dev/null
    
    # Create new session with backend
    tmux new-session -d -s $SESSION -n backend
    tmux send-keys -t $SESSION:backend "cd $SCRIPT_DIR/backend && npx tsx dev-server.ts" C-m
    
    # Create new window for frontend
    tmux new-window -t $SESSION -n frontend
    tmux send-keys -t $SESSION:frontend "cd $SCRIPT_DIR/frontend && npm run dev" C-m
    
    echo ""
    echo "✅ Both servers started in tmux session '$SESSION'"
    echo ""
    echo "📡 Backend:  http://localhost:4001"
    echo "🌐 Frontend: http://localhost:4173"
    echo ""
    echo "To attach to the session:"
    echo "  tmux attach -t $SESSION"
    echo ""
    echo "To switch between windows:"
    echo "  Ctrl+b then 'n' (next) or 'p' (previous)"
    echo ""
    echo "To detach: Ctrl+b then 'd'"
    echo "To kill session: tmux kill-session -t $SESSION"
    echo ""
    
else
    echo "⚠️  tmux not found. Starting in separate background processes..."
    echo ""
    
    # Start backend
    cd "$SCRIPT_DIR/backend"
    npx tsx dev-server.ts > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    # Wait a moment for backend to start
    sleep 2
    
    # Start frontend
    cd "$SCRIPT_DIR/frontend"
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    
    # Save PIDs
    cd "$SCRIPT_DIR"
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
    
    echo ""
    echo "✅ Both servers started"
    echo ""
    echo "📡 Backend:  http://localhost:4001 (PID: $BACKEND_PID)"
    echo "🌐 Frontend: http://localhost:4173 (PID: $FRONTEND_PID)"
    echo ""
    echo "Logs:"
    echo "  Backend:  $SCRIPT_DIR/backend/backend.log"
    echo "  Frontend: $SCRIPT_DIR/frontend/frontend.log"
    echo ""
    echo "To stop servers:"
    echo "  ./stop.sh"
    echo "  or: kill $BACKEND_PID $FRONTEND_PID"
    echo ""
fi
