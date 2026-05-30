# Load .env.local variables and start dev server
# Usage: .\dev.ps1

# Read and export env vars from .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        # Skip comments and empty lines
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                # Remove quotes if present
                $value = $value -replace '^["'']|["'']$', ''
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "Loaded: $key" -ForegroundColor Green
            }
        }
    }
    Write-Host "`nStarting dev server with env vars from .env.local`n" -ForegroundColor Cyan
} else {
    Write-Host "Error: .env.local not found!" -ForegroundColor Red
    exit 1
}

# Start dev server
npm run dev
