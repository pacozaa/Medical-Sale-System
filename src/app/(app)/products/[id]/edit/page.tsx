import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/products";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SALES_MANAGER");
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id }, include: { inventory: true } });
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>
      <form action={updateProductWithId} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={product.name} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="sku">SKU</label>
          <input id="sku" name="sku" required defaultValue={product.sku} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="category">Category</label>
          <input id="category" name="category" defaultValue={product.category ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={product.description ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="unitPrice">Unit Price (USD)</label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product.unitPrice.toString()}
            className={input}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="quantityOnHand">Stock on Hand</label>
            <input
              id="quantityOnHand"
              name="quantityOnHand"
              type="number"
              min="0"
              defaultValue={product.inventory?.quantityOnHand ?? 0}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="reorderLevel">Reorder Level</label>
            <input
              id="reorderLevel"
              name="reorderLevel"
              type="number"
              min="0"
              defaultValue={product.inventory?.reorderLevel ?? 10}
              className={input}
            />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="warehouseLocation">Warehouse Location</label>
          <input
            id="warehouseLocation"
            name="warehouseLocation"
            defaultValue={product.inventory?.warehouseLocation ?? "Main Warehouse"}
            className={input}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Save Changes</button>
          <Link href="/products" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
