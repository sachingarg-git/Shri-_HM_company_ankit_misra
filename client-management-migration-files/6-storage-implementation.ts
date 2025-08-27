// FILE 6: Storage Implementation
// ADD these methods to your DatabaseStorage class in server/storage.ts
// Also add this import at the top: import { clients, type Client, type InsertClient, insertClientSchema } from "@shared/schema";

// Client Management Implementation - ADD TO DatabaseStorage CLASS
async getClient(id: string): Promise<Client | undefined> {
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client || undefined;
}

async getAllClients(): Promise<Client[]> {
  return await db.select().from(clients).orderBy(asc(clients.name));
}

async getClientsByCategory(category: string): Promise<Client[]> {
  return await db.select().from(clients).where(eq(clients.category, category as any)).orderBy(asc(clients.name));
}

async getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string }): Promise<Client[]> {
  let query = db.select().from(clients);
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(clients.category, filters.category as any));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${clients.name}) LIKE ${searchTerm} OR 
           LOWER(${clients.email}) LIKE ${searchTerm} OR 
           LOWER(${clients.mobileNumber}) LIKE ${searchTerm})`
    );
  }

  if (filters.dateFrom) {
    conditions.push(gte(clients.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(clients.createdAt, toDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query.orderBy(asc(clients.name));
}

async getClientCategoryStats(): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }> {
  const results = await db.select({
    category: clients.category,
    count: sql<number>`count(*)::int`
  }).from(clients).groupBy(clients.category);

  const stats = { ALFA: 0, BETA: 0, GAMMA: 0, DELTA: 0, total: 0 };
  
  results.forEach(result => {
    if (result.category in stats) {
      stats[result.category as keyof typeof stats] = result.count;
      stats.total += result.count;
    }
  });

  return stats;
}

async createClient(insertClient: InsertClient): Promise<Client> {
  const [client] = await db.insert(clients).values(insertClient).returning();
  return client;
}

async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client> {
  const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
  return client;
}

async deleteClient(id: string): Promise<void> {
  await db.delete(clients).where(eq(clients.id, id));
}