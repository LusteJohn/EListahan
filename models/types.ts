export type User = {
  user_id: number;
  username: string;
  password: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Category = {
  category_id: number;
  category_name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Product = {
  product_id: number;
  category_id: number | null;
  category_name?: string | null;
  barcode: string;
  product_name: string;
  selling_price: number;
  product_image: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Customer = {
  customer_id: number;
  customer_name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Sale = {
  sale_id: number;
  transaction_no: string;
  customer_id: number | null;
  payment_method: string;
  subtotal: number;
  total_amount: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CustomerDebt = {
  debt_id: number;
  sale_id: number;
  customer_id: number | null;
  total_debt: number;
  remaining_balance: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SaleItem = {
  sale_item_id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  created_at?: string | null;
  updated_at?: string | null;
};
