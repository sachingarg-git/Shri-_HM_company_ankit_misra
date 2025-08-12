using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TallySync
{
    public partial class MainForm : Form
    {
        private readonly HttpClient httpClient;
        private readonly string baseUrl = "http://localhost:5000/api/tally";
        
        public MainForm()
        {
            InitializeComponent();
            httpClient = new HttpClient();
        }

        private async void btnConnect_Click(object sender, EventArgs e)
        {
            try
            {
                btnConnect.Enabled = false;
                lblStatus.Text = "Testing backend connection...";
                lblStatus.ForeColor = Color.Blue;

                // First test basic connectivity
                var testResponse = await httpClient.GetAsync($"{baseUrl}/test");
                
                if (!testResponse.IsSuccessStatusCode)
                {
                    lblStatus.Text = $"Backend test failed: {testResponse.StatusCode}";
                    lblStatus.ForeColor = Color.Red;
                    return;
                }

                lblStatus.Text = "Fetching companies...";
                
                // Then fetch companies
                var companiesResponse = await httpClient.GetAsync($"{baseUrl}/companies");
                
                if (companiesResponse.IsSuccessStatusCode)
                {
                    var content = await companiesResponse.Content.ReadAsStringAsync();
                    
                    if (string.IsNullOrEmpty(content) || content.Trim() == "[]")
                    {
                        lblStatus.Text = "Connected successfully! No companies found.";
                        lblStatus.ForeColor = Color.Green;
                        listCompanies.Items.Clear();
                        listCompanies.Items.Add("No companies registered yet");
                    }
                    else
                    {
                        var companies = JsonSerializer.Deserialize<JsonElement[]>(content);
                        
                        lblStatus.Text = $"Connected successfully! Found {companies.Length} companies.";
                        lblStatus.ForeColor = Color.Green;
                        
                        // Display companies in list
                        listCompanies.Items.Clear();
                        foreach (var company in companies)
                        {
                            var name = company.GetProperty("name").GetString();
                            var id = company.GetProperty("id").GetString();
                            listCompanies.Items.Add($"{name} ({id})");
                        }
                    }
                    
                    btnSyncData.Enabled = true;
                }
                else
                {
                    var errorContent = await companiesResponse.Content.ReadAsStringAsync();
                    lblStatus.Text = $"Companies fetch failed: {companiesResponse.StatusCode} - {errorContent}";
                    lblStatus.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = $"Connection error: {ex.Message}";
                lblStatus.ForeColor = Color.Red;
            }
            finally
            {
                btnConnect.Enabled = true;
            }
        }

        private async void btnSyncData_Click(object sender, EventArgs e)
        {
            try
            {
                btnSyncData.Enabled = false;
                lblStatus.Text = "Preparing sync data...";
                lblStatus.ForeColor = Color.Blue;

                // Create sample Tally data to sync with timestamp for uniqueness
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var syncData = new
                {
                    apiKey = "test-api-key-123",
                    companies = new[]
                    {
                        new
                        {
                            name = $"TallySync Desktop App - {timestamp}",
                            externalId = $"DESKTOP_{timestamp}",
                            apiKey = $"desktop-sync-key-{timestamp}"
                        }
                    }
                };

                lblStatus.Text = "Sending data to backend...";
                
                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{baseUrl}/sync/companies", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    // Parse the response to get details
                    var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var success = result.GetProperty("success").GetBoolean();
                    
                    if (success)
                    {
                        lblStatus.Text = "Sample company data synced successfully!";
                        lblStatus.ForeColor = Color.Green;
                        
                        // Refresh companies list after a short delay
                        await Task.Delay(500);
                        btnConnect_Click(sender, e);
                    }
                    else
                    {
                        lblStatus.Text = "Sync completed with errors. Check response details.";
                        lblStatus.ForeColor = Color.Orange;
                    }
                }
                else
                {
                    lblStatus.Text = $"Sync failed: {response.StatusCode} - {responseContent}";
                    lblStatus.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = $"Sync error: {ex.Message}";
                lblStatus.ForeColor = Color.Red;
            }
            finally
            {
                btnSyncData.Enabled = true;
            }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            httpClient?.Dispose();
        }
    }
}