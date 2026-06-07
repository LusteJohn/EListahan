import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchDebtPayments } from "@/controllers/customerDebtsController";
import { useColorScheme } from "@/hooks/use-color-scheme";

type DebtPayment = {
  debt_id: number;
  sale_id: number;
  customer_id: number;
  total_debt: number;
  remaining_balance: number;
  created_at: string | null;
  updated_at: string | null;
  customer_name: string;
  transaction_no: string;
};

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const colorScheme = useColorScheme();

  const palette = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            background: "#10150f",
            surface: "#141c13",
            surfaceAlt: "#1d271b",
            border: "#2b3827",
            primary: "#7ad87a",
            text: "#e8f2e5",
            muted: "#9aac97",
          }
        : {
            background: "#f5f7f2",
            surface: "#ffffff",
            surfaceAlt: "#eef3e8",
            border: "#d8e0d2",
            primary: "#2f8f2f",
            text: "#1f2a1e",
            muted: "#6d7869",
          },
    [colorScheme],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDebtPayments();
      setPayments(data);
    } catch (error) {
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const trimmed = filterQuery.trim().toLowerCase();
    if (!trimmed) {
      return payments;
    }
    return payments.filter((item) =>
      [
        item.customer_name,
        item.transaction_no,
        `PHP ${item.total_debt.toFixed(2)}`,
        `PHP ${item.remaining_balance.toFixed(2)}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(trimmed),
    );
  }, [payments, filterQuery]);

  const paidAmount = useMemo(
    () =>
      filtered.reduce(
        (sum, item) => sum + (item.total_debt - item.remaining_balance),
        0,
      ),
    [filtered],
  );

  const outstandingAmount = useMemo(
    () =>
      filtered.reduce((sum, item) => sum + item.remaining_balance, 0),
    [filtered],
  );

  const totalCredit = useMemo(
    () => filtered.reduce((sum, item) => sum + item.total_debt, 0),
    [filtered],
  );

  const renderItem = ({ item }: { item: DebtPayment }) => {
    const paid = item.total_debt - item.remaining_balance;
    const created = item.created_at
      ? new Date(item.created_at).toLocaleString()
      : "";
    const updated = item.updated_at
      ? new Date(item.updated_at).toLocaleString()
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
            Customer
          </ThemedText>
          <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
            {item.customer_name}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaLabel, { color: palette.muted }]}>
            Transaction
          </ThemedText>
          <ThemedText style={{ color: palette.text }}>
            {item.transaction_no}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaLabel, { color: palette.muted }]}>
            Total credit
          </ThemedText>
          <ThemedText style={{ color: palette.text }}>
            {`PHP ${item.total_debt.toFixed(2)}`}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaLabel, { color: palette.muted }]}>
            Paid
          </ThemedText>
          <ThemedText style={{ color: palette.primary }}>
            {`PHP ${paid.toFixed(2)}`}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaLabel, { color: palette.muted }]}>
            Balance
          </ThemedText>
          <ThemedText
            style={[
              { color: palette.text },
              item.remaining_balance > 0
                ? { color: palette.text }
                : { color: palette.primary },
            ]}
          >
            {`PHP ${item.remaining_balance.toFixed(2)}`}
          </ThemedText>
        </View>

        <ThemedText style={{ color: palette.muted, fontSize: 11 }}>
          Created: {created}
        </ThemedText>
        <ThemedText style={{ color: palette.muted, fontSize: 11 }}>
          Updated: {updated}
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="Payment History" />

      <View style={styles.content}>
        <ThemedText
          style={[styles.sectionLabel, { color: palette.muted }]}
        >
          Search payment history
        </ThemedText>
        <View
          style={[
            styles.searchRow,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <TextInput
            placeholder="Search by customer, transaction, or amount..."
            placeholderTextColor={palette.muted}
            value={filterQuery}
            onChangeText={setFilterQuery}
            style={[styles.searchInput, { color: palette.text }]}
          />
          {filterQuery ? (
            <Pressable onPress={() => setFilterQuery("")}>
              <ThemedText style={{ color: palette.primary }}>
                Clear
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <ThemedText style={[styles.summaryLabel, { color: palette.muted }]}>
              Total credit
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
              {`PHP ${totalCredit.toFixed(2)}`}
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <ThemedText style={[styles.summaryLabel, { color: palette.muted }]}>
              Paid
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: palette.primary }]}>
              {`PHP ${paidAmount.toFixed(2)}`}
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <ThemedText style={[styles.summaryLabel, { color: palette.muted }]}>
              Balance
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
              {`PHP ${outstandingAmount.toFixed(2)}`}
            </ThemedText>
          </View>
        </View>

        {filtered.length === 0 && !isLoading ? (
          <ThemedText style={{ color: palette.muted, marginTop: 16 }}>
            No credit payment history found.
          </ThemedText>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.debt_id.toString()}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
          />
        )}
      </View>
    </ThemedView>
  );
}

const Styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  sectionLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 6,
    alignItems: "center",
  },
  summaryLabel: {
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
  },
  list: {
    gap: 12,
    paddingVertical: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
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
    fontSize: 16,
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
});

const styles = Styles;
