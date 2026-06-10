import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface ScreenProps {
  children: ReactNode;
  /**
   * Design-frame bottom padding (Figma screens use 40; Home's launcher sits
   * at 28). The home-indicator inset wins when it's bigger.
   */
  paddingBottom?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The screen scaffold primitive (PLAN §2): full-bleed `bg/base` surface
 * mapping the 393×852 design frame's 64/40/24 padding onto real safe areas.
 * The design's 64px top includes the status-bar zone, so on device it becomes
 * inset + a small breath.
 */
export function Screen({ children, paddingBottom, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, paddingBottom ?? 40);
  return (
    <View style={[styles.base, { paddingTop: insets.top + 8, paddingBottom: bottom }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
    paddingHorizontal: theme.space[24],
  },
}));
