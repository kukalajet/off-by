import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Figma `Stat Row` (249:212): label · value line for detail cards
 * (Gauntlet End, Daily result, head-to-head). Value=Mint marks the earned
 * number.
 */
export function StatRow({
  label,
  value,
  mint = false,
}: {
  label: string;
  value: string;
  mint?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, mint && styles.valueMint]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  valueMint: {
    color: theme.colors.tier.great,
  },
}));
