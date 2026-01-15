// Quick test to verify the endpoint works
async function quickTest() {
  try {
    const invoiceId = "b5458615-7a5b-4adf-9693-221a040a51f9";
    console.log(`Testing endpoint: /api/sales-operations/invoices/${invoiceId}/payments`);
    
    // This would be called from browser, simulating what our frontend does
    const response = await fetch(`/api/sales-operations/invoices/${invoiceId}/payments`);
    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`Response data:`, data);
    console.log(`Payments count: ${Array.isArray(data) ? data.length : 'Not an array!'}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Auto-run when page loads
window.addEventListener('load', quickTest);
console.log('Test script loaded. Auto-running in 1 second...');
setTimeout(quickTest, 1000);
