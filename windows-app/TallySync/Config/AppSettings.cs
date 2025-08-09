using System;

namespace TallySync.Config
{
    public class AppSettings
    {
        public TallySettings Tally { get; set; } = new();
        public ApiSettings Api { get; set; } = new();
        public SyncSettings Sync { get; set; } = new();
        public LoggingSettings Logging { get; set; } = new();
    }

    public class TallySettings
    {
        public string GatewayUrl { get; set; } = "http://localhost:9000";
        public int TimeoutSeconds { get; set; } = 30;
        public DateTime FromDate { get; set; } = DateTime.Today.AddMonths(-1);
        public DateTime ToDate { get; set; } = DateTime.Today;
    }

    public class ApiSettings
    {
        public string BaseUrl { get; set; } = "";
        public string ApiKey { get; set; } = "";
        public int BatchSize { get; set; } = 100;
        public int MaxRetries { get; set; } = 5;
        public int TimeoutSeconds { get; set; } = 60;
    }

    public class SyncSettings
    {
        public int IntervalMinutes { get; set; } = 5;
        public bool AutoStart { get; set; } = false;
        public bool SyncMasters { get; set; } = true;
        public bool SyncVouchers { get; set; } = true;
    }

    public class LoggingSettings
    {
        public string LogLevel { get; set; } = "Information";
        public string FilePath { get; set; } = "logs/app.log";
        public long MaxFileSizeBytes { get; set; } = 10485760; // 10MB
    }
}