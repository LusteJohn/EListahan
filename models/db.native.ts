import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let didInit = false;

async function initDb(db: SQLite.SQLiteDatabase) {
  if (didInit) {
    return;
  }

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS category (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      barcode TEXT NOT NULL,
      product_name TEXT NOT NULL,
      selling_price REAL NOT NULL,
      product_image TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sales (
      sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_no TEXT NOT NULL UNIQUE,
      customer_id INTEGER,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL,
      total_amount REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customer_debts (
      debt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      customer_id INTEGER,
      total_debt REAL NOT NULL,
      remaining_balance REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      sale_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
    );
  `);

  try {
    await db.execAsync(
      "ALTER TABLE customer_debts ADD COLUMN customer_id INTEGER",
    );
  } catch {
    // Ignore if the column already exists.
  }
  didInit = true;
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("store.db");
  }

  const db = await dbPromise;
  await initDb(db);
  return db;
}
