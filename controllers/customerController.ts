import {
    deleteCustomer,
    getCustomerById,
    insertCustomer,
    listCustomers,
    updateCustomer,
} from "../models/CustomerModel";

export async function fetchCustomers() {
  return listCustomers();
}

export async function fetchCustomerById(customerId: number) {
  return getCustomerById(customerId);
}

export async function addCustomer(customerName: string) {
  return insertCustomer({ customer_name: customerName.trim() });
}

export async function editCustomer(customerId: number, customerName: string) {
  return updateCustomer(customerId, customerName.trim());
}

export async function removeCustomer(customerId: number) {
  return deleteCustomer(customerId);
}
