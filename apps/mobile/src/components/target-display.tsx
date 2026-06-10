import { type Centiseconds, formatSeconds, MYSTERY_DISPLAY } from '@offby/core';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * The target hero: a rolled target ("7.30s") or Home's mystery "?.??s".
 * Solid and ghost states arrive with the real Round surface in Phase 1.
 */
export function TargetDisplay({ cs }: { cs: Centiseconds | null }) {
  return <Text style={styles.value}>{cs === null ? MYSTERY_DISPLAY : formatSeconds(cs)}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  value: {
    ...theme.typography.heroDelta,
    color: theme.colors.text.primary,
  },
}));
