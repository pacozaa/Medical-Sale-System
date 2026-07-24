import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { card, input, table, td, th } from "@/components/ui";

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("SALES_MANAGER");
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const reps = await prisma.salesRep.findMany({
    where: query
      ? {
          user: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        }
      : {},
    include: {
      user: true,
      customers: { select: { id: true } },
      orders: {
        include: { items: true },
      },
    },
  });

  const ranked = reps
    .map((rep) => {
      const completedOrders = rep.orders.filter((order) => order.status === "COMPLETED");
      const kitsSold = completedOrders.reduce(
        (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
        0,
      );
      const revenue = completedOrders.reduce(
        (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity * Number(item.unitPrice), 0),
        0,
      );
      return {
        id: rep.id,
        name: rep.user.name,
        email: rep.user.email,
        region: rep.region ?? "—",
        customerCount: rep.customers.length,
        orderCount: rep.orders.length,
        completedOrderCount: completedOrders.length,
        kitsSold,
        revenue,
      };
    })
    .sort((a, b) => b.kitsSold - a.kitsSold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sales Rep Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">Rank and search sales reps by how many test kits they have sold.</p>
      </div>

      <form className={`${card} max-w-md`}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="q">
          Search by name or email
        </label>
        <div className="mt-1 flex gap-2">
          <input id="q" name="q" defaultValue={query} placeholder="e.g. Alice" className={`${input} mt-0`} />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Search
          </button>
        </div>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Rank</th>
              <th className={th}>Sales Rep</th>
              <th className={th}>Region</th>
              <th className={th}>Customers</th>
              <th className={th}>Orders (Completed)</th>
              <th className={th}>Kits Sold</th>
              <th className={th}>Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranked.map((rep, index) => (
              <tr key={rep.id}>
                <td className={td}>#{index + 1}</td>
                <td className={td}>
                  <div>{rep.name}</div>
                  <div className="text-xs text-slate-400">{rep.email}</div>
                </td>
                <td className={td}>{rep.region}</td>
                <td className={td}>{rep.customerCount}</td>
                <td className={td}>
                  {rep.orderCount} ({rep.completedOrderCount})
                </td>
                <td className={td}>
                  <span className="font-semibold text-slate-900">{rep.kitsSold}</span>
                </td>
                <td className={td}>${rep.revenue.toFixed(2)}</td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr>
                <td className={td} colSpan={7}>
                  No sales reps match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
