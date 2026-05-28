import { getDb } from "./db";
import type { Sale } from "./types";

export type SaleItemInput = {
  product_id: number;
  quantity: number;
  price: number;
  total?: number;
};

export type CreateSaleInput = {
  transaction_no: string;
  customer_id: number | null;
  payment_method: string;
  items: SaleItemInput[];
  subtotal?: number;
  total_amount?: number;
  is_debt?: boolean;
  debt_total?: number;
  debt_balance?: number;
};

export async function listSales() {
  const db = await getDb();
  const rows = await db.getAllAsync<Sale>(`
      SELECT
        s.sale_id,
        s.transaction_no,
        s.customer_id,
        s.payment_method,
        s.subtotal,
        s.total_amount,
        s.created_at,
        s.updated_at
      FROM sales s
      ORDER BY s.created_at DESC
    `);
  return rows;
}

export async function getSaleById(saleId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<Sale>(
    `
      SELECT
        s.sale_id,
        s.transaction_no,
        s.customer_id,
        s.payment_method,
        s.subtotal,
        s.total_amount,
        s.created_at,
        s.updated_at
      FROM sales s
      WHERE s.sale_id = ?
    `,
    [saleId],
  );
  return row ?? null;
}

export async function insertSale(
  sale: Omit<Sale, "sale_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO sales (
      transaction_no,
      customer_id,
      payment_method,
      subtotal,
      total_amount
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      sale.transaction_no,
      sale.customer_id,
      sale.payment_method,
      sale.subtotal,
      sale.total_amount,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateSale(
  saleId: number,
  sale: Omit<Sale, "sale_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE sales SET
      transaction_no = ?,
      customer_id = ?,
      payment_method = ?,
      subtotal = ?,
      total_amount = ?,
      updated_at = datetime('now')
    WHERE sale_id = ?`,
    [
      sale.transaction_no,
      sale.customer_id,
      sale.payment_method,
      sale.subtotal,
      sale.total_amount,
      saleId,
    ],
  );
}

export async function deleteSale(saleId: number) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM sales WHERE sale_id = ?`, [saleId]);
}

export async function createSaleWithItems(input: CreateSaleInput) {
  if (!input.items.length) {
    throw new Error("Sale must include at least one item.");
  }

  const isDebt = input.is_debt ?? input.payment_method.toLowerCase() === "debt";

  if (isDebt && !input.customer_id) {
    throw new Error("Customer is required for debt sales.");
  }

  const normalizedItems = input.items.map((item) => ({
    ...item,
    total: item.total ?? item.price * item.quantity,
  }));

  const subtotal =
    input.subtotal ??
    normalizedItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = input.total_amount ?? subtotal;

  const db = await getDb();
  await db.execAsync("BEGIN");

  try {
    const saleResult = await db.runAsync(
      `INSERT INTO sales (
        transaction_no,
        customer_id,
        payment_method,
        subtotal,
        total_amount
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        input.transaction_no,
        input.customer_id,
        input.payment_method,
        subtotal,
        totalAmount,
      ],
    );

    const saleId = saleResult.lastInsertRowId;

    for (const item of normalizedItems) {
      await db.runAsync(
        `INSERT INTO sale_items (
          sale_id,
          product_id,
          quantity,
          price,
          total
        ) VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, item.price, item.total],
      );
    }

    if (isDebt) {
      const debtTotal = input.debt_total ?? totalAmount;
      const debtBalance = input.debt_balance ?? debtTotal;

      await db.runAsync(
        `INSERT INTO customer_debts (
          sale_id,
          customer_id,
          total_debt,
          remaining_balance
        ) VALUES (?, ?, ?, ?)`,
        [saleId, input.customer_id, debtTotal, debtBalance],
      );
    }

    await db.execAsync("COMMIT");
    return saleId;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}
