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
                lblStatus.Text = "Connecting to backend...";
                lblStatus.ForeColor = Color.Blue;

                // Test connection by fetching companies
                var response = await httpClient.GetAsync($"{baseUrl}/companies");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var companies = JsonSerializer.Deserialize<dynamic>(content);
                    
                    lblStatus.Text = $"Connected successfully! Found {((object[])companies).Length} companies.";
                    lblStatus.ForeColor = Color.Green;
                    
                    btnSyncData.Enabled = true;
                    
                    // Display companies in list
                    listCompanies.Items.Clear();
                    foreach (var company in (object[])companies)
                    {
                        var companyObj = (JsonElement)company;
                        var name = companyObj.GetProperty("name").GetString();
                        var id = companyObj.GetProperty("id").GetString();
                        listCompanies.Items.Add($"{name} ({id})");
                    }
                }
                else
                {
                    lblStatus.Text = $"Connection failed: {response.StatusCode}";
                    lblStatus.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = $"Error: {ex.Message}";
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
                lblStatus.Text = "Syncing data to backend...";
                lblStatus.ForeColor = Color.Blue;

                // Create sample Tally data to sync
                var syncData = new
                {
                    apiKey = "test-api-key-123",
                    companies = new[]
                    {
                        new
                        {
                            name = "Test Company from Desktop",
                            externalId = "DESKTOP001",
                            apiKey = "desktop-sync-key"
                        }
                    }
                };

                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{baseUrl}/sync/companies", content);
                
                if (response.IsSuccessStatusCode)
                {
                    lblStatus.Text = "Data synced successfully!";
                    lblStatus.ForeColor = Color.Green;
                    
                    // Refresh companies list
                    btnConnect_Click(sender, e);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    lblStatus.Text = $"Sync failed: {response.StatusCode} - {errorContent}";
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