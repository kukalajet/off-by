import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface Sample {
  /** Native input-event timestamp (ms) — the capture path PRD §11.1 wants. */
  eventTs: number;
  /** performance.now() at the moment the JS handler ran. */
  jsNow: number;
}

/**
 * Phase 0 timing spike harness (PLAN §Phase 0). Run on a physical device:
 * tap the pad repeatedly and read the event→JS offsets. A stable offset means
 * the native event timestamp is trustworthy; the jitter line is the per-device
 * noise that goes into the spike note.
 */
export default function Spike() {
  const insets = useSafeAreaInsets();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [hapticMs, setHapticMs] = useState<number | null>(null);

  const onTouch = (e: GestureResponderEvent) => {
    const jsNow = performance.now();
    const eventTs = e.nativeEvent.timestamp;
    setSamples((prev) => [...prev.slice(-19), { eventTs, jsNow }]);
  };

  const offsets = samples.map((s) => s.jsNow - s.eventTs);
  const mean = offsets.length ? offsets.reduce((a, b) => a + b, 0) / offsets.length : 0;
  const jitter = offsets.length ? Math.max(...offsets) - Math.min(...offsets) : 0;

  const measureHaptic = async () => {
    const t0 = performance.now();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHapticMs(performance.now() - t0);
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      <Text style={styles.title}>Timing spike</Text>
      <Text style={styles.meta}>
        {Device.modelName ?? 'unknown device'} · {Platform.OS} {Platform.Version}
      </Text>

      <View style={styles.pad} onTouchStart={onTouch}>
        <Text style={styles.padLabel}>TAP REPEATEDLY</Text>
        <Text style={styles.padSub}>{samples.length} samples (last 20 kept)</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>
          event→JS offset: mean {mean.toFixed(2)}ms · jitter {jitter.toFixed(2)}ms
        </Text>
        <Text style={styles.statMuted}>
          stable offset ⇒ native event timestamps are usable; jitter = per-device noise
        </Text>
      </View>

      <Pressable style={styles.hapticButton} onPress={measureHaptic}>
        <Text style={styles.hapticLabel}>
          {hapticMs === null ? 'Measure haptic call' : `Haptic JS call: ${hapticMs.toFixed(1)}ms`}
        </Text>
      </Pressable>
      <Text style={styles.statMuted}>
        (JS-side call time only — judge actuator lag by feel against the tap)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
    paddingHorizontal: theme.space[24],
    gap: theme.space[16],
  },
  title: {
    ...theme.typography.titleScreen,
    color: theme.colors.text.primary,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  pad: {
    flex: 1,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[8],
  },
  padLabel: {
    ...theme.typography.runTapCue,
    color: theme.colors.text.primary,
  },
  padSub: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  stats: {
    gap: theme.space[4],
  },
  stat: {
    ...theme.typography.body,
    color: theme.colors.tier.great,
  },
  statMuted: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  hapticButton: {
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space[16],
    alignItems: 'center',
  },
  hapticLabel: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.primary,
  },
}));
