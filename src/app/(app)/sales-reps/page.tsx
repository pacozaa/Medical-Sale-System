import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteSalesRep } from "@/lib/actions/sales-reps";
import { DeleteButton } from "@/components/delete-button";
import { card, primaryButton, table, td, th } from "@/components/ui";

export default async function SalesRepsPage() {
  await requireRole("SALES_MANAGER");

  const reps = await prisma.user.findMany({
    where: { salesRep: { isNot: null } },
    include: {
      salesRep: {
        include: {
          _count: { select: { customers: true, orders: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sales Representatives</h1>
          <p className="mt-1 text-sm text-slate-500">Manage sales team members and their access.</p>
        </div>
        <Link href="/sales-reps/new" className={primaryButton}>
          Add Sales Rep
        </Link>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Region</th>
              <th className={th}>Customers</th>
              <th className={th}>Orders</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reps.map((rep) => (
              <tr key={rep.id}>
                <td className={td}>{rep.name}</td>
                <td className={td}>{rep.email}</td>
                <td className={td}>{rep.role === "SALES_MANAGER" ? "Manager" : "Rep"}</td>
                <td className={td}>{rep.salesRep?.region ?? "—"}</td>
                <td className={td}>{rep.salesRep?._count.customers ?? 0}</td>
                <td className={td}>{rep.salesRep?._count.orders ?? 0}</td>
                <td className={`${td} space-x-3`}>
                  <Link href={`/sales-reps/${rep.id}/edit`} className="font-medium text-slate-700 hover:text-slate-900">
                    Edit
                  </Link>
                  <DeleteButton action={deleteSalesRep.bind(null, rep.id)} confirmMessage={`Remove ${rep.name}?`} />
                </td>
              </tr>
            ))}
            {reps.length === 0 && (
              <tr>
                <td className={td} colSpan={7}>
                  No sales representatives yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
