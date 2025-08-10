using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Security.Cryptography;
using System.Linq;
using System.Xml;
using System.Xml.Linq;

namespace TallySyncApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public partial class MainForm : Form
    {
        private Timer syncTimer;
        private readonly HttpClient httpClient;
        private readonly string logPath = "logs/app.log";
        private readonly string configPath = "TallySyncConfig.exe.config";
        
        // UI Components
        private Label lblStatus;
        private Label lblLastSync;
        private Label lblRecords;
        private Button btnStartStop;
        private TextBox txtLogs;
        private GroupBox grpStatus;
        private GroupBox grpLogs;

        public MainForm()
        {
            httpClient = new HttpClient();
            InitializeComponent();
            InitializeLogging();
            LoadConfiguration();
            UpdateUI();
        }

        private void InitializeComponent()
        {
            this.Text = "Tally Sync Application";
            this.Size = new System.Drawing.Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;

            // Status Group
            grpStatus = new GroupBox
            {
                Text = "Status",
                Location = new System.Drawing.Point(12, 12),
                Size = new System.Drawing.Size(760, 120)
            };

            lblStatus = new Label
            {
                Text = "Connection: Disconnected",
                Location = new System.Drawing.Point(15, 25),
                Size = new System.Drawing.Size(300, 20),
                ForeColor = System.Drawing.Color.Red
            };

            lblLastSync = new Label
            {
                Text = "Last Sync: Never",
                Location = new System.Drawing.Point(15, 50),
                Size = new System.Drawing.Size(400, 20)
            };

            lblRecords = new Label
            {
                Text = "Records - Fetched: 0, Sent: 0, Failed: 0",
                Location = new System.Drawing.Point(15, 75),
                Size = new System.Drawing.Size(500, 20)
            };

            btnStartStop = new Button
            {
                Text = "Start Sync",
                Location = new System.Drawing.Point(650, 40),
                Size = new System.Drawing.Size(100, 50),
                BackColor = System.Drawing.Color.Green,
                ForeColor = System.Drawing.Color.White
            };
            btnStartStop.Click += BtnStartStop_Click;

            grpStatus.Controls.AddRange(new Control[] { lblStatus, lblLastSync, lblRecords, btnStartStop });

            // Logs Group
            grpLogs = new GroupBox
            {
                Text = "Logs",
                Location = new System.Drawing.Point(12, 145),
                Size = new System.Drawing.Size(760, 400)
            };

            txtLogs = new TextBox
            {
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Location = new System.Drawing.Point(15, 25),
                Size = new System.Drawing.Size(730, 360),
                BackColor = System.Drawing.Color.Black,
                ForeColor = System.Drawing.Color.LimeGreen,
                Font = new System.Drawing.Font("Consolas", 9)
            };

            grpLogs.Controls.Add(txtLogs);

            this.Controls.AddRange(new Control[] { grpStatus, grpLogs });
        }

        private void InitializeLogging()
        {
            Directory.CreateDirectory(Path.GetDirectoryName(logPath));
        }

        private void LoadConfiguration()
        {
            try
            {
                var config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
                LogMessage($"Configuration loaded from: {config.FilePath}");
            }
            catch (Exception ex)
            {
                LogMessage($"Error loading configuration: {ex.Message}");
            }
        }

        private async void BtnStartStop_Click(object sender, EventArgs e)
        {
            if (syncTimer == null || !syncTimer.Enabled)
            {
                await StartSync();
            }
            else
            {
                StopSync();
            }
        }

        private async Task StartSync()
        {
            try
            {
                btnStartStop.Text = "Stop Sync";
                btnStartStop.BackColor = System.Drawing.Color.Red;
                
                LogMessage("Starting Tally Sync Service...");
                
                // Test Tally connection
                await TestTallyConnection();
                
                // Start timer
                int intervalMinutes = int.Parse(ConfigurationManager.AppSettings["SyncIntervalMinutes"] ?? "5");
                syncTimer = new Timer(async (state) => await PerformSync(), null, TimeSpan.Zero, TimeSpan.FromMinutes(intervalMinutes));
                
                LogMessage($"Sync timer started - Running every {intervalMinutes} minutes");
                UpdateConnectionStatus(true);
            }
            catch (Exception ex)
            {
                LogMessage($"Error starting sync: {ex.Message}");
                StopSync();
            }
        }

        private void StopSync()
        {
            syncTimer?.Dispose();
            syncTimer = null;
            
            btnStartStop.Text = "Start Sync";
            btnStartStop.BackColor = System.Drawing.Color.Green;
            
            LogMessage("Sync service stopped");
            UpdateConnectionStatus(false);
        }

        private async Task TestTallyConnection()
        {
            try
            {
                string tallyUrl = ConfigurationManager.AppSettings["TallyUrl"] ?? "http://localhost:9000";
                var response = await httpClient.GetAsync($"{tallyUrl}/");
                
                if (response.IsSuccessStatusCode)
                {
                    LogMessage("Tally connection successful");
                    UpdateConnectionStatus(true);
                }
                else
                {
                    throw new Exception($"Tally returned status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Tally connection failed: {ex.Message}");
                UpdateConnectionStatus(false);
                throw;
            }
        }

        private async Task PerformSync()
        {
            try
            {
                LogMessage("Starting sync process...");
                
                // Get date range from config
                var fromDate = DateTime.Parse(ConfigurationManager.AppSettings["FromDate"] ?? DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd"));
                var toDate = DateTime.Parse(ConfigurationManager.AppSettings["ToDate"] ?? DateTime.Now.ToString("yyyy-MM-dd"));
                
                LogMessage($"Syncing data from {fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd}");
                
                // Fetch Masters and Vouchers
                var masters = await FetchTallyData("Masters", fromDate, toDate);
                var vouchers = await FetchTallyData("Vouchers", fromDate, toDate);
                
                int fetched = masters.Count + vouchers.Count;
                int sent = 0;
                int failed = 0;
                
                // Send Masters
                var masterResult = await SendDataInBatches(masters, "Masters");
                sent += masterResult.sent;
                failed += masterResult.failed;
                
                // Send Vouchers
                var voucherResult = await SendDataInBatches(vouchers, "Vouchers");
                sent += voucherResult.sent;
                failed += voucherResult.failed;
                
                UpdateLastSync(DateTime.Now);
                UpdateRecordCounts(fetched, sent, failed);
                
                LogMessage($"Sync completed - Fetched: {fetched}, Sent: {sent}, Failed: {failed}");
            }
            catch (Exception ex)
            {
                LogMessage($"Sync error: {ex.Message}");
            }
        }

        private async Task<List<Dictionary<string, object>>> FetchTallyData(string dataType, DateTime fromDate, DateTime toDate)
        {
            var results = new List<Dictionary<string, object>>();
            
            try
            {
                string tallyUrl = ConfigurationManager.AppSettings["TallyUrl"] ?? "http://localhost:9000";
                
                // Create Tally XML request
                string xmlRequest = CreateTallyXMLRequest(dataType, fromDate, toDate);
                
                var content = new StringContent(xmlRequest, Encoding.UTF8, "application/xml");
                var response = await httpClient.PostAsync(tallyUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var xmlResponse = await response.Content.ReadAsStringAsync();
                    results = ParseTallyXML(xmlResponse, dataType);
                    
                    LogMessage($"Fetched {results.Count} {dataType} records from Tally");
                }
                else
                {
                    throw new Exception($"Tally API returned: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error fetching {dataType}: {ex.Message}");
            }
            
            return results;
        }

        private string CreateTallyXMLRequest(string dataType, DateTime fromDate, DateTime toDate)
        {
            // Sample Tally XML request structure
            return $@"<ENVELOPE>
                <HEADER>
                    <VERSION>1</VERSION>
                    <TALLYREQUEST>Export</TALLYREQUEST>
                    <TYPE>Data</TYPE>
                    <ID>All {dataType}</ID>
                </HEADER>
                <BODY>
                    <DESC>
                        <STATICVARIABLES>
                            <SVEXPORTFORMAT>XML (Data Interchange)</SVEXPORTFORMAT>
                            <SVFROMDATE>{fromDate:yyyyMMdd}</SVFROMDATE>
                            <SVTODATE>{toDate:yyyyMMdd}</SVTODATE>
                        </STATICVARIABLES>
                        <TDL>
                            <TDLMESSAGE>
                                <COLLECTION NAME=""All {dataType}"">
                                    <TYPE>{dataType}</TYPE>
                                    <FETCH>*</FETCH>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>";
        }

        private List<Dictionary<string, object>> ParseTallyXML(string xmlData, string dataType)
        {
            var results = new List<Dictionary<string, object>>();
            
            try
            {
                var doc = XDocument.Parse(xmlData);
                var items = doc.Descendants(dataType.TrimEnd('s')); // Remove 's' from Masters/Vouchers
                
                foreach (var item in items)
                {
                    var record = new Dictionary<string, object>();
                    
                    foreach (var element in item.Elements())
                    {
                        record[element.Name.LocalName] = element.Value;
                    }
                    
                    // Add idempotency hash
                    var hash = GenerateHash(JsonSerializer.Serialize(record));
                    record["_hash"] = hash;
                    record["_type"] = dataType;
                    record["_timestamp"] = DateTime.Now;
                    
                    results.Add(record);
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error parsing XML for {dataType}: {ex.Message}");
            }
            
            return results;
        }

        private async Task<(int sent, int failed)> SendDataInBatches(List<Dictionary<string, object>> data, string dataType)
        {
            int batchSize = int.Parse(ConfigurationManager.AppSettings["BatchSize"] ?? "100");
            int sent = 0;
            int failed = 0;
            
            var batches = data.Select((item, index) => new { item, index })
                             .GroupBy(x => x.index / batchSize)
                             .Select(g => g.Select(x => x.item).ToList());
            
            foreach (var batch in batches)
            {
                var result = await SendBatch(batch, dataType);
                sent += result.sent;
                failed += result.failed;
                
                // Small delay between batches
                await Task.Delay(1000);
            }
            
            return (sent, failed);
        }

        private async Task<(int sent, int failed)> SendBatch(List<Dictionary<string, object>> batch, string dataType)
        {
            int maxRetries = int.Parse(ConfigurationManager.AppSettings["MaxRetries"] ?? "5");
            int sent = 0;
            int failed = 0;
            
            for (int retry = 0; retry <= maxRetries; retry++)
            {
                try
                {
                    // Filter out already sent records
                    var filteredBatch = await FilterAlreadySentRecords(batch);
                    
                    if (!filteredBatch.Any())
                    {
                        sent += batch.Count;
                        LogMessage($"Batch of {batch.Count} {dataType} records already sent (skipped)");
                        break;
                    }
                    
                    string apiUrl = ConfigurationManager.AppSettings["PublicApiUrl"];
                    string apiKey = ConfigurationManager.AppSettings["ApiKey"];
                    
                    var json = JsonSerializer.Serialize(new { 
                        dataType = dataType,
                        records = filteredBatch 
                    });
                    
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    httpClient.DefaultRequestHeaders.Clear();
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                    
                    var response = await httpClient.PostAsync(apiUrl, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        // Mark records as sent
                        await MarkRecordsAsSent(filteredBatch);
                        sent += filteredBatch.Count;
                        
                        LogMessage($"Successfully sent batch of {filteredBatch.Count} {dataType} records");
                        break;
                    }
                    else
                    {
                        throw new Exception($"API returned: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                    }
                }
                catch (Exception ex)
                {
                    LogMessage($"Batch send attempt {retry + 1} failed: {ex.Message}");
                    
                    if (retry == maxRetries)
                    {
                        failed += batch.Count;
                        LogMessage($"Failed to send batch after {maxRetries + 1} attempts");
                    }
                    else
                    {
                        // Exponential backoff
                        await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retry)));
                    }
                }
            }
            
            return (sent, failed);
        }

        private async Task<List<Dictionary<string, object>>> FilterAlreadySentRecords(List<Dictionary<string, object>> records)
        {
            var filtered = new List<Dictionary<string, object>>();
            
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"]?.ConnectionString;
                
                if (string.IsNullOrEmpty(connectionString))
                {
                    LogMessage("No database connection configured, sending all records");
                    return records;
                }
                
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    
                    foreach (var record in records)
                    {
                        var hash = record["_hash"].ToString();
                        var checkCmd = new SqlCommand("SELECT COUNT(*) FROM SentRecords WHERE Hash = @hash", connection);
                        checkCmd.Parameters.AddWithValue("@hash", hash);
                        
                        var count = (int)await checkCmd.ExecuteScalarAsync();
                        
                        if (count == 0)
                        {
                            filtered.Add(record);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error filtering records: {ex.Message}");
                return records; // Return all if filtering fails
            }
            
            return filtered;
        }

        private async Task MarkRecordsAsSent(List<Dictionary<string, object>> records)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"]?.ConnectionString;
                
                if (string.IsNullOrEmpty(connectionString))
                    return;
                
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    
                    foreach (var record in records)
                    {
                        var insertCmd = new SqlCommand(
                            "INSERT INTO SentRecords (Hash, DataType, SentAt) VALUES (@hash, @type, @sentAt)", 
                            connection);
                        
                        insertCmd.Parameters.AddWithValue("@hash", record["_hash"]);
                        insertCmd.Parameters.AddWithValue("@type", record["_type"]);
                        insertCmd.Parameters.AddWithValue("@sentAt", DateTime.Now);
                        
                        await insertCmd.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error marking records as sent: {ex.Message}");
            }
        }

        private string GenerateHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToBase64String(bytes);
            }
        }

        private void LogMessage(string message)
        {
            var logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}";
            
            // Write to file
            try
            {
                File.AppendAllText(logPath, logEntry + Environment.NewLine);
            }
            catch { }
            
            // Update UI
            if (txtLogs.InvokeRequired)
            {
                txtLogs.Invoke(new Action(() => {
                    txtLogs.AppendText(logEntry + Environment.NewLine);
                    txtLogs.ScrollToCaret();
                }));
            }
            else
            {
                txtLogs.AppendText(logEntry + Environment.NewLine);
                txtLogs.ScrollToCaret();
            }
        }

        private void UpdateConnectionStatus(bool connected)
        {
            if (lblStatus.InvokeRequired)
            {
                lblStatus.Invoke(new Action(() => {
                    lblStatus.Text = connected ? "Connection: Connected to Tally" : "Connection: Disconnected";
                    lblStatus.ForeColor = connected ? System.Drawing.Color.Green : System.Drawing.Color.Red;
                }));
            }
            else
            {
                lblStatus.Text = connected ? "Connection: Connected to Tally" : "Connection: Disconnected";
                lblStatus.ForeColor = connected ? System.Drawing.Color.Green : System.Drawing.Color.Red;
            }
        }

        private void UpdateLastSync(DateTime syncTime)
        {
            if (lblLastSync.InvokeRequired)
            {
                lblLastSync.Invoke(new Action(() => {
                    lblLastSync.Text = $"Last Sync: {syncTime:yyyy-MM-dd HH:mm:ss}";
                }));
            }
            else
            {
                lblLastSync.Text = $"Last Sync: {syncTime:yyyy-MM-dd HH:mm:ss}";
            }
        }

        private void UpdateRecordCounts(int fetched, int sent, int failed)
        {
            if (lblRecords.InvokeRequired)
            {
                lblRecords.Invoke(new Action(() => {
                    lblRecords.Text = $"Records - Fetched: {fetched}, Sent: {sent}, Failed: {failed}";
                }));
            }
            else
            {
                lblRecords.Text = $"Records - Fetched: {fetched}, Sent: {sent}, Failed: {failed}";
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            StopSync();
            httpClient?.Dispose();
            base.OnFormClosing(e);
        }
    }
}