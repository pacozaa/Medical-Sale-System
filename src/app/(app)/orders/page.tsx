import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { card, primaryButton, table, td, th } from "@/components/ui";

const statusStyles: Record<string, string> = {
  PENDING: "text-amber-600",
  COMPLETED: "text-emerald-600",
  CANCELLED: "text-slate-400",
};

export default async function OrdersPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";

  const orders = await prisma.order.findMany({
    where: isManager ? {} : { salesRepId: session?.user.salesRepId ?? "__none__" },
    include: {
      customer: true,
      salesRep: { include: { user: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track and fulfill test kit orders. Fulfilling deducts warehouse stock.</p>
        </div>
        <Link href="/orders/new" className={primaryButton}>
          New Order
        </Link>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Order</th>
              <th className={th}>Customer</th>
              <th className={th}>Sales Rep</th>
              <th className={th}>Kits</th>
              <th className={th}>Status</th>
              <th className={th}>Created</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={td}>#{order.id.slice(-6).toUpperCase()}</td>
                <td className={td}>{order.customer.name}</td>
                <td className={td}>{order.salesRep.user.name}</td>
                <td className={td}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className={td}>
                  <span className={`font-medium ${statusStyles[order.status]}`}>{order.status}</span>
                </td>
                <td className={td}>{order.createdAt.toLocaleDateString()}</td>
                <td className={td}>
                  <Link href={`/orders/${order.id}`} className="font-medium text-slate-700 hover:text-slate-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className={td} colSpan={7}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
