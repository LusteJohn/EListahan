import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import {
    fetchDebtPayments,
    fetchDebtPaymentsWithItems,
} from "@/controllers/customerDebtsController";
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
  items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
};

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await fetchDebtPaymentsWithItems();
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Payment History Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #1f2a1e; }
              h1 { font-size: 22px; margin-bottom: 8px; }
              .meta { color: #6d7869; font-size: 12px; margin-bottom: 20px; }
              .summary { display: flex; gap: 12px; margin-bottom: 24px; }
              .summary-card { flex: 1; border: 1px solid #d8e0d2; border-radius: 8px; padding: 12px; }
              .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6d7869; }
              .summary-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
              .customer-group { margin-bottom: 24px; page-break-inside: avoid; }
              .customer-header { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
              .transaction-header { font-size: 12px; color: #6d7869; margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
              th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #d8e0d2; font-size: 13px; }
              th { font-weight: 600; color: #6d7869; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
              .amounts { text-align: right; }
              .totals { display: flex; justify-content: flex-end; gap: 16px; font-size: 13px; margin-top: 4px; }
              .totals span { font-weight: 600; }
            </style>
          </head>
          <body>
            <h1>Payment History Report</h1>
            <div class="meta">Generated on ${new Date().toLocaleString()}</div>

            <div class="summary">
              <div class="summary-card">
                <div class="summary-label">Total Credit</div>
                <div class="summary-value">PHP ${data.reduce((s, i) => s + i.total_debt, 0).toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Paid</div>
                <div class="summary-value">PHP ${data.reduce((s, i) => s + (i.total_debt - i.remaining_balance), 0).toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Outstanding Balance</div>
                <div class="summary-value">PHP ${data.reduce((s, i) => s + i.remaining_balance, 0).toFixed(2)}</div>
              </div>
            </div>

            ${data.map((debt) => {
              const paid = debt.total_debt - debt.remaining_balance;
              return `
                <div class="customer-group">
                  <div class="customer-header">${debt.customer_name}</div>
                  <div class="transaction-header">Transaction: ${debt.transaction_no} | Created: ${debt.created_at ? new Date(debt.created_at).toLocaleString() : "-"}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th class="amounts">Qty</th>
                        <th class="amounts">Price</th>
                        <th class="amounts">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(debt.items ?? []).map((item) => `
                        <tr>
                          <td>${item.product_name}</td>
                          <td class="amounts">${item.quantity}</td>
                          <td class="amounts">PHP ${item.price.toFixed(2)}</td>
                          <td class="amounts">PHP ${item.total.toFixed(2)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                  <div class="totals">
                    <div>Total Credit: <span>PHP ${debt.total_debt.toFixed(2)}</span></div>
                    <div>Paid: <span>PHP ${paid.toFixed(2)}</span></div>
                    <div>Balance: <span>PHP ${debt.remaining_balance.toFixed(2)}</span></div>
                  </div>
                </div>
              `;
            }).join("")}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing unavailable", "Cannot share files on this device.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Payment History Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      Alert.alert(
        "Export failed",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsExporting(false);
    }
  };

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
        <View style={styles.headerRow}>
          <ThemedText
            style={[styles.sectionLabel, { color: palette.muted }]}
          >
            Search payment history
          </ThemedText>
          <Pressable
            style={[styles.exportButton, { backgroundColor: palette.primary }]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <ThemedText style={styles.exportButtonText}>
              {isExporting ? "Generating..." : "Export PDF"}
            </ThemedText>
          </Pressable>
        </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  exportButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exportButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
