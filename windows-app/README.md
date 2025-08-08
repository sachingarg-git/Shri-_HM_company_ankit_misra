# Tally Sync - Windows Desktop Application

## Overview

**Tally Sync** is a Windows desktop application that provides seamless real-time and scheduled data synchronization between Tally ERP systems and the BizFlow Pro web application. The application runs as a background service with system tray integration for easy management.

## Features

### Core Functionality
- **Real-time Data Sync**: Continuous monitoring and synchronization of Tally data
- **Scheduled Sync**: Configurable interval-based synchronization (15 minutes to daily)
- **System Tray Integration**: Minimizes to system tray for background operation
- **Auto-start with Windows**: Optional automatic startup with Windows
- **Connection Testing**: Built-in connectivity tests for both Tally and Web API

### Data Synchronization
- **Ledgers → Clients**: Automatic mapping of Tally ledgers to BizFlow clients
- **Vouchers → Payments/Orders**: Transaction data synchronization
- **Stock Items → Products**: Inventory data integration
- **Intelligent Categorization**: Automatic client categorization based on transaction volume

### User Interface
- **Configuration Management**: Easy-to-use settings interface
- **Real-time Monitoring**: Live sync status and progress tracking
- **Comprehensive Logging**: Detailed operation logs with viewer
- **Notification System**: System notifications for sync events

## Technical Architecture

### Built With
- **.NET 8.0**: Modern Windows Forms application
- **C# Language**: Type-safe, object-oriented development
- **Dependency Injection**: Microsoft.Extensions.DependencyInjection
- **HTTP Client**: Built-in HTTP client for API communication
- **XML Processing**: Native XML parsing for Tally data
- **JSON Serialization**: Newtonsoft.Json for API communication

### Key Components

#### Services Layer
- **TallyConnector**: Handles Tally Gateway XML communication
- **WebApiClient**: Manages BizFlow Pro API integration
- **SyncService**: Orchestrates synchronization operations
- **ConfigurationManager**: Persists application settings
- **NotificationService**: System tray notifications

#### Forms Layer
- **MainForm**: Primary application interface
- **ConfigurationForm**: Settings management
- **LogViewerForm**: Operation log display

## Installation & Setup

### Prerequisites
- Windows 10 or later
- .NET 8.0 Runtime
- Tally ERP 9 or Tally Prime with Gateway enabled
- Network connectivity to BizFlow Pro API

### Configuration Steps

1. **Tally Setup**:
   ```
   Gateway of Tally: Yes
   Port: 9000 (default)
   Accept connections: Yes
   ```

2. **Application Configuration**:
   - Tally Server URL: `http://[tally-ip]:9000`
   - Company Name: Your Tally company name
   - Web API URL: Your BizFlow Pro API endpoint
   - API Key: Authentication key for BizFlow Pro

3. **Sync Settings**:
   - Choose Real-time or Scheduled mode
   - Set sync interval (for scheduled mode)
   - Configure auto-start preferences

## Data Mapping

### Tally to BizFlow Mapping

| Tally Entity | BizFlow Entity | Mapping Logic |
|--------------|----------------|---------------|
| Ledgers (Sundry Debtors) | Clients | Name, balance-based categorization |
| Vouchers (Payment/Receipt) | Payments | Amount, date, party mapping |
| Vouchers (Sales/Invoice) | Orders | Order details, client linking |
| Stock Items | Products | Name, category, current stock |

### Client Categorization
- **ALFA**: > ₹10,00,000 closing balance
- **BETA**: > ₹5,00,000 closing balance  
- **GAMMA**: > ₹1,00,000 closing balance
- **DELTA**: All others

## Operation Modes

### Real-time Sync
- Polls Tally every minute for changes
- Immediate data synchronization
- Best for high-transaction environments

### Scheduled Sync
- Configurable intervals (15 min - 24 hours)
- Batch processing of changes
- Suitable for stable environments

## Logging & Monitoring

### Log Levels
- **Information**: Normal operations
- **Warning**: Non-critical issues
- **Error**: Failed operations requiring attention

### Log Storage
- Location: `%AppData%\TallySync\logs.txt`
- Automatic rotation for performance
- Exportable for analysis

## Troubleshooting

### Common Issues

**Connection Failed to Tally**
- Verify Tally Gateway is enabled (Port 9000)
- Check firewall settings
- Ensure company name is correct

**API Connection Failed**
- Verify Web API URL and API key
- Check internet connectivity
- Confirm BizFlow Pro server status

**Sync Errors**
- Review detailed logs in Log Viewer
- Check data formats and mapping
- Verify user permissions in Tally

### Support
For technical support and issues, check the application logs and ensure all connection parameters are configured correctly.

## Development Notes

### Building from Source
```bash
# Clone repository
git clone [repository-url]
cd windows-app

# Build solution
dotnet build TallySync.sln

# Run application
dotnet run --project TallySync
```

### Deployment
The application can be deployed as:
- Self-contained executable
- MSI installer package
- ClickOnce deployment

## Security Considerations
- API keys stored securely in user profile
- All communications use HTTPS where possible
- No sensitive data cached locally
- Configurable connection timeout settings