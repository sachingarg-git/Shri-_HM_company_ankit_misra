using Microsoft.Extensions.Logging;

namespace TallySync.Services;

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error
}

public class NotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public void ShowNotification(string title, string message, NotificationType type = NotificationType.Info)
    {
        try
        {
            var icon = type switch
            {
                NotificationType.Success => ToolTipIcon.Info,
                NotificationType.Warning => ToolTipIcon.Warning,
                NotificationType.Error => ToolTipIcon.Error,
                _ => ToolTipIcon.Info
            };

            // This would be implemented by the main form's NotifyIcon
            NotificationRequested?.Invoke(this, new NotificationEventArgs
            {
                Title = title,
                Message = message,
                Type = type,
                Icon = icon
            });

            _logger.LogInformation($"Notification: {type} - {title}: {message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to show notification");
        }
    }

    public event EventHandler<NotificationEventArgs>? NotificationRequested;
}

public class NotificationEventArgs : EventArgs
{
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public NotificationType Type { get; set; }
    public ToolTipIcon Icon { get; set; }
}