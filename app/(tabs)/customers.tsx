import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { FormField } from "@/components/form-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import {
    addCustomer,
    editCustomer,
    fetchCustomers,
    removeCustomer,
} from "@/controllers/customerController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Customer } from "@/models/types";

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return customers;
    }
    return customers.filter((item) =>
      item.customer_name.toLowerCase().includes(trimmed),
    );
  }, [customers, query]);

  const loadCustomers = useCallback(() => {
    setIsLoading(true);
    fetchCustomers()
      .then(setCustomers)
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers]),
  );

  const handleDelete = (customerId: number) => {
    Alert.alert("Delete customer?", "This will remove the customer.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeCustomer(customerId);
          loadCustomers();
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setCustomerName("");
    setIsModalVisible(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.customer_name);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    setCustomerName("");
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      Alert.alert("Missing name", "Please enter a customer name.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCustomer) {
        await editCustomer(editingCustomer.customer_id, customerName);
      } else {
        await addCustomer(customerName);
      }
      closeModal();
      loadCustomers();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Customer Management" />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.title, { color: palette.text }]}>
              Customers
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              Track your buyers
            </ThemedText>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: palette.primary }]}
            onPress={openAddModal}
          >
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
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
              placeholder="Find a customer"
              placeholderTextColor={palette.muted}
              value={query}
              onChangeText={setQuery}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>
        </View>

        {filtered.length === 0 && !isLoading ? (
          <ThemedText style={[styles.emptyText, { color: palette.muted }]}>
            No customers yet.
          </ThemedText>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.customer_id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
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
                  <ThemedText
                    style={[styles.cardTitle, { color: palette.text }]}
                  >
                    {item.customer_name}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      { borderColor: palette.border },
                    ]}
                    onPress={() => openEditModal(item)}
                  >
                    <ThemedText style={{ color: palette.text }}>
                      Edit
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.actionButton,
                      { borderColor: palette.error },
                    ]}
                    onPress={() => handleDelete(item.customer_id)}
                  >
                    <ThemedText style={{ color: palette.error }}>
                      Delete
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
              {editingCustomer ? "Edit customer" : "Add customer"}
            </ThemedText>
            <FormField
              label="Customer name"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="e.g. Maria Santos"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { borderColor: palette.border }]}
                onPress={closeModal}
              >
                <ThemedText style={{ color: palette.text }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: palette.primary },
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <ThemedText style={styles.modalButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    marginTop: 6,
  },
  addButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  section: {
    gap: 8,
    marginBottom: 16,
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
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    gap: 6,
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
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyText: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 20, 32, 0.4)",
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});
