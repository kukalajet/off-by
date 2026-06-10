import { formatSeconds, formatSignedDelta, type StopResult } from '@offby/core';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Share, Text, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Glow } from '@/components/glow';
import { LiveMark } from '@/components/live-mark';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SecondaryButton } from '@/components/secondary-button';
import { TargetHero } from '@/components/target-hero';
import { useRound } from '@/features/round/store';
import { logEvent } from '@/lib/analytics';
import { misfireHaptic, tierHaptic } from '@/lib/haptics';
import { stampFromEvent } from '@/lib/timing';
import { hexAlpha } from '@/theme/color';

/**
 * The Round surface: Ready → Run → Reveal as internal states of ONE screen
 * (Figma 219:180 → 82:2 → 9:2), so the prototype's beats stay local:
 * the recede (Ready's solid hero sinks to Run's 9% ghost, 150ms ease-out),
 * the stop dissolve (250ms), and the Retry dissolve (120ms) onto a fresh
 * roll. Modes later re-dress this surface via a round config (PLAN §0).
 */
const RECEDE_MS = 150;
const REVEAL_MS = 250;
const RETRY_MS = 120;
const GHOST_OPACITY = 0.09;
/** Run's ambient field is slate on purpose — mint stays the earned color. */
const SLATE = '#2b3647';

/**
 * Juice v2 (PRD F-5): the reveal glow blooms in, scaled by tier. Tighter hit →
 * deeper undershoot + springier settle. Miss gets no bloom at all — quiet
 * failure (PRD §10).
 */
const BLOOM = {
  bullseye: { from: 0.7, damping: 10 },
  insane: { from: 0.7, damping: 10 },
  great: { from: 0.85, damping: 13 },
  good: { from: 0.85, damping: 13 },
  close: { from: 0.94, damping: 18 },
  miss: null,
} as const;

export default function RoundScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();

  const phase = useRound((s) => s.phase);
  const targetCs = useRound((s) => s.targetCs);
  const result = useRound((s) => s.result);
  const coinsEarned = useRound((s) => s.coinsEarned);
  const misfired = useRound((s) => s.misfired);

  // Arm a fresh roll on entry; disarm (and kill the ceiling timer) on exit.
  useEffect(() => {
    useRound.getState().begin();
    return () => useRound.getState().reset();
  }, []);

  // Juice reacts to the machine — the machine never waits for juice.
  useEffect(() => {
    if (phase === 'reveal' && result?.kind === 'scored') tierHaptic(result.tier);
  }, [phase, result]);
  useEffect(() => {
    if (misfired) misfireHaptic();
  }, [misfired]);

  const reduceMotion = useReducedMotion();
  const heroOpacity = useSharedValue(1);
  const readyChrome = useSharedValue(1);
  const runChrome = useSharedValue(0);
  const revealLayer = useSharedValue(0);
  const revealBloom = useSharedValue(1);

  useEffect(() => {
    const d = (ms: number) => ({ duration: reduceMotion ? 0 : ms });
    if (phase === 'ready') {
      heroOpacity.set(withTiming(1, d(RETRY_MS)));
      readyChrome.set(withTiming(1, d(RETRY_MS)));
      runChrome.set(withTiming(0, d(RETRY_MS)));
      revealLayer.set(withTiming(0, d(RETRY_MS)));
    } else if (phase === 'running') {
      const recede = { duration: reduceMotion ? 0 : RECEDE_MS, easing: Easing.out(Easing.quad) };
      heroOpacity.set(withTiming(GHOST_OPACITY, recede));
      readyChrome.set(withTiming(0, recede));
      runChrome.set(withTiming(1, recede));
    } else {
      revealLayer.set(withTiming(1, d(REVEAL_MS)));
      const bloom = result?.kind === 'scored' ? BLOOM[result.tier] : null;
      if (bloom && !reduceMotion) {
        revealBloom.set(bloom.from);
        revealBloom.set(withSpring(1, { damping: bloom.damping, stiffness: 160 }));
      } else {
        revealBloom.set(1);
      }
    }
  }, [phase, result, reduceMotion, heroOpacity, readyChrome, runChrome, revealLayer, revealBloom]);

  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOpacity.get() }));
  const readyChromeStyle = useAnimatedStyle(() => ({ opacity: readyChrome.get() }));
  const runChromeStyle = useAnimatedStyle(() => ({ opacity: runChrome.get() }));
  const playLayerStyle = useAnimatedStyle(() => ({ opacity: 1 - revealLayer.get() }));
  const revealLayerStyle = useAnimatedStyle(() => ({ opacity: revealLayer.get() }));
  const bloomStyle = useAnimatedStyle(() => ({ transform: [{ scale: revealBloom.get() }] }));

  /**
   * Whole-screen tap target (PRD §10). Captured at touch-down via the input
   * event's native timestamp (§11.1) — handler kept lean on purpose.
   */
  const onSurfaceTouch = (e: GestureResponderEvent) => {
    const stamp = stampFromEvent(e);
    const round = useRound.getState();
    if (round.phase === 'ready') round.start(stamp);
    else if (round.phase === 'running') round.stop(stamp);
  };

  return (
    <View
      style={styles.root}
      onTouchStart={phase === 'reveal' ? undefined : onSurfaceTouch}
      accessible={phase !== 'reveal'}
      accessibilityRole={phase === 'reveal' ? undefined : 'button'}
      accessibilityLabel={
        phase === 'ready'
          ? `Target ${formatSeconds(targetCs)}. Tap anywhere to start.`
          : phase === 'running'
            ? 'Timer running. Tap anywhere to stop.'
            : undefined
      }
    >
      {/* Full-bleed and chrome-free — the status clock has no business here. */}
      <StatusBar hidden />

      <Animated.View style={[styles.layer, playLayerStyle]}>
        <Screen>
          <View style={styles.glowField}>
            <Animated.View style={[styles.glowAbs, runChromeStyle]}>
              <Glow size={620} blur={170} color={SLATE} opacity={0.3} />
            </Animated.View>
            <View style={styles.glowAbs}>
              <Glow size={440} blur={130} color={SLATE} opacity={0.55} />
            </View>
            <Animated.View style={[styles.glowAbs, runChromeStyle]}>
              <Glow size={240} blur={80} color={SLATE} opacity={0.45} />
            </Animated.View>
          </View>

          <Animated.View style={[styles.reminder, runChromeStyle]}>
            <Text style={styles.reminderLabel}>AIM FOR</Text>
            <Text style={styles.reminderValue}>{formatSeconds(targetCs)}</Text>
          </Animated.View>

          <View style={styles.center}>
            <Animated.View style={readyChromeStyle}>
              <Text style={styles.overline}>YOUR TARGET</Text>
            </Animated.View>
            <Animated.View style={heroStyle}>
              <TargetHero cs={targetCs} />
            </Animated.View>
            <Animated.View style={readyChromeStyle}>
              <Text style={[styles.cue, misfired && styles.misfireCue]}>
                {misfired ? 'too fast — that one didn’t count' : 'tap anywhere to start'}
              </Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.liveMark, runChromeStyle]}>
            <LiveMark />
          </Animated.View>
        </Screen>
      </Animated.View>

      {result && (
        <Animated.View
          style={[
            styles.layer,
            styles.revealLayer,
            revealLayerStyle,
            { pointerEvents: phase === 'reveal' ? 'auto' : 'none' },
          ]}
        >
          <Animated.View style={[styles.revealGlow, bloomStyle]}>
            {/* Miss keeps the wash barely-there — failure stays quiet. */}
            <Glow
              size={560}
              blur={24}
              color={theme.colors.tier[result.kind === 'scored' ? result.tier : 'miss']}
              opacity={result.kind === 'scored' && result.tier !== 'miss' ? 0.12 : 0.07}
            />
          </Animated.View>
          <Reveal
            result={result}
            targetCs={targetCs}
            coinsEarned={coinsEarned}
            onMenu={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        </Animated.View>
      )}
    </View>
  );
}

/** Reveal — Great (Figma 9:2), tinted by the earned tier. The showpiece. */
function Reveal({
  result,
  targetCs,
  coinsEarned,
  onMenu,
}: {
  result: StopResult;
  targetCs: number;
  coinsEarned: number;
  onMenu: () => void;
}) {
  const { theme } = useUnistyles();
  const tier = result.kind === 'scored' ? result.tier : 'miss';
  const tierColor = theme.colors.tier[tier];

  return (
    <Screen>
      <View
        style={[
          styles.tierBadge,
          { backgroundColor: hexAlpha(tierColor, 0.12), borderColor: hexAlpha(tierColor, 0.35) },
        ]}
      >
        <Text style={[styles.tierLabel, { color: tierColor }]}>{tier.toUpperCase()}</Text>
      </View>

      <View style={styles.revealHero}>
        <Text style={styles.overline}>{result.kind === 'scored' ? 'OFF BY' : 'ROUND OVER'}</Text>
        <Text style={styles.delta}>
          {result.kind === 'scored' ? formatSignedDelta(result.deltaCs) : '30s+'}
        </Text>
        <View style={styles.statsCard}>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>YOUR TIME</Text>
            <Text style={styles.statsValuePrimary}>
              {result.kind === 'scored' ? formatSeconds(result.elapsedCs) : '30s+'}
            </Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>TARGET</Text>
            <Text style={styles.statsValueSecondary}>{formatSeconds(targetCs)}</Text>
          </View>
        </View>
        <View style={styles.coinsChip}>
          <View style={styles.coinDot} />
          <Text style={styles.coinsValue}>+{coinsEarned}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Retry" icon="retry" onPress={() => useRound.getState().retry()} />
        {result.kind === 'scored' && (
          <SecondaryButton
            label="Share"
            icon="share"
            onPress={() => {
              logEvent('share_tapped');
              void Share.share({
                message: `Off by ${formatSignedDelta(result.deltaCs)} on a ${formatSeconds(targetCs)} target. Can you get closer?`,
              });
            }}
          />
        )}
        <Text style={styles.menuLink} accessibilityRole="button" onPress={onMenu}>
          Menu
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
  },
  layer: {
    flex: 1,
  },
  revealLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glowAbs: {
    position: 'absolute',
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[8],
    opacity: 0.75,
  },
  reminderLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  reminderValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.secondary,
  },
  cue: {
    ...theme.typography.body,
    color: theme.colors.tier.great,
  },
  misfireCue: {
    color: theme.colors.text.secondary,
  },
  liveMark: {
    alignItems: 'center',
  },
  revealGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: -14,
  },
  tierBadge: {
    alignSelf: 'center',
    paddingHorizontal: theme.space[16],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  tierLabel: {
    ...theme.typography.tierLabel,
  },
  revealHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  delta: {
    ...theme.typography.heroDelta,
    color: theme.colors.text.primary,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[20],
    paddingHorizontal: theme.space[24],
    paddingVertical: theme.space[16],
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  statsCol: {
    alignItems: 'center',
    gap: 6,
  },
  statsLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  statsValuePrimary: {
    ...theme.typography.timeValue,
    color: theme.colors.text.primary,
  },
  statsValueSecondary: {
    ...theme.typography.timeValue,
    color: theme.colors.text.secondary,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.stroke.subtle,
  },
  coinsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
    paddingHorizontal: theme.space[16],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: hexAlpha(theme.colors.coin, 0.35),
    backgroundColor: hexAlpha(theme.colors.coin, 0.12),
  },
  coinDot: {
    width: 14,
    height: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.coin,
  },
  coinsValue: {
    ...theme.typography.coinValue,
    color: theme.colors.coin,
  },
  actions: {
    alignItems: 'center',
    gap: theme.space[12],
  },
  menuLink: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.muted,
    paddingHorizontal: theme.space[16],
    paddingVertical: 10,
  },
}));
