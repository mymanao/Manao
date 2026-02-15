#Requires -Version 5.0
param(
    [string]$InstallDir = "$env:ProgramFiles\ManaoBot"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing Manao Twitch Bot to $InstallDir..."

# --- Ensure install directory ---
try {
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }
} catch {
    Write-Host "ERROR: Failed to create install directory: $_"
    exit 1
}

# --- Check Git ---
try {
    git --version | Out-Null
    Write-Host "Git found."
} catch {
    Write-Host "Installing Git via winget..."
    winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements --silent
}

# --- Reload PATH (in case Git was newly installed) ---
$env:PATH = "$env:ProgramFiles\Git\cmd;$env:PATH"

# --- Fetch latest release tag (optional) ---
try {
    $releases = Invoke-RestMethod -Uri 'https://api.github.com/repos/tinarskii/manao/releases'
    $selectedVersion = if ($releases.Count -gt 0) { $releases[0].tag_name } else { "latest" }
    Write-Host "Selected version: $selectedVersion"
} catch {
    $selectedVersion = "latest"
    Write-Host "Could not fetch release info, defaulting to latest."
}

$target = Join-Path $InstallDir "manao"

# --- Clone repo ---
try {
    if ($selectedVersion -eq "latest") {
        git clone --depth 1 https://github.com/mymanao/manao.git $target
    } else {
        git clone --branch $selectedVersion https://github.com/mymanao/manao.git $target
    }
    Write-Host "Repository cloned successfully."
} catch {
    Write-Host "ERROR: Failed to clone repo: $_"
    exit 1
}

Set-Location $target

# --- Check Bun ---
try {
    bun --version | Out-Null
    Write-Host "Bun found."
} catch {
    Write-Host "Installing Bun..."
    Invoke-WebRequest https://bun.sh/install.ps1 -OutFile install-bun.ps1 -UseBasicParsing
    powershell -ExecutionPolicy Bypass -File install-bun.ps1
    Remove-Item install-bun.ps1 -Force -ErrorAction SilentlyContinue
}

# --- Reload PATH for Bun ---
$env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"

# --- Twitch CLI ---
try {
    twitch --version | Out-Null
    Write-Host "Twitch CLI found."
} catch {
    Write-Host "Installing Twitch CLI..."
    winget install -e --id Twitch.TwitchCLI --accept-package-agreements --accept-source-agreements --silent
}

# --- Install dependencies ---
try {
    Write-Host "Installing dependencies..."
    bun install
    Write-Host "Dependencies installed."
} catch {
    Write-Host "Failed to install dependencies."
}

# --- Set ManaoPath environment variable ---
[Environment]::SetEnvironmentVariable("MANAO_PATH", $target, "Machine")
Write-Host "Environment variable MANAO_PATH set to $target"

# --- Finish ---
Write-Host "Manao Twitch Bot installed successfully."
Write-Host "Path: $InstallDir"
exit 0
