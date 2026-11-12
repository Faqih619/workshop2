@echo off
setlocal
title SkillBridge AI Setup

echo ========================================
echo       SkillBridge AI - Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git...
where git >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or is not in PATH.
    echo Install Git from https://git-scm.com/downloads
    goto :failed
)
echo Git is installed.
echo.

echo [2/4] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or is not in PATH.
    echo Install the LTS version from https://nodejs.org/
    goto :failed
)
node --version
echo.

echo [3/4] Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm was not found. Reinstall Node.js LTS.
    goto :failed
)
npm --version
echo.

echo [4/4] Setting up environment and dependencies...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        if errorlevel 1 (
            echo ERROR: Could not create .env.local.
            goto :failed
        )
        echo Created .env.local from .env.example.
    ) else (
        echo WARNING: .env.example was not found.
        echo Create .env.local manually using the README instructions.
    )
) else (
    echo Existing .env.local found. Keeping your current configuration.
)

echo.
echo Installing project dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Check the error above and try again.
    goto :failed
)

echo.
echo ========================================
echo Setup completed successfully.
echo ========================================
echo Start the development server with:
echo     npm run dev
echo.
pause
exit /b 0

:failed
echo.
echo Setup could not be completed. Fix the issue shown above and run setup.bat again.
echo.
pause
exit /b 1
