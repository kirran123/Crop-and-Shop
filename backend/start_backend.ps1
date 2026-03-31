Write-Host "Waiting for heavy backend dependencies to finish downloading..."
while ($true) {
    $check = .\venv\Scripts\python.exe -c "import zstandard" 2>&1
    if ($LASTEXITCODE -eq 0) { 
        break 
    }
    Start-Sleep -Seconds 15
}
Write-Host "Dependencies completely installed! Starting API..."
& ".\venv\Scripts\python.exe" "main.py"
