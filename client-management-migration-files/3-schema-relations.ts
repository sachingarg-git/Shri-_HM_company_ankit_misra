// FILE 3: Database Relations
// ADD these relation definitions to your shared/schema.ts file

export const clientsRelations = relations(clients, ({ many }) => ({
  orders: many(orders),
  payments: many(payments),
  creditAgreements: many(creditAgreements),
  tasks: many(tasks),
  clientTracking: many(clientTracking),
  salesRates: many(salesRates),
  purchaseOrders: many(purchaseOrders),
  shippingAddresses: many(shippingAddresses),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({ one }) => ({
  client: one(clients, {
    fields: [shippingAddresses.clientId],
    references: [clients.id],
  }),
}));