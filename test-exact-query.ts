import { db } from "./server/db";
import { invoicePayments } from "./shared/schema";
import { eq } from "drizzle-orm";

async function testQuery() {
  try {
    const testInvoiceId = "b5458615-7a5b-4adf-9693-221a040a51f9";
    
    console.log("Testing the exact query from the endpoint...");
    console.log(`Query: SELECT FROM invoicePayments WHERE invoiceId = ${testInvoiceId}`);
    
    const payments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, testInvoiceId));
    
    console.log(`✅ Result: Found ${payments.length} payments`);
    payments.forEach((p, i) => {
      console.log(`${i+1}. ${p.id}: ₹${p.paymentAmount} on ${p.paymentDate}`);
    });
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testQuery();
