using Microsoft.Extensions.Logging;
using TallySync.Models;

namespace TallySync.Services;

public class SyncService
{
    private readonly ILogger<SyncService> _logger;
    private readonly TallyConnector _tallyConnector;
    private readonly WebApiClient _webApiClient;
    private readonly ConfigurationManager _configManager;
    private readonly NotificationService _notificationService;
    private readonly System.Timers.Timer _syncTimer;
    private bool _isRunning;
    private bool _isSyncing;

    public event EventHandler<SyncResult>? SyncCompleted;
    public event EventHandler<string>? StatusChanged;

    public bool IsRunning => _isRunning;
    public bool IsSyncing => _isSyncing;

    public SyncService(
        ILogger<SyncService> logger,
        TallyConnector tallyConnector,
        WebApiClient webApiClient,
        ConfigurationManager configManager,
        NotificationService notificationService)
    {
        _logger = logger;
        _tallyConnector = tallyConnector;
        _webApiClient = webApiClient;
        _configManager = configManager;
        _notificationService = notificationService;
        
        _syncTimer = new System.Timers.Timer();
        _syncTimer.Elapsed += async (sender, e) => await PerformScheduledSyncAsync();
        _syncTimer.AutoReset = true;
    }

    public void Start()
    {
        if (_isRunning) return;

        var config = _configManager.GetConfiguration();
        
        if (config.SyncMode == SyncMode.Scheduled)
        {
            _syncTimer.Interval = TimeSpan.FromMinutes(config.SyncIntervalMinutes).TotalMilliseconds;
            _syncTimer.Start();
            _logger.LogInformation($"Scheduled sync started with {config.SyncIntervalMinutes} minute intervals");
        }
        else
        {
            // For real-time mode, we would typically use file watchers or polling
            _syncTimer.Interval = TimeSpan.FromMinutes(1).TotalMilliseconds; // Check every minute for changes
            _syncTimer.Start();
            _logger.LogInformation("Real-time sync monitoring started");
        }

        _isRunning = true;
        StatusChanged?.Invoke(this, "Sync service started");
        _notificationService.ShowNotification("Tally Sync", "Synchronization service started", NotificationType.Success);
    }

    public void Stop()
    {
        if (!_isRunning) return;

        _syncTimer.Stop();
        _isRunning = false;
        StatusChanged?.Invoke(this, "Sync service stopped");
        _notificationService.ShowNotification("Tally Sync", "Synchronization service stopped", NotificationType.Info);
        _logger.LogInformation("Sync service stopped");
    }

    public async Task<SyncResult> PerformManualSyncAsync()
    {
        if (_isSyncing)
        {
            return new SyncResult
            {
                Success = false,
                Message = "Sync already in progress"
            };
        }

        return await PerformSyncAsync(isManual: true);
    }

    private async Task PerformScheduledSyncAsync()
    {
        if (_isSyncing) return;
        await PerformSyncAsync(isManual: false);
    }

    private async Task<SyncResult> PerformSyncAsync(bool isManual)
    {
        _isSyncing = true;
        var startTime = DateTime.Now;
        var result = new SyncResult { SyncTime = startTime };
        
        try
        {
            StatusChanged?.Invoke(this, "Synchronization started");
            _logger.LogInformation($"Starting {(isManual ? "manual" : "scheduled")} sync");

            var config = _configManager.GetConfiguration();

            // Test connections first
            var tallyConnected = await _tallyConnector.TestConnectionAsync(config.TallyServerUrl, config.CompanyName);
            if (!tallyConnected)
            {
                throw new Exception("Failed to connect to Tally server");
            }

            var apiConnected = await _webApiClient.TestConnectionAsync(config.WebApiUrl, config.ApiKey);
            if (!apiConnected)
            {
                throw new Exception("Failed to connect to Web API");
            }

            // Determine sync date range
            var fromDate = config.LastSyncTime == DateTime.MinValue ? DateTime.Today.AddDays(-30) : config.LastSyncTime;
            var toDate = DateTime.Today;

            // Sync Ledgers (Clients)
            StatusChanged?.Invoke(this, "Syncing clients...");
            var ledgers = await _tallyConnector.GetLedgersAsync(config.TallyServerUrl, config.CompanyName);
            if (ledgers.Any())
            {
                var ledgerResult = await _webApiClient.SyncLedgersAsync(config.WebApiUrl, config.ApiKey, ledgers);
                if (!ledgerResult.Success)
                {
                    result.Errors.Add($"Ledger sync failed: {ledgerResult.Message}");
                }
                else
                {
                    result.RecordsProcessed += ledgers.Count;
                    result.RecordsSuccess += ledgers.Count;
                }
            }

            // Sync Vouchers (Payments/Orders)
            StatusChanged?.Invoke(this, "Syncing transactions...");
            var vouchers = await _tallyConnector.GetVouchersAsync(config.TallyServerUrl, config.CompanyName, fromDate, toDate);
            if (vouchers.Any())
            {
                var voucherResult = await _webApiClient.SyncVouchersAsync(config.WebApiUrl, config.ApiKey, vouchers);
                if (!voucherResult.Success)
                {
                    result.Errors.Add($"Voucher sync failed: {voucherResult.Message}");
                }
                else
                {
                    result.RecordsProcessed += vouchers.Count;
                    result.RecordsSuccess += vouchers.Count;
                }
            }

            // Sync Stock Items (if applicable)
            StatusChanged?.Invoke(this, "Syncing inventory...");
            var stockItems = await _tallyConnector.GetStockItemsAsync(config.TallyServerUrl, config.CompanyName);
            if (stockItems.Any())
            {
                var stockResult = await _webApiClient.SyncStockItemsAsync(config.WebApiUrl, config.ApiKey, stockItems);
                if (!stockResult.Success)
                {
                    result.Errors.Add($"Stock sync failed: {stockResult.Message}");
                }
                else
                {
                    result.RecordsProcessed += stockItems.Count;
                    result.RecordsSuccess += stockItems.Count;
                }
            }

            // Update last sync time
            config.LastSyncTime = DateTime.Now;
            _configManager.SaveConfiguration(config);

            result.Success = result.Errors.Count == 0;
            result.RecordsError = result.RecordsProcessed - result.RecordsSuccess;
            result.Message = result.Success 
                ? $"Sync completed successfully. Processed {result.RecordsProcessed} records."
                : $"Sync completed with {result.Errors.Count} errors.";

            var notificationType = result.Success ? NotificationType.Success : NotificationType.Warning;
            _notificationService.ShowNotification("Tally Sync", result.Message, notificationType);

            _logger.LogInformation($"Sync completed: {result.Message}");
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Sync failed: {ex.Message}";
            result.Errors.Add(ex.Message);
            
            _logger.LogError(ex, "Sync operation failed");
            _notificationService.ShowNotification("Tally Sync", result.Message, NotificationType.Error);
        }
        finally
        {
            result.Duration = DateTime.Now - startTime;
            _isSyncing = false;
            StatusChanged?.Invoke(this, result.Success ? "Sync completed" : "Sync failed");
            SyncCompleted?.Invoke(this, result);
        }

        return result;
    }

    public void UpdateSyncInterval(int minutes)
    {
        if (_isRunning && _syncTimer != null)
        {
            _syncTimer.Interval = TimeSpan.FromMinutes(minutes).TotalMilliseconds;
            _logger.LogInformation($"Sync interval updated to {minutes} minutes");
        }
    }

    public void Dispose()
    {
        Stop();
        _syncTimer?.Dispose();
    }
}