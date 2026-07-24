import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/permissions";
import { updateCustomer } from "@/lib/actions/customers";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const isManager = session?.user.role === "SALES_MANAGER";
  if (!isManager && session?.user.salesRepId !== customer.salesRepId) {
    throw new ForbiddenError("You can only edit your own customers.");
  }

  const salesReps = isManager
    ? await prisma.salesRep.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } })
    : await prisma.salesRep.findMany({ where: { id: customer.salesRepId }, include: { user: true } });

  const updateCustomerWithId = updateCustomer.bind(null, customer.id);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Customer</h1>
      <form action={updateCustomerWithId} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={customer.name} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="organization">Organization</label>
          <input id="organization" name="organization" defaultValue={customer.organization ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={customer.email ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={customer.phone ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="address">Address</label>
          <textarea id="address" name="address" rows={2} defaultValue={customer.address ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="salesRepId">Sales Representative</label>
          <select
            id="salesRepId"
            name="salesRepId"
            required
            disabled={!isManager}
            defaultValue={customer.salesRepId}
            className={input}
          >
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Save Changes</button>
          <Link href="/customers" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
