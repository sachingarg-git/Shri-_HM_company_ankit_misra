# Tally Sync Windows Desktop Application

This Windows Forms application connects to the Tally integration backend and demonstrates data synchronization between Tally accounting software and your business management system.

## Features

- **Backend Connection**: Connects to the web API running on `http://localhost:5000`
- **Company Management**: Lists existing Tally companies from the database
- **Data Synchronization**: Sends sample Tally data to the backend API
- **Real-time Status**: Shows connection and sync status with visual feedback

## How to Build and Run

### Prerequisites
- Windows 10/11
- .NET 8.0 SDK or later
- Visual Studio 2022 or VS Code with C# extension

### Building the Application

**Important**: Make sure your web backend is running on `http://localhost:5000` before testing the desktop app.

1. **Using Visual Studio:**
   ```
   1. Open the TallySync folder in Visual Studio
   2. Build > Build Solution (Ctrl+Shift+B)
   3. Debug > Start Debugging (F5)
   ```

2. **Using Command Line:**
   ```bash
   cd windows-app/TallySync
   dotnet build
   dotnet run
   ```

3. **If you get build errors:**
   ```bash
   # Clean and restore
   cd windows-app/TallySync
   dotnet clean
   dotnet restore
   dotnet build
   ```

### Usage Instructions

1. **Start the Web Backend**: Make sure your web application is running on `http://localhost:5000`

2. **Launch Desktop App**: Run the Windows application

3. **Connect to Backend**:
   - Click "Connect to Backend" button
   - The app will test the connection and display existing companies
   - Status will show green for success, red for errors

4. **Sync Sample Data**:
   - Click "Sync Sample Data" to send test data to the backend
   - This demonstrates how Tally data would be transmitted
   - The companies list will refresh to show new data

## API Integration

The desktop app communicates with these backend endpoints:

- `GET /api/tally/companies` - Retrieves existing companies
- `POST /api/tally/sync/companies` - Syncs new company data
- `GET /api/tally/sync/status` - Gets synchronization status

## Connection Configuration

The application currently connects to:
- **Backend URL**: `http://localhost:5000/api/tally`
- **API Key**: `test-api-key-123` (for demonstration)

To modify the connection settings, edit the `baseUrl` variable in `MainForm.cs`.

## Troubleshooting

### "Invalid Response" Error
- Ensure the web backend is running on port 5000
- Check that the Tally API endpoints are working
- Verify the API key matches what's configured in the backend

### Connection Timeout
- Check Windows Firewall settings
- Ensure no antivirus is blocking the connection
- Verify the backend is accessible at `http://localhost:5000`

## Production Deployment

For production use:
1. Update the `baseUrl` to point to your production server
2. Implement proper API key management and authentication
3. Add error logging and retry mechanisms
4. Configure the app for your specific Tally integration requirements