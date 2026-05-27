import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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

import { FormField } from "@/components/form-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { fetchCategories } from "@/controllers/categoryController";
import {
  addProduct,
  editProduct,
  fetchProducts,
  removeProduct,
} from "@/controllers/productController";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Category, Product } from "@/models/types";

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [productImage, setProductImage] = useState("");
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

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return products;
    }
    return products.filter((item) =>
      [item.product_name, item.barcode, item.category_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(trimmed),
    );
  }, [products, query]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryId === null) {
      return "Uncategorized";
    }
    return (
      categories.find((item) => item.category_id === selectedCategoryId)
        ?.category_name ?? "Uncategorized"
    );
  }, [categories, selectedCategoryId]);

  const buildBarcode = (
    name: string,
    priceValue: number,
    categoryId: number | null,
  ) => {
    const normalizedName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const priceToken = Math.round(priceValue * 100).toString();
    const categoryToken = categoryId === null ? "NA" : String(categoryId);
    return [normalizedName, priceToken, categoryToken]
      .filter(Boolean)
      .join("-");
  };

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

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    fetchProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const handleDelete = (productId: number) => {
    Alert.alert("Delete product?", "This will remove the product.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeProduct(productId);
          loadProducts();
        },
      },
    ]);
  };

  const openAddModal = async () => {
    setEditingProduct(null);
    setSelectedCategoryId(null);
    setIsCategoryMenuOpen(false);
    setProductName("");
    setSellingPrice("");
    setProductImage("");
    setIsModalVisible(true);
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch (error) {
      setCategories([]);
      Alert.alert(
        "Categories unavailable",
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    }
  };

  const openEditModal = async (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.category_id ?? null);
    setIsCategoryMenuOpen(false);
    setProductName(product.product_name);
    setSellingPrice(String(product.selling_price));
    setProductImage(product.product_image);
    setIsModalVisible(true);
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch (error) {
      setCategories([]);
      Alert.alert(
        "Categories unavailable",
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    setIsCategoryMenuOpen(false);
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
      const barcodeValue = buildBarcode(
        productName,
        priceValue,
        selectedCategoryId,
      );
      const payload = {
        category_id: selectedCategoryId,
        barcode: barcodeValue,
        product_name: productName.trim(),
        selling_price: priceValue,
        product_image: productImage.trim(),
      };

      if (editingProduct) {
        await editProduct(editingProduct.product_id, payload);
      } else {
        await addProduct(payload);
      }

      closeModal();
      loadProducts();
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
          <View>
            <ThemedText style={[styles.title, { color: palette.text }]}>
              Inventory
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              Products and pricing
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
              placeholder="Scan barcode or type item name"
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
            No products yet.
          </ThemedText>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.product_id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ThemedView
                style={[styles.card, { borderColor: palette.border }]}
                lightColor={palette.surface}
                darkColor={palette.surface}
              >
                {item.product_image ? (
                  <Image
                    source={{ uri: item.product_image }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      {
                        backgroundColor: palette.surfaceAlt,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[styles.qtyBadge, { color: palette.muted }]}
                    >
                      QTY
                    </ThemedText>
                  </View>
                )}
                <ThemedText
                  style={[styles.cardLabel, { color: palette.muted }]}
                >
                  {item.category_name ?? "Uncategorized"}
                </ThemedText>
                <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
                  {item.product_name}
                </ThemedText>
                <ThemedText style={[styles.price, { color: palette.primary }]}>
                  PHP {item.selling_price.toFixed(2)}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={[styles.metaText, { color: palette.muted }]}
                >
                  {item.barcode}
                </ThemedText>
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
                    onPress={() => handleDelete(item.product_id)}
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
              {editingProduct ? "Edit product" : "Add product"}
            </ThemedText>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ThemedText
                style={[styles.sectionLabel, { color: palette.muted }]}
              >
                Category
              </ThemedText>
              <Pressable
                style={[
                  styles.dropdownTrigger,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                  },
                ]}
                onPress={() => setIsCategoryMenuOpen((prev) => !prev)}
              >
                <ThemedText
                  style={[styles.dropdownText, { color: palette.text }]}
                >
                  {selectedCategoryLabel}
                </ThemedText>
                <ThemedText
                  style={[styles.dropdownIcon, { color: palette.muted }]}
                >
                  v
                </ThemedText>
              </Pressable>
              {isCategoryMenuOpen ? (
                <View
                  style={[
                    styles.dropdownList,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                    },
                  ]}
                >
                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategoryId(null);
                      setIsCategoryMenuOpen(false);
                    }}
                  >
                    <ThemedText
                      style={{
                        color:
                          selectedCategoryId === null
                            ? palette.primary
                            : palette.text,
                      }}
                    >
                      Uncategorized
                    </ThemedText>
                  </Pressable>
                  {categories.map((item) => {
                    const isSelected = item.category_id === selectedCategoryId;
                    return (
                      <Pressable
                        key={item.category_id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCategoryId(item.category_id);
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        <ThemedText
                          style={{
                            color: isSelected ? palette.primary : palette.text,
                          }}
                        >
                          {item.category_name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <ThemedText style={[styles.helperText, { color: palette.muted }]}>
                A barcode will be generated from the product details when you
                save.
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
            </ScrollView>
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
    padding: 12,
    gap: 8,
    flex: 1,
  },
  columnWrapper: {
    gap: 12,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderRadius: 6,
    height: 110,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 8,
  },
  qtyBadge: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  cardLabel: {
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  price: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
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
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  modalContent: {
    gap: 12,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helperText: {
    marginTop: -2,
    fontSize: 12,
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
