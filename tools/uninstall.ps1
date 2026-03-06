# ManaoBot Uninstaller for Windows
# Run with: powershell -ExecutionPolicy Bypass -File uninstall.ps1

Write-Host @"

::::    ::::      :::     ::::    :::     :::      ::::::::       :::     :::    :::
+:+:+: :+:+:+   :+: :+:   :+:+:   :+:   :+: :+:   :+:    :+:      :+:     :+:   :+:
+:+ +:+:+ +:+  +:+   +:+  :+:+:+  +:+  +:+   +:+  +:+    +:+      +:+     +:+  +:+ +:+
+#+  +:+  +#+ +#++:++#++: +#+ +:+ +#+ +#++:++#++: +#+    +:+      +#+     +:+ +#+  +:+
+#+       +#+ +#+     +#+ +#+  +#+#+# +#+     +#+ +#+    +#+       +#+   +#+ +#+#+#+#+#+
#+#       #+# #+#     #+# #+#   #+#+# #+#     #+# #+#    #+#        #+#+#+#        #+#
###       ### ###     ### ###    #### ###     ###  ########           ###          ###

"@ -ForegroundColor Cyan

Add-Type -AssemblyName System.Windows.Forms

function Ask-YesNo($message) {
    $result = [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Uninstaller",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
    )
    return $result -eq [System.Windows.Forms.DialogResult]::Yes
}

function Show-Error($message) {
    [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Uninstaller - Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
}

function Show-Info($message) {
    [System.Windows.Forms.MessageBox]::Show(
            $message, "ManaoBot Uninstaller",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
}

$installDir = "$env:USERPROFILE\ManaoBot"

if (-not (Test-Path $installDir)) {
    Show-Error "ManaoBot installation not found at $installDir. Nothing to uninstall."
    exit 1
}

if (-not (Ask-YesNo "This will remove ManaoBot from $installDir.`nDo you want to continue?")) {
    Show-Info "Uninstall cancelled."
    exit 0
}

# ── Backup config files ───────────────────────────────────────────────────────

if (Ask-YesNo "Do you want to save your config and data files before uninstalling?") {
    $saveTo = "$env:USERPROFILE\ManaoBot-backup"
    New-Item -ItemType Directory -Path $saveTo -Force | Out-Null
    @(".env", "bot-data.sqlite", "userConfig.json") | ForEach-Object {
        $src = Join-Path $installDir $_
        if (Test-Path $src) {
            Copy-Item $src $saveTo -Force
            Write-Host "  Saved $_ → $saveTo" -ForegroundColor Cyan
        }
    }
    Show-Info "Config files saved to $saveTo"
}

# ── Double confirm ────────────────────────────────────────────────────────────

if (-not (Ask-YesNo "Are you sure you want to permanently delete ManaoBot?`nThis cannot be undone.")) {
    Show-Info "Uninstall cancelled."
    exit 0
}

# ── Remove install directory ──────────────────────────────────────────────────

Write-Host "Removing ManaoBot..." -ForegroundColor Yellow
try {
    Remove-Item -Recurse -Force $installDir
    Write-Host "  Removed $installDir" -ForegroundColor Green
} catch {
    Show-Error "Failed to remove $installDir`n$($_.Exception.Message)"
    exit 1
}

# ── Remove shortcuts ──────────────────────────────────────────────────────────

$desktopDir = [System.Environment]::GetFolderPath("Desktop")
$startMenu  = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"

foreach ($target in @($desktopDir, $startMenu)) {
    @("ManaoBot.lnk", "ManaoBot Setup.lnk", "ManaoBot Manager.lnk") | ForEach-Object {
        $path = Join-Path $target $_
        if (Test-Path $path) {
            Remove-Item $path -Force
            Write-Host "  Removed shortcut: $_" -ForegroundColor Green
        }
    }
}

# ── Done ──────────────────────────────────────────────────────────────────────

Show-Info "ManaoBot has been successfully uninstalled."