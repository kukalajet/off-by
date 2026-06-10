import { type Centiseconds, formatSeconds, MYSTERY_DISPLAY } from '@offby/core';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { hexAlpha } from '@/theme/color';

/**
 * The target hero value: a rolled target ("7.30s") or Home's mystery "?.??s".
 * `ghost` is Run's 9% watermark (Figma 229:183) — same glyphs, same slot, so
 * the Ready→Run recede animates between the two states of one element.
 */
export function TargetHero({ cs, ghost = false }: { cs: Centiseconds | null; ghost?: boolean }) {
  return (
    <Text style={[styles.value, ghost && styles.ghost]}>
      {cs === null ? MYSTERY_DISPLAY : formatSeconds(cs)}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  value: {
    ...theme.typography.heroDelta,
    color: theme.colors.text.primary,
  },
  ghost: {
    color: hexAlpha(theme.colors.text.primary, 0.09),
  },
}));
