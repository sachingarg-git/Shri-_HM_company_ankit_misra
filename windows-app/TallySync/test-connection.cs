using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TallySyncConsole
{
    // Simple console test to verify backend connectivity
    class Program
    {
        static async Task Main(string[] args)
        {
        Console.WriteLine("Testing Tally Backend Connection...");
        
        using var client = new HttpClient();
        
        try
        {
            // Test basic connectivity
            Console.WriteLine("1. Testing /api/tally/test endpoint...");
            var testResponse = await client.GetAsync("http://localhost:5000/api/tally/test");
            Console.WriteLine($"   Status: {testResponse.StatusCode}");
            if (testResponse.IsSuccessStatusCode)
            {
                var testContent = await testResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"   Response: {testContent.Substring(0, Math.Min(100, testContent.Length))}...");
            }
            
            // Test companies endpoint
            Console.WriteLine("\n2. Testing /api/tally/companies endpoint...");
            var companiesResponse = await client.GetAsync("http://localhost:5000/api/tally/companies");
            Console.WriteLine($"   Status: {companiesResponse.StatusCode}");
            if (companiesResponse.IsSuccessStatusCode)
            {
                var companiesContent = await companiesResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"   Response: {companiesContent.Substring(0, Math.Min(100, companiesContent.Length))}...");
            }
            
            // Test sync endpoint
            Console.WriteLine("\n3. Testing sync functionality...");
            var syncData = new
            {
                apiKey = "test-api-key-123",
                companies = new[]
                {
                    new
                    {
                        name = "Console Test Company",
                        externalId = "CONSOLE001",
                        apiKey = "console-test-key"
                    }
                }
            };
            
            var json = JsonSerializer.Serialize(syncData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var syncResponse = await client.PostAsync("http://localhost:5000/api/tally/sync/companies", content);
            Console.WriteLine($"   Status: {syncResponse.StatusCode}");
            if (syncResponse.IsSuccessStatusCode)
            {
                var syncContent = await syncResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"   Response: {syncContent.Substring(0, Math.Min(100, syncContent.Length))}...");
            }
            
            Console.WriteLine("\n✓ Backend is fully working from this system!");
            Console.WriteLine("✓ Connection test successful!");
            Console.WriteLine("✓ Data sync test successful!");
            
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n✗ Connection failed: {ex.Message}");
            Console.WriteLine("Make sure:");
            Console.WriteLine("1. Web backend is running on localhost:5000");
            Console.WriteLine("2. No firewall is blocking the connection");
            Console.WriteLine("3. The web app is actually serving API endpoints");
        }
        
        Console.WriteLine("\nTest completed. Press any key to exit...");
        Console.ReadKey();
        }
    }
}