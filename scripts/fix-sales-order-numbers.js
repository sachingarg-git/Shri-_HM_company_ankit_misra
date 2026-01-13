// Script to fix existing Sales Order numbers to new format (SO-001/25-26)
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixSalesOrderNumbers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting Sales Order number migration...\n');
    
    // Get all sales orders ordered by creation date
    const result = await client.query(`
      SELECT id, order_number, order_date, created_at 
      FROM sales_orders 
      ORDER BY created_at ASC
    `);
    
    console.log(`📋 Found ${result.rows.length} sales orders to process\n`);
    
    if (result.rows.length === 0) {
      console.log('No sales orders found. Nothing to update.');
      return;
    }
    
    // Group orders by financial year
    const ordersByFY = {};
    
    for (const order of result.rows) {
      const orderDate = new Date(order.order_date || order.created_at);
      const currentMonth = orderDate.getMonth(); // 0-11
      const currentYear = orderDate.getFullYear();
      
      // Financial year starts in April (month 3)
      let fyStart, fyEnd;
      if (currentMonth < 3) { // Jan, Feb, Mar
        fyStart = currentYear - 1;
        fyEnd = currentYear;
      } else { // Apr-Dec
        fyStart = currentYear;
        fyEnd = currentYear + 1;
      }
      
      const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
      
      if (!ordersByFY[fyString]) {
        ordersByFY[fyString] = [];
      }
      ordersByFY[fyString].push(order);
    }
    
    console.log('📊 Orders by Financial Year:');
    for (const [fy, orders] of Object.entries(ordersByFY)) {
      console.log(`   FY ${fy}: ${orders.length} orders`);
    }
    console.log('');
    
    // Update each order with new format
    let totalUpdated = 0;
    
    for (const [fyString, orders] of Object.entries(ordersByFY)) {
      console.log(`\n🔧 Processing FY ${fyString}...`);
      
      let seqNum = 1;
      for (const order of orders) {
        const newOrderNumber = `SO-${seqNum.toString().padStart(3, '0')}/${fyString}`;
        
        // Check if already in correct format
        if (order.order_number === newOrderNumber) {
          console.log(`   ✅ ${order.order_number} - Already correct`);
          seqNum++;
          continue;
        }
        
        // Update the order number
        await client.query(
          'UPDATE sales_orders SET order_number = $1 WHERE id = $2',
          [newOrderNumber, order.id]
        );
        
        console.log(`   📝 ${order.order_number} → ${newOrderNumber}`);
        totalUpdated++;
        seqNum++;
      }
    }
    
    console.log(`\n✅ Migration complete! Updated ${totalUpdated} sales orders.`);
    
    // Show final state
    console.log('\n📋 Final Sales Order Numbers:');
    const finalResult = await client.query(`
      SELECT order_number, order_date 
      FROM sales_orders 
      ORDER BY created_at ASC
    `);
    
    for (const order of finalResult.rows) {
      const date = new Date(order.order_date).toLocaleDateString('en-IN');
      console.log(`   ${order.order_number} (${date})`);
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
fixSalesOrderNumbers()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
