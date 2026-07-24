import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteCustomer } from "@/lib/actions/customers";
import { DeleteButton } from "@/components/delete-button";
import { card, primaryButton, table, td, th } from "@/components/ui";

export default async function CustomersPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";

  const customers = await prisma.customer.findMany({
    where: isManager ? {} : { salesRepId: session?.user.salesRepId ?? "__none__" },
    include: { salesRep: { include: { user: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isManager ? "All customer accounts across the sales team." : "Your assigned customer accounts."}
          </p>
        </div>
        <Link href="/customers/new" className={primaryButton}>
          Add Customer
        </Link>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Organization</th>
              <th className={th}>Contact</th>
              <th className={th}>Sales Rep</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className={td}>{customer.name}</td>
                <td className={td}>{customer.organization ?? "—"}</td>
                <td className={td}>
                  <div>{customer.email ?? "—"}</div>
                  <div className="text-slate-400">{customer.phone ?? ""}</div>
                </td>
                <td className={td}>{customer.salesRep.user.name}</td>
                <td className={`${td} space-x-3`}>
                  <Link href={`/customers/${customer.id}/edit`} className="font-medium text-slate-700 hover:text-slate-900">
                    Edit
                  </Link>
                  <DeleteButton action={deleteCustomer.bind(null, customer.id)} confirmMessage={`Delete ${customer.name}?`} />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className={td} colSpan={5}>
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
