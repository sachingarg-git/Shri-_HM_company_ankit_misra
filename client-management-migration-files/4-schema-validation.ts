// FILE 4: Validation Schemas
// ADD these validation schemas to your shared/schema.ts file

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  incorporationDate: z.union([z.string(), z.date(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      try {
        return new Date(val);
      } catch {
        return null;
      }
    }
    return val;
  }),
  creditLimit: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      const num = parseFloat(val);
      return isNaN(num) ? null : num.toString();
    }
    return val;
  }),
  interestPercent: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      const num = parseFloat(val);
      return isNaN(num) ? null : num.toString();
    }
    return val;
  }),
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;