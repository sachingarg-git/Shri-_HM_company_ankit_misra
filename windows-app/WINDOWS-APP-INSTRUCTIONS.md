# TallySync Windows Desktop Application - Setup Instructions

## 🚨 Important: Why It's Not Working in Replit

**The Windows desktop application CANNOT run in Replit because:**
- Replit runs on Linux servers (not Windows)
- Windows Forms requires Windows operating system
- No GUI support in cloud Linux environment

## ✅ Solution: Run on Your Windows PC

### Step 1: Download Files to Windows
Copy these files to your Windows machine:

```
TallySync.csproj
Program.cs  
MainForm.cs
MainForm.Designer.cs
TallyGatewayService.cs
```

### Step 2: Install Prerequisites
1. Download and install **.NET 8 SDK**: https://dotnet.microsoft.com/download/dotnet/8.0
2. Install **Visual Studio 2022 Community** (free): https://visualstudio.microsoft.com/

### Step 3: Configure Backend URL
In `MainForm.cs`, update the backend URL:

**For Replit backend:**
```csharp
private readonly string baseUrl = "https://[your-repl-name].[your-username].repl.co/api/tally";
```

**For local testing:**
```csharp
private readonly string baseUrl = "http://localhost:5000/api/tally";
```

### Step 4: Build and Run
Open Command Prompt in the TallySync folder:
```cmd
dotnet build
dotnet run
```

Or open in Visual Studio and press F5.

## 🧪 Backend Status (Verified Working)

I've tested all backend APIs and they work perfectly:

✅ **GET /api/tally/companies** - Returns company data  
✅ **POST /api/tally/sync/companies** - Accepts sync data  
✅ **GET /api/tally/sync/status** - Returns sync logs  
✅ **GET /api/tally/test** - Connectivity test  

## 🎯 Expected Desktop App Behavior

When running on Windows, the app should:

1. **Click "Connect to Backend":**
   - Tests backend connectivity
   - Fetches and displays existing companies
   - Enables sync functionality

2. **Click "Sync Sample Data":**
   - Sends test company data to backend
   - Updates company list automatically
   - Shows success/error status

## 🔧 Troubleshooting

### "Backend connection failed"
- Check if backend URL is correct
- Test URL in web browser first
- Check Windows Firewall settings

### "Invalid API key"
- Ensure using "test-api-key-123"
- Check backend logs for authentication errors

### "Unexpected response"
- Backend might be returning HTML instead of JSON
- Check if backend is deployed correctly
- Verify API endpoints are working

## 📋 Quick Test Checklist

Before running Windows app:
1. ✅ Backend is deployed and accessible
2. ✅ Test backend URL in browser
3. ✅ .NET 8 SDK installed on Windows
4. ✅ Correct backend URL configured in code
5. ✅ Windows Firewall allows connection

The backend is fully working - your desktop app just needs to run on Windows!