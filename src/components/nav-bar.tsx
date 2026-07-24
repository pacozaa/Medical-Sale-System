import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@prisma/client";

const links: { href: string; label: string; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["SALES_REP", "SALES_MANAGER"] },
  { href: "/products", label: "Products", roles: ["SALES_REP", "SALES_MANAGER"] },
  { href: "/customers", label: "Customers", roles: ["SALES_REP", "SALES_MANAGER"] },
  { href: "/orders", label: "Orders", roles: ["SALES_REP", "SALES_MANAGER"] },
  { href: "/inventory", label: "Inventory", roles: ["SALES_REP", "SALES_MANAGER"] },
  { href: "/sales-reps", label: "Sales Reps", roles: ["SALES_MANAGER"] },
  { href: "/tracking", label: "Rep Tracking", roles: ["SALES_MANAGER"] },
];

export function NavBar({ name, role }: { name: string; role: Role }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            MedTest Sales
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            {links
              .filter((link) => link.roles.includes(role))
              .map((link) => (
                <Link key={link.href} href={link.href} className="text-slate-600 hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {name} <span className="text-slate-400">({role === "SALES_MANAGER" ? "Manager" : "Rep"})</span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
