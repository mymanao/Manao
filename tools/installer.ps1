# ManaoBot Installer for Windows
# Run with: powershell -ExecutionPolicy Bypass -File install.ps1

Write-Host @"

::::    ::::      :::     ::::    :::     :::      ::::::::       :::     :::    :::
+:+:+: :+:+:+   :+: :+:   :+:+:   :+:   :+: :+:   :+:    :+:      :+:     :+:   :+:
+:+ +:+:+ +:+  +:+   +:+  :+:+:+  +:+  +:+   +:+  +:+    +:+      +:+     +:+  +:+ +:+
+#+  +:+  +#+ +#++:++#++: +#+ +:+ +#+ +#++:++#++: +#+    +:+      +#+     +:+ +#+  +:+
+#+       +#+ +#+     +#+ +#+  +#+#+# +#+     +#+ +#+    +#+       +#+   +#+ +#+#+#+#+#+
#+#       #+# #+#     #+# #+#   #+#+# #+#     #+# #+#    #+#        #+#+#+#        #+#
###       ### ###     ### ###    #### ###     ###  ########           ###          ###

"@ -ForegroundColor Cyan

# ── Helpers ───────────────────────────────────────────────────────────────────

function Ask-YesNo($message) {
    $result = [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Installer",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
    )
    return $result -eq [System.Windows.Forms.DialogResult]::Yes
}

function Show-Error($message) {
    [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Installer - Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
}

function Show-Info($message) {
    [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Installer",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
}

function Has-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Install-Winget($packageId, $name) {
    Write-Host "Installing $name via winget..." -ForegroundColor Yellow
    winget install -e --id $packageId `
        --accept-package-agreements `
        --accept-source-agreements `
        --silent
    if ($LASTEXITCODE -ne 0) {
        Show-Error "Failed to install $name. Please install it manually and run this installer again."
        exit 1
    }
    # Refresh PATH so newly installed commands are available
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# Load Windows Forms for dialogs
Add-Type -AssemblyName System.Windows.Forms

# ── Mode selection ────────────────────────────────────────────────────────────

$modeForm = New-Object System.Windows.Forms.Form
$modeForm.Text = "ManaoBot Manager"
$modeForm.Size = New-Object System.Drawing.Size(300, 220)
$modeForm.StartPosition = "CenterScreen"
$modeForm.FormBorderStyle = "FixedDialog"
$modeForm.MaximizeBox = $false

$installBtn   = New-Object System.Windows.Forms.Button
$installBtn.Text = "Install / Update"
$installBtn.Size = New-Object System.Drawing.Size(260, 40)
$installBtn.Location = New-Object System.Drawing.Point(10, 10)
$installBtn.Tag = "install"

$setupBtn = New-Object System.Windows.Forms.Button
$setupBtn.Text = "Run Setup"
$setupBtn.Size = New-Object System.Drawing.Size(260, 40)
$setupBtn.Location = New-Object System.Drawing.Point(10, 60)
$setupBtn.Tag = "setup"

$uninstallBtn = New-Object System.Windows.Forms.Button
$uninstallBtn.Text = "Uninstall"
$uninstallBtn.Size = New-Object System.Drawing.Size(260, 40)
$uninstallBtn.Location = New-Object System.Drawing.Point(10, 110)
$uninstallBtn.Tag = "uninstall"
$uninstallBtn.ForeColor = [System.Drawing.Color]::Red

$selectedMode = $null
foreach ($btn in @($installBtn, $setupBtn, $uninstallBtn)) {
    $btn.Add_Click({
        $script:selectedMode = $this.Tag
        $modeForm.Close()
    })
}

$modeForm.Controls.AddRange(@($installBtn, $setupBtn, $uninstallBtn))
$modeForm.ShowDialog() | Out-Null

if (-not $selectedMode) { exit 0 }

# ── Uninstall flow ────────────────────────────────────────────────────────────

if ($selectedMode -eq "uninstall") {
    $installDir = "$env:USERPROFILE\ManaoBot"

    if (-not (Test-Path $installDir)) {
        Show-Error "ManaoBot installation not found at $installDir. Nothing to uninstall."
        exit 1
    }
    if (-not (Ask-YesNo "This will remove ManaoBot from $installDir.`nDo you want to continue?")) {
        Show-Info "Uninstall cancelled."
        exit 0
    }

    if (Ask-YesNo "Do you want to save your config and data files before uninstalling?") {
        $saveTo = "$env:USERPROFILE\ManaoBot-backup"
        New-Item -ItemType Directory -Path $saveTo -Force | Out-Null
        @(".env", "bot-data.sqlite", "userConfig.json") | ForEach-Object {
            $src = Join-Path $installDir $_
            if (Test-Path $src) { Copy-Item $src $saveTo -Force; Write-Host "  Saved $_" -ForegroundColor Cyan }
        }
        Show-Info "Config files saved to $saveTo"
    }

    if (-not (Ask-YesNo "Are you sure you want to permanently delete ManaoBot?`nThis cannot be undone.")) {
        Show-Info "Uninstall cancelled."
        exit 0
    }

    try { Remove-Item -Recurse -Force $installDir; Write-Host "  Removed $installDir" -ForegroundColor Green }
    catch { Show-Error "Failed to remove $installDir`n$($_.Exception.Message)"; exit 1 }

    $desktopDir = [System.Environment]::GetFolderPath("Desktop")
    $startMenu  = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
    foreach ($target in @($desktopDir, $startMenu)) {
        @("ManaoBot.lnk", "ManaoBot Setup.lnk", "ManaoBot Manager.lnk") | ForEach-Object {
            $path = Join-Path $target $_
            if (Test-Path $path) { Remove-Item $path -Force; Write-Host "  Removed shortcut: $_" -ForegroundColor Green }
        }
    }

    Show-Info "ManaoBot has been successfully uninstalled."
    exit 0
}

# ── Setup flow ────────────────────────────────────────────────────────────────

if ($selectedMode -eq "setup") {
    $installDir = "$env:USERPROFILE\ManaoBot"
    if (-not (Test-Path $installDir)) {
        Show-Error "ManaoBot installation not found at $installDir. Please install first."
        exit 1
    }
    Start-Process "cmd.exe" -ArgumentList "/k `"$env:USERPROFILE\.bun\bin\bun.exe`" run setup" -WorkingDirectory $installDir
    exit 0
}

# ── Dependency: git ───────────────────────────────────────────────────────────

if (-not (Has-Command "git")) {
    if (Ask-YesNo "Git is not installed. Do you want to install it now?") {
        Install-Winget "Git.Git" "Git"
    } else {
        Show-Error "Git is required to install ManaoBot. Exiting."
        exit 1
    }
}

# ── Dependency: bun ───────────────────────────────────────────────────────────

if (-not (Has-Command "bun")) {
    if (Ask-YesNo "Bun is not installed. Do you want to install it now?") {
        Write-Host "Installing Bun..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -Command "irm https://bun.sh/install.ps1 | iex"
        # Refresh PATH
        $env:PATH = "$env:USERPROFILE\.bun\bin;" + $env:PATH
        if (-not (Has-Command "bun")) {
            Show-Error "Bun installation failed. Please install it manually from https://bun.sh and run this installer again."
            exit 1
        }
    } else {
        Show-Error "Bun is required to run ManaoBot. Exiting."
        exit 1
    }
}

# ── Dependency: twitch-cli ────────────────────────────────────────────────────

if (-not (Has-Command "twitch")) {
    if (Ask-YesNo "twitch-cli is not installed. Do you want to install it now?") {
        Install-Winget "Twitch.TwitchCLI" "Twitch CLI"
    } else {
        Show-Error "twitch-cli is required to run ManaoBot. Exiting."
        exit 1
    }
}

# ── Version selection ─────────────────────────────────────────────────────────

Write-Host "Fetching available versions from GitHub..." -ForegroundColor Cyan
$tags = Invoke-RestMethod -Uri "https://api.github.com/repos/mymanao/manao/tags"
$versions = $tags.name | Where-Object { $_ -match '^4\.\d+\.\d+$' } | Sort-Object {
    $parts = $_ -split '\.'
    [int]$parts[0] * 1000000 + [int]$parts[1] * 1000 + [int]$parts[2]
} -Descending

if (-not $versions) {
    Show-Error "Failed to fetch versions from GitHub. Check your internet connection and try again."
    exit 1
}

# Build a selection dialog
$form = New-Object System.Windows.Forms.Form
$form.Text = "Select ManaoBot Version"
$form.Size = New-Object System.Drawing.Size(300, 430)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

$listBox = New-Object System.Windows.Forms.ListBox
$listBox.Size = New-Object System.Drawing.Size(260, 320)
$listBox.Location = New-Object System.Drawing.Point(10, 10)
$versions | ForEach-Object { $listBox.Items.Add($_) | Out-Null }
$listBox.SelectedIndex = 0

$okBtn = New-Object System.Windows.Forms.Button
$okBtn.Text = "Install"
$okBtn.Size = New-Object System.Drawing.Size(260, 35)
$okBtn.Location = New-Object System.Drawing.Point(10, 340)
$okBtn.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.AcceptButton = $okBtn

$form.Controls.AddRange(@($listBox, $okBtn))
$result = $form.ShowDialog()

if ($result -ne [System.Windows.Forms.DialogResult]::OK -or -not $listBox.SelectedItem) {
    Show-Error "No version selected. Exiting."
    exit 1
}
$selectedVersion = $listBox.SelectedItem

# ── Backup ────────────────────────────────────────────────────────────────────

$installDir = "$env:USERPROFILE\ManaoBot"
$backupDir  = Join-Path $env:TEMP "manao-backup-$(Get-Date -Format 'yyyyMMddHHmmss')"

if (Test-Path $installDir) {
    if (-not (Ask-YesNo "$installDir already exists. Do you want to overwrite it?")) {
        Show-Info "Installation cancelled."
        exit 0
    }

    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    @(".env", "bot-data.sqlite", "userConfig.json") | ForEach-Object {
        $src = Join-Path $installDir $_
        if (Test-Path $src) {
            Copy-Item $src $backupDir
            Write-Host "  Backed up $_" -ForegroundColor Cyan
        }
    }

    Remove-Item -Recurse -Force $installDir
}

# ── Clone ─────────────────────────────────────────────────────────────────────

Write-Host "Cloning ManaoBot $selectedVersion..." -ForegroundColor Cyan
git clone --branch $selectedVersion --depth 1 https://github.com/mymanao/manao.git $installDir
if ($LASTEXITCODE -ne 0) {
    Show-Error "Failed to clone ManaoBot $selectedVersion. Check your internet connection and try again."
    if (Test-Path $backupDir) { Remove-Item -Recurse -Force $backupDir }
    exit 1
}

# ── Install dependencies ──────────────────────────────────────────────────────

Set-Location $installDir
Write-Host "Installing dependencies..." -ForegroundColor Cyan
bun install
if ($LASTEXITCODE -ne 0) {
    Show-Error "Failed to install dependencies. Check your internet connection and try again."
    if (Test-Path $backupDir) { Remove-Item -Recurse -Force $backupDir }
    exit 1
}

# ── Restore backup ────────────────────────────────────────────────────────────

if (Test-Path $backupDir) {
    @(".env", "bot-data.sqlite", "userConfig.json") | ForEach-Object {
        $src = Join-Path $backupDir $_
        if (Test-Path $src) {
            Move-Item $src $installDir -Force
            Write-Host "  Restored $_" -ForegroundColor Cyan
        }
    }
    Remove-Item -Recurse -Force $backupDir
}

# ── Desktop shortcuts ─────────────────────────────────────────────────────────

$ws         = New-Object -ComObject WScript.Shell
$desktopDir = [System.Environment]::GetFolderPath("Desktop")
$startMenu  = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"

foreach ($target in @($desktopDir, $startMenu)) {
    # ManaoBot (start bot)
    $lnk = $ws.CreateShortcut("$target\ManaoBot.lnk")
    $lnk.TargetPath       = "cmd.exe"
    $lnk.Arguments        = "/k `"$env:USERPROFILE\.bun\bin\bun.exe`" run start"
    $lnk.WorkingDirectory = $installDir
    $lnk.IconLocation     = "$installDir\docs\manao_mini.ico"
    $lnk.Save()

    # ManaoBot Setup
    $lnkSetup = $ws.CreateShortcut("$target\ManaoBot Setup.lnk")
    $lnkSetup.TargetPath       = "cmd.exe"
    $lnkSetup.Arguments        = "/k `"$env:USERPROFILE\.bun\bin\bun.exe`" run setup"
    $lnkSetup.WorkingDirectory = $installDir
    $lnkSetup.IconLocation     = "$installDir\docs\manao_mini.ico"
    $lnkSetup.Save()
}

# ── Done ──────────────────────────────────────────────────────────────────────

Show-Info "ManaoBot $selectedVersion has been installed successfully!`nShortcuts have been created on your desktop and Start Menu."

if (Ask-YesNo "Do you want to run the setup now?") {
    Start-Process "cmd.exe" -ArgumentList "/k `"$env:USERPROFILE\.bun\bin\bun.exe`" run setup" -WorkingDirectory $installDir
} else {
    Show-Info "You can run the setup later by double-clicking the ManaoBot Setup shortcut on your desktop."
}