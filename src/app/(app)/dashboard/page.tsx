import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { card } from "@/components/ui";

export default async function DashboardPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";
  const salesRepId = session?.user.salesRepId;

  const orderWhere = isManager ? {} : { salesRepId: salesRepId ?? "__none__" };
  const customerWhere = isManager ? {} : { salesRepId: salesRepId ?? "__none__" };

  const [productCount, customerCount, pendingOrders, completedOrders, inventoryItems, kitsSoldAgg] = await Promise.all([
    prisma.product.count(),
    prisma.customer.count({ where: customerWhere }),
    prisma.order.count({ where: { ...orderWhere, status: "PENDING" } }),
    prisma.order.count({ where: { ...orderWhere, status: "COMPLETED" } }),
    prisma.inventoryItem.findMany({ include: { product: true } }),
    prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: { order: { ...orderWhere, status: "COMPLETED" } },
    }),
  ]);

  const lowStock = inventoryItems
    .filter((item) => item.quantityOnHand <= item.reorderLevel)
    .slice(0, 5);

  const stats = [
    { label: "Products", value: productCount, href: "/products" },
    { label: isManager ? "Customers" : "My Customers", value: customerCount, href: "/customers" },
    { label: "Pending Orders", value: pendingOrders, href: "/orders" },
    { label: "Completed Orders", value: completedOrders, href: "/orders" },
    { label: "Kits Sold", value: kitsSoldAgg._sum.quantity ?? 0, href: isManager ? "/tracking" : "/orders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {session?.user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isManager ? "Here is an overview of the whole sales operation." : "Here is an overview of your accounts."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`${card} hover:border-slate-300`}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold text-slate-900">Low stock alerts</h2>
        {lowStock.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">All products are sufficiently stocked.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {lowStock.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{item.product.name}</span>
                <span className="font-medium text-red-600">
                  {item.quantityOnHand} left (reorder at {item.reorderLevel})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
