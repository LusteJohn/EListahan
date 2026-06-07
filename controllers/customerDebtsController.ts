import {
    listDebtPayments,
    applyDebtPayment,
    deleteCustomerDebt,
    getDebtById,
    getDebtBySaleId,
    insertCustomerDebt,
    listCustomerDebts,
    updateCustomerDebt,
} from "@/models/CustomerDebtsModel";
import type { CustomerDebt } from "@/models/types";

export async function fetchCustomerDebts() {
  return listCustomerDebts();
}

export async function fetchDebtPayments() {
  return listDebtPayments();
}

export async function fetchDebtById(debtId: number) {
  return getDebtById(debtId);
}

export async function fetchDebtBySaleId(saleId: number) {
  return getDebtBySaleId(saleId);
}

export async function addCustomerDebt(
  debt: Omit<CustomerDebt, "debt_id" | "created_at" | "updated_at">,
) {
  return insertCustomerDebt(debt);
}

export async function editCustomerDebt(
  debtId: number,
  debt: Omit<CustomerDebt, "debt_id" | "created_at" | "updated_at">,
) {
  return updateCustomerDebt(debtId, debt);
}

export async function recordDebtPayment(debtId: number, amount: number) {
  return applyDebtPayment(debtId, amount);
}

export async function removeCustomerDebt(debtId: number) {
  return deleteCustomerDebt(debtId);
}
