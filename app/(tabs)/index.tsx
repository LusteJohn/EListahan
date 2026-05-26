import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopAppBar } from '@/components/top-app-bar';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState('');
  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            background: '#0f1420',
            surface: '#151b2a',
            surfaceAlt: '#1d2638',
            border: '#2f3a52',
            primary: '#8db1ff',
            text: '#e9eefc',
            muted: '#9aa6bf',
          }
        : {
            background: '#f9f9ff',
            surface: '#ffffff',
            surfaceAlt: '#e7eeff',
            border: '#c3c6d7',
            primary: '#004ac6',
            text: '#111c2d',
            muted: '#6b7080',
          },
    [colorScheme]
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <TopAppBar title="SariSari Hub" subtitle="Store Dashboard" />

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>Search inventory</ThemedText>
          <View style={[styles.searchRow, { borderColor: palette.border, backgroundColor: palette.surface }]}
          >
            <TextInput
              placeholder="Scan barcode or type item name..."
              placeholderTextColor={colorScheme === 'dark' ? '#7f8ca6' : '#737686'}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={[styles.actionCard, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => router.push('/category-form')}
          >
            <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>Category</ThemedText>
            <ThemedText style={[styles.cardTitle, { color: palette.text }]}>Add category</ThemedText>
            <ThemedText style={[styles.actionHint, { color: palette.muted }]}>Create a new grouping</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionCard, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={() => router.push('/product-form')}
          >
            <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>Product</ThemedText>
            <ThemedText style={[styles.cardTitle, { color: palette.text }]}>Add product</ThemedText>
            <ThemedText style={[styles.actionHint, { color: palette.muted }]}>Record new inventory</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.surfaceCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <ThemedText style={[styles.sectionLabel, { color: palette.muted }]}>Quick status</ThemedText>
          <ThemedText style={[styles.statusTitle, { color: palette.text }]}>Inventory ready</ThemedText>
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
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
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
