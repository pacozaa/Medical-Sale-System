import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { createProduct } from "@/lib/actions/products";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function NewProductPage() {
  await requireRole("SALES_MANAGER");

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add Product</h1>
      <form action={createProduct} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="sku">SKU</label>
          <input id="sku" name="sku" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="category">Category</label>
          <input id="category" name="category" className={input} placeholder="e.g. Rapid Antigen" />
        </div>
        <div>
          <label className={label} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="unitPrice">Unit Price (USD)</label>
          <input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required className={input} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="quantityOnHand">Initial Stock</label>
            <input id="quantityOnHand" name="quantityOnHand" type="number" min="0" defaultValue={0} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="reorderLevel">Reorder Level</label>
            <input id="reorderLevel" name="reorderLevel" type="number" min="0" defaultValue={10} className={input} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="warehouseLocation">Warehouse Location</label>
          <input id="warehouseLocation" name="warehouseLocation" defaultValue="Main Warehouse" className={input} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Create Product</button>
          <Link href="/products" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
