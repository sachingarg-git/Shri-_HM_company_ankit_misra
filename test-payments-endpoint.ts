import fetch from 'node-fetch';

async function testPaymentsEndpoint() {
  try {
    // Get one of the invoices first to test
    const invoiceResponse = await fetch('http://localhost:3002/api/sales-operations/sales-invoices', {
      headers: {
        'Cookie': 'connect.sid=test' // This might not work without auth, but let's try
      }
    });

    if (invoiceResponse.ok) {
      const invoices = await invoiceResponse.json();
      console.log(`Found ${invoices.length} invoices`);
      
      if (invoices.length > 0) {
        const invoiceId = invoices[0].id;
        console.log(`Testing payments endpoint for invoice: ${invoiceId}`);
        
        const paymentsResponse = await fetch(
          `http://localhost:3002/api/sales-operations/invoices/${invoiceId}/payments`,
          {
            headers: {
              'Cookie': 'connect.sid=test'
            }
          }
        );
        
        console.log(`Payments endpoint response status: ${paymentsResponse.status}`);
        const payments = await paymentsResponse.json();
        console.log(`Payments:`, JSON.stringify(payments, null, 2));
      }
    } else {
      console.log(`Failed to fetch invoices: ${invoiceResponse.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPaymentsEndpoint();
