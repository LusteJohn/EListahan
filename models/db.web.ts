export async function getDb() {
  throw new Error('SQLite is not available on web. Use a native device or add a web DB shim.');
}
