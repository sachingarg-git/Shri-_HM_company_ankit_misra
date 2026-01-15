import { db } from "./server/db";
import { invoicePayments } from "./shared/schema";

async function checkPayments() {
  try {
    console.log("🔍 Checking invoicePayments table...");
    console.log("invoicePayments:", invoicePayments);
    
    const payments = await db.select().from(invoicePayments);
    console.log(`✅ Found ${payments.length} total payments in database:`);
    
    payments.forEach((p, idx) => {
      console.log(`${idx + 1}. Invoice ${p.invoiceId}: ₹${p.paymentAmount} on ${p.paymentDate}`);
    });

    // Group by invoice
    const byInvoice: any = {};
    payments.forEach(p => {
      if (!byInvoice[p.invoiceId]) byInvoice[p.invoiceId] = [];
      byInvoice[p.invoiceId].push(p);
    });

    console.log("\n📊 Payments grouped by invoice:");
    Object.entries(byInvoice).forEach(([invoiceId, pays]: any) => {
      console.log(`Invoice ${invoiceId}: ${pays.length} payments, Total: ₹${pays.reduce((sum: number, p: any) => sum + parseFloat(p.paymentAmount), 0)}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkPayments();
