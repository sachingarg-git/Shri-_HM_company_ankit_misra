// FILE 5: Storage Interface
// ADD these methods to your IStorage interface in server/storage.ts

// Client Management Methods - ADD TO IStorage INTERFACE
getClient(id: string): Promise<Client | undefined>;
getAllClients(): Promise<Client[]>;
getClientsByCategory(category: string): Promise<Client[]>;
getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string }): Promise<Client[]>;
getClientCategoryStats(): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }>;
createClient(client: InsertClient): Promise<Client>;
updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
deleteClient(id: string): Promise<void>;