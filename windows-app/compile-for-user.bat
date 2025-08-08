@echo off
title TallySync Compiler - Easy Setup
echo ========================================
echo     TallySync Application Compiler
echo         (User-Friendly Version)
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo NOTE: For best results, run as Administrator
    echo.
)

:: Check if .NET SDK is installed
echo [1/5] Checking .NET SDK...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ .NET SDK not found!
    echo.
    echo Please download and install .NET 8.0 SDK:
    echo https://dotnet.microsoft.com/download/dotnet/8.0
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('dotnet --version 2^>nul') do set DOTNET_VERSION=%%i
echo ✅ .NET SDK found: %DOTNET_VERSION%
echo.

:: Navigate to correct directory
cd /d "%~dp0"

:: Clean previous builds
echo [2/5] Cleaning previous builds...
if exist "dist" rmdir /s /q "dist" >nul 2>&1
if exist "TallySync\bin" rmdir /s /q "TallySync\bin" >nul 2>&1
if exist "TallySync\obj" rmdir /s /q "TallySync\obj" >nul 2>&1
echo ✅ Cleanup completed
echo.

:: Build and publish
echo [3/5] Building TallySync application...
cd TallySync
dotnet build -c Release --verbosity quiet
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b 1
)
echo ✅ Build successful
echo.

echo [4/5] Creating portable executable...
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o "../dist" --verbosity quiet
if %errorlevel% neq 0 (
    echo ❌ Publish failed! Please check for errors above.
    pause
    exit /b 1
)
echo ✅ Portable executable created
echo.

:: Go back and finalize
cd ..

echo [5/5] Finalizing package...
:: Copy documentation
copy "README.md" "dist\README.txt" >nul 2>&1
copy "setup-instructions.md" "dist\Setup-Guide.txt" >nul 2>&1

:: Create a simple batch file to run the app
echo @echo off > "dist\Run-TallySync.bat"
echo title TallySync - Tally ERP Integration >> "dist\Run-TallySync.bat"
echo echo Starting TallySync... >> "dist\Run-TallySync.bat"
echo TallySync.exe >> "dist\Run-TallySync.bat"

:: Create installation script
echo @echo off > "dist\Install-TallySync.bat"
echo title TallySync Installation >> "dist\Install-TallySync.bat"
echo echo Installing TallySync to Program Files... >> "dist\Install-TallySync.bat"
echo if not exist "C:\Program Files\TallySync" mkdir "C:\Program Files\TallySync" >> "dist\Install-TallySync.bat"
echo copy "TallySync.exe" "C:\Program Files\TallySync\" >> "dist\Install-TallySync.bat"
echo copy "*.txt" "C:\Program Files\TallySync\" >> "dist\Install-TallySync.bat"
echo echo Installation completed! >> "dist\Install-TallySync.bat"
echo echo You can now run TallySync from Program Files >> "dist\Install-TallySync.bat"
echo pause >> "dist\Install-TallySync.bat"

echo ✅ Package finalized
echo.

:: Check file size
for %%A in ("dist\TallySync.exe") do set SIZE=%%~zA
set /a SIZE_MB=%SIZE%/1024/1024
echo ========================================
echo        COMPILATION SUCCESSFUL! 🎉
echo ========================================
echo.
echo 📁 Package location: %~dp0dist\
echo 📊 Executable size: ~%SIZE_MB%MB
echo.
echo 📦 Files created:
echo   • TallySync.exe (Main application)
echo   • README.txt (Documentation)
echo   • Setup-Guide.txt (Installation instructions)
echo   • Run-TallySync.bat (Quick start)
echo   • Install-TallySync.bat (System installation)
echo.
echo 🚀 Ready to use:
echo   1. Copy 'dist' folder to any Windows computer
echo   2. Double-click 'Run-TallySync.bat' or 'TallySync.exe'
echo   3. Configure Tally connection settings
echo   4. Start syncing!
echo.
echo ℹ️  Note: This is a self-contained executable
echo    No .NET installation required on target computer
echo.
pause