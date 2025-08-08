@echo off
echo =====================================
echo    TallySync Build Script
echo =====================================
echo.

:: Check if .NET SDK is installed
echo Checking .NET SDK installation...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found!
    echo Please install .NET 8.0 SDK from:
    echo https://dotnet.microsoft.com/download/dotnet/8.0
    pause
    exit /b 1
)

echo .NET SDK found: 
dotnet --version
echo.

:: Navigate to project directory
cd /d "%~dp0"

:: Clean previous builds
echo Cleaning previous builds...
if exist "TallySync\bin" rmdir /s /q "TallySync\bin"
if exist "TallySync\obj" rmdir /s /q "TallySync\obj"

:: Build the solution
echo Building TallySync solution...
dotnet build TallySync.sln -c Release
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful!
echo.

:: Create different deployment packages
echo Creating deployment packages...

:: 1. Self-contained executable (no .NET runtime needed)
echo Creating self-contained package...
cd TallySync
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
if %errorlevel% neq 0 (
    echo ERROR: Self-contained publish failed!
    cd..
    pause
    exit /b 1
)

:: 2. Framework-dependent (requires .NET runtime)
echo Creating framework-dependent package...
dotnet publish -c Release -r win-x64 --self-contained false
if %errorlevel% neq 0 (
    echo ERROR: Framework-dependent publish failed!
    cd..
    pause
    exit /b 1
)

cd..

:: Create distribution folders
echo Creating distribution folders...
if not exist "dist" mkdir "dist"
if not exist "dist\self-contained" mkdir "dist\self-contained"
if not exist "dist\framework-dependent" mkdir "dist\framework-dependent"

:: Copy self-contained version
echo Copying self-contained version...
xcopy "TallySync\bin\Release\net8.0-windows\win-x64\publish\*" "dist\self-contained\" /E /Y

:: Copy framework-dependent version  
echo Copying framework-dependent version...
xcopy "TallySync\bin\Release\net8.0-windows\win-x64\publish\*" "dist\framework-dependent\" /E /Y

:: Create shortcuts and documentation
echo Creating documentation...
copy "README.md" "dist\self-contained\README.txt"
copy "setup-instructions.md" "dist\self-contained\Setup-Instructions.txt"
copy "README.md" "dist\framework-dependent\README.txt"
copy "setup-instructions.md" "dist\framework-dependent\Setup-Instructions.txt"

echo.
echo =====================================
echo    Build Complete!
echo =====================================
echo.
echo Packages created in 'dist' folder:
echo.
echo 1. Self-contained (dist\self-contained\):
echo    - TallySync.exe (runs without .NET installation)
echo    - Larger file size (~100MB)
echo    - Best for single computer deployment
echo.
echo 2. Framework-dependent (dist\framework-dependent\):
echo    - TallySync.exe (requires .NET 8.0 runtime)
echo    - Smaller file size (~1MB)
echo    - Best for multiple computers with .NET installed
echo.
echo Next steps:
echo 1. Copy appropriate folder to target computer
echo 2. Run TallySync.exe
echo 3. Configure settings
echo 4. Start sync service
echo.
pause