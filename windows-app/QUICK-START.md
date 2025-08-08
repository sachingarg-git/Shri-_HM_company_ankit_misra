# TallySync - Quick Start Guide (Hindi/English)

## आसान Setup के लिए

### Step 1: Compile करें
1. `compile-for-user.bat` को **Administrator** के रूप में run करें
2. Script automatically सब कुछ setup कर देगी
3. `dist` folder में ready-to-use files मिलेंगी

### Step 2: Use करें
1. `dist` folder को अपने computer पर copy करें
2. `Run-TallySync.bat` पर double-click करें
3. पहली बार run करने पर configuration screen खुलेगी

## Configuration Settings

### Tally ERP Settings:
- **Tally Server URL**: `http://localhost:9000` (default)
- **Company Name**: आपकी Tally company का exact name

### Web API Settings:
- **Web API URL**: आपका business management system का URL
- **API Key**: Administrator से मिलेगा

### Sync Settings:
- **Sync Mode**: Real-time या Scheduled
- **Sync Interval**: Scheduled के लिए minutes में

## Before Starting

### Tally ERP में:
1. Tally खोलें
2. **Gateway of Tally** → **Configure** → **Advanced Configuration**
3. **"Load on Startup"** enable करें
4. Port **9000** set करें
5. Tally restart करें

### First Time Setup:
1. TallySync खोलें
2. **"Configuration"** button click करें
3. सभी details भरें
4. **"Test Connections"** click करें
5. अगर successful है तो **"Start Sync"** करें

## File Structure After Compilation

```
dist/
├── TallySync.exe          (Main application)
├── README.txt             (Documentation)
├── Setup-Guide.txt        (Detailed setup)
├── Run-TallySync.bat      (Quick launcher)
└── Install-TallySync.bat  (System installation)
```

## Troubleshooting

### Common Issues:

**"Cannot connect to Tally"**
- Tally ERP running है?
- Gateway enabled है?
- Port 9000 free है?

**"Web API connection failed"**
- Internet connection check करें
- API URL correct है?
- API key valid है?

**"Application not starting"**
- Windows Defender में allow करें
- Administrator rights दें

## System Requirements

- **Windows**: 10 या newer
- **Tally ERP**: Version 9 या newer
- **RAM**: Minimum 2GB
- **Storage**: 200MB free space
- **Internet**: Web API के लिए

## Support

Technical issues के लिए:
1. Log files check करें: `%AppData%\TallySync\Logs\`
2. Error messages screenshot लें
3. Administrator को contact करें

---

## Quick Commands

```batch
# Compile application
compile-for-user.bat

# Run application
Run-TallySync.bat

# Install to system
Install-TallySync.bat
```

---

**Note**: यह self-contained executable है। Target computer पर .NET install करने की जरूरत नहीं है।