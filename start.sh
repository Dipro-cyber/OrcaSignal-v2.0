#!/bin/bash

echo "🐋 Starting OrcaSignal Development Environment (Foundry)"

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install Foundry first:"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "foundryup"
    exit 1
fi

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Install Foundry dependencies
if [ ! -d "lib" ]; then
    echo "🔨 Installing Foundry dependencies..."
    forge install foundry-rs/forge-std --no-commit
fi

# Check if contracts are compiled
if [ ! -d "out" ]; then
    echo "🔨 Building smart contracts..."
    forge build
fi

echo "🚀 Starting services..."
echo "Backend will run on http://localhost:3001"
echo "Frontend will run on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Start both backend and frontend
npm run dev