import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Figma `Live Mark` (242:187): mint dot + LIVE. Run's static "clock is armed"
 * signal — binary on purpose, it must never pulse or leak time (PRD F-2).
 */
export function LiveMark() {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={styles.label}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
  },
  label: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
}));
