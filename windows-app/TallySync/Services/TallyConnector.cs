using System.Text;
using System.Xml;
using TallySync.Models;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace TallySync.Services;

public class TallyConnector
{
    private readonly ILogger<TallyConnector> _logger;
    private readonly HttpClient _httpClient;

    public TallyConnector(ILogger<TallyConnector> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<bool> TestConnectionAsync(string serverUrl, string companyName)
    {
        try
        {
            var companyListXml = @"
                <ENVELOPE>
                    <HEADER>
                        <TALLYREQUEST>Import Data</TALLYREQUEST>
                    </HEADER>
                    <BODY>
                        <IMPORTDATA>
                            <REQUESTDESC>
                                <REPORTNAME>List of Companies</REPORTNAME>
                            </REQUESTDESC>
                        </IMPORTDATA>
                    </BODY>
                </ENVELOPE>";

            var response = await SendTallyRequestAsync(serverUrl, companyListXml);
            return !string.IsNullOrEmpty(response) && response.Contains("<COMPANY>");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test Tally connection");
            return false;
        }
    }

    public async Task<List<TallyLedger>> GetLedgersAsync(string serverUrl, string companyName)
    {
        var ledgers = new List<TallyLedger>();
        
        try
        {
            var requestXml = $@"
                <ENVELOPE>
                    <HEADER>
                        <TALLYREQUEST>Export Data</TALLYREQUEST>
                    </HEADER>
                    <BODY>
                        <EXPORTDATA>
                            <REQUESTDESC>
                                <REPORTNAME>List of Accounts</REPORTNAME>
                                <STATICVARIABLES>
                                    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                                    <SVFROMDATE>##SVCURRENTDATE</SVFROMDATE>
                                    <SVTODATE>##SVCURRENTDATE</SVTODATE>
                                </STATICVARIABLES>
                            </REQUESTDESC>
                        </EXPORTDATA>
                    </BODY>
                </ENVELOPE>";

            var response = await SendTallyRequestAsync(serverUrl, requestXml, companyName);
            ledgers = ParseLedgersFromXml(response);
            
            _logger.LogInformation($"Retrieved {ledgers.Count} ledgers from Tally");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get ledgers from Tally");
        }

        return ledgers;
    }

    public async Task<List<TallyVoucher>> GetVouchersAsync(string serverUrl, string companyName, DateTime fromDate, DateTime toDate)
    {
        var vouchers = new List<TallyVoucher>();
        
        try
        {
            var requestXml = $@"
                <ENVELOPE>
                    <HEADER>
                        <TALLYREQUEST>Export Data</TALLYREQUEST>
                    </HEADER>
                    <BODY>
                        <EXPORTDATA>
                            <REQUESTDESC>
                                <REPORTNAME>Daybook</REPORTNAME>
                                <STATICVARIABLES>
                                    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                                    <SVFROMDATE>{fromDate:yyyyMMdd}</SVFROMDATE>
                                    <SVTODATE>{toDate:yyyyMMdd}</SVTODATE>
                                </STATICVARIABLES>
                            </REQUESTDESC>
                        </EXPORTDATA>
                    </BODY>
                </ENVELOPE>";

            var response = await SendTallyRequestAsync(serverUrl, requestXml, companyName);
            vouchers = ParseVouchersFromXml(response);
            
            _logger.LogInformation($"Retrieved {vouchers.Count} vouchers from Tally");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get vouchers from Tally");
        }

        return vouchers;
    }

    public async Task<List<TallyStockItem>> GetStockItemsAsync(string serverUrl, string companyName)
    {
        var stockItems = new List<TallyStockItem>();
        
        try
        {
            var requestXml = $@"
                <ENVELOPE>
                    <HEADER>
                        <TALLYREQUEST>Export Data</TALLYREQUEST>
                    </HEADER>
                    <BODY>
                        <EXPORTDATA>
                            <REQUESTDESC>
                                <REPORTNAME>List of Stock Items</REPORTNAME>
                                <STATICVARIABLES>
                                    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                                </STATICVARIABLES>
                            </REQUESTDESC>
                        </EXPORTDATA>
                    </BODY>
                </ENVELOPE>";

            var response = await SendTallyRequestAsync(serverUrl, requestXml, companyName);
            stockItems = ParseStockItemsFromXml(response);
            
            _logger.LogInformation($"Retrieved {stockItems.Count} stock items from Tally");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get stock items from Tally");
        }

        return stockItems;
    }

    private async Task<string> SendTallyRequestAsync(string serverUrl, string requestXml, string? companyName = null)
    {
        var url = serverUrl.TrimEnd('/');
        if (!string.IsNullOrEmpty(companyName))
        {
            url += $"/{Uri.EscapeDataString(companyName)}";
        }

        var content = new StringContent(requestXml, Encoding.UTF8, "application/xml");
        var response = await _httpClient.PostAsync(url, content);
        
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadAsStringAsync();
        }
        
        throw new HttpRequestException($"Tally request failed: {response.StatusCode}");
    }

    private List<TallyLedger> ParseLedgersFromXml(string xmlResponse)
    {
        var ledgers = new List<TallyLedger>();
        
        try
        {
            var doc = new XmlDocument();
            doc.LoadXml(xmlResponse);
            
            var ledgerNodes = doc.SelectNodes("//LEDGER");
            if (ledgerNodes != null)
            {
                foreach (XmlNode node in ledgerNodes)
                {
                    var ledger = new TallyLedger
                    {
                        GUID = GetNodeValue(node, "GUID"),
                        Name = GetNodeValue(node, "NAME"),
                        Parent = GetNodeValue(node, "PARENT"),
                        Alias = GetNodeValue(node, "ALIAS"),
                        Group = GetNodeValue(node, "GROUP"),
                        OpeningBalance = ParseDecimal(GetNodeValue(node, "OPENINGBALANCE")),
                        ClosingBalance = ParseDecimal(GetNodeValue(node, "CLOSINGBALANCE")),
                        LastModified = DateTime.Now
                    };
                    ledgers.Add(ledger);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse ledgers XML");
        }
        
        return ledgers;
    }

    private List<TallyVoucher> ParseVouchersFromXml(string xmlResponse)
    {
        var vouchers = new List<TallyVoucher>();
        
        try
        {
            var doc = new XmlDocument();
            doc.LoadXml(xmlResponse);
            
            var voucherNodes = doc.SelectNodes("//VOUCHER");
            if (voucherNodes != null)
            {
                foreach (XmlNode node in voucherNodes)
                {
                    var voucher = new TallyVoucher
                    {
                        GUID = GetNodeValue(node, "GUID"),
                        VoucherTypeName = GetNodeValue(node, "VOUCHERTYPENAME"),
                        VoucherNumber = GetNodeValue(node, "VOUCHERNUMBER"),
                        Date = ParseDate(GetNodeValue(node, "DATE")),
                        Reference = GetNodeValue(node, "REFERENCE"),
                        Narration = GetNodeValue(node, "NARRATION"),
                        PartyLedgerName = GetNodeValue(node, "PARTYLEDGERNAME"),
                        LastModified = DateTime.Now
                    };
                    
                    // Parse ledger entries
                    var entryNodes = node.SelectNodes(".//ALLLEDGERENTRIES.LIST");
                    if (entryNodes != null)
                    {
                        foreach (XmlNode entryNode in entryNodes)
                        {
                            var entry = new TallyVoucherEntry
                            {
                                LedgerName = GetNodeValue(entryNode, "LEDGERNAME"),
                                Amount = ParseDecimal(GetNodeValue(entryNode, "AMOUNT")),
                                IsDeemedPositive = GetNodeValue(entryNode, "ISDEEMEDPOSITIVE") == "Yes"
                            };
                            voucher.Entries.Add(entry);
                        }
                    }
                    
                    vouchers.Add(voucher);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse vouchers XML");
        }
        
        return vouchers;
    }

    private List<TallyStockItem> ParseStockItemsFromXml(string xmlResponse)
    {
        var stockItems = new List<TallyStockItem>();
        
        try
        {
            var doc = new XmlDocument();
            doc.LoadXml(xmlResponse);
            
            var itemNodes = doc.SelectNodes("//STOCKITEM");
            if (itemNodes != null)
            {
                foreach (XmlNode node in itemNodes)
                {
                    var item = new TallyStockItem
                    {
                        GUID = GetNodeValue(node, "GUID"),
                        Name = GetNodeValue(node, "NAME"),
                        Alias = GetNodeValue(node, "ALIAS"),
                        Parent = GetNodeValue(node, "PARENT"),
                        Category = GetNodeValue(node, "CATEGORY"),
                        BaseUnits = GetNodeValue(node, "BASEUNITS"),
                        OpeningBalance = ParseDecimal(GetNodeValue(node, "OPENINGBALANCE")),
                        ClosingBalance = ParseDecimal(GetNodeValue(node, "CLOSINGBALANCE")),
                        OpeningValue = ParseDecimal(GetNodeValue(node, "OPENINGVALUE")),
                        ClosingValue = ParseDecimal(GetNodeValue(node, "CLOSINGVALUE")),
                        LastModified = DateTime.Now
                    };
                    stockItems.Add(item);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse stock items XML");
        }
        
        return stockItems;
    }

    private string GetNodeValue(XmlNode parent, string nodeName)
    {
        var node = parent.SelectSingleNode(nodeName);
        return node?.InnerText ?? "";
    }

    private decimal ParseDecimal(string value)
    {
        if (decimal.TryParse(value, out var result))
            return result;
        return 0;
    }

    private DateTime ParseDate(string value)
    {
        if (DateTime.TryParse(value, out var result))
            return result;
        return DateTime.MinValue;
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}