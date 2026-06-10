import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { colors, radius, space, typography } from '@/theme/tokens';

/**
 * Tokens gallery — the visual contract against Figma (Phase 0 exit criterion).
 * Every entry carries its Figma variable / text-style name for a side-by-side check.
 */

const colorEntries: [string, string][] = [
  ['bg/base', colors.bg.base],
  ['bg/surface', colors.bg.surface],
  ['text/primary', colors.text.primary],
  ['text/secondary', colors.text.secondary],
  ['text/muted', colors.text.muted],
  ['text/on-accent', colors.text.onAccent],
  ['stroke/subtle', colors.stroke.subtle],
  ['tier/bullseye', colors.tier.bullseye],
  ['tier/insane', colors.tier.insane],
  ['tier/great', colors.tier.great],
  ['tier/good', colors.tier.good],
  ['tier/close', colors.tier.close],
  ['tier/miss', colors.tier.miss],
  ['coin', colors.coin],
  ['color/danger', colors.danger],
];

const radiusEntries = Object.entries(radius) as [string, number][];
const spaceEntries = Object.entries(space) as [string, number][];

const typeEntries: [string, (typeof typography)[keyof typeof typography], string][] = [
  ['Overline', typography.overline, 'YOUR TARGET'],
  ['Body', typography.body, 'Cosmetics only — never pay to win.'],
  ['Tier/Label', typography.tierLabel, 'GREAT'],
  ['Time/Label', typography.timeLabel, 'YOUR TIME'],
  ['Time/Value', typography.timeValue, '7.34s'],
  ['Coin/Value', typography.coinValue, '+12'],
  ['Button/Primary', typography.buttonPrimary, 'START'],
  ['Button/Secondary', typography.buttonSecondary, 'Share'],
  ['Title/Screen', typography.titleScreen, 'Stats'],
  ['Run/Tap Cue', typography.runTapCue, 'TAP TO STOP'],
  ['Display/Value', typography.displayValue, '2.50s'],
  ['Display/Hero', typography.displayHero, 'Top 12%'],
  ['Display/Score', typography.displayScore, '740'],
  ['Hero/Delta', typography.heroDelta, '+0.04s'],
];

export default function TokensGallery() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space[24], paddingBottom: insets.bottom + space[48] },
      ]}
    >
      <Text style={styles.title}>Tokens</Text>

      <Text style={styles.section}>COLORS</Text>
      {colorEntries.map(([name, value]) => (
        <View key={name} style={styles.row}>
          <View style={[styles.swatch, { backgroundColor: value }]} />
          <Text style={styles.rowLabel}>{name}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
      ))}

      <Text style={styles.section}>RADIUS</Text>
      {radiusEntries.map(([name, value]) => (
        <View key={name} style={styles.row}>
          <View style={[styles.radiusBox, { borderRadius: Math.min(value, 24) }]} />
          <Text style={styles.rowLabel}>radius/{name}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
      ))}

      <Text style={styles.section}>SPACE</Text>
      {spaceEntries.map(([name, value]) => (
        <View key={name} style={styles.row}>
          <View style={[styles.spaceBar, { width: value }]} />
          <Text style={styles.rowLabel}>space/{name}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
      ))}

      <Text style={styles.section}>TYPE</Text>
      {typeEntries.map(([name, style, sample]) => (
        <View key={name} style={styles.typeBlock}>
          <Text style={styles.rowLabel}>{name}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[style, styles.typeSample]}>
            {sample}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
  },
  content: {
    paddingHorizontal: theme.space[24],
    gap: theme.space[12],
  },
  title: {
    ...theme.typography.titleScreen,
    color: theme.colors.text.primary,
  },
  section: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
    marginTop: theme.space[24],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[16],
  },
  swatch: {
    width: 44,
    height: 28,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
  },
  radiusBox: {
    width: 44,
    height: 28,
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
  },
  spaceBar: {
    height: 12,
    backgroundColor: theme.colors.tier.great,
    borderRadius: 2,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  rowValue: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  typeBlock: {
    gap: theme.space[4],
    marginBottom: theme.space[8],
  },
  typeSample: {
    color: theme.colors.text.primary,
  },
}));
