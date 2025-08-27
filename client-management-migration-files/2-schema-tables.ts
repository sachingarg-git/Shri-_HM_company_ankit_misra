// FILE 2: Database Tables
// ADD these table definitions to your shared/schema.ts file

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Company & Compliance
  name: text("name").notNull(),
  category: clientCategoryEnum("category").notNull(),
  billingAddressLine: text("billing_address_line"),
  billingCity: text("billing_city"),
  billingPincode: text("billing_pincode"),
  billingState: text("billing_state"),
  billingCountry: text("billing_country").default('India'),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  msmeNumber: text("msme_number"),
  incorporationCertNumber: text("incorporation_cert_number"),
  incorporationDate: timestamp("incorporation_date"),
  companyType: companyTypeEnum("company_type"),
  
  // Primary Contact Details
  contactPersonName: text("contact_person_name"),
  mobileNumber: text("mobile_number"),
  email: text("email"),
  communicationPreferences: text("communication_preferences").array(),
  
  // Commercial & Finance
  paymentTerms: integer("payment_terms").default(30),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  bankInterestApplicable: bankInterestEnum("bank_interest_applicable"),
  interestPercent: decimal("interest_percent", { precision: 5, scale: 2 }),
  poRequired: boolean("po_required").default(false),
  invoicingEmails: text("invoicing_emails").array(),
  
  // Documents Upload Status
  gstCertificateUploaded: boolean("gst_certificate_uploaded").default(false),
  panCopyUploaded: boolean("pan_copy_uploaded").default(false),
  securityChequeUploaded: boolean("security_cheque_uploaded").default(false),
  aadharCardUploaded: boolean("aadhar_card_uploaded").default(false),
  agreementUploaded: boolean("agreement_uploaded").default(false),
  poRateContractUploaded: boolean("po_rate_contract_uploaded").default(false),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Shipping Addresses table
export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  contactPersonName: text("contact_person_name"),
  contactPersonMobile: text("contact_person_mobile"),
  deliveryAddressName: text("delivery_address_name"),
  googleLocation: text("google_location"),
  deliveryWindowFrom: text("delivery_window_from"),
  deliveryWindowTo: text("delivery_window_to"),
  unloadingFacility: unloadingFacilityEnum("unloading_facility"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});