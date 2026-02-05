// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Categories {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    description?: string;
  };
}

export interface Locations {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    code?: string;
    description?: string;
  };
}

export interface Inventory {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    sku?: string;
    category?: string; // applookup -> URL zu 'Categories' Record
    location?: string; // applookup -> URL zu 'Locations' Record
    quantity?: number;
    min_quantity?: number;
    unit_price?: number;
  };
}

export interface Suppliers {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface GoodsReceipt {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    receipt_number?: string;
    supplier?: string; // applookup -> URL zu 'Suppliers' Record
    item?: string; // applookup -> URL zu 'Inventory' Record
    quantity?: number;
    receipt_date?: string; // Format: YYYY-MM-DD oder ISO String
    notes?: string;
  };
}

export const APP_IDS = {
  CATEGORIES: '6984a4fac01ae38848ef1908',
  LOCATIONS: '6984a4fb641bdbe96f5d5d23',
  INVENTORY: '6984a4fbb31a385167ef8f99',
  SUPPLIERS: '6984ab3b179414d6aaf6ba08',
  GOODS_RECEIPT: '6984ab3b6b4e4abf3d48df96',
} as const;

// Helper Types for creating new records
export type CreateCategories = Categories['fields'];
export type CreateLocations = Locations['fields'];
export type CreateInventory = Inventory['fields'];
export type CreateSuppliers = Suppliers['fields'];
export type CreateGoodsReceipt = GoodsReceipt['fields'];