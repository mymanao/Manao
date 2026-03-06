@echo off
bun run setup
if %ERRORLEVEL% neq 0 (
    echo.
    echo Process exited with code %ERRORLEVEL%. Press any key to close...
    pause >nul
)