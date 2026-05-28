import type { CreateSaleInput } from "@/models/SalesModel";
import {
    createSaleWithItems,
    deleteSale,
    getSaleById,
    insertSale,
    listSales,
    updateSale,
} from "@/models/SalesModel";
import type { Sale } from "@/models/types";

export async function fetchSales() {
  return listSales();
}

export async function fetchSaleById(saleId: number) {
  return getSaleById(saleId);
}

export async function addSale(
  sale: Omit<Sale, "sale_id" | "created_at" | "updated_at">,
) {
  return insertSale(sale);
}

export async function editSale(
  saleId: number,
  sale: Omit<Sale, "sale_id" | "created_at" | "updated_at">,
) {
  return updateSale(saleId, sale);
}

export async function removeSale(saleId: number) {
  return deleteSale(saleId);
}

export async function createSaleTransaction(input: CreateSaleInput) {
  return createSaleWithItems(input);
}
