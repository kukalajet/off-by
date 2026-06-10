import { type Centiseconds, formatSeconds, type StopResult } from '@offby/core';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';
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
import { Screen } from '@/components/screen';
import { TargetHero } from '@/components/target-hero';
import type { RoundStore } from '@/features/round/store';
import { misfireHaptic, tierHaptic } from '@/lib/haptics';
import { stampFromEvent } from '@/lib/timing';

/**
 * THE play surface — Ready → Run → Reveal as internal states of one screen
 * (PLAN §0: "one Round surface, parameterized; modes become data"). Carries
 * the loop's choreography for every mode: the recede beat (solid hero →
 * 9% ghost, 150ms), the stop dissolve (250ms), the retry dissolve (120ms),
 * tier-scaled haptics + reveal bloom, reduce-motion variants throughout.
 *
 * Modes supply: their store instance (sink + target contract), top chrome,
 * an optional HUD strip, and what Reveal renders. Run shows nothing
 * temporal, nothing rhythmic — that rule is not a prop.
 */
const RECEDE_MS = 150;
const REVEAL_MS = 250;
const RETRY_MS = 120;
const GHOST_OPACITY = 0.09;
/** Run's ambient field is slate on purpose — mint stays the earned color. */
const SLATE = '#2b3647';

/** Juice v2 (PRD F-5): bloom undershoot/spring scaled by tier; Miss = none. */
const BLOOM = {
  bullseye: { from: 0.7, damping: 10 },
  insane: { from: 0.7, damping: 10 },
  great: { from: 0.85, damping: 13 },
  good: { from: 0.85, damping: 13 },
  close: { from: 0.94, damping: 18 },
  miss: null,
} as const;

export interface RoundContext {
  label: string;
  value?: string;
  subline?: string;
  /** Mode framing usually shows in Ready too; Classic's reminder is run-only. */
  showInReady?: boolean;
  /** Right-aligned text action ("End run") — turns the row edge-to-edge. */
  action?: { label: string; onPress: () => void };
}

export interface RoundRevealArgs {
  result: StopResult;
  targetCs: Centiseconds;
  coinsEarned: number;
}

interface RoundSurfaceProps {
  useStore: RoundStore;
  /** Top chrome for a given target. Default: Classic's "AIM FOR x", run-only. */
  context?: (targetCs: Centiseconds) => RoundContext;
  /** Slim strip under the context row (Gauntlet's lives · score · band). */
  hud?: ReactNode;
  readyOverline?: string;
  readyCue?: string;
  /** Reveal layer content; return null when the mode navigates away instead. */
  renderReveal?: (args: RoundRevealArgs) => ReactNode;
  /** Tier-tinted bloom behind the reveal — off for quiet modes (Practice). */
  revealGlow?: boolean;
  /** Arm the round on mount. Default rolls a fresh target. */
  beginOnMount?: () => void;
}

const defaultContext = (targetCs: Centiseconds): RoundContext => ({
  label: 'AIM FOR',
  value: formatSeconds(targetCs),
  showInReady: false,
});

export function RoundSurface({
  useStore,
  context = defaultContext,
  hud,
  readyOverline = 'YOUR TARGET',
  readyCue = 'tap anywhere to start',
  renderReveal,
  revealGlow = true,
  beginOnMount,
}: RoundSurfaceProps) {
  const { theme } = useUnistyles();

  const phase = useStore((s) => s.phase);
  const targetCs = useStore((s) => s.targetCs);
  const result = useStore((s) => s.result);
  const coinsEarned = useStore((s) => s.coinsEarned);
  const misfired = useStore((s) => s.misfired);

  // Arm on entry; disarm (and kill the ceiling timer) on exit.
  useEffect(() => {
    if (beginOnMount) beginOnMount();
    else useStore.getState().begin();
    return () => useStore.getState().reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
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
    const round = useStore.getState();
    if (round.phase === 'ready') round.start(stamp);
    else if (round.phase === 'running') round.stop(stamp);
  };

  const ctx = context(targetCs);
  const contextOpacity = ctx.showInReady === false ? runChromeStyle : undefined;

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

          <Animated.View style={contextOpacity}>
            <View style={[styles.contextRow, ctx.action && styles.contextRowSpread]}>
              <View style={styles.contextGroup}>
                <Text style={styles.contextLabel}>{ctx.label}</Text>
                {ctx.value !== undefined && <Text style={styles.contextValue}>{ctx.value}</Text>}
              </View>
              {ctx.action && (
                <Text
                  accessibilityRole="button"
                  style={styles.contextAction}
                  onPress={ctx.action.onPress}
                >
                  {ctx.action.label}
                </Text>
              )}
            </View>
            {ctx.subline !== undefined && <Text style={styles.contextSubline}>{ctx.subline}</Text>}
          </Animated.View>

          {hud}

          <View style={styles.center}>
            <Animated.View style={readyChromeStyle}>
              <Text style={styles.overline}>{readyOverline}</Text>
            </Animated.View>
            <Animated.View style={heroStyle}>
              <TargetHero cs={targetCs} />
            </Animated.View>
            <Animated.View style={readyChromeStyle}>
              <Text style={[styles.cue, misfired && styles.misfireCue]}>
                {misfired ? 'too fast — that one didn’t count' : readyCue}
              </Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.liveMark, runChromeStyle]}>
            <LiveMark />
          </Animated.View>
        </Screen>
      </Animated.View>

      {result && renderReveal && (
        <Animated.View
          style={[
            styles.layer,
            styles.revealLayer,
            revealLayerStyle,
            { pointerEvents: phase === 'reveal' ? 'auto' : 'none' },
          ]}
        >
          {revealGlow && (
            <Animated.View style={[styles.revealGlow, bloomStyle]}>
              {/* Miss keeps the wash barely-there — failure stays quiet. */}
              <Glow
                size={560}
                blur={24}
                color={theme.colors.tier[result.kind === 'scored' ? result.tier : 'miss']}
                opacity={result.kind === 'scored' && result.tier !== 'miss' ? 0.12 : 0.07}
              />
            </Animated.View>
          )}
          {renderReveal({ result, targetCs, coinsEarned })}
        </Animated.View>
      )}
    </View>
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
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[8],
    opacity: 0.75,
  },
  contextRowSpread: {
    justifyContent: 'space-between',
    width: '100%',
  },
  contextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
  },
  contextAction: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    color: theme.colors.text.secondary,
    paddingVertical: theme.space[4],
    paddingLeft: theme.space[12],
  },
  contextLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  contextValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  contextSubline: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.75,
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
}));
