@echo off
echo 🐋 Starting OrcaSignal Development Environment (Foundry)

REM Check if Foundry is installed
where forge >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Foundry not found. Please install Foundry first:
    echo curl -L https://foundry.paradigm.xyz ^| bash
    echo foundryup
    exit /b 1
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm run install:all
)

REM Install Foundry dependencies
if not exist "lib" (
    echo 🔨 Installing Foundry dependencies...
    call forge install foundry-rs/forge-std --no-commit
)

REM Check if contracts are compiled
if not exist "out" (
    echo 🔨 Building smart contracts...
    call forge build
)

echo 🚀 Starting services...
echo Backend will run on http://localhost:3001
echo Frontend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop all services

REM Start both backend and frontend
call npm run dev