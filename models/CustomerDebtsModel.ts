import { getDb } from "./db";
import type { CustomerDebt } from "./types";

export async function listCustomerDebts() {
  const db = await getDb();
  const rows = await db.getAllAsync<CustomerDebt>(`
		SELECT
			debt_id,
			sale_id,
			customer_id,
			total_debt,
			remaining_balance,
			created_at,
			updated_at
		FROM customer_debts
		ORDER BY created_at DESC
	`);
  return rows;
}

export async function getDebtById(debtId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<CustomerDebt>(
    `
			SELECT
				debt_id,
				sale_id,
				customer_id,
				total_debt,
				remaining_balance,
				created_at,
				updated_at
			FROM customer_debts
			WHERE debt_id = ?
		`,
    [debtId],
  );
  return row ?? null;
}

export async function getDebtBySaleId(saleId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<CustomerDebt>(
    `
			SELECT
				debt_id,
				sale_id,
				customer_id,
				total_debt,
				remaining_balance,
				created_at,
				updated_at
			FROM customer_debts
			WHERE sale_id = ?
		`,
    [saleId],
  );
  return row ?? null;
}

export async function insertCustomerDebt(
  debt: Omit<CustomerDebt, "debt_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  const result = await db.runAsync(
    `
			INSERT INTO customer_debts (
				sale_id,
				customer_id,
				total_debt,
				remaining_balance
			) VALUES (?, ?, ?, ?)
		`,
    [debt.sale_id, debt.customer_id, debt.total_debt, debt.remaining_balance],
  );
  return result.lastInsertRowId;
}

export async function updateCustomerDebt(
  debtId: number,
  debt: Omit<CustomerDebt, "debt_id" | "created_at" | "updated_at">,
) {
  const db = await getDb();
  await db.runAsync(
    `
			UPDATE customer_debts
			SET
				sale_id = ?,
				customer_id = ?,
				total_debt = ?,
				remaining_balance = ?,
				updated_at = datetime('now')
			WHERE debt_id = ?
		`,
    [
      debt.sale_id,
      debt.customer_id,
      debt.total_debt,
      debt.remaining_balance,
      debtId,
    ],
  );
}

export async function applyDebtPayment(debtId: number, amount: number) {
  const db = await getDb();
  await db.runAsync(
    `
			UPDATE customer_debts
			SET
				remaining_balance = MAX(remaining_balance - ?, 0),
				updated_at = datetime('now')
			WHERE debt_id = ?
		`,
    [amount, debtId],
  );
}

export async function deleteCustomerDebt(debtId: number) {
  const db = await getDb();
  await db.runAsync("DELETE FROM customer_debts WHERE debt_id = ?", [debtId]);
}
