import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BackButton } from '@/components/back-button';

/**
 * The utility-screen chrome (Stats, Settings — Figma 86:2/94:2): circular
 * Back + large title + one-line subtitle. Play surfaces never get this.
 */
export function UtilityHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <BackButton />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: theme.space[20],
    width: '100%',
  },
  text: {
    gap: 7,
  },
  title: {
    ...theme.typography.titleScreen,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 15,
    lineHeight: 19.5,
    color: theme.colors.text.secondary,
  },
}));
