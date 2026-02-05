// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Categories, Locations, Inventory } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- CATEGORIES ---
  static async getCategories(): Promise<Categories[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.CATEGORIES}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getCategorie(id: string): Promise<Categories | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.CATEGORIES}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createCategorie(fields: Categories['fields']) {
    return callApi('POST', `/apps/${APP_IDS.CATEGORIES}/records`, { fields });
  }
  static async updateCategorie(id: string, fields: Partial<Categories['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.CATEGORIES}/records/${id}`, { fields });
  }
  static async deleteCategorie(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.CATEGORIES}/records/${id}`);
  }

  // --- LOCATIONS ---
  static async getLocations(): Promise<Locations[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LOCATIONS}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getLocation(id: string): Promise<Locations | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LOCATIONS}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createLocation(fields: Locations['fields']) {
    return callApi('POST', `/apps/${APP_IDS.LOCATIONS}/records`, { fields });
  }
  static async updateLocation(id: string, fields: Partial<Locations['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.LOCATIONS}/records/${id}`, { fields });
  }
  static async deleteLocation(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.LOCATIONS}/records/${id}`);
  }

  // --- INVENTORY ---
  static async getInventory(): Promise<Inventory[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.INVENTORY}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getInventoryEntry(id: string): Promise<Inventory | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.INVENTORY}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createInventoryEntry(fields: Inventory['fields']) {
    return callApi('POST', `/apps/${APP_IDS.INVENTORY}/records`, { fields });
  }
  static async updateInventoryEntry(id: string, fields: Partial<Inventory['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.INVENTORY}/records/${id}`, { fields });
  }
  static async deleteInventoryEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.INVENTORY}/records/${id}`);
  }

}