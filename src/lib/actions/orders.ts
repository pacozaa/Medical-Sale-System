"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, requireSession } from "@/lib/permissions";

const itemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
});

const orderSchema = z.object({
  customerId: z.string().trim().min(1, "Customer is required"),
  salesRepId: z.string().trim().min(1, "Sales representative is required"),
  notes: z.string().trim().optional(),
  items: z.array(itemSchema).min(1, "Add at least one product"),
});

function parseOrderForm(formData: FormData) {
  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(String);

  const items = productIds
    .map((productId, index) => ({ productId, quantity: quantities[index] }))
    .filter((item) => item.productId);

  return orderSchema.parse({
    customerId: formData.get("customerId"),
    salesRepId: formData.get("salesRepId"),
    notes: formData.get("notes") || undefined,
    items,
  });
}

export async function createOrder(formData: FormData) {
  const session = await requireSession();
  const data = parseOrderForm(formData);

  if (session.user.role !== "SALES_MANAGER" && session.user.salesRepId !== data.salesRepId) {
    throw new ForbiddenError("Sales representatives can only create orders for themselves.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((item) => item.productId) } },
  });
  const priceById = new Map(products.map((p) => [p.id, p.unitPrice]));

  const order = await prisma.order.create({
    data: {
      customerId: data.customerId,
      salesRepId: data.salesRepId,
      notes: data.notes,
      status: "PENDING",
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: priceById.get(item.productId) ?? 0,
        })),
      },
    },
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

async function assertOrderAccess(session: Awaited<ReturnType<typeof requireSession>>, orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (session.user.role !== "SALES_MANAGER" && session.user.salesRepId !== order.salesRepId) {
    throw new ForbiddenError("You can only manage your own orders.");
  }
  return order;
}

/** Marks an order as completed and deducts the fulfilled quantities from warehouse inventory. */
export async function fulfillOrder(orderId: string) {
  const session = await requireSession();
  const order = await assertOrderAccess(session, orderId);

  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be fulfilled.");
  }

  await prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId }, include: { product: { include: { inventory: true } } } });

    for (const item of items) {
      const available = item.product.inventory?.quantityOnHand ?? 0;
      if (available < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}. Available: ${available}, requested: ${item.quantity}.`);
      }
    }

    for (const item of items) {
      await tx.inventoryItem.update({
        where: { productId: item.productId },
        data: { quantityOnHand: { decrement: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", fulfilledAt: new Date() },
    });
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/inventory");
  revalidatePath("/tracking");
}

export async function cancelOrder(orderId: string) {
  const session = await requireSession();
  const order = await assertOrderAccess(session, orderId);

  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be cancelled.");
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
