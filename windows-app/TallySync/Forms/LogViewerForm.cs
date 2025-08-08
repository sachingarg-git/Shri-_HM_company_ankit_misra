using Microsoft.Extensions.Logging;

namespace TallySync.Forms;

public partial class LogViewerForm : Form
{
    private readonly ILogger<LogViewerForm> _logger;
    private readonly string _logFilePath;

    public LogViewerForm(ILogger<LogViewerForm> logger)
    {
        _logger = logger;
        var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var appFolder = Path.Combine(appDataPath, "TallySync");
        _logFilePath = Path.Combine(appFolder, "logs.txt");
        
        InitializeComponent();
        LoadLogs();
    }

    private void InitializeComponent()
    {
        Text = "Tally Sync Logs";
        Size = new Size(800, 600);
        StartPosition = FormStartPosition.CenterParent;
        Icon = SystemIcons.Information;

        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2,
            Padding = new Padding(10)
        };

        // Log display
        var logTextBox = new RichTextBox
        {
            Name = "LogTextBox",
            Dock = DockStyle.Fill,
            ReadOnly = true,
            BackColor = Color.Black,
            ForeColor = Color.LightGreen,
            Font = new Font("Consolas", 9),
            ScrollBars = RichTextBoxScrollBars.Both,
            WordWrap = false
        };

        // Button panel
        var buttonPanel = new Panel { Height = 50, Dock = DockStyle.Fill };
        var buttonLayout = new FlowLayoutPanel 
        { 
            Dock = DockStyle.Fill, 
            FlowDirection = FlowDirection.LeftToRight,
            Padding = new Padding(5)
        };

        var refreshButton = new Button 
        { 
            Text = "Refresh", 
            Size = new Size(80, 30) 
        };
        refreshButton.Click += RefreshButton_Click;

        var clearButton = new Button 
        { 
            Text = "Clear", 
            Size = new Size(80, 30) 
        };
        clearButton.Click += ClearButton_Click;

        var saveButton = new Button 
        { 
            Text = "Save As...", 
            Size = new Size(80, 30) 
        };
        saveButton.Click += SaveButton_Click;

        var closeButton = new Button 
        { 
            Text = "Close", 
            Size = new Size(80, 30) 
        };
        closeButton.Click += (s, e) => Close();

        buttonLayout.Controls.Add(refreshButton);
        buttonLayout.Controls.Add(clearButton);
        buttonLayout.Controls.Add(saveButton);
        buttonLayout.Controls.Add(closeButton);
        buttonPanel.Controls.Add(buttonLayout);

        mainPanel.Controls.Add(logTextBox, 0, 0);
        mainPanel.Controls.Add(buttonPanel, 0, 1);

        mainPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        mainPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 50));

        Controls.Add(mainPanel);
    }

    private void LoadLogs()
    {
        var logTextBox = Controls.Find("LogTextBox", true).FirstOrDefault() as RichTextBox;
        if (logTextBox == null) return;

        try
        {
            if (File.Exists(_logFilePath))
            {
                var logs = File.ReadAllText(_logFilePath);
                logTextBox.Text = logs;
                logTextBox.SelectionStart = logTextBox.Text.Length;
                logTextBox.ScrollToCaret();
            }
            else
            {
                logTextBox.Text = "No log file found.";
            }
        }
        catch (Exception ex)
        {
            logTextBox.Text = $"Error loading logs: {ex.Message}";
            _logger.LogError(ex, "Failed to load log file");
        }
    }

    private void RefreshButton_Click(object? sender, EventArgs e)
    {
        LoadLogs();
    }

    private void ClearButton_Click(object? sender, EventArgs e)
    {
        var result = MessageBox.Show(
            "Are you sure you want to clear all logs?",
            "Clear Logs",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Question);

        if (result == DialogResult.Yes)
        {
            try
            {
                File.WriteAllText(_logFilePath, "");
                LoadLogs();
                MessageBox.Show("Logs cleared successfully.", "Clear Complete", 
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to clear logs: {ex.Message}", "Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    private void SaveButton_Click(object? sender, EventArgs e)
    {
        using var saveDialog = new SaveFileDialog
        {
            Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*",
            DefaultExt = "txt",
            FileName = $"TallySync_Logs_{DateTime.Now:yyyyMMdd_HHmmss}.txt"
        };

        if (saveDialog.ShowDialog() == DialogResult.OK)
        {
            try
            {
                var logTextBox = Controls.Find("LogTextBox", true).FirstOrDefault() as RichTextBox;
                if (logTextBox != null)
                {
                    File.WriteAllText(saveDialog.FileName, logTextBox.Text);
                    MessageBox.Show("Logs saved successfully.", "Save Complete", 
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to save logs: {ex.Message}", "Save Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}