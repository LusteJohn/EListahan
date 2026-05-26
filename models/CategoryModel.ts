import { getDb } from './db';
import type { Category } from './types';

export async function listCategories() {
  const db = await getDb();
  const rows = await db.getAllAsync<Category>(
    'SELECT category_id, category_name FROM category ORDER BY category_name'
  );
  return rows;
}

export async function getCategoryById(categoryId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<Category>(
    'SELECT category_id, category_name FROM category WHERE category_id = ?',
    [categoryId]
  );
  return row ?? null;
}

export async function insertCategory(categoryName: string) {
  const db = await getDb();
  const result = await db.runAsync('INSERT INTO category (category_name) VALUES (?)', [
    categoryName,
  ]);
  return result.lastInsertRowId;
}

export async function updateCategory(categoryId: number, categoryName: string) {
  const db = await getDb();
  await db.runAsync('UPDATE category SET category_name = ? WHERE category_id = ?', [
    categoryName,
    categoryId,
  ]);
}

export async function deleteCategory(categoryId: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM category WHERE category_id = ?', [categoryId]);
}
