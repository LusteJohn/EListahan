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
            background: "#10150f",
            surface: "#141c13",
            border: "#2b3827",
            primary: "#7ad87a",
            text: "#e8f2e5",
            muted: "#9aac97",
            error: "#ff8a80",
          }
        : {
            background: "#f5f7f2",
            surface: "#ffffff",
            border: "#d8e0d2",
            primary: "#2f8f2f",
            text: "#1f2a1e",
            muted: "#6d7869",
            error: "#c04b3e",
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
