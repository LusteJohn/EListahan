import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCustomers } from "@/controllers/customerController";
import { fetchSales } from "@/controllers/salesController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Customer, Sale } from "@/models/types";

export default function SalesScreen() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
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

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales]),
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Sales" />

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
            onPress={() => router.push("/sale-form")}
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
});
