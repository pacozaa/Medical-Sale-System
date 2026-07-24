import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/products";
import { DeleteButton } from "@/components/delete-button";
import { card, primaryButton, table, td, th } from "@/components/ui";

export default async function ProductsPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";

  const products = await prisma.product.findMany({
    include: { inventory: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Medical test kits available for sale.</p>
        </div>
        {isManager && (
          <Link href="/products/new" className={primaryButton}>
            Add Product
          </Link>
        )}
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>SKU</th>
              <th className={th}>Category</th>
              <th className={th}>Unit Price</th>
              <th className={th}>Stock</th>
              {isManager && <th className={th}>Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className={td}>{product.name}</td>
                <td className={td}>{product.sku}</td>
                <td className={td}>{product.category ?? "—"}</td>
                <td className={td}>${product.unitPrice.toString()}</td>
                <td className={td}>{product.inventory?.quantityOnHand ?? 0}</td>
                {isManager && (
                  <td className={`${td} space-x-3`}>
                    <Link href={`/products/${product.id}/edit`} className="font-medium text-slate-700 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteProduct.bind(null, product.id)} confirmMessage={`Delete ${product.name}?`} />
                  </td>
                )}
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className={td} colSpan={6}>
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
