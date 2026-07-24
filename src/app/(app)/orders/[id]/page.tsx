import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { card, secondaryButton, table, td, th } from "@/components/ui";
import { OrderActions } from "./order-actions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      salesRep: { include: { user: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  const isManager = session?.user.role === "SALES_MANAGER";
  if (!isManager && session?.user.salesRepId !== order.salesRepId) {
    notFound();
  }

  const total = order.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
  const totalKits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {order.createdAt.toLocaleString()} by {order.salesRep.user.name}
          </p>
        </div>
        <Link href="/orders" className={secondaryButton}>
          Back to Orders
        </Link>
      </div>

      <div className={`${card} grid grid-cols-2 gap-4 sm:grid-cols-4`}>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <p className="font-medium text-slate-900">{order.status}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Customer</p>
          <p className="font-medium text-slate-900">{order.customer.name}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Kits</p>
          <p className="font-medium text-slate-900">{totalKits}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Order Total</p>
          <p className="font-medium text-slate-900">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Quantity</th>
              <th className={th}>Unit Price</th>
              <th className={th}>Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className={td}>{item.product.name}</td>
                <td className={td}>{item.quantity}</td>
                <td className={td}>${Number(item.unitPrice).toFixed(2)}</td>
                <td className={td}>${(item.quantity * Number(item.unitPrice)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div className={card}>
          <p className="text-sm font-medium text-slate-700">Notes</p>
          <p className="mt-1 text-sm text-slate-600">{order.notes}</p>
        </div>
      )}

      {order.status === "PENDING" && <OrderActions orderId={order.id} />}
    </div>
  );
}
