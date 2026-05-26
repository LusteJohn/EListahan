import {
  deleteCategory,
  getCategoryById,
  insertCategory,
  listCategories,
  updateCategory,
} from '@/models/CategoryModel';

export async function fetchCategories() {
  return listCategories();
}

export async function fetchCategoryById(categoryId: number) {
  return getCategoryById(categoryId);
}

export async function addCategory(categoryName: string) {
  return insertCategory(categoryName.trim());
}

export async function editCategory(categoryId: number, categoryName: string) {
  return updateCategory(categoryId, categoryName.trim());
}

export async function removeCategory(categoryId: number) {
  return deleteCategory(categoryId);
}
