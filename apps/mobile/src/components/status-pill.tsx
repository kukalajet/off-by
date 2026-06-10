import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { hexAlpha } from '@/theme/color';

/**
 * Figma `Pill` (205:180): dot + label. Mint = ready/earned cue (translucent
 * mint fill — a literal `tier/great @ 0.12` paint in the file). The Dark tone
 * joins when its first consumer does.
 */
export function StatusPill({ label, showDot = true }: { label: string; showDot?: boolean }) {
  return (
    <View style={styles.pill}>
      {showDot && <View style={styles.dot} />}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
    paddingHorizontal: 14,
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    backgroundColor: hexAlpha(theme.colors.tier.great, 0.12),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
  },
  label: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    color: theme.colors.tier.great,
  },
}));
