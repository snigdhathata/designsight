@echo off
echo ========================================
echo    DesignSight - MERN Prototype
echo ========================================
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is running ✓
echo.

echo Checking environment variables...
if not exist .env (
    echo Creating .env file from template...
    copy server\env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and add your OpenAI API key
    echo Then run this script again
    pause
    exit /b 1
)

echo Environment file found ✓
echo.

echo Starting DesignSight application...
echo This may take a few minutes on first run...
echo.

docker-compose up --build

echo.
echo Application stopped
pause


