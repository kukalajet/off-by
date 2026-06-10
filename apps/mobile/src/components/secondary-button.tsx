import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ShareIcon } from '@/components/icons';

interface SecondaryButtonProps {
  label: string;
  icon?: 'share';
  /** Figma `Button/Secondary` tones: Outline (no fill) · Surface (filled, quieter). */
  tone?: 'outline' | 'surface';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Figma `Button/Secondary` (246:200): Tone=Outline 246:190 / Tone=Surface 246:191. */
export function SecondaryButton({
  label,
  icon,
  tone = 'outline',
  onPress,
  style,
}: SecondaryButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'surface' && styles.surface,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon === 'share' && <ShareIcon color={theme.colors.text.primary} />}
      <Text style={[styles.label, tone === 'surface' && styles.surfaceLabel]}>{label}</Text>
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
  surface: {
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    paddingVertical: 15,
  },
  pressed: {
    backgroundColor: theme.colors.bg.surface,
  },
  label: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.primary,
  },
  surfaceLabel: {
    color: theme.colors.text.secondary,
  },
}));
