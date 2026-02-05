import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InventoryItem {
  record_id: string;
  name: string;
  sku: string;
  category: string;
  category_name?: string;
  location: string;
  location_name?: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity === 0) return { label: "Nicht verfügbar", class: "status-out-of-stock" };
  if (quantity <= minQuantity) return { label: "Niedriger Bestand", class: "status-low-stock" };
  return { label: "Auf Lager", class: "status-in-stock" };
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead>Artikelnr.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Lagerort</TableHead>
            <TableHead className="text-right">Menge</TableHead>
            <TableHead className="text-right">Stückpreis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Keine Artikel gefunden
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const status = getStockStatus(item.quantity, item.min_quantity);
              return (
                <TableRow key={item.record_id} className="animate-slide-in">
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category_name || item.category}</TableCell>
                  <TableCell>{item.location_name || item.location}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        item.quantity <= item.min_quantity && "text-[var(--status-out-of-stock)]"
                      )}
                    >
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground"> / Min: {item.min_quantity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    €{item.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium", status.class)}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(item.record_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
