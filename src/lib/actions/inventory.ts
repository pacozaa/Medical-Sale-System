"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

const adjustSchema = z.object({
  quantityOnHand: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  reorderLevel: z.coerce.number().int().min(0, "Reorder level cannot be negative"),
  warehouseLocation: z.string().trim().min(1, "Warehouse location is required"),
});

export async function adjustInventory(productId: string, formData: FormData) {
  await requireRole("SALES_MANAGER");

  const data = adjustSchema.parse({
    quantityOnHand: formData.get("quantityOnHand"),
    reorderLevel: formData.get("reorderLevel"),
    warehouseLocation: formData.get("warehouseLocation"),
  });

  await prisma.inventoryItem.upsert({
    where: { productId },
    create: { productId, ...data },
    update: data,
  });

  revalidatePath("/inventory");
  revalidatePath("/products");
}
