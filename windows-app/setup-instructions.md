# TallySync - Setup Instructions for Beginners

## Prerequisites Installation

### Step 1: Install .NET 8.0 SDK
1. Go to: https://dotnet.microsoft.com/download/dotnet/8.0
2. Download ".NET 8.0 SDK" (not runtime)
3. Run installer and follow default settings

### Step 2: Install Visual Studio (Optional but Recommended)
1. Go to: https://visualstudio.microsoft.com/vs/community/
2. Download Visual Studio Community 2022 (Free)
3. During installation, select:
   - ✅ .NET desktop development workload
   - ✅ Windows Forms and WPF support

## Building the Application

### Method 1: Using Visual Studio (Easiest)
1. Open Visual Studio
2. Click "Open a project or solution"
3. Navigate to `windows-app/TallySync.sln`
4. Press **Ctrl+Shift+B** to build
5. Press **F5** to run with debugging OR **Ctrl+F5** to run without debugging

### Method 2: Using Command Prompt
1. Press **Windows Key + R**
2. Type `cmd` and press Enter
3. Navigate to project folder:
   ```cmd
   cd path\to\windows-app
   ```
4. Build the project:
   ```cmd
   dotnet build TallySync.sln
   ```
5. Run the application:
   ```cmd
   dotnet run --project TallySync
   ```

## Creating Standalone Executable

### For Single Machine (Self-Contained)
```cmd
cd windows-app\TallySync
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

The EXE will be created in:
`bin\Release\net8.0-windows\win-x64\publish\TallySync.exe`

### For Multiple Machines (Framework-Dependent)
```cmd
cd windows-app\TallySync
dotnet publish -c Release -r win-x64 --self-contained false
```

## Installation on Target Machine

### If Self-Contained EXE
1. Copy the entire `publish` folder to target machine
2. Run `TallySync.exe` directly
3. No additional software needed

### If Framework-Dependent
1. Install .NET 8.0 Runtime on target machine
2. Copy application files
3. Run `TallySync.exe`

## Initial Configuration

### Step 1: Configure Tally
1. Open Tally ERP
2. Go to Gateway of Tally
3. Set: **Gateway of Tally = Yes**
4. Set: **Port = 9000**
5. Set: **Accept connections = Yes**

### Step 2: Configure TallySync Application
1. Run TallySync.exe
2. Click "Settings" button
3. Fill in Connection tab:
   - **Tally Server URL**: `http://[Tally-Computer-IP]:9000`
   - **Company Name**: Your exact Tally company name
   - **Web API URL**: Your BizFlow Pro URL (e.g., `https://your-app.com`)
   - **API Key**: Your BizFlow Pro API key

4. Test connections using "Test" buttons
5. Configure Sync Settings tab:
   - Choose Real-time or Scheduled
   - Set sync interval (15-60 minutes recommended)
6. Click "Save"

### Step 3: Start Service
1. Click "Start Service" in main window
2. Application will minimize to system tray
3. Check system tray for TallySync icon

## Troubleshooting

### Build Errors
- Ensure .NET 8.0 SDK is installed
- Run `dotnet --version` to verify installation
- Close and reopen command prompt after SDK installation

### Connection Issues
- Check if Tally Gateway is enabled
- Verify firewall allows port 9000
- Test with `telnet [tally-ip] 9000`
- Ensure company name matches exactly (case-sensitive)

### API Connection Failed
- Verify BizFlow Pro URL is correct
- Check API key validity
- Ensure internet connectivity

### Application Won't Start
- Check Windows Event Viewer for errors
- Ensure .NET runtime is installed
- Run from command prompt to see error messages

## Network Setup for Different Scenarios

### Same Computer (Tally + TallySync)
- Tally Server URL: `http://localhost:9000`

### Different Computers - Same Network
- Tally Server URL: `http://192.168.1.100:9000` (replace with Tally computer IP)
- Ensure port 9000 is open in Windows Firewall

### Different Networks (Advanced)
- Use VPN or port forwarding
- Configure router to forward port 9000
- Use dynamic DNS for changing IP addresses

## Auto-Start Setup
1. Open TallySync Settings
2. Go to Advanced tab
3. Check "Start with Windows"
4. Application will auto-start when Windows boots

## Log Files Location
- Logs: `C:\Users\[Username]\AppData\Roaming\TallySync\logs.txt`
- Config: `C:\Users\[Username]\AppData\Roaming\TallySync\config.json`

## Support
For issues:
1. Check log files for error details
2. Verify all connection settings
3. Test individual components (Tally connection, API connection)
4. Ensure all prerequisites are installed