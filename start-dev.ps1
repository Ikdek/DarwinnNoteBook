$currentDir = (Get-Location).Path
$backendDir = Join-Path $currentDir "Darwin.Back"
$frontendDir = Join-Path $currentDir "Darwin"

Write-Host "Starting Darwin App Auto-Script..."

Write-Host "Launching Backend (Darwin.Back)..."
$backendScript = "
    Set-Location '$backendDir'
    Write-Host 'Checking Virtual Environment...'
    
    if (-not (Test-Path '.venv')) {
        Write-Host 'Creating .venv...'
        python -m venv .venv
    }
    
    # Path to the isolated Python executable
    `$py = Join-Path '$backendDir' '.venv\Scripts\python.exe'
    
    if (-not (Test-Path `$py)) {
        Write-Host 'Error: Could not find python in .venv!' -ForegroundColor Red
        Read-Host 'Press Enter to exit'
        exit
    }

    Write-Host 'Installing dependencies via internal pip...'
    & `$py -m pip install -r requirements.txt

    Write-Host 'Starting Flask server...'
    & `$py -m flask run
"

$backendScript = $backendScript -replace "`r`n", "; " -replace "`n", "; "

Start-Process powershell -ArgumentList "-NoExit", "-Command", "$backendScript"


Write-Host "Launching Frontend (Darwin)..."
$frontendScript = "
    Set-Location '$frontendDir'
    Write-Host 'Installing Node dependencies...'
    npm install
    
    Write-Host 'Starting Vite server...'
    npm run dev
"
$frontendScript = $frontendScript -replace "`r`n", "; " -replace "`n", "; "

Start-Process powershell -ArgumentList "-NoExit", "-Command", "$frontendScript"

Write-Host "Services launched! Check the new windows."
