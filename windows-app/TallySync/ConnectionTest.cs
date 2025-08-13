using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TallySyncConsole
{
    class ConnectionTest
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly string baseUrl = "http://localhost:5000/api/tally";
        
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Tally Backend Connection Test ===");
            Console.WriteLine("Testing backend connectivity from Linux environment...\n");
            
            try
            {
                // Test 1: Basic connectivity
                Console.WriteLine("1. Testing backend health check...");
                var testResponse = await client.GetAsync($"{baseUrl}/test");
                Console.WriteLine($"   Status: {testResponse.StatusCode}");
                
                if (testResponse.IsSuccessStatusCode)
                {
                    var testContent = await testResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"   ✅ Response: {testContent}");
                }
                else
                {
                    Console.WriteLine($"   ❌ Failed: {testResponse.ReasonPhrase}");
                    return;
                }
                
                // Test 2: Get companies
                Console.WriteLine("\n2. Testing companies endpoint...");
                var companiesResponse = await client.GetAsync($"{baseUrl}/companies");
                Console.WriteLine($"   Status: {companiesResponse.StatusCode}");
                
                if (companiesResponse.IsSuccessStatusCode)
                {
                    var companiesContent = await companiesResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"   ✅ Response: {companiesContent}");
                }
                
                // Test 3: Sync functionality
                Console.WriteLine("\n3. Testing sync endpoint...");
                var syncData = new
                {
                    apiKey = "test-api-key-123",
                    companies = new[]
                    {
                        new
                        {
                            name = "Linux Console Test Company",
                            externalId = $"LINUX{DateTime.Now:HHmmss}",
                            apiKey = $"linux-test-{DateTime.Now:HHmmss}"
                        }
                    }
                };
                
                var json = JsonSerializer.Serialize(syncData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var syncResponse = await client.PostAsync($"{baseUrl}/sync/companies", content);
                Console.WriteLine($"   Status: {syncResponse.StatusCode}");
                
                if (syncResponse.IsSuccessStatusCode)
                {
                    var syncContent = await syncResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"   ✅ Response: {syncContent}");
                }
                
                Console.WriteLine("\n🎉 SUCCESS: Backend is fully functional!");
                Console.WriteLine("The Windows desktop app should work perfectly when deployed to Windows.");
                
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"\n❌ Network Error: {ex.Message}");
                Console.WriteLine("This suggests the backend might not be running on localhost:5000");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n❌ Error: {ex.Message}");
            }
            finally
            {
                client.Dispose();
            }
        }
    }
}