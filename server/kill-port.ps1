# Kill process using port 4001 (PowerShell script)

Write-Host "Checking for processes using port 4001..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":4001"

if ($connections) {
    $pidList = @()
    
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            if ($pid -notin $pidList) {
                $pidList += $pid
            }
        }
    }
    
    foreach ($pid in $pidList) {
        Write-Host "Found process with PID: $pid" -ForegroundColor Cyan
        try {
            Stop-Process -Id $pid -Force
            Write-Host "✓ Process $pid terminated successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to terminate process $pid" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✓ Port 4001 is now free. You can start the server." -ForegroundColor Green
} else {
    Write-Host "✓ No process is using port 4001" -ForegroundColor Green
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
