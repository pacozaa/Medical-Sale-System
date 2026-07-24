import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adjustInventory } from "@/lib/actions/inventory";
import { card, input, primaryButton, table, td, th } from "@/components/ui";

export default async function InventoryPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";

  const items = await prisma.inventoryItem.findMany({
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inventory (Warehouse)</h1>
        <p className="mt-1 text-sm text-slate-500">Stock levels for all medical test kits.</p>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Location</th>
              <th className={th}>Quantity on Hand</th>
              <th className={th}>Reorder Level</th>
              <th className={th}>Status</th>
              {isManager && <th className={th}>Update</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const low = item.quantityOnHand <= item.reorderLevel;
              const adjustInventoryForProduct = adjustInventory.bind(null, item.productId);
              return (
                <tr key={item.id}>
                  <td className={td}>{item.product.name}</td>
                  <td className={td}>{item.warehouseLocation}</td>
                  <td className={td}>{item.quantityOnHand}</td>
                  <td className={td}>{item.reorderLevel}</td>
                  <td className={td}>
                    <span className={low ? "font-medium text-red-600" : "font-medium text-emerald-600"}>
                      {low ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  {isManager && (
                    <td className={td}>
                      <form action={adjustInventoryForProduct} className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          name="quantityOnHand"
                          min="0"
                          defaultValue={item.quantityOnHand}
                          className={`${input} mt-0 w-24`}
                          aria-label="Quantity on hand"
                        />
                        <input
                          type="number"
                          name="reorderLevel"
                          min="0"
                          defaultValue={item.reorderLevel}
                          className={`${input} mt-0 w-24`}
                          aria-label="Reorder level"
                        />
                        <input
                          type="text"
                          name="warehouseLocation"
                          defaultValue={item.warehouseLocation}
                          className={`${input} mt-0 w-40`}
                          aria-label="Warehouse location"
                        />
                        <button type="submit" className={primaryButton}>
                          Save
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td className={td} colSpan={6}>
                  No inventory records yet. Add a product to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
