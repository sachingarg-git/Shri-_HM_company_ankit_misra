// FILE 1: Schema Enums
// ADD these enums to your shared/schema.ts file (at the top with other enums)

export const clientCategoryEnum = pgEnum('client_category', ['ALFA', 'BETA', 'GAMMA', 'DELTA']);
export const companyTypeEnum = pgEnum('company_type', ['PVT_LTD', 'PARTNERSHIP', 'PROPRIETOR', 'GOVT', 'OTHERS']);
export const bankInterestEnum = pgEnum('bank_interest', ['FROM_DAY_1', 'FROM_DUE_DATE']);
export const unloadingFacilityEnum = pgEnum('unloading_facility', ['PUMP', 'CRANE', 'MANUAL', 'OTHERS']);