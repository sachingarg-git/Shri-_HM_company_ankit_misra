import * as storage from './server/sales-operations-storage';
import { db } from './server/db';
import { invoicePayments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testEndpoint() {
  try {
    // Test with the known invoice ID
    const invoiceId = "b5458615-7a5b-4adf-9693-221a040a51f9";
    
    // Test 1: Direct DB query (what the endpoint does)
    console.log("Test 1: Direct DB query");
    const dbResult = await storage.getTotalPaymentsForInvoice(invoiceId);
    console.log(`✅ DB Query result: ₹${dbResult}`);
    
    // Test 2: What the endpoint should return
    console.log("\nTest 2: What the endpoint would return");
    
    const payments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, invoiceId));
    
    console.log(`✅ Endpoint would return ${payments.length} payments:`);
    payments.forEach((p: any, i: number) => {
      console.log(`${i+1}. ₹${p.paymentAmount} on ${p.paymentDate}`);
    });
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

testEndpoint();
