import fetch from 'node-fetch';

async function testPaymentsAPI() {
  const invoiceId = 'b5458615-7a5b-4adf-9693-221a040a51f9';
  
  try {
    const response = await fetch(
      `http://localhost:3002/api/sales-operations/invoices/${invoiceId}/payments`,
      {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testPaymentsAPI();
