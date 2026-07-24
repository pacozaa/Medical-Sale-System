import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateSalesRep } from "@/lib/actions/sales-reps";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function EditSalesRepPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SALES_MANAGER");
  const { id } = await params;

  const rep = await prisma.user.findUnique({ where: { id }, include: { salesRep: true } });
  if (!rep || !rep.salesRep) notFound();

  const updateSalesRepWithId = updateSalesRep.bind(null, rep.id);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Sales Representative</h1>
      <form action={updateSalesRepWithId} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Full Name</label>
          <input id="name" name="name" required defaultValue={rep.name} className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input value={rep.email} disabled className={`${input} bg-slate-100 text-slate-500`} />
        </div>
        <div>
          <label className={label} htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue={rep.role} className={input}>
            <option value="SALES_REP">Sales Representative</option>
            <option value="SALES_MANAGER">Sales Manager</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="region">Region</label>
          <input id="region" name="region" defaultValue={rep.salesRep.region ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={rep.salesRep.phone ?? ""} className={input} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Save Changes</button>
          <Link href="/sales-reps" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
