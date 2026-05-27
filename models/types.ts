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
