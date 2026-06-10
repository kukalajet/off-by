import { formatSignedDelta } from '@offby/core';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Card } from '@/components/card';
import { Glow } from '@/components/glow';
import { ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { UtilityHeader } from '@/components/utility-header';
import { biasLean, biasRead } from '@/features/stats/bias';
import { meanBiasCs, useStats } from '@/features/stats/store';

/**
 * Stats (Figma 86:2): best = the hero, echoing Reveal's mint + glow; the
 * signed-bias visualizer makes the skill curve visible (PRD F-10). P0 scope —
 * trends are the dashed P1 teaser. Leaderboards row goes live in Phase 4.
 */
export default function Stats() {
  const { theme } = useUnistyles();
  const roundsPlayed = useStats((s) => s.roundsPlayed);
  const bestDeltaCs = useStats((s) => s.bestDeltaCs);
  const biasSumCs = useStats((s) => s.biasSumCs);
  const mean = meanBiasCs({ roundsPlayed, biasSumCs });

  return (
    <Screen style={styles.screen}>
      <Glow size={340} height={240} blur={90} color={theme.colors.tier.great} opacity={0.12} style={styles.bestGlow} />
      <UtilityHeader title="Stats" subtitle="Your internal clock, measured." />

      <View style={styles.best}>
        <Text style={styles.bestLabel}>BEST · CLOSEST HIT</Text>
        <Text style={[styles.bestValue, bestDeltaCs === null && styles.bestValueEmpty]}>
          {bestDeltaCs === null ? '—' : formatSignedDelta(bestDeltaCs)}
        </Text>
        <Text style={styles.bestCaption}>
          {bestDeltaCs === null
            ? 'no rounds yet — go land one'
            : `your closest tap ever · ${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'}`}
        </Text>
      </View>

      <Card style={styles.biasCard}>
        <Text style={styles.sectionLabel}>SIGNED BIAS</Text>
        <Text style={styles.biasValue}>
          {mean === null ? '—' : formatSignedDelta(Math.round(mean))}
        </Text>
        <BiasScale mean={mean} />
        <Text style={styles.biasRead}>{biasRead(mean)}</Text>
      </Card>

      <Card>
        <ListRow type="link" label="Leaderboards" subtitle="Banded, not ranked" />
      </Card>

      <View style={styles.teaser}>
        <Text style={styles.sectionLabel}>COMING IN P1</Text>
        <Text style={styles.teaserCopy}>Trends · closeness · bias · consistency</Text>
      </View>

      <View style={styles.spacer} />
      <Text style={styles.footer}>Saved on this device</Text>
    </Screen>
  );
}

/**
 * The bias visualizer (Figma 89:5): neutral track, center tick, mint lean
 * fill + marker offset to the player's side. Full scale = ±0.30s.
 */
function BiasScale({ mean }: { mean: number | null }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const lean = mean === null ? 0 : biasLean(mean);
  const half = trackWidth / 2;
  const offset = lean * Math.max(0, half - MARKER / 2);

  return (
    <View style={styles.scale}>
      <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        <View style={styles.trackBase} />
        {trackWidth > 0 && offset !== 0 && (
          <View
            style={[
              styles.lean,
              offset > 0
                ? { left: half, width: offset }
                : { left: half + offset, width: -offset },
            ]}
          />
        )}
        <View style={[styles.centerTick, { left: half - 1 }]} />
        {trackWidth > 0 && (
          <View style={[styles.marker, { left: half + offset - MARKER / 2 }]} />
        )}
      </View>
      <View style={styles.scaleLabels}>
        <Text style={[styles.scaleLabel, lean < -0.05 && styles.scaleLabelActive]}>EARLY</Text>
        <Text style={[styles.scaleLabel, lean > 0.05 && styles.scaleLabelActive]}>LATE</Text>
      </View>
    </View>
  );
}

const MARKER = 14;

const styles = StyleSheet.create((theme) => ({
  screen: {
    gap: theme.space[20],
  },
  bestGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: 60,
  },
  best: {
    gap: theme.space[8],
    width: '100%',
  },
  bestLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  bestValue: {
    ...theme.typography.displayValue,
    color: theme.colors.tier.great,
  },
  bestValueEmpty: {
    color: theme.colors.text.muted,
  },
  bestCaption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  biasCard: {
    padding: theme.space[20],
    gap: 14,
  },
  sectionLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  biasValue: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 28,
    lineHeight: 28,
    letterSpacing: -0.28,
    color: theme.colors.text.primary,
  },
  biasRead: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  scale: {
    gap: theme.space[8],
    width: '100%',
  },
  track: {
    height: 20,
    width: '100%',
  },
  trackBase: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.stroke.subtle,
  },
  lean: {
    position: 'absolute',
    top: 7,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tier.great,
  },
  centerTick: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: theme.colors.text.muted,
  },
  marker: {
    position: 'absolute',
    top: 3,
    width: MARKER,
    height: MARKER,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
    borderWidth: 2,
    borderColor: theme.colors.bg.surface,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  scaleLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  scaleLabelActive: {
    color: theme.colors.tier.great,
  },
  teaser: {
    width: '100%',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.stroke.subtle,
  },
  teaserCopy: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  spacer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  footer: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
  },
}));
