using Microsoft.Extensions.Logging;
using TallySync.Models;
using TallySync.Services;

namespace TallySync.Forms;

public partial class ConfigurationForm : Form
{
    private readonly ILogger<ConfigurationForm> _logger;
    private readonly ConfigurationManager _configManager;
    private readonly TallyConnector _tallyConnector;
    private readonly WebApiClient _webApiClient;
    private TallyConfig _config;

    public ConfigurationForm(
        ILogger<ConfigurationForm> logger,
        ConfigurationManager configManager,
        TallyConnector tallyConnector,
        WebApiClient webApiClient)
    {
        _logger = logger;
        _configManager = configManager;
        _tallyConnector = tallyConnector;
        _webApiClient = webApiClient;
        _config = _configManager.GetConfiguration();
        
        InitializeComponent();
        LoadCurrentConfiguration();
    }

    private void InitializeComponent()
    {
        Text = "Tally Sync Configuration";
        Size = new Size(600, 500);
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;

        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 3,
            Padding = new Padding(20)
        };

        // Configuration tabs
        var tabControl = new TabControl
        {
            Dock = DockStyle.Fill,
            Name = "ConfigTabs"
        };

        tabControl.TabPages.Add(CreateConnectionTab());
        tabControl.TabPages.Add(CreateSyncTab());
        tabControl.TabPages.Add(CreateAdvancedTab());

        // Button panel
        var buttonPanel = CreateButtonPanel();

        mainPanel.Controls.Add(tabControl, 0, 0);
        mainPanel.Controls.Add(buttonPanel, 0, 1);

        mainPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        mainPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 60));

        Controls.Add(mainPanel);
    }

    private TabPage CreateConnectionTab()
    {
        var tab = new TabPage("Connection");
        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 6,
            Padding = new Padding(10)
        };

        // Tally Server
        var tallyLabel = new Label { Text = "Tally Server URL:", Anchor = AnchorStyles.Left };
        var tallyTextBox = new TextBox { Name = "TallyServerUrl", Anchor = AnchorStyles.Left | AnchorStyles.Right, Width = 300 };
        var tallyTestButton = new Button { Text = "Test", Name = "TestTallyButton", Width = 60 };
        tallyTestButton.Click += TestTallyButton_Click;

        var tallyPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, Dock = DockStyle.Fill };
        tallyPanel.Controls.Add(tallyTextBox);
        tallyPanel.Controls.Add(tallyTestButton);

        // Company Name
        var companyLabel = new Label { Text = "Company Name:", Anchor = AnchorStyles.Left };
        var companyTextBox = new TextBox { Name = "CompanyName", Anchor = AnchorStyles.Left | AnchorStyles.Right, Width = 300 };

        // Web API URL
        var apiLabel = new Label { Text = "Web API URL:", Anchor = AnchorStyles.Left };
        var apiTextBox = new TextBox { Name = "WebApiUrl", Anchor = AnchorStyles.Left | AnchorStyles.Right, Width = 300 };
        var apiTestButton = new Button { Text = "Test", Name = "TestApiButton", Width = 60 };
        apiTestButton.Click += TestApiButton_Click;

        var apiPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, Dock = DockStyle.Fill };
        apiPanel.Controls.Add(apiTextBox);
        apiPanel.Controls.Add(apiTestButton);

        // API Key
        var keyLabel = new Label { Text = "API Key:", Anchor = AnchorStyles.Left };
        var keyTextBox = new TextBox { Name = "ApiKey", Anchor = AnchorStyles.Left | AnchorStyles.Right, Width = 300, UseSystemPasswordChar = true };

        layout.Controls.Add(tallyLabel, 0, 0);
        layout.Controls.Add(tallyPanel, 1, 0);
        layout.Controls.Add(companyLabel, 0, 1);
        layout.Controls.Add(companyTextBox, 1, 1);
        layout.Controls.Add(apiLabel, 0, 2);
        layout.Controls.Add(apiPanel, 1, 2);
        layout.Controls.Add(keyLabel, 0, 3);
        layout.Controls.Add(keyTextBox, 1, 3);

        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 30));
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 70));

        tab.Controls.Add(layout);
        return tab;
    }

    private TabPage CreateSyncTab()
    {
        var tab = new TabPage("Sync Settings");
        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 4,
            Padding = new Padding(10)
        };

        // Sync Mode
        var modeLabel = new Label { Text = "Sync Mode:", Anchor = AnchorStyles.Left };
        var modePanel = new Panel { Dock = DockStyle.Fill };
        var realtimeRadio = new RadioButton { Text = "Real-time", Name = "RealtimeMode", AutoSize = true };
        var scheduledRadio = new RadioButton { Text = "Scheduled", Name = "ScheduledMode", AutoSize = true, Top = 25 };
        modePanel.Controls.Add(realtimeRadio);
        modePanel.Controls.Add(scheduledRadio);

        // Sync Interval
        var intervalLabel = new Label { Text = "Sync Interval (minutes):", Anchor = AnchorStyles.Left };
        var intervalNumeric = new NumericUpDown 
        { 
            Name = "SyncInterval", 
            Minimum = 1, 
            Maximum = 1440, 
            Value = 15,
            Width = 100 
        };

        // Last Sync
        var lastSyncLabel = new Label { Text = "Last Sync:", Anchor = AnchorStyles.Left };
        var lastSyncValue = new Label { Name = "LastSyncDisplay", Text = "Never", Anchor = AnchorStyles.Left };

        layout.Controls.Add(modeLabel, 0, 0);
        layout.Controls.Add(modePanel, 1, 0);
        layout.Controls.Add(intervalLabel, 0, 1);
        layout.Controls.Add(intervalNumeric, 1, 1);
        layout.Controls.Add(lastSyncLabel, 0, 2);
        layout.Controls.Add(lastSyncValue, 1, 2);

        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 40));
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 60));

        tab.Controls.Add(layout);
        return tab;
    }

    private TabPage CreateAdvancedTab()
    {
        var tab = new TabPage("Advanced");
        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 4,
            Padding = new Padding(10)
        };

        // Checkboxes
        var autoStartCheckBox = new CheckBox 
        { 
            Text = "Start with Windows", 
            Name = "AutoStartCheckBox",
            AutoSize = true 
        };

        var minimizeCheckBox = new CheckBox 
        { 
            Text = "Minimize to system tray", 
            Name = "MinimizeCheckBox",
            AutoSize = true 
        };

        // Reset button
        var resetButton = new Button 
        { 
            Text = "Reset to Defaults", 
            Name = "ResetButton",
            AutoSize = true 
        };
        resetButton.Click += ResetButton_Click;

        layout.Controls.Add(autoStartCheckBox, 0, 0);
        layout.Controls.Add(minimizeCheckBox, 0, 1);
        layout.Controls.Add(resetButton, 0, 3);

        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 40));

        tab.Controls.Add(layout);
        return tab;
    }

    private Panel CreateButtonPanel()
    {
        var panel = new Panel { Dock = DockStyle.Fill };
        var layout = new FlowLayoutPanel 
        { 
            Dock = DockStyle.Fill, 
            FlowDirection = FlowDirection.RightToLeft,
            Padding = new Padding(10)
        };

        var cancelButton = new Button 
        { 
            Text = "Cancel", 
            DialogResult = DialogResult.Cancel,
            Size = new Size(80, 30) 
        };

        var saveButton = new Button 
        { 
            Text = "Save", 
            DialogResult = DialogResult.OK,
            Size = new Size(80, 30) 
        };
        saveButton.Click += SaveButton_Click;

        layout.Controls.Add(cancelButton);
        layout.Controls.Add(saveButton);
        panel.Controls.Add(layout);
        return panel;
    }

    private void LoadCurrentConfiguration()
    {
        // Connection tab
        var tallyUrlTextBox = Controls.Find("TallyServerUrl", true).FirstOrDefault() as TextBox;
        if (tallyUrlTextBox != null) tallyUrlTextBox.Text = _config.TallyServerUrl;

        var companyTextBox = Controls.Find("CompanyName", true).FirstOrDefault() as TextBox;
        if (companyTextBox != null) companyTextBox.Text = _config.CompanyName;

        var apiUrlTextBox = Controls.Find("WebApiUrl", true).FirstOrDefault() as TextBox;
        if (apiUrlTextBox != null) apiUrlTextBox.Text = _config.WebApiUrl;

        var apiKeyTextBox = Controls.Find("ApiKey", true).FirstOrDefault() as TextBox;
        if (apiKeyTextBox != null) apiKeyTextBox.Text = _config.ApiKey;

        // Sync tab
        var realtimeRadio = Controls.Find("RealtimeMode", true).FirstOrDefault() as RadioButton;
        var scheduledRadio = Controls.Find("ScheduledMode", true).FirstOrDefault() as RadioButton;
        if (realtimeRadio != null && scheduledRadio != null)
        {
            if (_config.SyncMode == SyncMode.Realtime)
                realtimeRadio.Checked = true;
            else
                scheduledRadio.Checked = true;
        }

        var intervalNumeric = Controls.Find("SyncInterval", true).FirstOrDefault() as NumericUpDown;
        if (intervalNumeric != null) intervalNumeric.Value = _config.SyncIntervalMinutes;

        var lastSyncLabel = Controls.Find("LastSyncDisplay", true).FirstOrDefault() as Label;
        if (lastSyncLabel != null)
        {
            lastSyncLabel.Text = _config.LastSyncTime == DateTime.MinValue 
                ? "Never" 
                : _config.LastSyncTime.ToString("yyyy-MM-dd HH:mm:ss");
        }

        // Advanced tab
        var autoStartCheckBox = Controls.Find("AutoStartCheckBox", true).FirstOrDefault() as CheckBox;
        if (autoStartCheckBox != null) autoStartCheckBox.Checked = _config.AutoStartWithWindows;

        var minimizeCheckBox = Controls.Find("MinimizeCheckBox", true).FirstOrDefault() as CheckBox;
        if (minimizeCheckBox != null) minimizeCheckBox.Checked = _config.MinimizeToTray;
    }

    private async void TestTallyButton_Click(object? sender, EventArgs e)
    {
        var tallyUrlTextBox = Controls.Find("TallyServerUrl", true).FirstOrDefault() as TextBox;
        var companyTextBox = Controls.Find("CompanyName", true).FirstOrDefault() as TextBox;
        var button = sender as Button;

        if (tallyUrlTextBox == null || companyTextBox == null || button == null) return;

        button.Enabled = false;
        button.Text = "Testing...";

        try
        {
            var success = await _tallyConnector.TestConnectionAsync(tallyUrlTextBox.Text, companyTextBox.Text);
            MessageBox.Show(
                success ? "Connection successful!" : "Connection failed. Please check your settings.",
                "Tally Connection Test",
                MessageBoxButtons.OK,
                success ? MessageBoxIcon.Information : MessageBoxIcon.Error);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Connection failed: {ex.Message}", "Connection Error", 
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            button.Enabled = true;
            button.Text = "Test";
        }
    }

    private async void TestApiButton_Click(object? sender, EventArgs e)
    {
        var apiUrlTextBox = Controls.Find("WebApiUrl", true).FirstOrDefault() as TextBox;
        var apiKeyTextBox = Controls.Find("ApiKey", true).FirstOrDefault() as TextBox;
        var button = sender as Button;

        if (apiUrlTextBox == null || apiKeyTextBox == null || button == null) return;

        button.Enabled = false;
        button.Text = "Testing...";

        try
        {
            var success = await _webApiClient.TestConnectionAsync(apiUrlTextBox.Text, apiKeyTextBox.Text);
            MessageBox.Show(
                success ? "API connection successful!" : "API connection failed. Please check your settings.",
                "Web API Connection Test",
                MessageBoxButtons.OK,
                success ? MessageBoxIcon.Information : MessageBoxIcon.Error);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"API connection failed: {ex.Message}", "Connection Error", 
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            button.Enabled = true;
            button.Text = "Test";
        }
    }

    private void ResetButton_Click(object? sender, EventArgs e)
    {
        var result = MessageBox.Show(
            "Are you sure you want to reset all settings to defaults?",
            "Reset Configuration",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Question);

        if (result == DialogResult.Yes)
        {
            _configManager.ResetConfiguration();
            _config = _configManager.GetConfiguration();
            LoadCurrentConfiguration();
            MessageBox.Show("Settings have been reset to defaults.", "Reset Complete", 
                MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    private void SaveButton_Click(object? sender, EventArgs e)
    {
        try
        {
            // Collect values from form controls
            var tallyUrlTextBox = Controls.Find("TallyServerUrl", true).FirstOrDefault() as TextBox;
            var companyTextBox = Controls.Find("CompanyName", true).FirstOrDefault() as TextBox;
            var apiUrlTextBox = Controls.Find("WebApiUrl", true).FirstOrDefault() as TextBox;
            var apiKeyTextBox = Controls.Find("ApiKey", true).FirstOrDefault() as TextBox;
            var realtimeRadio = Controls.Find("RealtimeMode", true).FirstOrDefault() as RadioButton;
            var intervalNumeric = Controls.Find("SyncInterval", true).FirstOrDefault() as NumericUpDown;
            var autoStartCheckBox = Controls.Find("AutoStartCheckBox", true).FirstOrDefault() as CheckBox;
            var minimizeCheckBox = Controls.Find("MinimizeCheckBox", true).FirstOrDefault() as CheckBox;

            // Validate required fields
            if (string.IsNullOrWhiteSpace(tallyUrlTextBox?.Text) ||
                string.IsNullOrWhiteSpace(companyTextBox?.Text) ||
                string.IsNullOrWhiteSpace(apiUrlTextBox?.Text) ||
                string.IsNullOrWhiteSpace(apiKeyTextBox?.Text))
            {
                MessageBox.Show("Please fill in all required fields.", "Validation Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Update configuration
            _config.TallyServerUrl = tallyUrlTextBox.Text.Trim();
            _config.CompanyName = companyTextBox.Text.Trim();
            _config.WebApiUrl = apiUrlTextBox.Text.Trim();
            _config.ApiKey = apiKeyTextBox.Text.Trim();
            _config.SyncMode = realtimeRadio?.Checked == true ? SyncMode.Realtime : SyncMode.Scheduled;
            _config.SyncIntervalMinutes = (int)(intervalNumeric?.Value ?? 15);
            _config.AutoStartWithWindows = autoStartCheckBox?.Checked ?? false;
            _config.MinimizeToTray = minimizeCheckBox?.Checked ?? true;

            // Save configuration
            _configManager.SaveConfiguration(_config);
            _configManager.SetAutoStartWithWindows(_config.AutoStartWithWindows);

            MessageBox.Show("Configuration saved successfully!", "Save Complete", 
                MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save configuration");
            MessageBox.Show($"Failed to save configuration: {ex.Message}", "Save Error", 
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}