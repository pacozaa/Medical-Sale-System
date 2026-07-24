import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar name={session.user.name ?? session.user.email ?? "User"} role={session.user.role} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
