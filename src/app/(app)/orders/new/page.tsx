import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewOrderForm } from "./new-order-form";

export default async function NewOrderPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";
  const salesRepId = session?.user.salesRepId ?? "";

  const [customers, products, salesRepsRaw] = await Promise.all([
    prisma.customer.findMany({
      where: isManager ? {} : { salesRepId },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    isManager
      ? prisma.salesRep.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } })
      : prisma.salesRep.findMany({ where: { id: salesRepId }, include: { user: true } }),
  ]);

  const salesReps = salesRepsRaw.map((rep) => ({ id: rep.id, name: rep.user.name }));

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">New Order</h1>
      <NewOrderForm
        customers={customers}
        products={products}
        salesReps={salesReps}
        isManager={isManager}
        defaultSalesRepId={salesRepId}
      />
    </div>
  );
}
