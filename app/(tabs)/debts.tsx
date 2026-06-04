import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCustomers } from "@/controllers/customerController";
import {
    editCustomerDebt,
    fetchCustomerDebts,
    recordDebtPayment,
} from "@/controllers/customerDebtsController";
import { fetchSales } from "@/controllers/salesController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { CustomerDebt } from "@/models/types";

export default function DebtsScreen() {
  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDebt, setActiveDebt] = useState<CustomerDebt | null>(null);
  const [amount, setAmount] = useState("");
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
            error: "#ff8a80",
          }
        : {
            background: "#f5f7f2",
            surface: "#ffffff",
            surfaceAlt: "#eef3e8",
            border: "#d8e0d2",
            primary: "#2f8f2f",
            text: "#1f2a1e",
            muted: "#6d7869",
            error: "#c04b3e",
          },
    [colorScheme],
  );

  const customerMap = useMemo(() => {
    return new Map(customers.map((c: any) => [c.customer_id, c.customer_name]));
  }, [customers]);

  const saleMap = useMemo(() => {
    return new Map(sales.map((s: any) => [s.sale_id, s.transaction_no]));
  }, [sales]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [debtsData, customersData, salesData] = await Promise.all([
        fetchCustomerDebts(),
        fetchCustomers(),
        fetchSales(),
      ]);
      setDebts(debtsData);
      setCustomers(customersData);
      setSales(salesData);
    } catch (error) {
      Alert.alert(
        "Unable to load debts",
        error instanceof Error ? error.message : String(error),
      );
      setDebts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openPay = (debt: CustomerDebt) => {
    setActiveDebt(debt);
    setAmount("");
    setIsPayModalOpen(true);
  };

  const submitPayment = async () => {
    if (!activeDebt) return;
    const val = Number(amount);
    if (Number.isNaN(val) || val <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid payment amount.");
      return;
    }
    try {
      await recordDebtPayment(activeDebt.debt_id, val);
      setIsPayModalOpen(false);
      load();
    } catch (error) {
      Alert.alert(
        "Unable to record payment",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const openEdit = (debt: CustomerDebt) => {
    setActiveDebt(debt);
    setAmount(String(debt.remaining_balance));
    setIsEditModalOpen(true);
  };

  const submitEdit = async () => {
    if (!activeDebt) return;
    const val = Number(amount);
    if (Number.isNaN(val) || val < 0) {
      Alert.alert("Invalid balance", "Please enter a valid remaining balance.");
      return;
    }
    try {
      await editCustomerDebt(activeDebt.debt_id, {
        sale_id: activeDebt.sale_id,
        customer_id: activeDebt.customer_id,
        total_debt: activeDebt.total_debt,
        remaining_balance: val,
      });
      setIsEditModalOpen(false);
      load();
    } catch (error) {
      Alert.alert(
        "Unable to update debt",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="Customer Debts" />
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: palette.text }]}>
          Customer Debts
        </ThemedText>
        {debts.length === 0 && !isLoading ? (
          <ThemedText style={{ color: palette.muted }}>
            No debts recorded.
          </ThemedText>
        ) : (
          <FlatList
            data={debts}
            keyExtractor={(item) => item.debt_id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ThemedView
                style={[styles.card, { borderColor: palette.border }]}
                lightColor={palette.surface}
                darkColor={palette.surface}
              >
                <View style={styles.row}>
                  <View style={styles.col}>
                    <ThemedText
                      style={[styles.label, { color: palette.muted }]}
                    >
                      Customer
                    </ThemedText>
                    <ThemedText style={{ color: palette.text }}>
                      {customerMap.get(item.customer_id) ?? "Customer"}
                    </ThemedText>
                    <ThemedText
                      style={[styles.label, { color: palette.muted }]}
                    >
                      Sale
                    </ThemedText>
                    <ThemedText style={{ color: palette.text }}>
                      {saleMap.get(item.sale_id) ?? `#${item.sale_id}`}
                    </ThemedText>
                  </View>
                  <View style={styles.colRight}>
                    <ThemedText
                      style={[styles.label, { color: palette.muted }]}
                    >
                      Total
                    </ThemedText>
                    <ThemedText
                      style={{ color: palette.text }}
                    >{`PHP ${item.total_debt.toFixed(2)}`}</ThemedText>
                    <ThemedText
                      style={[styles.label, { color: palette.muted }]}
                    >
                      Remaining
                    </ThemedText>
                    <ThemedText
                      style={{ color: palette.error }}
                    >{`PHP ${item.remaining_balance.toFixed(2)}`}</ThemedText>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <Pressable
                    style={[
                      styles.button,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.surfaceAlt,
                      },
                    ]}
                    onPress={() => openPay(item)}
                  >
                    <ThemedText style={{ color: palette.text }}>
                      Record payment
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.button, { borderColor: palette.border }]}
                    onPress={() => openEdit(item)}
                  >
                    <ThemedText style={{ color: palette.text }}>
                      Edit balance
                    </ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            )}
          />
        )}
      </View>

      <Modal
        transparent
        visible={isPayModalOpen}
        animationType="fade"
        onRequestClose={() => setIsPayModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsPayModalOpen(false)}
          />
          <ThemedView
            style={[styles.modalCard, { borderColor: palette.border }]}
            lightColor={palette.surface}
            darkColor={palette.surface}
          >
            <ThemedText style={[styles.modalTitle, { color: palette.text }]}>
              Record payment
            </ThemedText>
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={[
                styles.input,
                { borderColor: palette.border, color: palette.text },
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelButton, { borderColor: palette.border }]}
                onPress={() => setIsPayModalOpen(false)}
              >
                <ThemedText style={{ color: palette.text }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: palette.primary },
                ]}
                onPress={submitPayment}
              >
                <ThemedText style={styles.saveButtonText}>Submit</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isEditModalOpen}
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsEditModalOpen(false)}
          />
          <ThemedView
            style={[styles.modalCard, { borderColor: palette.border }]}
            lightColor={palette.surface}
            darkColor={palette.surface}
          >
            <ThemedText style={[styles.modalTitle, { color: palette.text }]}>
              Edit remaining balance
            </ThemedText>
            <TextInput
              placeholder="Remaining balance"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={[
                styles.input,
                { borderColor: palette.border, color: palette.text },
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelButton, { borderColor: palette.border }]}
                onPress={() => setIsEditModalOpen(false)}
              >
                <ThemedText style={{ color: palette.text }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: palette.primary },
                ]}
                onPress={submitEdit}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 20, fontFamily: Fonts.rounded, marginBottom: 8 },
  list: { gap: 12, paddingVertical: 8 },
  card: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  col: { flex: 1, gap: 6 },
  colRight: { alignItems: "flex-end", gap: 6 },
  label: { textTransform: "uppercase", fontSize: 11, letterSpacing: 1.1 },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  button: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalOverlay: { flex: 1, justifyContent: "center", padding: 16 },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 18, fontFamily: Fonts.rounded, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 12,
    flex: 1,
  },
  saveButton: {
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 12,
    flex: 1,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
