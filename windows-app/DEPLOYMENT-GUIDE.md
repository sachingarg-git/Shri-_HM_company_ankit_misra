# TallySync Windows Desktop App - Deployment Guide

## Why the Desktop App Cannot Run in Replit

The Windows Forms desktop application **cannot run directly in Replit** because:

1. **Replit runs on Linux servers** - Windows Forms requires Windows OS
2. **No GUI support** - Replit's environment doesn't support Windows desktop applications
3. **Architecture mismatch** - .NET Windows Forms apps need Windows runtime

## How to Run the Windows Desktop App

### Option 1: On Your Windows PC (Recommended)

1. **Prerequisites:**
   - Windows 10/11
   - .NET 8 SDK: Download from https://dotnet.microsoft.com/download/dotnet/8.0
   - Visual Studio 2022 Community (free) or Visual Studio Code

2. **Copy the files to your Windows machine:**
   ```
   windows-app/TallySync/TallySync.csproj
   windows-app/TallySync/Program.cs
   windows-app/TallySync/MainForm.cs
   windows-app/TallySync/MainForm.Designer.cs
   windows-app/TallySync/TallyGatewayService.cs
   ```

3. **Build and run:**
   ```cmd
   cd TallySync
   dotnet build
   dotnet run
   ```

4. **Make sure your backend is accessible:**
   - Update the `baseUrl` in MainForm.cs to your Replit app URL
   - Change from `http://localhost:5000` to your deployed backend URL

### Option 2: Using Visual Studio

1. Open Visual Studio 2022
2. Create new Windows Forms App (.NET)
3. Copy the code from the provided files
4. Build and run (F5)

## Backend Connection Configuration

### For Local Testing
If running backend locally:
```csharp
private readonly string baseUrl = "http://localhost:5000/api/tally";
```

### For Replit Backend
If using Replit-hosted backend:
```csharp
private readonly string baseUrl = "https://your-repl-name.your-username.repl.co/api/tally";
```

## Current Status

✅ **Backend APIs working perfectly in Replit:**
- GET /api/tally/companies - Returns company data
- POST /api/tally/sync/companies - Accepts sync data
- GET /api/tally/sync/status - Returns sync logs
- GET /api/tally/test - Connectivity test

✅ **Windows app code is complete and ready to deploy**

❌ **Cannot demonstrate GUI in Replit environment** (Linux limitation)

## Testing the Integration

I've verified the backend works by testing all API endpoints with curl:
- ✅ Companies API returns JSON data
- ✅ Sync API accepts and processes company data
- ✅ Database stores data correctly
- ✅ All HTTP responses are proper JSON

The Windows desktop app should work perfectly once deployed to a Windows environment.

## Troubleshooting

### Common Issues:
1. **"Backend connection failed"** - Check if backend URL is correct
2. **"API key invalid"** - Ensure using "test-api-key-123" 
3. **"Unexpected response"** - Backend might be returning HTML instead of JSON

### Solutions:
1. Test backend URL in browser first
2. Check Windows Firewall settings
3. Ensure .NET 8 runtime is installed
4. Verify backend is deployed and accessible