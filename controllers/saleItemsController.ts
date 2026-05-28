import {
    deleteSaleItem,
    getSaleItemById,
    insertSaleItem,
    listSaleItemsBySale,
    updateSaleItem,
} from "@/models/SaleItemsModel";
import type { SaleItem } from "@/models/types";

export async function fetchSaleItemsBySale(saleId: number) {
  return listSaleItemsBySale(saleId);
}

export async function fetchSaleItemById(saleItemId: number) {
  return getSaleItemById(saleItemId);
}

export async function addSaleItem(
  item: Omit<SaleItem, "sale_item_id" | "created_at" | "updated_at">,
) {
  return insertSaleItem(item);
}

export async function editSaleItem(
  saleItemId: number,
  item: Omit<SaleItem, "sale_item_id" | "created_at" | "updated_at">,
) {
  return updateSaleItem(saleItemId, item);
}

export async function removeSaleItem(saleItemId: number) {
  return deleteSaleItem(saleItemId);
}
