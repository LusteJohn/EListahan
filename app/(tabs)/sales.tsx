import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCustomers } from "@/controllers/customerController";
import { fetchProducts } from "@/controllers/productController";
import {
  createSaleTransaction,
  fetchSales,
} from "@/controllers/salesController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Customer, Product, Sale } from "@/models/types";

const buildTransactionNo = () => `TRX-${Date.now()}`;

type CartItem = {
  product: Product;
  quantity: string;
};

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debt" | "">("");
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const colorScheme = useColorScheme();
  const palette = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            background: "#0f1420",
            surface: "#151b2a",
            surfaceAlt: "#1d2638",
            border: "#2f3a52",
            primary: "#8db1ff",
            text: "#e9eefc",
            muted: "#9aa6bf",
            error: "#ff7b7b",
          }
        : {
            background: "#f9f9ff",
            surface: "#ffffff",
            surfaceAlt: "#e7eeff",
            border: "#c3c6d7",
            primary: "#004ac6",
            text: "#111c2d",
            muted: "#6b7080",
            error: "#ba1a1a",
          },
    [colorScheme],
  );

  const customerMap = useMemo(() => {
    return new Map(
      customers.map((customer) => [
        customer.customer_id,
        customer.customer_name,
      ]),
    );
  }, [customers]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return sales;
    }
    return sales.filter((sale) => {
      const customerName = sale.customer_id
        ? (customerMap.get(sale.customer_id) ?? "")
        : "walk-in";
      return [sale.transaction_no, sale.payment_method, customerName]
        .join(" ")
        .toLowerCase()
        .includes(trimmed);
    });
  }, [sales, query, customerMap]);

  const filteredProducts = useMemo(() => {
    const trimmed = productQuery.trim().toLowerCase();
    if (!trimmed) {
      return products;
    }
    return products.filter((item) =>
      [item.product_name, item.barcode]
        .join(" ")
        .toLowerCase()
        .includes(trimmed),
    );
  }, [productQuery, products]);

  const selectedCustomerLabel = useMemo(() => {
    if (!selectedCustomerId) {
      return "Select customer";
    }
    return (
      customers.find((item) => item.customer_id === selectedCustomerId)
        ?.customer_name ?? "Select customer"
    );
  }, [customers, selectedCustomerId]);

  const selectedPaymentLabel = paymentMethod
    ? paymentMethod === "cash"
      ? "Cash"
      : "Debt"
    : "Select payment method";

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const quantity = Number.parseInt(item.quantity, 10);
      const safeQty = Number.isNaN(quantity) ? 0 : quantity;
      return sum + safeQty * item.product.selling_price;
    }, 0);
  }, [cartItems]);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesData, customersData] = await Promise.all([
        fetchSales(),
        fetchCustomers(),
      ]);
      setSales(salesData);
      setCustomers(customersData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAddModal = async () => {
    setSelectedCustomerId(null);
    setPaymentMethod("");
    setIsCustomerMenuOpen(false);
    setIsPaymentMenuOpen(false);
    setProductQuery("");
    setCartItems([]);
    setIsModalVisible(true);
    try {
      const [customersData, productsData] = await Promise.all([
        fetchCustomers(),
        fetchProducts(),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      setCustomers([]);
      setProducts([]);
      Alert.alert(
        "Unable to load data",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setIsCustomerMenuOpen(false);
    setIsPaymentMenuOpen(false);
  };

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.product_id === product.product_id,
      );
      if (!existing) {
        return [...prev, { product, quantity: "1" }];
      }
      return prev.map((item) => {
        if (item.product.product_id !== product.product_id) {
          return item;
        }
        const nextQty = Number.parseInt(item.quantity, 10);
        const safeQty = Number.isNaN(nextQty) ? 0 : nextQty;
        return { ...item, quantity: String(safeQty + 1) };
      });
    });
  };

  const updateQuantity = (productId: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.product_id === productId
          ? { ...item, quantity: sanitized }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.product_id !== productId),
    );
  };

  const handleSave = async () => {
    if (!paymentMethod.trim()) {
      Alert.alert("Missing payment method", "Please select a payment method.");
      return;
    }

    if (!cartItems.length) {
      Alert.alert("No items", "Please add at least one product.");
      return;
    }

    const isDebt = paymentMethod.trim().toLowerCase() === "debt";
    if (isDebt && !selectedCustomerId) {
      Alert.alert(
        "Missing customer",
        "Please select a customer for debt sales.",
      );
      return;
    }

    const items = cartItems
      .map((item) => {
        const quantity = Number.parseInt(item.quantity, 10);
        return {
          product_id: item.product.product_id,
          quantity: Number.isNaN(quantity) ? 0 : quantity,
          price: item.product.selling_price,
        };
      })
      .filter((item) => item.quantity > 0);

    if (!items.length) {
      Alert.alert("Invalid quantities", "Please enter valid quantities.");
      return;
    }

    setIsSaving(true);
    try {
      await createSaleTransaction({
        transaction_no: buildTransactionNo(),
        customer_id: selectedCustomerId,
        payment_method: paymentMethod.trim(),
        items,
        subtotal,
        total_amount: subtotal,
        is_debt: isDebt,
      });
      closeModal();
      loadSales();
    } finally {
      setIsSaving(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales]),
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.title, { color: palette.text }]}>
              Transactions
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              Customer sales history
            </ThemedText>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: palette.primary }]}
            onPress={openAddModal}
          >
            <ThemedText style={styles.addButtonText}>New</ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Search
          </ThemedText>
          <View
            style={[
              styles.searchRow,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <TextInput
              placeholder="Find a transaction"
              placeholderTextColor={
                colorScheme === "dark" ? "#7f8ca6" : "#737686"
              }
              value={query}
              onChangeText={setQuery}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>
        </View>

        {filtered.length === 0 && !isLoading ? (
          <ThemedText style={[styles.emptyText, { color: palette.muted }]}>
            No sales yet.
          </ThemedText>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.sale_id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const customerName = item.customer_id
                ? (customerMap.get(item.customer_id) ?? "Customer")
                : "Walk-in";
              const created = item.created_at
                ? new Date(item.created_at).toLocaleString()
                : "";
              return (
                <ThemedView
                  style={[styles.card, { borderColor: palette.border }]}
                  lightColor={palette.surface}
                  darkColor={palette.surface}
                >
                  <View style={styles.cardHeader}>
                    <ThemedText
                      style={[styles.cardLabel, { color: palette.muted }]}
                    >
                      Transaction
                    </ThemedText>
                    <ThemedText
                      style={[styles.cardTitle, { color: palette.text }]}
                    >
                      {item.transaction_no}
                    </ThemedText>
                  </View>
                  <View style={styles.metaRow}>
                    <ThemedText
                      style={[styles.metaLabel, { color: palette.muted }]}
                    >
                      Customer
                    </ThemedText>
                    <ThemedText style={{ color: palette.text }}>
                      {customerName}
                    </ThemedText>
                  </View>
                  <View style={styles.metaRow}>
                    <ThemedText
                      style={[styles.metaLabel, { color: palette.muted }]}
                    >
                      Payment
                    </ThemedText>
                    <ThemedText style={{ color: palette.text }}>
                      {item.payment_method}
                    </ThemedText>
                  </View>
                  <View style={styles.metaRow}>
                    <ThemedText
                      style={[styles.metaLabel, { color: palette.muted }]}
                    >
                      Total
                    </ThemedText>
                    <ThemedText style={{ color: palette.text }}>
                      {`PHP ${item.total_amount.toFixed(2)}`}
                    </ThemedText>
                  </View>
                  {created ? (
                    <ThemedText style={{ color: palette.muted }}>
                      {created}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              );
            }}
          />
        )}
      </View>

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <ThemedView
            style={[styles.modalCard, { borderColor: palette.border }]}
            lightColor={palette.surface}
            darkColor={palette.surface}
          >
            <ThemedText style={[styles.modalTitle, { color: palette.text }]}>
              Create sale
            </ThemedText>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <ThemedText
                  style={[styles.sectionLabel, { color: palette.muted }]}
                >
                  Customer
                </ThemedText>
                <ThemedText
                  style={[styles.helperText, { color: palette.muted }]}
                >
                  Tap to assign a customer (required for debt).
                </ThemedText>
                <Pressable
                  style={[
                    styles.dropdownTrigger,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                    },
                  ]}
                  onPress={() => setIsCustomerMenuOpen((prev) => !prev)}
                >
                  <ThemedText style={{ color: palette.text }}>
                    {selectedCustomerLabel}
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted }}>
                    {isCustomerMenuOpen ? "Hide" : "Select"}
                  </ThemedText>
                </Pressable>
                {isCustomerMenuOpen ? (
                  <View
                    style={[
                      styles.dropdownList,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      },
                    ]}
                  >
                    {customers.length === 0 ? (
                      <ThemedText style={{ color: palette.muted }}>
                        No customers yet.
                      </ThemedText>
                    ) : (
                      customers.map((item) => (
                        <Pressable
                          key={item.customer_id}
                          style={[
                            styles.dropdownItem,
                            {
                              backgroundColor:
                                item.customer_id === selectedCustomerId
                                  ? palette.surfaceAlt
                                  : "transparent",
                            },
                          ]}
                          onPress={() => {
                            setSelectedCustomerId(item.customer_id);
                            setIsCustomerMenuOpen(false);
                          }}
                        >
                          <ThemedText style={{ color: palette.text }}>
                            {item.customer_name}
                          </ThemedText>
                        </Pressable>
                      ))
                    )}
                  </View>
                ) : null}
              </View>

              <View style={styles.modalSection}>
                <ThemedText
                  style={[styles.sectionLabel, { color: palette.muted }]}
                >
                  Payment
                </ThemedText>
                <Pressable
                  style={[
                    styles.dropdownTrigger,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                    },
                  ]}
                  onPress={() => setIsPaymentMenuOpen((prev) => !prev)}
                >
                  <ThemedText style={{ color: palette.text }}>
                    {selectedPaymentLabel}
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted }}>
                    {isPaymentMenuOpen ? "Hide" : "Select"}
                  </ThemedText>
                </Pressable>
                {isPaymentMenuOpen ? (
                  <View
                    style={[
                      styles.dropdownList,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      },
                    ]}
                  >
                    {["cash", "debt"].map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor:
                              option === paymentMethod
                                ? palette.surfaceAlt
                                : "transparent",
                          },
                        ]}
                        onPress={() => {
                          setPaymentMethod(option as "cash" | "debt");
                          setIsPaymentMenuOpen(false);
                        }}
                      >
                        <ThemedText style={{ color: palette.text }}>
                          {option === "cash" ? "Cash" : "Debt"}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.modalSection}>
                <ThemedText
                  style={[styles.sectionLabel, { color: palette.muted }]}
                >
                  Products
                </ThemedText>
                <View
                  style={[
                    styles.searchRow,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.surfaceAlt,
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Search products"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#7f8ca6" : "#737686"
                    }
                    value={productQuery}
                    onChangeText={setProductQuery}
                    style={[styles.searchInput, { color: palette.text }]}
                  />
                </View>

                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item.product_id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.list}
                  renderItem={({ item }) => (
                    <View style={styles.productRow}>
                      <View style={styles.productInfo}>
                        <ThemedText
                          style={[styles.productName, { color: palette.text }]}
                        >
                          {item.product_name}
                        </ThemedText>
                        <ThemedText style={{ color: palette.muted }}>
                          {`PHP ${item.selling_price.toFixed(2)}`}
                        </ThemedText>
                      </View>
                      <Pressable
                        style={[
                          styles.addButton,
                          {
                            borderColor: palette.border,
                            backgroundColor: palette.surfaceAlt,
                          },
                        ]}
                        onPress={() => addToCart(item)}
                      >
                        <ThemedText style={{ color: palette.text }}>
                          Add
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}
                  ListEmptyComponent={
                    <ThemedText style={{ color: palette.muted }}>
                      No products found.
                    </ThemedText>
                  }
                />
              </View>

              <View style={styles.modalSection}>
                <ThemedText
                  style={[styles.sectionLabel, { color: palette.muted }]}
                >
                  Cart
                </ThemedText>
                {cartItems.length === 0 ? (
                  <ThemedText style={{ color: palette.muted }}>
                    No items added yet.
                  </ThemedText>
                ) : (
                  cartItems.map((item) => (
                    <View style={styles.cartRow} key={item.product.product_id}>
                      <View style={styles.cartInfo}>
                        <ThemedText
                          style={[styles.productName, { color: palette.text }]}
                        >
                          {item.product.product_name}
                        </ThemedText>
                        <ThemedText style={{ color: palette.muted }}>
                          {`PHP ${item.product.selling_price.toFixed(2)}`}
                        </ThemedText>
                      </View>
                      <TextInput
                        value={item.quantity}
                        onChangeText={(value) =>
                          updateQuantity(item.product.product_id, value)
                        }
                        keyboardType="numeric"
                        style={[
                          styles.qtyInput,
                          { borderColor: palette.border, color: palette.text },
                        ]}
                      />
                      <Pressable
                        style={[
                          styles.removeButton,
                          { borderColor: palette.error },
                        ]}
                        onPress={() => removeFromCart(item.product.product_id)}
                      >
                        <ThemedText style={{ color: palette.error }}>
                          Remove
                        </ThemedText>
                      </Pressable>
                    </View>
                  ))
                )}
                <View style={styles.totalRow}>
                  <ThemedText
                    style={[styles.totalLabel, { color: palette.muted }]}
                  >
                    Subtotal
                  </ThemedText>
                  <ThemedText
                    style={[styles.totalValue, { color: palette.text }]}
                  >
                    {`PHP ${subtotal.toFixed(2)}`}
                  </ThemedText>
                </View>
              </View>

              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: palette.primary },
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save sale"}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 13,
  },
  addButton: {
    borderRadius: 6,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  section: {
    marginTop: 16,
    gap: 8,
  },
  sectionLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  searchRow: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 15,
  },
  list: {
    gap: 12,
    paddingVertical: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    gap: 4,
  },
  cardLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  emptyText: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  modalContent: {
    gap: 16,
  },
  modalSection: {
    gap: 10,
  },
  helperText: {
    fontSize: 12,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 8,
    padding: 8,
    gap: 6,
  },
  dropdownItem: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 15,
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartInfo: {
    flex: 1,
    gap: 4,
  },
  qtyInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 64,
    textAlign: "center",
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  totalRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  saveButton: {
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
