import { getDb } from "./db";
import type { SaleItem } from "./types";

export async function listSaleItemsBySale(saleId: number) {
  const db = await getDb();
  const rows = await db.getAllAsync<SaleItem>(
    `
			SELECT
				sale_item_id,
				sale_id,
				product_id,
				quantity,
				price,
				total,
				created_at,
				updated_at
			FROM sale_items
			WHERE sale_id = ?
			ORDER BY sale_item_id
		`,
    [saleId],
  );
  return rows;
}

export async function getSaleItemById(saleItemId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<SaleItem>(
    `
			SELECT
				sale_item_id,
				sale_id,
				product_id,
				quantity,
				price,
				total,
				created_at,
				updated_at
			FROM sale_items
			WHERE sale_item_id = ?
		`,
    [saleItemId],
  );
  return row ?? null;
}

export async function insertSaleItem(
  item: Omit<SaleItem, "sale_item_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  const result = await db.runAsync(
    `
			INSERT INTO sale_items (
				sale_id,
				product_id,
				quantity,
				price,
				total
			) VALUES (?, ?, ?, ?, ?)
		`,
    [item.sale_id, item.product_id, item.quantity, item.price, item.total],
  );
  return result.lastInsertRowId;
}

export async function updateSaleItem(
  saleItemId: number,
  item: Omit<SaleItem, "sale_item_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  await db.runAsync(
    `
			UPDATE sale_items
			SET
				sale_id = ?,
				product_id = ?,
				quantity = ?,
				price = ?,
				total = ?,
				updated_at = datetime('now')
			WHERE sale_item_id = ?
		`,
    [
      item.sale_id,
      item.product_id,
      item.quantity,
      item.price,
      item.total,
      saleItemId,
    ],
  );
}

export async function deleteSaleItem(saleItemId: number) {
  const db = await getDb();
  await db.runAsync("DELETE FROM sale_items WHERE sale_item_id = ?", [
    saleItemId,
  ]);
}
