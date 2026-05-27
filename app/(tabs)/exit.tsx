import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopAppBar } from "@/components/top-app-bar";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabTwoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            background: "#0f1420",
            surface: "#151b2a",
            border: "#2f3a52",
            primary: "#8db1ff",
            text: "#e9eefc",
            muted: "#9aa6bf",
            error: "#ff7b7b",
          }
        : {
            background: "#f9f9ff",
            surface: "#ffffff",
            border: "#c3c6d7",
            primary: "#004ac6",
            text: "#111c2d",
            muted: "#6b7080",
            error: "#ba1a1a",
          },
    [colorScheme],
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <TopAppBar title="SariSari Hub" subtitle="Account" />

      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: palette.text }]}>
          Log out
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
          End your session and return to the login screen.
        </ThemedText>

        <ThemedView
          style={[styles.card, { borderColor: palette.border }]}
          lightColor={palette.surface}
          darkColor={palette.surface}
        >
          <ThemedText style={[styles.cardLabel, { color: palette.muted }]}>
            Session
          </ThemedText>
          <ThemedText style={[styles.cardTitle, { color: palette.text }]}>
            Signed in
          </ThemedText>
          <ThemedText style={[styles.cardBody, { color: palette.muted }]}>
            Logging out will take you back to the welcome screen.
          </ThemedText>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: palette.error }]}
            onPress={() => router.replace("/login")}
          >
            <ThemedText style={styles.logoutText}>Log out</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
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
    gap: 12,
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
    borderRadius: 12,
    padding: 16,
    gap: 10,
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
  cardBody: {
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});
