using Microsoft.Extensions.Logging;
using TallySync.Models;
using TallySync.Services;

namespace TallySync.Forms;

public partial class MainForm : Form
{
    private readonly ILogger<MainForm> _logger;
    private readonly SyncService _syncService;
    private readonly ConfigurationManager _configManager;
    private readonly NotificationService _notificationService;
    private readonly ConfigurationForm _configurationForm;
    private readonly LogViewerForm _logViewerForm;
    
    private NotifyIcon? _notifyIcon;
    private ContextMenuStrip? _contextMenu;
    private bool _isClosing;

    public MainForm(
        ILogger<MainForm> logger,
        SyncService syncService,
        ConfigurationManager configManager,
        NotificationService notificationService,
        ConfigurationForm configurationForm,
        LogViewerForm logViewerForm)
    {
        _logger = logger;
        _syncService = syncService;
        _configManager = configManager;
        _notificationService = notificationService;
        _configurationForm = configurationForm;
        _logViewerForm = logViewerForm;
        
        InitializeComponent();
        InitializeSystemTray();
        InitializeEvents();
        LoadConfiguration();
    }

    private void InitializeComponent()
    {
        // Form setup
        Text = "Tally Sync Service";
        Size = new Size(800, 600);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        Icon = SystemIcons.Application;

        // Main panel
        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 4,
            Padding = new Padding(20)
        };

        // Header
        var headerLabel = new Label
        {
            Text = "Tally Sync Service",
            Font = new Font("Segoe UI", 16, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleCenter,
            Dock = DockStyle.Fill,
            Height = 50
        };

        // Status panel
        var statusPanel = CreateStatusPanel();
        
        // Control panel
        var controlPanel = CreateControlPanel();
        
        // Log panel
        var logPanel = CreateLogPanel();

        mainPanel.Controls.Add(headerLabel, 0, 0);
        mainPanel.Controls.Add(statusPanel, 0, 1);
        mainPanel.Controls.Add(controlPanel, 0, 2);
        mainPanel.Controls.Add(logPanel, 0, 3);

        mainPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 60));
        mainPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 120));
        mainPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 80));
        mainPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        Controls.Add(mainPanel);
    }

    private Panel CreateStatusPanel()
    {
        var panel = new Panel
        {
            Dock = DockStyle.Fill,
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(10)
        };

        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 3
        };

        // Status labels
        var statusLabel = new Label { Text = "Status:", Font = new Font("Segoe UI", 9, FontStyle.Bold) };
        var statusValue = new Label { Text = "Stopped", Name = "StatusValue", ForeColor = Color.Red };

        var lastSyncLabel = new Label { Text = "Last Sync:", Font = new Font("Segoe UI", 9, FontStyle.Bold) };
        var lastSyncValue = new Label { Text = "Never", Name = "LastSyncValue" };

        var nextSyncLabel = new Label { Text = "Next Sync:", Font = new Font("Segoe UI", 9, FontStyle.Bold) };
        var nextSyncValue = new Label { Text = "N/A", Name = "NextSyncValue" };

        layout.Controls.Add(statusLabel, 0, 0);
        layout.Controls.Add(statusValue, 1, 0);
        layout.Controls.Add(lastSyncLabel, 0, 1);
        layout.Controls.Add(lastSyncValue, 1, 1);
        layout.Controls.Add(nextSyncLabel, 0, 2);
        layout.Controls.Add(nextSyncValue, 1, 2);

        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 30));
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 70));

        panel.Controls.Add(layout);
        return panel;
    }

    private Panel CreateControlPanel()
    {
        var panel = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(10)
        };

        var layout = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.LeftToRight,
            WrapContents = false
        };

        var startStopButton = new Button
        {
            Text = "Start Service",
            Name = "StartStopButton",
            Size = new Size(120, 35),
            UseVisualStyleBackColor = true,
            Margin = new Padding(0, 0, 10, 0)
        };
        startStopButton.Click += StartStopButton_Click;

        var syncNowButton = new Button
        {
            Text = "Sync Now",
            Name = "SyncNowButton",
            Size = new Size(100, 35),
            UseVisualStyleBackColor = true,
            Margin = new Padding(0, 0, 10, 0)
        };
        syncNowButton.Click += SyncNowButton_Click;

        var configButton = new Button
        {
            Text = "Settings",
            Size = new Size(100, 35),
            UseVisualStyleBackColor = true,
            Margin = new Padding(0, 0, 10, 0)
        };
        configButton.Click += ConfigButton_Click;

        var logButton = new Button
        {
            Text = "View Logs",
            Size = new Size(100, 35),
            UseVisualStyleBackColor = true
        };
        logButton.Click += LogButton_Click;

        layout.Controls.Add(startStopButton);
        layout.Controls.Add(syncNowButton);
        layout.Controls.Add(configButton);
        layout.Controls.Add(logButton);

        panel.Controls.Add(layout);
        return panel;
    }

    private Panel CreateLogPanel()
    {
        var panel = new Panel
        {
            Dock = DockStyle.Fill,
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(5)
        };

        var logTextBox = new RichTextBox
        {
            Name = "LogTextBox",
            Dock = DockStyle.Fill,
            ReadOnly = true,
            BackColor = Color.Black,
            ForeColor = Color.LightGreen,
            Font = new Font("Consolas", 9),
            ScrollBars = RichTextBoxScrollBars.Vertical
        };

        panel.Controls.Add(logTextBox);
        return panel;
    }

    private void InitializeSystemTray()
    {
        _contextMenu = new ContextMenuStrip();
        _contextMenu.Items.Add("Show", null, (s, e) => ShowMainWindow());
        _contextMenu.Items.Add("Start Service", null, (s, e) => StartStopButton_Click(s, e));
        _contextMenu.Items.Add("Sync Now", null, (s, e) => SyncNowButton_Click(s, e));
        _contextMenu.Items.Add("-");
        _contextMenu.Items.Add("Settings", null, (s, e) => ConfigButton_Click(s, e));
        _contextMenu.Items.Add("-");
        _contextMenu.Items.Add("Exit", null, (s, e) => ExitApplication());

        _notifyIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Text = "Tally Sync Service",
            ContextMenuStrip = _contextMenu,
            Visible = true
        };
        _notifyIcon.DoubleClick += (s, e) => ShowMainWindow();
    }

    private void InitializeEvents()
    {
        _syncService.StatusChanged += OnSyncStatusChanged;
        _syncService.SyncCompleted += OnSyncCompleted;
        _notificationService.NotificationRequested += OnNotificationRequested;

        FormClosing += MainForm_FormClosing;
        WindowState = FormWindowState.Minimized;
        ShowInTaskbar = false;
    }

    private void LoadConfiguration()
    {
        var config = _configManager.GetConfiguration();
        UpdateUI();
        
        if (config.MinimizeToTray)
        {
            WindowState = FormWindowState.Minimized;
            Hide();
        }

        AddLogMessage($"Application started. Configuration loaded.");
    }

    private void StartStopButton_Click(object? sender, EventArgs e)
    {
        var button = Controls.Find("StartStopButton", true).FirstOrDefault() as Button;
        if (button == null) return;

        if (_syncService.IsRunning)
        {
            _syncService.Stop();
            button.Text = "Start Service";
        }
        else
        {
            if (!_configManager.IsConfigurationValid())
            {
                MessageBox.Show("Please configure the application settings first.", "Configuration Required", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                ConfigButton_Click(sender, e);
                return;
            }

            _syncService.Start();
            button.Text = "Stop Service";
        }
    }

    private async void SyncNowButton_Click(object? sender, EventArgs e)
    {
        if (!_configManager.IsConfigurationValid())
        {
            MessageBox.Show("Please configure the application settings first.", "Configuration Required", 
                MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var syncButton = Controls.Find("SyncNowButton", true).FirstOrDefault() as Button;
        if (syncButton != null)
        {
            syncButton.Enabled = false;
            syncButton.Text = "Syncing...";
        }

        try
        {
            var result = await _syncService.PerformManualSyncAsync();
            var message = result.Success ? 
                $"Sync completed successfully!\n\nProcessed: {result.RecordsProcessed} records\nDuration: {result.Duration.TotalSeconds:F1} seconds" :
                $"Sync failed!\n\nError: {result.Message}";
            
            MessageBox.Show(message, "Sync Result", MessageBoxButtons.OK, 
                result.Success ? MessageBoxIcon.Information : MessageBoxIcon.Error);
        }
        finally
        {
            if (syncButton != null)
            {
                syncButton.Enabled = true;
                syncButton.Text = "Sync Now";
            }
        }
    }

    private void ConfigButton_Click(object? sender, EventArgs e)
    {
        _configurationForm.ShowDialog();
        UpdateUI();
    }

    private void LogButton_Click(object? sender, EventArgs e)
    {
        _logViewerForm.Show();
    }

    private void OnSyncStatusChanged(object? sender, string status)
    {
        BeginInvoke(() =>
        {
            var statusLabel = Controls.Find("StatusValue", true).FirstOrDefault() as Label;
            if (statusLabel != null)
            {
                statusLabel.Text = status;
                statusLabel.ForeColor = _syncService.IsRunning ? Color.Green : Color.Red;
            }
            AddLogMessage($"Status: {status}");
        });
    }

    private void OnSyncCompleted(object? sender, SyncResult result)
    {
        BeginInvoke(() =>
        {
            var lastSyncLabel = Controls.Find("LastSyncValue", true).FirstOrDefault() as Label;
            if (lastSyncLabel != null)
            {
                lastSyncLabel.Text = result.SyncTime.ToString("yyyy-MM-dd HH:mm:ss");
            }

            var message = result.Success ? 
                $"Sync completed: {result.RecordsProcessed} records in {result.Duration.TotalSeconds:F1}s" :
                $"Sync failed: {result.Message}";
            
            AddLogMessage(message);
        });
    }

    private void OnNotificationRequested(object? sender, NotificationEventArgs e)
    {
        _notifyIcon?.ShowBalloonTip(3000, e.Title, e.Message, e.Icon);
    }

    private void AddLogMessage(string message)
    {
        var logTextBox = Controls.Find("LogTextBox", true).FirstOrDefault() as RichTextBox;
        if (logTextBox != null)
        {
            var timestamp = DateTime.Now.ToString("HH:mm:ss");
            var logEntry = $"[{timestamp}] {message}\n";
            
            logTextBox.AppendText(logEntry);
            logTextBox.ScrollToCaret();

            // Keep only last 1000 lines
            if (logTextBox.Lines.Length > 1000)
            {
                var lines = logTextBox.Lines.Skip(100).ToArray();
                logTextBox.Lines = lines;
            }
        }
    }

    private void UpdateUI()
    {
        var config = _configManager.GetConfiguration();
        
        var lastSyncLabel = Controls.Find("LastSyncValue", true).FirstOrDefault() as Label;
        if (lastSyncLabel != null && config.LastSyncTime != DateTime.MinValue)
        {
            lastSyncLabel.Text = config.LastSyncTime.ToString("yyyy-MM-dd HH:mm:ss");
        }
    }

    private void ShowMainWindow()
    {
        Show();
        WindowState = FormWindowState.Normal;
        BringToFront();
        Activate();
    }

    private void MainForm_FormClosing(object? sender, FormClosingEventArgs e)
    {
        if (!_isClosing)
        {
            e.Cancel = true;
            Hide();
            return;
        }

        _syncService.Stop();
        _notifyIcon?.Dispose();
    }

    private void ExitApplication()
    {
        _isClosing = true;
        Close();
        Application.Exit();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _notifyIcon?.Dispose();
            _contextMenu?.Dispose();
            _syncService?.Dispose();
        }
        base.Dispose(disposing);
    }
}