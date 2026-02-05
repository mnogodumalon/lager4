import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
import { InventoryTable, type InventoryItem } from "@/components/InventoryTable";
import { InventoryDialog } from "@/components/InventoryDialog";
import { CategoryDialog } from "@/components/CategoryDialog";
import { LocationDialog } from "@/components/LocationDialog";
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  FolderOpen,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { LivingAppsService, extractRecordId, createRecordUrl } from "@/services/livingAppsService";
import { APP_IDS, type Categories, type Locations, type Inventory } from "@/types/app";

interface CategoryUI {
  record_id: string;
  name: string;
  description?: string;
}

interface LocationUI {
  record_id: string;
  name: string;
  code: string;
  description?: string;
}

// Helper to transform API data to UI format
function transformCategory(cat: Categories): CategoryUI {
  return {
    record_id: cat.record_id,
    name: cat.fields.name || "",
    description: cat.fields.description,
  };
}

function transformLocation(loc: Locations): LocationUI {
  return {
    record_id: loc.record_id,
    name: loc.fields.name || "",
    code: loc.fields.code || "",
    description: loc.fields.description,
  };
}

function transformInventory(inv: Inventory, categories: CategoryUI[], locations: LocationUI[]): InventoryItem {
  const categoryId = extractRecordId(inv.fields.category);
  const locationId = extractRecordId(inv.fields.location);
  const category = categories.find((c) => c.record_id === categoryId);
  const location = locations.find((l) => l.record_id === locationId);

  return {
    record_id: inv.record_id,
    name: inv.fields.name || "",
    sku: inv.fields.sku || "",
    category: categoryId || "",
    category_name: category?.name || "",
    location: locationId || "",
    location_name: location ? `${location.name} (${location.code})` : "",
    quantity: inv.fields.quantity || 0,
    min_quantity: inv.fields.min_quantity || 0,
    unit_price: inv.fields.unit_price || 0,
  };
}

export default function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryUI[]>([]);
  const [locations, setLocations] = useState<LocationUI[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editCategory, setEditCategory] = useState<CategoryUI | null>(null);
  const [editLocation, setEditLocation] = useState<LocationUI | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [catsData, locsData, invData] = await Promise.all([
        LivingAppsService.getCategories(),
        LivingAppsService.getLocations(),
        LivingAppsService.getInventory(),
      ]);

      const cats = catsData.map(transformCategory);
      const locs = locsData.map(transformLocation);
      const inv = invData.map((i) => transformInventory(i, cats, locs));

      setCategories(cats);
      setLocations(locs);
      setItems(inv);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter((item) => item.quantity <= item.min_quantity && item.quantity > 0).length;
  const outOfStockItems = items.filter((item) => item.quantity === 0).length;
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleAddItem = async (data: Omit<InventoryItem, "record_id"> | InventoryItem) => {
    try {
      const fields: Inventory["fields"] = {
        name: data.name,
        sku: data.sku,
        category: createRecordUrl(APP_IDS.CATEGORIES, data.category),
        location: createRecordUrl(APP_IDS.LOCATIONS, data.location),
        quantity: data.quantity,
        min_quantity: data.min_quantity,
        unit_price: data.unit_price,
      };

      if ("record_id" in data && data.record_id) {
        await LivingAppsService.updateInventoryEntry(data.record_id, fields);
      } else {
        await LivingAppsService.createInventoryEntry(fields);
      }

      await loadAllData();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setEditItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Möchten Sie diesen Artikel wirklich löschen?")) {
      try {
        await LivingAppsService.deleteInventoryEntry(id);
        setItems((prev) => prev.filter((item) => item.record_id !== id));
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
      }
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAddCategory = async (data: { name: string; description?: string; record_id?: string }) => {
    try {
      const fields: Categories["fields"] = {
        name: data.name,
        description: data.description,
      };

      if (data.record_id) {
        await LivingAppsService.updateCategorie(data.record_id, fields);
      } else {
        await LivingAppsService.createCategorie(fields);
      }

      await loadAllData();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setEditCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Möchten Sie diese Kategorie wirklich löschen?")) {
      try {
        await LivingAppsService.deleteCategorie(id);
        setCategories((prev) => prev.filter((cat) => cat.record_id !== id));
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
      }
    }
  };

  const handleAddLocation = async (data: { name: string; code: string; description?: string; record_id?: string }) => {
    try {
      const fields: Locations["fields"] = {
        name: data.name,
        code: data.code,
        description: data.description,
      };

      if (data.record_id) {
        await LivingAppsService.updateLocation(data.record_id, fields);
      } else {
        await LivingAppsService.createLocation(fields);
      }

      await loadAllData();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setEditLocation(null);
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("Möchten Sie diesen Lagerort wirklich löschen?")) {
      try {
        await LivingAppsService.deleteLocation(id);
        setLocations((prev) => prev.filter((loc) => loc.record_id !== id));
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background warehouse-pattern">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary">
              <Warehouse className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Lagerverwaltung</h1>
          </div>
          <p className="text-muted-foreground">
            Verwalten Sie Ihren Lagerbestand effizient und behalten Sie den Überblick.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Gesamtbestand"
            value={totalItems.toLocaleString()}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Niedriger Bestand"
            value={lowStockItems}
            icon={AlertTriangle}
            variant="default"
          />
          <StatsCard
            title="Nicht verfügbar"
            value={outOfStockItems}
            icon={Package}
            variant="default"
          />
          <StatsCard
            title="Gesamtwert"
            value={`€${totalValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            variant="primary"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Inventar
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Kategorien
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Lagerorte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <CardTitle className="text-xl">Artikelübersicht</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setEditItem(null);
                        setDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Artikel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <InventoryTable
                  items={filteredItems}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Kategorien</CardTitle>
                  <Button
                    onClick={() => {
                      setEditCategory(null);
                      setCategoryDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Kategorie
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      Keine Kategorien vorhanden
                    </p>
                  ) : (
                    categories.map((category) => (
                      <Card key={category.record_id} className="bg-secondary/30">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description || "Keine Beschreibung"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {items.filter((i) => i.category === category.record_id).length} Artikel
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setEditCategory(category);
                                  setCategoryDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteCategory(category.record_id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Lagerorte</CardTitle>
                  <Button
                    onClick={() => {
                      setEditLocation(null);
                      setLocationDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Lagerort
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      Keine Lagerorte vorhanden
                    </p>
                  ) : (
                    locations.map((location) => (
                      <Card key={location.record_id} className="bg-secondary/30">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{location.name}</h3>
                              <p className="text-sm font-mono text-primary">{location.code}</p>
                              <p className="text-sm text-muted-foreground">
                                {location.description || "Keine Beschreibung"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {items.filter((i) => i.location === location.record_id).length} Artikel
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setEditLocation(location);
                                  setLocationDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteLocation(location.record_id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <InventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddItem}
        editItem={editItem}
        categories={categories}
        locations={locations}
      />
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleAddCategory}
        editItem={editCategory}
      />
      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        onSubmit={handleAddLocation}
        editItem={editLocation}
      />
    </div>
  );
}
