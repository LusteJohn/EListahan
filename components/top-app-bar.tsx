import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TopAppBarProps = {
  title: string;
  subtitle?: string;
};

export function TopAppBar({ title, subtitle }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette =
    colorScheme === "dark"
      ? {
          surface: "#141c13",
          border: "#2b3827",
          primary: "#7ad87a",
          text: "#e8f2e5",
          muted: "#9aac97",
        }
      : {
          surface: "#ffffff",
          border: "#d8e0d2",
          primary: "#2f8f2f",
          text: "#1f2a1e",
          muted: "#6d7869",
        };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          borderColor: palette.border,
          backgroundColor: palette.surface,
          paddingTop: insets.top + 10,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.logo, { backgroundColor: palette.primary }]}>
          <IconSymbol name="storefront" size={18} color="#ffffff" />
        </View>
        <View>
          <ThemedText style={[styles.title, { color: palette.primary }]}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.iconButton, { borderColor: palette.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={palette.text} />
        </View>
        <View style={[styles.iconButton, { borderColor: palette.border }]}>
          <IconSymbol name="person.circle" size={18} color={palette.text} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 11,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
