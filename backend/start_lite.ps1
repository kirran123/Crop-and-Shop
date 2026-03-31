Write-Host "Monitoring the ultra-fast pipeline..."
while ($true) {
    if ((Get-Process pip -ErrorAction SilentlyContinue) -or (Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*pip install fastapi*" })) {
        Start-Sleep -Seconds 5
    } else {
        break
    }
}
Write-Host "Minimal requirements installed! Booting server..."
& ".\venv\Scripts\python.exe" "main.py"
