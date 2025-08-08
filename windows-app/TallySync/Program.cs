using TallySync.Forms;
using TallySync.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace TallySync;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        
        // Check if another instance is already running
        bool createdNew;
        using var mutex = new Mutex(true, "TallySyncApp", out createdNew);
        
        if (!createdNew)
        {
            MessageBox.Show("Tally Sync is already running. Check system tray.", 
                "Already Running", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        // Configure services
        var services = new ServiceCollection();
        ConfigureServices(services);
        var serviceProvider = services.BuildServiceProvider();

        // Start the application
        var mainForm = serviceProvider.GetRequiredService<MainForm>();
        Application.Run(mainForm);
    }

    private static void ConfigureServices(ServiceCollection services)
    {
        // Logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.AddDebug();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        // Core services
        services.AddSingleton<TallyConnector>();
        services.AddSingleton<WebApiClient>();
        services.AddSingleton<SyncService>();
        services.AddSingleton<ConfigurationManager>();
        services.AddSingleton<NotificationService>();

        // Forms
        services.AddTransient<MainForm>();
        services.AddTransient<ConfigurationForm>();
        services.AddTransient<LogViewerForm>();
    }
}