import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TopAppBarProps = {
  title: string;
  subtitle?: string;
};

export function TopAppBar({ title, subtitle }: TopAppBarProps) {
  const colorScheme = useColorScheme();
  const palette =
    colorScheme === 'dark'
      ? {
          surface: '#ffffff',
          border: '#c3c6d7',
          primary: '#004ac6',
          text: '#111c2d',
          muted: '#6b7080',
        }
      : {
          surface: '#ffffff',
          border: '#c3c6d7',
          primary: '#004ac6',
          text: '#111c2d',
          muted: '#6b7080',
        };

  return (
    <ThemedView style={[styles.container, { borderColor: palette.border, backgroundColor: palette.surface }]}>
      <View style={styles.left}>
        <View style={[styles.logo, { backgroundColor: palette.primary }]}
        >
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
        <View style={[styles.iconButton, { borderColor: palette.border }]}
        >
          <IconSymbol name="magnifyingglass" size={18} color={palette.text} />
        </View>
        <View style={[styles.iconButton, { borderColor: palette.border }]}
        >
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
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
