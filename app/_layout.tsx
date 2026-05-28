import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="category-form"
          options={{ presentation: "modal", title: "Category" }}
        />
        <Stack.Screen
          name="product-form"
          options={{ presentation: "modal", title: "Product" }}
        />
        <Stack.Screen
          name="sale-form"
          options={{ presentation: "modal", title: "Sale" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
