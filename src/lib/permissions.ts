import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Returns the current session or throws if the user is not authenticated. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

/** Returns the current session and ensures the user has one of the allowed roles. */
export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session;
}

export function isManager(role: Role) {
  return role === "SALES_MANAGER";
}
