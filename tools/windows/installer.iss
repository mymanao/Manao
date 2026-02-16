[Setup]
AppName=Manao
AppVersion=4.0.0
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
Name: "{group}\Manao Bot"; Filename: "{app}\manao\tools\windows\START_MANAO.bat"; IconFilename: "{app}\manao\docs\favicon.ico"
Name: "{group}\Uninstall Manao Bot"; Filename: "{uninstallexe}"; IconFilename: "{app}\manao\docs\favicon.ico"


[Run]
Filename: "powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NoProfile -File ""{tmp}\INSTALLER.ps1"" -InstallDir ""{app}"""; \
  StatusMsg: "Installing Manao Bot dependencies..."; \
  Flags: waituntilterminated
  
Filename: "powershell.exe"; \
  Parameters: "-NoExit -ExecutionPolicy Bypass -NoProfile -Command ""Set-Location -Path '{app}\manao'; bun run tools/setup; Write-Host ''; Write-Host 'Configuration finished. Please close this window when done.' -ForegroundColor Green"""; \
  StatusMsg: "Running interactive configuration. A new window will open..."; \
  Flags: postinstall
  
  
[UninstallDelete]
Type: filesandordirs; Name: "{app}"