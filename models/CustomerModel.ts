import { getDb } from "./db";
import { Customer } from "./types";

export async function listCustomers() {
  const db = await getDb();
  const rows = await db.getAllAsync<Customer>(`
        SELECT
            customer_id,
            customer_name,
            created_at,
            updated_at
        FROM customers
        ORDER BY customer_name
    `);
  return rows;
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<Customer>(
    `
        SELECT
            customer_id,
            customer_name,
            created_at,
            updated_at
        FROM customers
        WHERE customer_id = ?
    `,
    [customerId],
  );
  return row ?? null;
}

export async function insertCustomer(
  customer: Omit<
    Customer,
    "customer_id" | "created_at" | "updated_at" | "category_name"
  >,
) {
  const db = await getDb();
  const result = await db.runAsync(
    `
        INSERT INTO customers (
            customer_name
        ) VALUES (?)
    `,
    [customer.customer_name],
  );
  return result.lastInsertRowId;
}

export async function updateCustomer(customerId: number, customerName: string) {
  const db = await getDb();
  await db.runAsync(
    `
        UPDATE customers
        SET customer_name = ?, updated_at = datetime('now')
        WHERE customer_id = ?
    `,
    [customerName, customerId],
  );
}

export async function deleteCustomer(customerId: number) {
  const db = await getDb();
  await db.runAsync(
    `
        DELETE FROM customers
        WHERE customer_id = ?
    `,
    [customerId],
  );
}
