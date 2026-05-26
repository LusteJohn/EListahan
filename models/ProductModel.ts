import { getDb } from './db';
import type { Product } from './types';

export async function listProducts() {
  const db = await getDb();
  const rows = await db.getAllAsync<Product>(`
    SELECT
      p.product_id,
      p.category_id,
      c.category_name,
      p.barcode,
      p.product_name,
      p.selling_price,
      p.product_image,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN category c ON c.category_id = p.category_id
    ORDER BY p.product_name
  `);
  return rows;
}

export async function getProductById(productId: number) {
  const db = await getDb();
  const row = await db.getFirstAsync<Product>(`
    SELECT
      p.product_id,
      p.category_id,
      c.category_name,
      p.barcode,
      p.product_name,
      p.selling_price,
      p.product_image,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN category c ON c.category_id = p.category_id
    WHERE p.product_id = ?
  `,
  [productId]);
  return row ?? null;
}

export async function insertProduct(product: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'category_name'>) {
  const db = await getDb();
  const result = await db.runAsync(
    `
      INSERT INTO products (
        category_id,
        barcode,
        product_name,
        selling_price,
        product_image
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      product.category_id,
      product.barcode,
      product.product_name,
      product.selling_price,
      product.product_image,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateProduct(
  productId: number,
  product: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'category_name'>
) {
  const db = await getDb();
  await db.runAsync(
    `
      UPDATE products
      SET
        category_id = ?,
        barcode = ?,
        product_name = ?,
        selling_price = ?,
        product_image = ?,
        updated_at = datetime('now')
      WHERE product_id = ?
    `,
    [
      product.category_id,
      product.barcode,
      product.product_name,
      product.selling_price,
      product.product_image,
      productId,
    ]
  );
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM products WHERE product_id = ?', [productId]);
}
