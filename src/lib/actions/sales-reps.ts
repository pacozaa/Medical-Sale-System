"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SALES_REP", "SALES_MANAGER"]),
  phone: z.string().trim().optional(),
  region: z.string().trim().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.enum(["SALES_REP", "SALES_MANAGER"]),
  phone: z.string().trim().optional(),
  region: z.string().trim().optional(),
});

export async function createSalesRep(formData: FormData) {
  await requireRole("SALES_MANAGER");

  const data = createSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    region: formData.get("region") || undefined,
  });

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      salesRep: {
        create: {
          phone: data.phone,
          region: data.region,
        },
      },
    },
  });

  revalidatePath("/sales-reps");
  redirect("/sales-reps");
}

export async function updateSalesRep(userId: string, formData: FormData) {
  await requireRole("SALES_MANAGER");

  const data = updateSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    region: formData.get("region") || undefined,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      role: data.role,
      salesRep: {
        update: {
          phone: data.phone,
          region: data.region,
        },
      },
    },
  });

  revalidatePath("/sales-reps");
  redirect("/sales-reps");
}

export async function deleteSalesRep(userId: string) {
  await requireRole("SALES_MANAGER");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/sales-reps");
}
