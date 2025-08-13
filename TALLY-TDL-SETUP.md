# Tally TDL Integration Setup - Exactly Like YouTube Video

## Step-by-Step TDL Implementation

### 1. TDL File को Tally में Install करें

आपकी Tally installation directory में (जैसे `C:\Tally.ERP9\`) निम्नलिखित file save करें:

**File Name:** `TallySync_Integration.tdl`

### 2. Tally Configuration Steps

1. **Tally open करें**
2. **F11 (Features)** दबाएं
3. **Advanced Configuration** में जाएं  
4. **Set/Alter TDL Names** में `TallySync_Integration.tdl` add करें
5. **Gateway of Tally** में जाएं - अब आपको **"TallySync Integration"** menu दिखेगा

### 3. Menu Structure (YouTube के अनुसार)

```
Gateway of Tally
└── TallySync Integration
    ├── Export Stock Items      (Video की तरह Stock Items export)
    ├── Export Ledgers          (Ledger data export)  
    ├── Export Vouchers         (Transaction export)
    ├── Sync All Data           (सारा data एक साथ)
    └── Test Connection         (Server connectivity test)
```

### 4. TDL Components (Video के exactly समान)

#### **Report Definition:**
```tdl
[Report: TallySync Export StockItems]
Form            : TallySync Request Form
Use             : Name Muster
Title           : "TallySync - Export Stock Items"
```

#### **Collection Definition:**
```tdl
[Collection: TallySync Export StockItems]
Type            : Stock Items
Remote URL      : @@TallySyncURL  
Remote Request  : TallySyncExportItems:ASCII
XML Object Path : IM:1:TallyRequest
```

#### **Function Definition (Video के समान XML construction):**
```tdl
[Function: TallySyncExportItems]
Parameter       : Company Name : Text
Parameter       : Company GUID : Text  
Parameter       : Request Type : Text

01 : HTTP Post URL      : @@TallySyncURL
02 : HTTP Post Data     : "<ENVELOPE><HEADER><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>ExportStockItems</ID></HEADER>..."
03 : Set                : DSP FILE : "TallySyncStockResult.xml"
04 : Import             : Data
```

### 5. Server Configuration

**Your Replit URL को update करें:**

TDL file में line 10 पर:
```tdl
TallySyncURL    : "https://your-actual-repl-url.repl.co/tally"
```

### 6. Testing Process (Video के अनुसार)

1. **Tally में company open करें**
2. **Gateway of Tally** → **TallySync Integration** → **Test Connection**
3. Success message देखें: `"Connection test completed!"`
4. **Export Stock Items** click करें
5. Success message: `"Stock Items exported to TallySync server successfully!"`

### 7. XML Request/Response Flow

#### **Tally भेजेगा (Request):**
```xml
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>ExportStockItems</ID>
    </HEADER>
    <BODY>
        <TALLYMESSAGE>
            <STOCKITEM ACTION="Create">
                <COMPANYNAME>Your Company</COMPANYNAME>
                <COMPANYGUID>company-guid-123</COMPANYGUID>
                <REQUESTTYPE>STOCKITEMS</REQUESTTYPE>
            </STOCKITEM>
        </TALLYMESSAGE>
    </BODY>
</ENVELOPE>
```

#### **Server Response करेगा:**
```xml
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>ExportStockItemsResponse</ID>
    </HEADER>
    <BODY>
        <DATA>
            <TALLYMESSAGE>
                <STOCKITEM NAME="Item 1" GUID="item-guid-1">
                    <PARENT>Primary</PARENT>
                    <BASEUNITS>Nos</BASEUNITS>
                    <OPENINGBALANCE>100</OPENINGBALANCE>
                </STOCKITEM>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>
```

### 8. Key Features Implemented

✅ **Report-based XML construction** (जैसे video में)
✅ **Collection-based data gathering**  
✅ **Function-based HTTP posting**
✅ **Menu integration in Gateway of Tally**
✅ **Multi-step data export process**
✅ **Error handling और success messages**
✅ **Remote URL configuration**
✅ **XML Object Path mapping**

### 9. Advanced Features (Video से भी बेहतर)

- **Automatic company GUID detection**
- **Real-time sync logging**
- **Multiple data types support (Stock, Ledgers, Vouchers)**
- **Batch export functionality**
- **Connection testing**

यह implementation बिल्कुल YouTube video के pattern को follow करती है और आपके web server के साथ perfect integration provide करती है!