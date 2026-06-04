import { useFocusEffect } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import { FormField } from "@/components/form-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCategories } from "@/controllers/categoryController";
import {
    addProduct,
    editProduct,
    fetchProductById,
} from "@/controllers/productController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Category } from "@/models/types";

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string }>();
  const productId = useMemo(
    () => (params.productId ? Number.parseInt(params.productId, 10) : null),
    [params.productId],
  );
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setCategoryError(null);
      const rows = await fetchCategories();
      setCategories(rows);
    } catch (error) {
      setCategories([]);
      setCategoryError(
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  useEffect(() => {
    if (!productId) {
      setSelectedCategoryId(null);
      setBarcode("");
      setProductName("");
      setSellingPrice("");
      setProductImage("");
      return;
    }

    fetchProductById(productId).then((product) => {
      if (product) {
        setSelectedCategoryId(product.category_id ?? null);
        setBarcode(product.barcode);
        setProductName(product.product_name);
        setSellingPrice(String(product.selling_price));
        setProductImage(product.product_image);
      }
    });
  }, [productId]);

  const generateBarcode = () =>
    Crypto.randomUUID().replace(/-/g, "").toUpperCase();

  const pickImage = async (source: "camera" | "library") => {
    const permissionResult =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        source === "camera"
          ? "Camera permission is required to take a photo."
          : "Photo library permission is required to select an image.",
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

    if (!result.canceled && result.assets[0]?.uri) {
      setProductImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Missing name", "Please enter a product name.");
      return;
    }

    const priceValue = Number.parseFloat(sellingPrice);
    if (Number.isNaN(priceValue)) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }

    if (!productImage.trim()) {
      Alert.alert("Missing image", "Please enter an image URL or file path.");
      return;
    }

    setIsSaving(true);
    try {
      const barcodeValue = barcode.trim() || generateBarcode();
      const payload = {
        category_id: selectedCategoryId,
        barcode: barcodeValue,
        product_name: productName.trim(),
        selling_price: priceValue,
        product_image: productImage.trim(),
      };

      if (productId) {
        await editProduct(productId, payload);
      } else {
        await addProduct(payload);
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
            {productId ? "Edit product" : "Add product"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
            Pricing and details
          </ThemedText>
        </View>

        <ThemedView
          style={[styles.card, { borderColor: palette.border }]}
          lightColor={palette.surface}
          darkColor={palette.surface}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Category
          </ThemedText>
          <ThemedText style={[styles.helperText, { color: palette.muted }]}>
            Tap to select a category (optional).
          </ThemedText>
          {categoryError ? (
            <ThemedText style={[styles.errorText, { color: palette.error }]}>
              {categoryError}
            </ThemedText>
          ) : null}
          <FlatList
            data={categories}
            keyExtractor={(item) => item.category_id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => {
              const isSelected = item.category_id === selectedCategoryId;
              return (
                <Pressable
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: isSelected
                        ? palette.primary
                        : palette.border,
                      backgroundColor: isSelected
                        ? palette.surfaceAlt
                        : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(item.category_id)}
                >
                  <ThemedText style={{ color: palette.text }}>
                    {item.category_name}
                  </ThemedText>
                </Pressable>
              );
            }}
          />
        </ThemedView>

        <ThemedView
          style={[styles.card, { borderColor: palette.border }]}
          lightColor={palette.surface}
          darkColor={palette.surface}
        >
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>
            Product details
          </ThemedText>
          <ThemedText style={[styles.helperText, { color: palette.muted }]}>
            A QR code will be generated automatically when you save.
          </ThemedText>
          <FormField
            label="Product name"
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Cold Brew"
          />
          <FormField
            label="Selling price"
            value={sellingPrice}
            onChangeText={setSellingPrice}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <FormField
            label="Product image"
            value={productImage}
            onChangeText={setProductImage}
            placeholder="Image URL or path"
          />
          <View style={styles.imageActions}>
            <Pressable
              style={[styles.imageButton, { borderColor: palette.border }]}
              onPress={() => pickImage("camera")}
            >
              <ThemedText style={{ color: palette.text }}>
                Take photo
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.imageButton, { borderColor: palette.border }]}
              onPress={() => pickImage("library")}
            >
              <ThemedText style={{ color: palette.text }}>
                Upload photo
              </ThemedText>
            </Pressable>
          </View>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.imagePreview}
              contentFit="cover"
            />
          ) : null}
        </ThemedView>

        <View style={styles.actions}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: palette.primary }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.clearButton, { borderColor: palette.border }]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <ThemedText style={{ color: palette.text }}>
              Clear category
            </ThemedText>
          </Pressable>
        </View>
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
    gap: 10,
  },
  sectionLabel: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  helperText: {
    marginTop: -2,
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
  },
  categoryList: {
    gap: 10,
    paddingVertical: 6,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actions: {
    gap: 10,
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
  clearButton: {
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 10,
  },
  imageActions: {
    flexDirection: "row",
    gap: 10,
  },
  imageButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
});
