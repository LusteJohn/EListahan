import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const router = useRouter();
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
          }
        : {
            background: "#f9f9ff",
            surface: "#ffffff",
            surfaceAlt: "#e7eeff",
            border: "#c3c6d7",
            primary: "#004ac6",
            text: "#111c2d",
            muted: "#6b7080",
          },
    [colorScheme],
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <View style={styles.branding}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: palette.surfaceAlt,
                borderColor: palette.border,
              },
            ]}
          >
            <ThemedText style={[styles.logoText, { color: palette.primary }]}>
              SH
            </ThemedText>
          </View>
          <ThemedText style={[styles.brandTitle, { color: palette.text }]}>
            SariSari Hub
          </ThemedText>
          <ThemedText style={[styles.brandSubtitle, { color: palette.muted }]}>
            Store management, simplified.
          </ThemedText>
        </View>

        <ThemedView
          style={[styles.card, { borderColor: palette.border }]}
          lightColor={palette.surface}
          darkColor={palette.surface}
        >
          <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
            Welcome back
          </ThemedText>
          <ThemedText style={[styles.cardBody, { color: palette.muted }]}>
            Get started to manage your inventory, pricing, and categories.
          </ThemedText>
          <Pressable
            style={[styles.cta, { backgroundColor: palette.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <ThemedText style={styles.ctaText}>Get started</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    gap: 24,
  },
  branding: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 22,
    fontFamily: Fonts.rounded,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: Fonts.rounded,
  },
  brandSubtitle: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
