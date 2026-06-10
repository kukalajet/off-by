import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ChevronLeftIcon } from '@/components/icons';

/**
 * Figma `Back Button` (104:2): circular back affordance for utility screens.
 * Pops the stack (push-right per the prototype), falling back to Home.
 */
export function BackButton() {
  const router = useRouter();
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ChevronLeftIcon color={theme.colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  pressed: {
    backgroundColor: theme.colors.bg.base,
  },
}));
