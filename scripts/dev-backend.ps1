# Start backend dev server dgn ANTHROPIC_API_KEY di-set ke environment proses.
# Windows PowerShell equivalent of dev-backend.sh.
#
# Kenapa perlu: claude-agent-sdk men-spawn `claude` CLI sebagai subprocess.
# CLI butuh auth. Kalau OAuth Claude.ai sudah di-logout, CLI HARUS dapat
# ANTHROPIC_API_KEY dari environment proses uvicorn. pydantic memuat .env untuk
# config app, TAPI tidak meng-export ANTHROPIC_API_KEY ke environment untuk
# subprocess - jadi kita set manual di sini.
#
# Pakai (PowerShell, dari folder audit-system-v7):
#   .\scripts\dev-backend.ps1     (Ctrl+C untuk stop)

$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $ProjectRoot 'backend')

# `.env` di backend/ — di Windows symlink butuh admin, jadi cari ke backend/.env
# dulu, kalau tidak ada fallback ke project-root .env.
$EnvFile = $null
if (Test-Path '.env') {
    $EnvFile = (Resolve-Path '.env').Path
} elseif (Test-Path (Join-Path $ProjectRoot '.env')) {
    $EnvFile = (Resolve-Path (Join-Path $ProjectRoot '.env')).Path
    Write-Host "[..] backend\.env tidak ada, fallback ke project-root .env: $EnvFile"
} else {
    Write-Error "Tidak menemukan .env (cek backend\.env atau project-root .env). Lihat README gotcha #1."
    exit 1
}

# Ambil ANTHROPIC_API_KEY dari .env (toleran CRLF & whitespace).
$Key = $null
$lines = Get-Content $EnvFile -ErrorAction SilentlyContinue
foreach ($line in $lines) {
    if ($line -match '^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$') {
        $Key = $Matches[1].Trim()
        # Strip optional surrounding quotes
        if ($Key.StartsWith('"') -and $Key.EndsWith('"')) { $Key = $Key.Substring(1, $Key.Length - 2) }
        elseif ($Key.StartsWith("'") -and $Key.EndsWith("'")) { $Key = $Key.Substring(1, $Key.Length - 2) }
        break
    }
}
if ([string]::IsNullOrWhiteSpace($Key)) {
    Write-Warning "ANTHROPIC_API_KEY tidak ditemukan di $EnvFile."
    Write-Host  "          Agen akan gagal auth kecuali Anda 'claude auth login' (OAuth)."
} else {
    $env:ANTHROPIC_API_KEY = $Key
    $prefix = if ($Key.Length -ge 14) { $Key.Substring(0, 14) } else { $Key }
    Write-Host "[OK] ANTHROPIC_API_KEY ter-set ($prefix...). claude CLI akan pakai API key." -ForegroundColor Green
}

# Activate venv (Windows venv → Scripts\Activate.ps1)
if (Test-Path '.venv\Scripts\Activate.ps1') {
    & '.venv\Scripts\Activate.ps1'
} elseif (Test-Path '.venv\bin\Activate.ps1') {
    & '.venv\bin\Activate.ps1'
} else {
    Write-Warning ".venv tidak ditemukan. Jalankan scripts\setup-dev.ps1 dulu, atau buat venv manual."
}

uvicorn app.main:app --reload --port 8000
