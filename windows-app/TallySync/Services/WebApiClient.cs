using System.Text;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using TallySync.Models;

namespace TallySync.Services;

public class WebApiClient
{
    private readonly ILogger<WebApiClient> _logger;
    private readonly HttpClient _httpClient;

    public WebApiClient(ILogger<WebApiClient> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient();
        _httpClient.Timeout = TimeSpan.FromMinutes(5); // Longer timeout for batch operations
    }

    public async Task<bool> TestConnectionAsync(string apiUrl, string apiKey)
    {
        try
        {
            SetAuthHeaders(apiKey);
            var response = await _httpClient.GetAsync($"{apiUrl.TrimEnd('/')}/api/health");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test web API connection");
            return false;
        }
    }

    public async Task<WebApiResponse<bool>> SyncLedgersAsync(string apiUrl, string apiKey, List<TallyLedger> ledgers)
    {
        try
        {
            SetAuthHeaders(apiKey);
            
            // Convert Tally ledgers to BizFlow clients
            var clients = ledgers.Where(l => IsClientLedger(l)).Select(ConvertToClient).ToList();
            
            var json = JsonConvert.SerializeObject(clients);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{apiUrl.TrimEnd('/')}/api/tally/sync/clients", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Successfully synced {clients.Count} clients");
                return new WebApiResponse<bool> { Success = true, Data = true, Message = $"Synced {clients.Count} clients" };
            }
            else
            {
                _logger.LogError($"Failed to sync clients: {response.StatusCode} - {responseContent}");
                return new WebApiResponse<bool> { Success = false, Message = $"API Error: {response.StatusCode}" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync ledgers");
            return new WebApiResponse<bool> { Success = false, Message = ex.Message };
        }
    }

    public async Task<WebApiResponse<bool>> SyncVouchersAsync(string apiUrl, string apiKey, List<TallyVoucher> vouchers)
    {
        try
        {
            SetAuthHeaders(apiKey);
            
            // Convert Tally vouchers to BizFlow payments/orders
            var payments = vouchers.Where(v => IsPaymentVoucher(v)).Select(ConvertToPayment).ToList();
            var orders = vouchers.Where(v => IsSalesVoucher(v)).Select(ConvertToOrder).ToList();
            
            var result = new WebApiResponse<bool> { Success = true, Data = true };
            var messages = new List<string>();
            
            // Sync payments
            if (payments.Any())
            {
                var paymentsJson = JsonConvert.SerializeObject(payments);
                var paymentsContent = new StringContent(paymentsJson, Encoding.UTF8, "application/json");
                
                var paymentsResponse = await _httpClient.PostAsync($"{apiUrl.TrimEnd('/')}/api/tally/sync/payments", paymentsContent);
                if (paymentsResponse.IsSuccessStatusCode)
                {
                    messages.Add($"Synced {payments.Count} payments");
                    _logger.LogInformation($"Successfully synced {payments.Count} payments");
                }
                else
                {
                    result.Success = false;
                    messages.Add($"Failed to sync payments: {paymentsResponse.StatusCode}");
                }
            }
            
            // Sync orders
            if (orders.Any())
            {
                var ordersJson = JsonConvert.SerializeObject(orders);
                var ordersContent = new StringContent(ordersJson, Encoding.UTF8, "application/json");
                
                var ordersResponse = await _httpClient.PostAsync($"{apiUrl.TrimEnd('/')}/api/tally/sync/orders", ordersContent);
                if (ordersResponse.IsSuccessStatusCode)
                {
                    messages.Add($"Synced {orders.Count} orders");
                    _logger.LogInformation($"Successfully synced {orders.Count} orders");
                }
                else
                {
                    result.Success = false;
                    messages.Add($"Failed to sync orders: {ordersResponse.StatusCode}");
                }
            }
            
            result.Message = string.Join(", ", messages);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync vouchers");
            return new WebApiResponse<bool> { Success = false, Message = ex.Message };
        }
    }

    public async Task<WebApiResponse<bool>> SyncStockItemsAsync(string apiUrl, string apiKey, List<TallyStockItem> stockItems)
    {
        try
        {
            SetAuthHeaders(apiKey);
            
            // Convert stock items to products (if your system has product management)
            var products = stockItems.Select(ConvertToProduct).ToList();
            
            var json = JsonConvert.SerializeObject(products);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{apiUrl.TrimEnd('/')}/api/tally/sync/products", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Successfully synced {products.Count} products");
                return new WebApiResponse<bool> { Success = true, Data = true, Message = $"Synced {products.Count} products" };
            }
            else
            {
                _logger.LogError($"Failed to sync products: {response.StatusCode} - {responseContent}");
                return new WebApiResponse<bool> { Success = false, Message = $"API Error: {response.StatusCode}" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync stock items");
            return new WebApiResponse<bool> { Success = false, Message = ex.Message };
        }
    }

    private void SetAuthHeaders(string apiKey)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        _httpClient.DefaultRequestHeaders.Add("X-Tally-Sync", "true");
    }

    private bool IsClientLedger(TallyLedger ledger)
    {
        // Determine if ledger represents a client/customer
        var clientGroups = new[] { "Sundry Debtors", "Customers", "Parties", "Trade Receivables" };
        return clientGroups.Any(group => ledger.Parent.Contains(group, StringComparison.OrdinalIgnoreCase) ||
                                       ledger.Group.Contains(group, StringComparison.OrdinalIgnoreCase));
    }

    private bool IsPaymentVoucher(TallyVoucher voucher)
    {
        var paymentTypes = new[] { "Payment", "Receipt", "Contra", "Journal" };
        return paymentTypes.Any(type => voucher.VoucherTypeName.Contains(type, StringComparison.OrdinalIgnoreCase));
    }

    private bool IsSalesVoucher(TallyVoucher voucher)
    {
        var salesTypes = new[] { "Sales", "Invoice" };
        return salesTypes.Any(type => voucher.VoucherTypeName.Contains(type, StringComparison.OrdinalIgnoreCase));
    }

    private object ConvertToClient(TallyLedger ledger)
    {
        return new
        {
            id = Guid.NewGuid().ToString(),
            name = ledger.Name,
            alias = ledger.Alias,
            category = DetermineClientCategory(ledger),
            contactPerson = "",
            email = "",
            phone = "",
            address = "",
            creditLimit = Math.Max(0, ledger.ClosingBalance),
            tallyGuid = ledger.GUID,
            lastSynced = DateTime.Now
        };
    }

    private object ConvertToPayment(TallyVoucher voucher)
    {
        return new
        {
            id = Guid.NewGuid().ToString(),
            clientId = "", // Would need to lookup by party name
            amount = Math.Abs(voucher.Entries.Sum(e => e.Amount)),
            dueDate = voucher.Date.AddDays(30), // Default 30 days
            status = "PENDING",
            description = voucher.Narration,
            voucherNumber = voucher.VoucherNumber,
            voucherType = voucher.VoucherTypeName,
            tallyGuid = voucher.GUID,
            lastSynced = DateTime.Now
        };
    }

    private object ConvertToOrder(TallyVoucher voucher)
    {
        return new
        {
            id = Guid.NewGuid().ToString(),
            clientId = "", // Would need to lookup by party name
            orderNumber = voucher.VoucherNumber,
            totalAmount = Math.Abs(voucher.Entries.Sum(e => e.Amount)),
            status = "PENDING",
            description = voucher.Narration,
            orderDate = voucher.Date,
            tallyGuid = voucher.GUID,
            lastSynced = DateTime.Now
        };
    }

    private object ConvertToProduct(TallyStockItem item)
    {
        return new
        {
            id = Guid.NewGuid().ToString(),
            name = item.Name,
            alias = item.Alias,
            category = item.Category,
            units = item.BaseUnits,
            stock = item.ClosingBalance,
            value = item.ClosingValue,
            tallyGuid = item.GUID,
            lastSynced = DateTime.Now
        };
    }

    private string DetermineClientCategory(TallyLedger ledger)
    {
        // Simple categorization based on closing balance
        var balance = Math.Abs(ledger.ClosingBalance);
        return balance switch
        {
            > 1000000 => "ALFA",
            > 500000 => "BETA",
            > 100000 => "GAMMA",
            _ => "DELTA"
        };
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}