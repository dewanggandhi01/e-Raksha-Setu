@echo off
REM Kill process using port 4001
echo Checking for processes using port 4001...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4001') do (
    echo Found process with PID: %%a
    taskkill /PID %%a /F
    echo Process terminated successfully!
)

echo.
echo Port 4001 is now free. You can start the server.
pause
