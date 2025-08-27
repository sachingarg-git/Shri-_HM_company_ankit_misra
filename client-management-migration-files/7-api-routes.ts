// FILE 7: API Routes
// ADD these routes to your server/routes.ts file inside the registerRoutes function
// Also add this import at the top: import { insertClientSchema } from "@shared/schema";

// Client Management API Routes - ADD THESE ROUTES
app.get("/api/clients", async (req, res) => {
  try {
    const { category, search, dateFrom, dateTo } = req.query;
    const clients = await storage.getFilteredClients({
      category: category as string,
      search: search as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients" });
  }
});

app.get("/api/clients/stats", async (req, res) => {
  try {
    const stats = await storage.getClientCategoryStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client stats" });
  }
});

app.get("/api/clients/:id", async (req, res) => {
  try {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const cleanedData = { ...req.body };
    
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || (Array.isArray(cleanedData[key]) && cleanedData[key].length === 0)) {
        cleanedData[key] = null;
      }
    });

    const clientData = insertClientSchema.parse(cleanedData);
    const client = await storage.createClient(clientData);
    res.status(201).json(client);
  } catch (error: any) {
    console.error("Client creation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create client", error: error.message });
  }
});

app.put("/api/clients/:id", async (req, res) => {
  try {
    const clientData = insertClientSchema.partial().parse(req.body);
    const client = await storage.updateClient(req.params.id, clientData);
    res.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update client" });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  try {
    await storage.deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete client" });
  }
});