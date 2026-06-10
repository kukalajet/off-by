import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * The card shell primitive (PLAN §2): surface + `radius/card` + subtle
 * stroke. Unpadded — list cards keep rows flush for full-width dividers;
 * content cards pass their own padding via `style`.
 */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
    overflow: 'hidden',
  },
}));
