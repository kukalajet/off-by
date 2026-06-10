import { useState } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { biasLean } from '@/features/stats/bias';

const MARKER = 14;

/**
 * The bias visualizer (Figma 89:5 / 172:143): neutral track, center tick,
 * mint lean fill + marker offset to the player's side. Full scale = ±0.30s.
 * Practice's variant softens the lean fill (`leanAlpha` 0.45).
 */
export function BiasScale({ mean, leanAlpha = 1 }: { mean: number | null; leanAlpha?: number }) {
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
              { opacity: leanAlpha },
              offset > 0 ? { left: half, width: offset } : { left: half + offset, width: -offset },
            ]}
          />
        )}
        <View style={[styles.centerTick, { left: half - 1 }]} />
        {trackWidth > 0 && <View style={[styles.marker, { left: half + offset - MARKER / 2 }]} />}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, lean < -0.05 && styles.labelActive]}>EARLY</Text>
        <Text style={[styles.label, lean > 0.05 && styles.labelActive]}>LATE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  labelActive: {
    color: theme.colors.tier.great,
  },
}));
