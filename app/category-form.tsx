import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { FormField } from "@/components/form-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import {
    addCategory,
    editCategory,
    fetchCategoryById,
} from "@/controllers/categoryController";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function CategoryFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = useMemo(
    () => (params.categoryId ? Number.parseInt(params.categoryId, 10) : null),
    [params.categoryId],
  );
  const colorScheme = useColorScheme();
  const palette = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            background: "#10150f",
            surface: "#141c13",
            border: "#2b3827",
            primary: "#7ad87a",
            text: "#e8f2e5",
            muted: "#9aac97",
          }
        : {
            background: "#f5f7f2",
            surface: "#ffffff",
            border: "#d8e0d2",
            primary: "#2f8f2f",
            text: "#1f2a1e",
            muted: "#6d7869",
          },
    [colorScheme],
  );

  const [categoryName, setCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setCategoryName("");
      return;
    }

    fetchCategoryById(categoryId).then((category) => {
      if (category) {
        setCategoryName(category.category_name);
      }
    });
  }, [categoryId]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Missing name", "Please enter a category name.");
      return;
    }

    setIsSaving(true);
    try {
      if (categoryId) {
        await editCategory(categoryId, categoryName);
      } else {
        await addCategory(categoryName);
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Inventory Management" />

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: palette.text }]}>
            {categoryId ? "Edit category" : "Add category"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
            Inventory grouping
          </ThemedText>
        </View>

        <ThemedView
          style={[styles.card, { borderColor: palette.border }]}
          lightColor={palette.surface}
          darkColor={palette.surface}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Details
          </ThemedText>
          <FormField
            label="Category name"
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="e.g. Beverages"
          />
        </ThemedView>

        <Pressable
          style={[styles.saveButton, { backgroundColor: palette.primary }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
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
