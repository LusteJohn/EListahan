import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCustomers } from "@/controllers/customerController";
import { fetchSales } from "@/controllers/salesController";
import {
  fetchDebtByCustomer,
  fetchDebtTimeline,
} from "@/controllers/customerDebtsController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Customer, Sale } from "@/models/types";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerDebts, setCustomerDebts] = useState<
    Array<{ customer_name?: string; total_debt?: number; remaining_balance?: number }>
  >([]);
  const [timeline, setTimeline] = useState<
    Array<{ date?: string; total_debt?: number; remaining_balance?: number }>
  >([]);

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

  const loadDashboard = useCallback(async () => {
    try {
      const [salesData, customersData, timelineData, debtsData] =
        await Promise.all([
          fetchSales(),
          fetchCustomers(),
          fetchDebtTimeline(),
          fetchDebtByCustomer(),
        ]);
      setSales(salesData);
      setCustomers(customersData);
      setTimeline(timelineData);
      setCustomerDebts(debtsData);
    } catch {
      setSales([]);
      setCustomers([]);
      setCustomerDebts([]);
      setTimeline([]);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalCustomers = customers.length;
  const totalSales = sales.length;
  const totalDebt = customerDebts.reduce(
    (sum: number, d: any) => sum + (Number(d.total_debt) || 0),
    0,
  );
  const outstandingBalance = customerDebts.reduce(
    (sum: number, d: any) => sum + (Number(d.remaining_balance) || 0),
    0,
  );

  const customerDebtData = useMemo(() => {
    const byCustomer = new Map<string, number>();
    customerDebts.forEach((debt: any) => {
      const name = debt.customer_name ?? `Customer ${debt.customer_id}`;
      byCustomer.set(name, (byCustomer.get(name) || 0) + (Number(debt.total_debt) || 0));
    });
    return Array.from(byCustomer.entries()).map(([label, value]) => ({ label, value }));
  }, [customerDebts]);

  const debtByCustomer = useMemo(() => customerDebtData, [customerDebtData]);

  const lineChartData = useMemo(() => {
    return timeline.map((row: any) => {
      const raw = row.date ? String(row.date) : "";
      const dateLabel = raw
        ? new Date(raw + "T00:00:00").toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";
      return { label: dateLabel, value: Number(row.total_debt) || 0 };
    });
  }, [timeline]);

  const recentLogs = useMemo(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      )
      .slice(0, 8);
  }, [sales]);

  const chartConfig = useMemo(
    () => ({
      backgroundColor: palette.surface,
      backgroundGradientFrom: palette.surface,
      backgroundGradientTo: palette.surface,
      decimalPlaces: 1,
      color: (opacity = 1) => palette.primary,
      labelColor: (opacity = 1) => palette.muted,
      style: { borderRadius: 0 },
      propsForDots: { r: "3", strokeWidth: "2", stroke: palette.primary },
    }),
    [palette],
  );

  const screenWidth = Dimensions.get("window").width - 40;

  const barChartDatasets = useMemo(() => {
    return {
      labels: debtByCustomer.map((d) => d.label),
      datasets: [
        {
          data: debtByCustomer.map((d) => d.value || 0),
        },
      ],
    };
  }, [debtByCustomer]);

  const lineChartDatasets = useMemo(() => {
    return {
      labels: lineChartData.map((d) => d.label),
      datasets: [
        {
          data: lineChartData.map((d) => d.value || 0),
        },
      ],
    };
  }, [lineChartData]);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Store Dashboard" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: palette.muted }]}
          >
            Search inventory
          </ThemedText>
          <View
            style={[
              styles.searchRow,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <TextInput
              placeholder="Scan barcode or type item name..."
              placeholderTextColor={palette.muted}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText
              style={[styles.statLabel, { color: palette.muted }]}
            >
              Customers
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: palette.text }]}>
              {totalCustomers}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText
              style={[styles.statLabel, { color: palette.muted }]}
            >
              Sales
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: palette.text }]}>
              {totalSales}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText
              style={[styles.statLabel, { color: palette.muted }]}
            >
              Total debt
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: palette.primary }]}>
              {`PHP ${totalDebt.toFixed(2)}`}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText
              style={[styles.statLabel, { color: palette.muted }]}
            >
              Outstanding
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: palette.text }]}>
              {`PHP ${outstandingBalance.toFixed(2)}`}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.surfaceCard,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Customer debts
          </ThemedText>
          {barChartDatasets.datasets[0]?.data?.some((v: any) => v > 0) ? (
            <BarChart
              data={barChartDatasets}
              width={screenWidth > 0 ? screenWidth : 300}
              height={220}
              yAxisLabel="PHP "
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              showBarLabels={false}
            />
          ) : (
            <ThemedText style={{ color: palette.muted }}>
              No debt records yet.
            </ThemedText>
          )}
        </View>

        <View
          style={[
            styles.surfaceCard,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Debt timeline
          </ThemedText>
          {lineChartDatasets.datasets[0]?.data?.some((v: any) => v > 0) ? (
            <LineChart
              data={{
                labels: lineChartDatasets.labels,
                datasets: [
                  {
                    data: lineChartDatasets.datasets[0].data,
                  },
                ],
              }}
              width={screenWidth > 0 ? screenWidth : 300}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 0 }}
            />
          ) : (
            <ThemedText style={{ color: palette.muted }}>
              No timeline data yet.
            </ThemedText>
          )}
        </View>

        <View
          style={[
            styles.surfaceCard,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Recent logs
          </ThemedText>
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <ThemedText style={[styles.tableCell, { color: palette.muted }]}>
                Transaction
              </ThemedText>
              <ThemedText style={[styles.tableCell, { color: palette.muted }]}>
                Payment
              </ThemedText>
              <ThemedText
                style={[styles.tableCellAlign, { color: palette.muted }]}
              >
                Total
              </ThemedText>
              <ThemedText
                style={[styles.tableCellAlign, { color: palette.muted }]}
              >
                Date
              </ThemedText>
            </View>
            {recentLogs.map((sale: Sale) => {
              const customerName =
                sale.customer_id != null
                  ? (customers.find((c) => c.customer_id === sale.customer_id)
                      ?.customer_name ?? "Customer")
                  : "Walk-in";
              const created = sale.created_at
                ? new Date(sale.created_at).toLocaleDateString()
                : "-";
              return (
                <View key={sale.sale_id} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <ThemedText style={{ color: palette.text }}>
                      {sale.transaction_no}
                    </ThemedText>
                    <ThemedText style={{ color: palette.muted, fontSize: 11 }}>
                      {customerName}
                    </ThemedText>
                  </View>
                  <View style={styles.tableCell}>
                    <ThemedText style={{ color: palette.text }}>
                      {sale.payment_method}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.tableCellAlign, { color: palette.text }]}
                  >
                    {`PHP ${sale.total_amount.toFixed(2)}`}
                  </ThemedText>
                  <ThemedText
                    style={[styles.tableCellAlign, { color: palette.muted }]}
                  >
                    {created}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.surfaceCard,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Quick actions
          </ThemedText>
          <View style={styles.quickActions}>
            <Pressable
              style={[
                styles.actionCard,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
              onPress={() => router.push("/categories")}
            >
              <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>
                Category
              </ThemedText>
              <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
                Add category
              </ThemedText>
              <ThemedText style={[styles.actionHint, { color: palette.muted }]}>
                Create a new grouping
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionCard,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
              onPress={() => router.push("/products")}
            >
              <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>
                Product
              </ThemedText>
              <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
                Add product
              </ThemedText>
              <ThemedText style={[styles.actionHint, { color: palette.muted }]}>
                Record new inventory
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionCard,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
              onPress={() => router.push("/sale-form")}
            >
              <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>
                Sale
              </ThemedText>
              <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
                New sale
              </ThemedText>
              <ThemedText style={[styles.actionHint, { color: palette.muted }]}>
                Capture customer items
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 12,
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  statLabel: {
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  surfaceCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  quickActions: {
    gap: 12,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
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
  actionHint: {
    fontSize: 13,
  },
  tableWrapper: {
    gap: 0,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d8e0d2",
    gap: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f7f2",
    alignItems: "center",
    gap: 8,
  },
  tableCell: {
    flex: 1.4,
  },
  tableCellAlign: {
    flex: 1,
    textAlign: "right",
  },
});
