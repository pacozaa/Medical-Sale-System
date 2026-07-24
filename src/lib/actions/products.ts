"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  unitPrice: z.coerce.number().nonnegative("Price must be a positive number"),
  quantityOnHand: z.coerce.number().int().nonnegative().default(0),
  reorderLevel: z.coerce.number().int().nonnegative().default(10),
  warehouseLocation: z.string().trim().min(1).default("Main Warehouse"),
});

function parseForm(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    unitPrice: formData.get("unitPrice"),
    quantityOnHand: formData.get("quantityOnHand") || 0,
    reorderLevel: formData.get("reorderLevel") || 10,
    warehouseLocation: formData.get("warehouseLocation") || "Main Warehouse",
  });
}

export async function createProduct(formData: FormData) {
  await requireRole("SALES_MANAGER");
  const data = parseForm(formData);

  await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      unitPrice: data.unitPrice,
      inventory: {
        create: {
          quantityOnHand: data.quantityOnHand,
          reorderLevel: data.reorderLevel,
          warehouseLocation: data.warehouseLocation,
        },
      },
    },
  });

  revalidatePath("/products");
  revalidatePath("/inventory");
  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireRole("SALES_MANAGER");
  const data = parseForm(formData);

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      unitPrice: data.unitPrice,
      inventory: {
        upsert: {
          create: {
            quantityOnHand: data.quantityOnHand,
            reorderLevel: data.reorderLevel,
            warehouseLocation: data.warehouseLocation,
          },
          update: {
            quantityOnHand: data.quantityOnHand,
            reorderLevel: data.reorderLevel,
            warehouseLocation: data.warehouseLocation,
          },
        },
      },
    },
  });

  revalidatePath("/products");
  revalidatePath("/inventory");
  redirect("/products");
}

export async function deleteProduct(id: string) {
  await requireRole("SALES_MANAGER");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  revalidatePath("/inventory");
}
