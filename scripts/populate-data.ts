import { db } from "../server/db";
import { 
  users, clients, creditAgreements, orders, purchaseOrders, 
  payments, tasks, ewayBills, clientTracking, salesRates 
} from "../shared/schema";

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Sample data arrays
const companyNames = [
  "Tata Steel Ltd", "JSW Steel Ltd", "SAIL Corporation", "Jindal Steel & Power", "Vedanta Resources",
  "Hindalco Industries", "National Aluminium Co", "Bharti Enterprises", "Reliance Industries", "ONGC Ltd",
  "Indian Oil Corporation", "Bharat Petroleum", "Hindustan Petroleum", "Coal India Ltd", "NTPC Ltd",
  "Adani Group", "Ambuja Cements", "UltraTech Cement", "ACC Ltd", "Shree Cement",
  "Asian Paints", "Berger Paints", "Kansai Nerolac", "Pidilite Industries", "Godrej Consumer",
  "ITC Ltd", "Hindustan Unilever", "Nestlé India", "Britannia Industries", "Dabur India",
  "Sun Pharma", "Dr. Reddy's Labs", "Cipla Ltd", "Lupin Ltd", "Aurobindo Pharma",
  "Bajaj Auto", "Hero MotoCorp", "TVS Motor", "Mahindra & Mahindra", "Tata Motors",
  "Maruti Suzuki", "Hyundai Motor", "Bajaj Finance", "HDFC Bank", "ICICI Bank",
  "State Bank of India", "Axis Bank", "Kotak Mahindra", "Yes Bank", "IndusInd Bank"
];

const firstNames = [
  "Rajesh", "Priya", "Amit", "Sunita", "Vikash", "Meera", "Suresh", "Kavita", "Rahul", "Deepika",
  "Anil", "Sita", "Manoj", "Ruchi", "Vishal", "Neha", "Ravi", "Anjali", "Sandeep", "Pooja",
  "Ajay", "Rekha", "Vinod", "Seema", "Mukesh", "Geeta", "Rohit", "Shilpa", "Naveen", "Swati",
  "Pankaj", "Nisha", "Sanjay", "Preeti", "Ashok", "Mamta", "Dinesh", "Kiran", "Yogesh", "Smita",
  "Ramesh", "Usha", "Prakash", "Saroj", "Mahesh", "Sudha", "Naresh", "Poonam", "Vijay", "Rashmi"
];

const lastNames = [
  "Sharma", "Kumar", "Singh", "Gupta", "Yadav", "Agarwal", "Mishra", "Jain", "Verma", "Pandey",
  "Shah", "Patel", "Mehta", "Desai", "Modi", "Joshi", "Trivedi", "Thakur", "Chauhan", "Rajput",
  "Reddy", "Rao", "Krishna", "Prasad", "Naidu", "Raman", "Iyer", "Nair", "Menon", "Pillai",
  "Das", "Roy", "Ghosh", "Mukherjee", "Banerjee", "Chakraborty", "Bose", "Sen", "Dutta", "Saha",
  "Khan", "Ahmed", "Ali", "Hassan", "Hussain", "Ansari", "Siddiqui", "Qureshi", "Malik", "Sheikh"
];

const cities = [
  "Mumbai, Maharashtra", "Delhi, Delhi", "Bangalore, Karnataka", "Hyderabad, Telangana", "Chennai, Tamil Nadu",
  "Kolkata, West Bengal", "Pune, Maharashtra", "Ahmedabad, Gujarat", "Jaipur, Rajasthan", "Surat, Gujarat",
  "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Nagpur, Maharashtra", "Indore, Madhya Pradesh", "Thane, Maharashtra",
  "Bhopal, Madhya Pradesh", "Visakhapatnam, Andhra Pradesh", "Pimpri-Chinchwad, Maharashtra", "Patna, Bihar", "Vadodara, Gujarat",
  "Ghaziabad, Uttar Pradesh", "Ludhiana, Punjab", "Agra, Uttar Pradesh", "Nashik, Maharashtra", "Faridabad, Haryana",
  "Meerut, Uttar Pradesh", "Rajkot, Gujarat", "Kalyan-Dombivli, Maharashtra", "Vasai-Virar, Maharashtra", "Varanasi, Uttar Pradesh",
  "Srinagar, Jammu and Kashmir", "Aurangabad, Maharashtra", "Dhanbad, Jharkhand", "Amritsar, Punjab", "Navi Mumbai, Maharashtra",
  "Allahabad, Uttar Pradesh", "Ranchi, Jharkhand", "Howrah, West Bengal", "Coimbatore, Tamil Nadu", "Jabalpur, Madhya Pradesh",
  "Gwalior, Madhya Pradesh", "Vijayawada, Andhra Pradesh", "Jodhpur, Rajasthan", "Madurai, Tamil Nadu", "Raipur, Chhattisgarh",
  "Kota, Rajasthan", "Chandigarh, Chandigarh", "Guwahati, Assam", "Solapur, Maharashtra", "Hubli-Dharwad, Karnataka"
];

const vehicleNumbers = [
  "MH-12-AB-1234", "DL-01-CD-5678", "KA-03-EF-9012", "TN-09-GH-3456", "GJ-05-IJ-7890",
  "RJ-14-KL-2345", "UP-16-MN-6789", "WB-02-OP-0123", "MP-04-QR-4567", "HR-26-ST-8901",
  "PB-03-UV-2345", "OR-05-WX-6789", "JH-01-YZ-0123", "CG-04-AB-4567", "AS-01-CD-8901",
  "AP-09-EF-2345", "TS-07-GH-6789", "KL-07-IJ-0123", "HP-02-KL-4567", "UK-01-MN-8901",
  "MH-14-OP-2345", "DL-03-QR-6789", "KA-05-ST-0123", "TN-11-UV-4567", "GJ-07-WX-8901",
  "RJ-19-YZ-2345", "UP-32-AB-6789", "WB-06-CD-0123", "MP-09-EF-4567", "HR-51-GH-8901",
  "PB-08-IJ-2345", "OR-09-KL-6789", "JH-05-MN-0123", "CG-07-OP-4567", "AS-07-QR-8901",
  "AP-28-ST-2345", "TS-13-UV-6789", "KL-14-WX-0123", "HP-55-YZ-4567", "UK-07-AB-8901",
  "MH-43-CD-2345", "DL-08-EF-6789", "KA-09-GH-0123", "TN-33-IJ-4567", "GJ-15-KL-8901",
  "RJ-27-MN-2345", "UP-80-OP-6789", "WB-19-QR-0123", "MP-20-ST-4567", "HR-66-UV-8901"
];

const taskTitles = [
  "Credit verification", "Payment follow-up", "Document collection", "Agreement preparation", "Quality inspection",
  "Material loading", "Vehicle inspection", "Driver briefing", "Route planning", "Delivery scheduling",
  "Customer confirmation", "Invoice generation", "Payment processing", "Account reconciliation", "Monthly report",
  "Client meeting", "Site visit", "Sample collection", "Testing completion", "Approval documentation",
  "Contract review", "Price negotiation", "Order confirmation", "Shipment tracking", "Delivery verification",
  "Feedback collection", "Complaint resolution", "Service review", "Performance analysis", "System update",
  "Database backup", "Security check", "Maintenance work", "Equipment calibration", "Safety audit",
  "Training session", "Team meeting", "Project review", "Budget planning", "Resource allocation",
  "Vendor evaluation", "Supplier meeting", "Purchase planning", "Inventory check", "Stock update",
  "Market research", "Competitor analysis", "Sales planning", "Target setting", "Performance review"
];

async function populateData() {
  console.log("Starting data population...");

  try {
    // 1. Create Users (50)
    console.log("Creating users...");
    const userIds: string[] = [];
    const roles = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS'];
    
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const result = await db.insert(users).values({
        username: `${firstName.toLowerCase()}${i + 1}`,
        password: "hashed_password_123",
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@company.com`,
        role: roles[Math.floor(Math.random() * roles.length)] as any,
      }).returning({ id: users.id });
      userIds.push(result[0].id);
    }

    // 2. Create Clients (50)
    console.log("Creating clients...");
    const clientIds: string[] = [];
    const categories = ['ALFA', 'BETA', 'GAMMA', 'DELTA'];
    
    for (let i = 0; i < 50; i++) {
      const result = await db.insert(clients).values({
        name: companyNames[i],
        category: categories[Math.floor(Math.random() * categories.length)] as any,
        email: `contact@${companyNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: cities[Math.floor(Math.random() * cities.length)],
        gstNumber: `22AAAAA${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}A1Z5`,
        creditLimit: (Math.floor(Math.random() * 50) + 10).toString(),
        paymentTerms: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
      }).returning({ id: clients.id });
      clientIds.push(result[0].id);
    }

    // 3. Create Credit Agreements (50)
    console.log("Creating credit agreements...");
    const creditAgreementIds: string[] = [];
    
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const signedDate = randomDate(new Date(2023, 0, 1), new Date());
      const result = await db.insert(creditAgreements).values({
        clientId,
        agreementNumber: `CA-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, '0')}`,
        creditLimit: (Math.floor(Math.random() * 100) + 50).toString(),
        paymentTerms: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
        interestRate: (Math.random() * 5 + 8).toFixed(2),
        isActive: Math.random() > 0.1,
        signedAt: signedDate,
        expiresAt: addDays(signedDate, 365),
      }).returning({ id: creditAgreements.id });
      creditAgreementIds.push(result[0].id);
    }

    // 4. Create Orders (50)
    console.log("Creating orders...");
    const orderIds: string[] = [];
    const orderStatuses = ['PENDING_AGREEMENT', 'APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const salesPersonId = userIds[Math.floor(Math.random() * userIds.length)];
      const creditAgreementId = creditAgreementIds[Math.floor(Math.random() * creditAgreementIds.length)];
      const result = await db.insert(orders).values({
        orderNumber: `ORD-${new Date().getFullYear()}-${(i + 1).toString().padStart(5, '0')}`,
        clientId,
        salesPersonId,
        amount: (Math.floor(Math.random() * 500000) + 50000).toString(),
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any,
        description: `Order for ${companyNames[Math.floor(Math.random() * companyNames.length)]} - Batch ${i + 1}`,
        creditAgreementRequired: Math.random() > 0.2,
        creditAgreementId: Math.random() > 0.3 ? creditAgreementId : null,
        expectedDeliveryDate: randomDate(new Date(), addDays(new Date(), 60)),
      }).returning({ id: orders.id });
      orderIds.push(result[0].id);
    }

    // 5. Create Purchase Orders (50)
    console.log("Creating purchase orders...");
    for (let i = 0; i < 50; i++) {
      const orderId = orderIds[Math.floor(Math.random() * orderIds.length)];
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const issuedDate = randomDate(new Date(2024, 0, 1), new Date());
      await db.insert(purchaseOrders).values({
        poNumber: `PO-${new Date().getFullYear()}-${(i + 1).toString().padStart(5, '0')}`,
        orderId,
        clientId,
        amount: (Math.floor(Math.random() * 300000) + 25000).toString(),
        issuedAt: issuedDate,
        validUntil: addDays(issuedDate, 30),
        terms: "Payment within 30 days, FOB destination, quality inspection required",
      });
    }

    // 6. Create Payments (50)
    console.log("Creating payments...");
    const paymentStatuses = ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL'];
    
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const orderId = orderIds[Math.floor(Math.random() * orderIds.length)];
      const dueDate = randomDate(new Date(2024, 0, 1), addDays(new Date(), 30));
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      await db.insert(payments).values({
        clientId,
        orderId: Math.random() > 0.3 ? orderId : null,
        amount: (Math.floor(Math.random() * 200000) + 10000).toString(),
        status: status as any,
        dueDate,
        paidAt: status === 'PAID' ? randomDate(dueDate, new Date()) : null,
        remindersSent: Math.floor(Math.random() * 5),
        lastReminderAt: Math.random() > 0.5 ? randomDate(dueDate, new Date()) : null,
        notes: `Payment for invoice ${i + 1} - ${status.toLowerCase()} status`,
      });
    }

    // 7. Create Tasks (50)
    console.log("Creating tasks...");
    const taskTypes = ['ONE_TIME', 'RECURRING'];
    
    for (let i = 0; i < 50; i++) {
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const assignedTo = userIds[Math.floor(Math.random() * userIds.length)];
      const clientId = Math.random() > 0.3 ? clientIds[Math.floor(Math.random() * clientIds.length)] : null;
      const orderId = Math.random() > 0.4 ? orderIds[Math.floor(Math.random() * orderIds.length)] : null;
      const dueDate = randomDate(new Date(), addDays(new Date(), 30));
      const isCompleted = Math.random() > 0.4;
      
      await db.insert(tasks).values({
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: `Detailed description for task ${i + 1} - ${taskType.toLowerCase()} task`,
        type: taskType as any,
        assignedTo,
        clientId,
        orderId,
        isCompleted,
        dueDate,
        completedAt: isCompleted ? randomDate(new Date(2024, 0, 1), dueDate) : null,
        recurringInterval: taskType === 'RECURRING' ? [7, 14, 30][Math.floor(Math.random() * 3)] : null,
        nextDueDate: taskType === 'RECURRING' && !isCompleted ? addDays(dueDate, 7) : null,
      });
    }

    // 8. Create E-way Bills (50)
    console.log("Creating e-way bills...");
    for (let i = 0; i < 50; i++) {
      const orderId = orderIds[Math.floor(Math.random() * orderIds.length)];
      const validFrom = randomDate(new Date(2024, 0, 1), new Date());
      const vehicleNumber = vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)];
      const driverName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      
      await db.insert(ewayBills).values({
        ewayNumber: `EWB${new Date().getFullYear()}${(Math.floor(Math.random() * 900000000) + 100000000)}`,
        orderId,
        vehicleNumber,
        driverName,
        driverPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        validFrom,
        validUntil: addDays(validFrom, Math.random() > 0.7 ? 10 : 3),
        isExtended: Math.random() > 0.8,
        extensionCount: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      });
    }

    // 9. Create Client Tracking (50)
    console.log("Creating client tracking...");
    const trackingStatuses = ['LOADING', 'IN_TRANSIT', 'DELIVERED'];
    
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const orderId = orderIds[Math.floor(Math.random() * orderIds.length)];
      const vehicleNumber = vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)];
      const driverName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const currentLocation = cities[Math.floor(Math.random() * cities.length)];
      const destinationLocation = cities[Math.floor(Math.random() * cities.length)];
      
      await db.insert(clientTracking).values({
        clientId,
        orderId,
        vehicleNumber,
        driverName,
        driverPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        currentLocation,
        destinationLocation,
        distanceRemaining: Math.floor(Math.random() * 800) + 50,
        estimatedArrival: randomDate(new Date(), addDays(new Date(), 7)),
        status: trackingStatuses[Math.floor(Math.random() * trackingStatuses.length)] as any,
        lastUpdated: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      });
    }

    // 10. Create Sales Rates (50)
    console.log("Creating sales rates...");
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const salesPersonId = userIds[Math.floor(Math.random() * userIds.length)];
      const date = randomDate(new Date(2024, 0, 1), new Date());
      
      await db.insert(salesRates).values({
        clientId,
        salesPersonId,
        date,
        rate: (Math.random() * 100 + 500).toFixed(2),
        volume: (Math.floor(Math.random() * 10000) + 1000).toString(),
        notes: `Sales rate for period ${i + 1} - market analysis included`,
      });
    }

    console.log("Data population completed successfully!");
    console.log("Created:");
    console.log("- 50 Users");
    console.log("- 50 Clients");
    console.log("- 50 Credit Agreements");
    console.log("- 50 Orders");
    console.log("- 50 Purchase Orders");
    console.log("- 50 Payments");
    console.log("- 50 Tasks");
    console.log("- 50 E-way Bills");
    console.log("- 50 Client Tracking Records");
    console.log("- 50 Sales Rates");

  } catch (error) {
    console.error("Error populating data:", error);
    throw error;
  }
}

// Run the population script
populateData().then(() => {
  console.log("All done!");
  process.exit(0);
}).catch((error) => {
  console.error("Population failed:", error);
  process.exit(1);
});