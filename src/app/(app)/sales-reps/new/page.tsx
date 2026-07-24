import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { createSalesRep } from "@/lib/actions/sales-reps";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

export default async function NewSalesRepPage() {
  await requireRole("SALES_MANAGER");

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add Sales Representative</h1>
      <form action={createSalesRep} className={`${card} space-y-4`}>
        <div>
          <label className={label} htmlFor="name">Full Name</label>
          <input id="name" name="name" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="password">Temporary Password</label>
          <input id="password" name="password" type="password" required minLength={8} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="SALES_REP" className={input}>
            <option value="SALES_REP">Sales Representative</option>
            <option value="SALES_MANAGER">Sales Manager</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="region">Region</label>
          <input id="region" name="region" className={input} placeholder="e.g. Northeast" />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className={input} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className={primaryButton}>Create</button>
          <Link href="/sales-reps" className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
