import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/lib/actions/customers";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function NewCustomerPage() {
  const session = await auth();
  const isManager = session?.user.role === "SALES_MANAGER";

  const salesReps = isManager
    ? await prisma.salesRep.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } })
    : await prisma.salesRep.findMany({ where: { id: session?.user.salesRepId ?? "__none__" }, include: { user: true } });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add Customer</h1>
      <form action={createCustomer} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="organization">Organization</label>
          <input id="organization" name="organization" className={input} placeholder="e.g. City Clinic" />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="address">Address</label>
          <textarea id="address" name="address" rows={2} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="salesRepId">Sales Representative</label>
          <select
            id="salesRepId"
            name="salesRepId"
            required
            disabled={!isManager}
            defaultValue={isManager ? "" : session?.user.salesRepId ?? ""}
            className={input}
          >
            {isManager && <option value="">Select a sales representative</option>}
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Create Customer</button>
          <Link href="/customers" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
