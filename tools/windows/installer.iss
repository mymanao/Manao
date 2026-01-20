[Setup]
AppName=Manao
AppVersion=3.2.0
DefaultDirName={localappdata}\ManaoBot
DefaultGroupName=Manao
OutputDir=dist
OutputBaseFilename=ManaoBotSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
Uninstallable=yes
WizardImageFile=..\..\docs\manao.bmp
WizardSmallImageFile=..\..\docs\favicon.bmp


[Files]
Source: "INSTALLER.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall


[Icons]
Name: "{group}\Manao Twitch Bot"; Filename: "{app}\manao\tools\windows\START_MANAOBOT.bat"
Name: "{group}\Uninstall Manao Twitch Bot"; Filename: "{uninstallexe}"


[Run]
Filename: "powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NoProfile -File ""{tmp}\INSTALLER.ps1"" -InstallDir ""{app}"""; \
  StatusMsg: "Installing Manao Twitch Bot dependencies..."; \
  Flags: waituntilterminated
  
Filename: "powershell.exe"; \
  Parameters: "-NoExit -ExecutionPolicy Bypass -NoProfile -Command ""Set-Location -Path '{app}\manao'; bun run tools/setup; Write-Host ''; Write-Host 'Configuration finished. Please close this window when done.' -ForegroundColor Green"""; \
  StatusMsg: "Running interactive configuration. A new window will open..."; \
  Flags: postinstall
  
  
[UninstallDelete]
Type: filesandordirs; Name: "{app}"