import {
  deleteProduct,
  getProductById,
  insertProduct,
  listProducts,
  updateProduct,
} from '@/models/ProductModel';
import type { Product } from '@/models/types';

export async function fetchProducts() {
  return listProducts();
}

export async function fetchProductById(productId: number) {
  return getProductById(productId);
}

export async function addProduct(product: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'category_name'>) {
  return insertProduct(product);
}

export async function editProduct(
  productId: number,
  product: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'category_name'>
) {
  return updateProduct(productId, product);
}

export async function removeProduct(productId: number) {
  return deleteProduct(productId);
}
