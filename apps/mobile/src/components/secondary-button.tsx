import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ShareIcon } from '@/components/icons';

interface SecondaryButtonProps {
  label: string;
  icon?: 'share';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Figma `Button/Secondary`, Tone=Outline (246:190): no fill, subtle 1.5px
 * stroke. The Surface tone joins when its first consumer (Gauntlet End) does.
 */
export function SecondaryButton({ label, icon, onPress, style }: SecondaryButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {icon === 'share' && <ShareIcon color={theme.colors.text.primary} />}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: theme.space[16],
    borderWidth: 1.5,
    borderColor: theme.colors.stroke.subtle,
    borderRadius: theme.radius.md,
  },
  pressed: {
    backgroundColor: theme.colors.bg.surface,
  },
  label: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.primary,
  },
}));
