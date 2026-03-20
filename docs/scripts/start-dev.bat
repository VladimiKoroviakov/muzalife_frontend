@echo off
REM =============================================================================
REM MuzaLife Frontend — Development Startup Script (Windows)
REM
REM Usage: Double-click or run: docs\scripts\start-dev.bat
REM =============================================================================

SETLOCAL

SET "SCRIPT_DIR=%~dp0"
SET "PROJECT_ROOT=%SCRIPT_DIR%..\..\"
CD /D "%PROJECT_ROOT%"

ECHO.
ECHO =============================================
ECHO   MuzaLife Frontend - Development Startup
ECHO =============================================
ECHO.

REM Check Node.js
WHERE node >NUL 2>&1
IF ERRORLEVEL 1 (
  ECHO [ERROR] Node.js not installed. Download from https://nodejs.org
  PAUSE & EXIT /B 1
)
FOR /F "tokens=*" %%i IN ('node -v') DO SET NODE_VER=%%i
ECHO [OK]    Node.js %NODE_VER%

REM Check .env
IF NOT EXIST ".env" (
  ECHO [ERROR] .env file not found. See README.md for required variables.
  PAUSE & EXIT /B 1
)
ECHO [OK]    .env found

REM Install dependencies if needed
IF NOT EXIST "node_modules" (
  ECHO [INFO]  Installing dependencies...
  CALL npm install --legacy-peer-deps
  IF ERRORLEVEL 1 ( ECHO [ERROR] npm install failed. & PAUSE & EXIT /B 1 )
)
ECHO [OK]    Dependencies ready

ECHO.
ECHO [INFO]  Starting Vite dev server at https://localhost:3000
ECHO.

CALL npm run dev

PAUSE
