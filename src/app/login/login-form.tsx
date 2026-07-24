"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

const initialState: { error?: string } = {};

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(async (_prev, formData) => {
    const result = await loginAction(formData);
    return result ?? {};
  }, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">MedTest Sales System</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage products, customers and orders.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              placeholder="jane@medtest.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Demo accounts (after seeding):</p>
          <p>Manager: manager@medtest.com / Password123!</p>
          <p>Rep: alice.rep@medtest.com / Password123!</p>
        </div>
      </div>
    </div>
  );
}
