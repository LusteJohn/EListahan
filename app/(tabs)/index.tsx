import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
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

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Store Dashboard" />

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
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

        <View
          style={[
            styles.surfaceCard,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Quick status
          </ThemedText>
          <ThemedText style={[styles.statusTitle, { color: palette.text }]}>
            Inventory ready
          </ThemedText>
          <ThemedText style={[styles.statusBody, { color: palette.muted }]}>
            Use the tabs to manage categories, products, and pricing.
          </ThemedText>
        </View>
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
    gap: 12,
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
  quickActions: {
    gap: 12,
    marginTop: 12,
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
  surfaceCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  statusBody: {
    fontSize: 13,
  },
});
