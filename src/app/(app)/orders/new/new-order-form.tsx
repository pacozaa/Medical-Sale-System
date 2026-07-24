"use client";

import { useState } from "react";
import Link from "next/link";
import { createOrder } from "@/lib/actions/orders";
import { card, input, label, primaryButton, secondaryButton } from "@/components/ui";

type Customer = { id: string; name: string; salesRepId: string };
type Product = { id: string; name: string; sku: string };
type SalesRep = { id: string; name: string };

export function NewOrderForm({
  customers,
  products,
  salesReps,
  isManager,
  defaultSalesRepId,
}: {
  customers: Customer[];
  products: Product[];
  salesReps: SalesRep[];
  isManager: boolean;
  defaultSalesRepId: string;
}) {
  const [rows, setRows] = useState([{ key: 0 }]);
  const [nextKey, setNextKey] = useState(1);

  return (
    <form action={createOrder} className={`${card} space-y-5`}>
      <div>
        <label className={label} htmlFor="salesRepId">Sales Representative</label>
        <select
          id="salesRepId"
          name="salesRepId"
          required
          disabled={!isManager}
          defaultValue={defaultSalesRepId}
          className={input}
        >
          {salesReps.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="customerId">Customer</label>
        <select id="customerId" name="customerId" required defaultValue="" className={input}>
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className={label}>Products</p>
        <div className="mt-2 space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="flex gap-2">
              <select name="productId" required defaultValue="" className={`${input} mt-0 flex-1`}>
                <option value="" disabled>
                  Select a product
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                min="1"
                defaultValue={1}
                required
                className={`${input} mt-0 w-24`}
                aria-label="Quantity"
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setRows((prev) => [...prev, { key: nextKey }]);
            setNextKey((k) => k + 1);
          }}
          className="mt-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          + Add another product
        </button>
      </div>

      <div>
        <label className={label} htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={2} className={input} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className={primaryButton}>Create Order</button>
        <Link href="/orders" className={secondaryButton}>Cancel</Link>
      </div>
    </form>
  );
}
