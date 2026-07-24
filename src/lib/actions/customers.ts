"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, requireSession } from "@/lib/permissions";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  organization: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  salesRepId: z.string().trim().min(1, "Sales representative is required"),
});

function parseForm(formData: FormData) {
  return customerSchema.parse({
    name: formData.get("name"),
    organization: formData.get("organization") || undefined,
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    salesRepId: formData.get("salesRepId"),
  });
}

/** Managers may assign any rep; reps may only manage their own customers. */
async function assertRepOwnership(session: Awaited<ReturnType<typeof requireSession>>, salesRepId: string) {
  if (session.user.role === "SALES_MANAGER") return;
  if (session.user.salesRepId !== salesRepId) {
    throw new ForbiddenError("Sales representatives can only manage their own customers.");
  }
}

export async function createCustomer(formData: FormData) {
  const session = await requireSession();
  const data = parseForm(formData);
  await assertRepOwnership(session, data.salesRepId);

  await prisma.customer.create({
    data: {
      name: data.name,
      organization: data.organization,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      salesRepId: data.salesRepId,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await requireSession();
  const data = parseForm(formData);

  const existing = await prisma.customer.findUniqueOrThrow({ where: { id } });
  await assertRepOwnership(session, existing.salesRepId);
  await assertRepOwnership(session, data.salesRepId);

  await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      organization: data.organization,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      salesRepId: data.salesRepId,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const session = await requireSession();
  const existing = await prisma.customer.findUniqueOrThrow({ where: { id } });
  await assertRepOwnership(session, existing.salesRepId);

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
