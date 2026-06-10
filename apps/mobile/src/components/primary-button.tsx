import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PlayIcon, RetryIcon } from '@/components/icons';
import { hexAlpha } from '@/theme/color';

interface PrimaryButtonProps {
  label: string;
  icon?: 'play' | 'retry';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Figma `Button/Primary` (105:4): filled mint with glow — swap the icon
 * (play/retry), override the label.
 */
export function PrimaryButton({ label, icon, onPress, style }: PrimaryButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {icon === 'play' && <PlayIcon color={theme.colors.text.onAccent} />}
      {icon === 'retry' && <RetryIcon color={theme.colors.text.onAccent} />}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    height: 58,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.tier.great,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.tier.great,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 8,
  },
  pressed: {
    backgroundColor: hexAlpha(theme.colors.tier.great, 0.85),
  },
  label: {
    ...theme.typography.buttonPrimary,
    color: theme.colors.text.onAccent,
  },
}));
