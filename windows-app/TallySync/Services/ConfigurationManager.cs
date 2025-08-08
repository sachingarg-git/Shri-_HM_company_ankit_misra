using System.Text.Json;
using Microsoft.Extensions.Logging;
using TallySync.Models;

namespace TallySync.Services;

public class ConfigurationManager
{
    private readonly ILogger<ConfigurationManager> _logger;
    private readonly string _configFilePath;
    private TallyConfig? _currentConfig;

    public ConfigurationManager(ILogger<ConfigurationManager> logger)
    {
        _logger = logger;
        var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var appFolder = Path.Combine(appDataPath, "TallySync");
        Directory.CreateDirectory(appFolder);
        _configFilePath = Path.Combine(appFolder, "config.json");
    }

    public TallyConfig GetConfiguration()
    {
        if (_currentConfig != null)
            return _currentConfig;

        if (File.Exists(_configFilePath))
        {
            try
            {
                var json = File.ReadAllText(_configFilePath);
                _currentConfig = JsonSerializer.Deserialize<TallyConfig>(json) ?? new TallyConfig();
                _logger.LogInformation("Configuration loaded from file");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load configuration file");
                _currentConfig = new TallyConfig();
            }
        }
        else
        {
            _currentConfig = new TallyConfig();
            _logger.LogInformation("Created new default configuration");
        }

        return _currentConfig;
    }

    public void SaveConfiguration(TallyConfig config)
    {
        try
        {
            var options = new JsonSerializerOptions
            {
                WriteIndented = true
            };
            var json = JsonSerializer.Serialize(config, options);
            File.WriteAllText(_configFilePath, json);
            _currentConfig = config;
            _logger.LogInformation("Configuration saved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save configuration");
            throw;
        }
    }

    public bool IsConfigurationValid()
    {
        var config = GetConfiguration();
        return !string.IsNullOrWhiteSpace(config.TallyServerUrl) &&
               !string.IsNullOrWhiteSpace(config.CompanyName) &&
               !string.IsNullOrWhiteSpace(config.WebApiUrl) &&
               !string.IsNullOrWhiteSpace(config.ApiKey);
    }

    public void ResetConfiguration()
    {
        _currentConfig = new TallyConfig();
        SaveConfiguration(_currentConfig);
        _logger.LogInformation("Configuration reset to defaults");
    }

    public void SetAutoStartWithWindows(bool enable)
    {
        try
        {
            var startupPath = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
            var shortcutPath = Path.Combine(startupPath, "TallySync.lnk");

            if (enable)
            {
                // Create startup shortcut
                var appPath = Application.ExecutablePath;
                CreateShortcut(shortcutPath, appPath);
                _logger.LogInformation("Auto-start enabled");
            }
            else
            {
                // Remove startup shortcut
                if (File.Exists(shortcutPath))
                {
                    File.Delete(shortcutPath);
                    _logger.LogInformation("Auto-start disabled");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update auto-start setting");
        }
    }

    private void CreateShortcut(string shortcutPath, string targetPath)
    {
        // Simple shortcut creation - in real implementation you might use COM objects
        // For now, this is a placeholder that would need proper Windows API calls
        _logger.LogWarning("Shortcut creation not fully implemented - would require Windows API");
    }
}