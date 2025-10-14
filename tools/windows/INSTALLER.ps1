#Requires -Version 5.0

$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host "         Installing Manao Twitch Bot..."
Write-Host "============================================"
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>$null
    Write-Host "Git is already installed."
} catch {
    Write-Host "Git not found. Installing Git..."
    winget install -e --id Git.Git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Git. Please install Git manually and try again."
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Reload PATH after Git installation
$env:PATH = "$env:ProgramFiles\Git\cmd;$env:PATH"

# Fetch available releases from GitHub
Write-Host "Fetching available releases..."
Write-Host ""

try {
    $releases = Invoke-RestMethod -Uri 'https://api.github.com/repos/wrong-lang/manao/releases' -ErrorAction Stop
    $versions = $releases | ForEach-Object { $_.tag_name }
} catch {
    Write-Host "ERROR: Failed to fetch releases"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Available versions:"
Write-Host ""

$versionList = @()
for ($i = 0; $i -lt $versions.Count; $i++) {
    $count = $i + 1
    Write-Host "$count. $($versions[$i])"
    $versionList += $versions[$i]
}

Write-Host ""
Write-Host "$($versionList.Count) versions found."
Write-Host ""

$versionChoice = Read-Host "Select a version (1-$($versionList.Count)) or press Enter for latest"

if ([string]::IsNullOrWhiteSpace($versionChoice)) {
    $selectedVersion = "latest"
    Write-Host "Using latest version."
} else {
    if ($versionChoice -as [int] -ge 1 -and $versionChoice -as [int] -le $versionList.Count) {
        $selectedVersion = $versionList[$versionChoice - 1]
        Write-Host "Selected version: $selectedVersion"
    } else {
        Write-Host "Invalid selection. Using latest version."
        $selectedVersion = "latest"
    }
}

Write-Host ""

# Folder selection using Windows Forms
Write-Host "Select installation folder..."
Write-Host ""

Add-Type -AssemblyName System.Windows.Forms
$folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
$folderBrowser.Description = "Select installation folder for Manao Twitch Bot"
$folderBrowser.RootFolder = [System.Environment+SpecialFolder]::Desktop
$folderBrowser.ShowNewFolderButton = $true

$folderResult = $folderBrowser.ShowDialog()
$selectedPath = $folderBrowser.SelectedPath

if ($folderResult -ne [System.Windows.Forms.DialogResult]::OK -or [string]::IsNullOrWhiteSpace($selectedPath)) {
    Write-Host "Installation cancelled by user."
    Read-Host "Press Enter to exit"
    exit 0
}

# Check if selected folder ends with "manaobot" (case-insensitive)
$folderName = Split-Path -Leaf $selectedPath
if ($folderName -like "*manaobot*") {
    Write-Host "Selected folder ends with 'manaobot' - using it directly."
    $installPath = $selectedPath
} else {
    $installPath = Join-Path $selectedPath "ManaoBot"
}

Write-Host "Selected installation path: $installPath"
Write-Host ""

# Check if the folder already exists
if (Test-Path $installPath) {
    Write-Host "Folder $installPath already exists."
    $overwrite = Read-Host "Do you want to overwrite? (Y/n)"
    if ($overwrite -eq "n" -or $overwrite -eq "N") {
        Write-Host "Installation cancelled."
        Read-Host "Press Enter to exit"
        exit 0
    }
    Write-Host "Removing existing installation..."
    Remove-Item -Path $installPath -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $installPath) {
        Write-Host "Failed to remove existing installation. Please remove manually."
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Create installation directory
try {
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
} catch {
    Write-Host "Failed to create installation directory."
    Read-Host "Press Enter to exit"
    exit 1
}

# Clone or download the repository
Write-Host "Downloading Manao Twitch Bot..."

try {
    if ($selectedVersion -eq "latest") {
        Write-Host "Cloning latest version..."
        git clone https://github.com/wrong-lang/manao.git $installPath
    } else {
        Write-Host "Downloading version $selectedVersion..."
        git clone --branch $selectedVersion https://github.com/wrong-lang/manao.git $installPath
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to clone repository with version $selectedVersion."
            Write-Host "Trying to clone and checkout..."
            git clone https://github.com/wrong-lang/manao.git $installPath
            if ($LASTEXITCODE -eq 0) {
                Set-Location $installPath
                git checkout $selectedVersion
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Failed to checkout version $selectedVersion."
                    Write-Host "Continuing with default branch..."
                }
            }
        }
    }
} catch {
    Write-Host "Failed to clone repository."
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $installPath
Write-Host ""

# Check if Bun is installed
try {
    $bunVersion = bun --version 2>$null
    Write-Host "Bun is already installed."
} catch {
    Write-Host "Bun not found. Installing Bun..."
    try {
        Invoke-WebRequest https://bun.sh/install.ps1 -OutFile install.ps1
        powershell -ExecutionPolicy Bypass -File install.ps1
        Remove-Item install.ps1 -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Failed to install Bun. Please install manually from https://bun.sh"
    }
}

# Reload PATH (new bun installation)
$env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"

# Check if Twitch CLI is installed
try {
    $twitchVersion = twitch --version 2>$null
    Write-Host "Twitch CLI is already installed."
} catch {
    Write-Host "Twitch CLI not found. Installing Twitch CLI..."
    winget install -e --id Twitch.TwitchCLI
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Twitch CLI. You may need to install it manually."
        Write-Host "Continuing with installation..."
    }
}

# Install project dependencies
Write-Host "Installing project dependencies..."
bun install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies. Please check your internet connection and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if user wants to run setup script
$runSetup = Read-Host "Do you want to run the setup script? (Y/n)"
if ($runSetup -eq "n" -or $runSetup -eq "N") {
    Write-Host "Skipping setup script."
} else {
    Write-Host "Running setup script..."
    bun setup
}

Write-Host ""
Write-Host "============================================"
Write-Host "Manao Twitch Bot installed successfully!"
Write-Host "Installation location: $installPath"
Write-Host "Version: $selectedVersion"
Write-Host ""
Write-Host "You can now run the bot using:"
Write-Host ""
Write-Host "bun run start"
Write-Host ""
Write-Host "Or double-click the following file:"
Write-Host "$installPath\tools\windows\START_MANAOBOT.bat"
Write-Host "============================================"
Write-Host ""

# Ask if user wants to open installation folder
$openFolder = Read-Host "Do you want to open the installation folder? (Y/n)"
if ($openFolder -ne "n" -and $openFolder -ne "N") {
    explorer $installPath
}

Read-Host "Press Enter to exit"