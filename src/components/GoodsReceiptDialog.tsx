import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupplierUI } from "./SupplierDialog";
import type { InventoryItem } from "./InventoryTable";

export interface GoodsReceiptUI {
  record_id: string;
  receipt_number: string;
  supplier: string;
  supplier_name?: string;
  item: string;
  item_name?: string;
  quantity: number;
  receipt_date: string;
  notes?: string;
}

interface GoodsReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<GoodsReceiptUI, "record_id" | "supplier_name" | "item_name"> | GoodsReceiptUI) => void;
  editItem?: GoodsReceiptUI | null;
  suppliers: SupplierUI[];
  items: InventoryItem[];
}

export function GoodsReceiptDialog({
  open,
  onOpenChange,
  onSubmit,
  editItem,
  suppliers,
  items,
}: GoodsReceiptDialogProps) {
  const [formData, setFormData] = useState({
    receipt_number: "",
    supplier: "",
    item: "",
    quantity: 1,
    receipt_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        receipt_number: editItem.receipt_number,
        supplier: editItem.supplier,
        item: editItem.item,
        quantity: editItem.quantity,
        receipt_date: editItem.receipt_date,
        notes: editItem.notes || "",
      });
    } else {
      setFormData({
        receipt_number: `WE-${Date.now().toString().slice(-6)}`,
        supplier: "",
        item: "",
        quantity: 1,
        receipt_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onSubmit({ ...formData, record_id: editItem.record_id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Wareneingang bearbeiten" : "Neuer Wareneingang"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receipt_number">Lieferscheinnummer *</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) =>
                    setFormData({ ...formData, receipt_number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_date">Eingangsdatum *</Label>
                <Input
                  id="receipt_date"
                  type="date"
                  value={formData.receipt_date}
                  onChange={(e) =>
                    setFormData({ ...formData, receipt_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Lieferant *</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lieferant wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.record_id} value={sup.record_id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item">Artikel *</Label>
                <Select
                  value={formData.item}
                  onValueChange={(value) =>
                    setFormData({ ...formData, item: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Artikel wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.record_id} value={item.record_id}>
                        {item.name} ({item.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Menge *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Bemerkungen</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                placeholder="Optionale Bemerkungen zum Wareneingang..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              {editItem ? "Speichern" : "Erfassen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
