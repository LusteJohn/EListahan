import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: FormFieldProps) {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#2f3a52' : '#c3c6d7';
  const inputBackground = colorScheme === 'dark' ? '#151b2a' : '#ffffff';
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={styles.fieldWrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.inputWrapper, { borderColor, backgroundColor: inputBackground }]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#999999' : '#777777'}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={[styles.input, { color: textColor }]}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.7,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
  },
});
