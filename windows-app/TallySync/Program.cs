using System;
using System.Windows.Forms;
using TallySync.Forms;
using TallySync.Services;
using TallySync.Config;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace TallySync
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .Build();
            
            // Setup dependency injection
            var services = new ServiceCollection();
            ConfigureServices(services, configuration);
            
            var serviceProvider = services.BuildServiceProvider();
            
            try
            {
                var mainForm = serviceProvider.GetRequiredService<MainForm>();
                Application.Run(mainForm);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Application startup failed: {ex.Message}", "Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                serviceProvider?.Dispose();
            }
        }
        
        private static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            // Configuration
            services.Configure<AppSettings>(configuration.GetSection("AppSettings"));
            
            // Logging
            services.AddLogging(builder =>
            {
                builder.AddConsole();
                builder.AddFile("logs/app.log");
            });
            
            // Services
            services.AddSingleton<ITallyDataService, TallyDataService>();
            services.AddSingleton<IApiService, ApiService>();
            services.AddSingleton<ISyncService, SyncService>();
            services.AddSingleton<IIdempotencyService, IdempotencyService>();
            
            // Forms
            services.AddTransient<MainForm>();
        }
    }
}