using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TallySync
{
    /// <summary>
    /// Service class for communicating with Tally software and the backend API.
    /// This simulates the connection to actual Tally accounting software.
    /// </summary>
    public class TallyGatewayService
    {
        private readonly HttpClient httpClient;
        private readonly string backendUrl;
        private readonly string apiKey;

        public TallyGatewayService(string backendUrl, string apiKey)
        {
            this.backendUrl = backendUrl;
            this.apiKey = apiKey;
            this.httpClient = new HttpClient();
        }

        /// <summary>
        /// Tests the connection to the backend API
        /// </summary>
        public async Task<bool> TestBackendConnection()
        {
            try
            {
                var response = await httpClient.GetAsync($"{backendUrl}/test");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Simulates retrieving company data from Tally software
        /// In a real implementation, this would connect to Tally via ODBC or XML
        /// </summary>
        public async Task<object[]> GetTallyCompanies()
        {
            // Simulate Tally company data retrieval
            await Task.Delay(100); // Simulate processing delay
            
            return new object[]
            {
                new
                {
                    name = "Acme Corporation Ltd",
                    externalId = "ACME001",
                    gstin = "29ABCDE1234F1Z5",
                    books = "April 2024 to March 2025"
                },
                new
                {
                    name = "Sample Trading Co",
                    externalId = "SAMPLE002", 
                    gstin = "27FGHIJ5678K2L9",
                    books = "April 2024 to March 2025"
                }
            };
        }

        /// <summary>
        /// Simulates retrieving ledger data from Tally
        /// </summary>
        public async Task<object[]> GetTallyLedgers()
        {
            await Task.Delay(100);
            
            return new object[]
            {
                new
                {
                    name = "Cash",
                    externalId = "CASH001",
                    groupName = "Cash-in-Hand",
                    openingBalance = 50000.00m,
                    closingBalance = 75000.00m
                },
                new
                {
                    name = "Bank of India",
                    externalId = "BANK001",
                    groupName = "Bank Accounts",
                    openingBalance = 200000.00m,
                    closingBalance = 185000.00m
                }
            };
        }

        /// <summary>
        /// Syncs company data to the backend
        /// </summary>
        public async Task<string> SyncCompaniesToBackend(object[] companies)
        {
            try
            {
                var syncData = new
                {
                    apiKey = this.apiKey,
                    companies = companies
                };

                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync($"{backendUrl}/sync/companies", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return $"Success: {responseContent}";
                }
                else
                {
                    return $"Error {response.StatusCode}: {responseContent}";
                }
            }
            catch (Exception ex)
            {
                return $"Exception: {ex.Message}";
            }
        }

        /// <summary>
        /// Gets sync status from the backend
        /// </summary>
        public async Task<string> GetSyncStatus()
        {
            try
            {
                var response = await httpClient.GetAsync($"{backendUrl}/sync/status");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return $"Sync Status: {content}";
                }
                else
                {
                    return $"Failed to get sync status: {response.StatusCode}";
                }
            }
            catch (Exception ex)
            {
                return $"Error getting sync status: {ex.Message}";
            }
        }

        public void Dispose()
        {
            httpClient?.Dispose();
        }
    }
}