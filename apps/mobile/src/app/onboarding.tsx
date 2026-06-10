import { formatSeconds, formatSignedDelta, resolveStop, type StopResult } from '@offby/core';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Glow } from '@/components/glow';
import { Screen } from '@/components/screen';
import { useSettings } from '@/features/settings/store';
import { misfireHaptic, tierHaptic } from '@/lib/haptics';
import { elapsedMsBetween, stampFromEvent, type InputStamp } from '@/lib/timing';
import { hexAlpha } from '@/theme/color';

/**
 * Onboarding — first run (Figma 59:2, F-8): one guided, unscored round on the
 * tap-pad. No text walls — the pad itself teaches tap-tap. Skip is always
 * available; either path sets the first-run flag and lands on Home.
 *
 * The guided target is a fixed, deliberately clean 3.00s: the easiest
 * possible first sight-read. The anti-clean re-roll bias is for the real
 * game, not the lesson.
 */
const GUIDED_TARGET_CS = 300;

type Lesson =
  | { phase: 'idle'; misfired: boolean }
  | { phase: 'running'; startStamp: InputStamp }
  | { phase: 'done'; result: StopResult };

export default function Onboarding() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [lesson, setLesson] = useState<Lesson>({ phase: 'idle', misfired: false });

  const complete = () => {
    useSettings.getState().setOnboarded(true);
    router.replace('/');
  };

  const onPadTouch = (e: GestureResponderEvent) => {
    const stamp = stampFromEvent(e);
    if (lesson.phase === 'idle') {
      setLesson({ phase: 'running', startStamp: stamp });
    } else if (lesson.phase === 'running') {
      const result = resolveStop(GUIDED_TARGET_CS, elapsedMsBetween(lesson.startStamp, stamp));
      if (result.kind === 'misfire') {
        misfireHaptic();
        setLesson({ phase: 'idle', misfired: true });
      } else {
        if (result.kind === 'scored') tierHaptic(result.tier);
        setLesson({ phase: 'done', result });
      }
    } else {
      complete();
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.overline}>FIRST ROUND</Text>
        <Text style={styles.title}>Learn the tap.</Text>
        <Text style={styles.copy}>
          Tap to start, tap to stop — land as close to the target as you can.
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.round}>
        <View style={styles.targetPill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillLabel}>AIM FOR</Text>
          <Text style={styles.pillValue}>{formatSeconds(GUIDED_TARGET_CS)}</Text>
        </View>

        <View style={styles.padZone}>
          <Glow
            size={384}
            height={560}
            blur={50}
            color={theme.colors.tier.great}
            opacity={0.16}
            style={styles.padGlow}
          />
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringMid]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              lesson.phase === 'running' ? 'Tap to stop' : 'Tap to start the guided round'
            }
            onTouchStart={onPadTouch}
            style={({ pressed }) => [styles.pad, pressed && styles.padPressed]}
          >
            <Svg width={PAD} height={PAD} style={styles.padFill}>
              <Defs>
                <LinearGradient id="pad-grad" x1="0.5" y1="0" x2="0.5" y2="1">
                  <Stop offset="0" stopColor="#5feab8" />
                  <Stop offset="1" stopColor="#28c892" />
                </LinearGradient>
              </Defs>
              <Circle cx={PAD / 2} cy={PAD / 2} r={PAD / 2} fill="url(#pad-grad)" />
            </Svg>
            <PadContent lesson={lesson} />
          </Pressable>
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Text style={styles.caption}>
          {lesson.phase === 'done'
            ? 'That’s the whole game — closer is better.'
            : 'One round to get the feel — then you’re in.'}
        </Text>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={complete}>
          <Text style={styles.skip}>{lesson.phase === 'done' ? 'Let’s go' : 'Skip'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function PadContent({ lesson }: { lesson: Lesson }) {
  if (lesson.phase === 'running') {
    return <Text style={styles.padLabel}>TAP TO STOP</Text>;
  }
  if (lesson.phase === 'done') {
    return (
      <>
        <Text style={styles.padDelta}>
          {lesson.result.kind === 'scored' ? formatSignedDelta(lesson.result.deltaCs) : '30s+'}
        </Text>
        <Text style={styles.padSub}>that’s how far off you were</Text>
      </>
    );
  }
  return (
    <>
      <Text style={styles.padLabel}>TAP TO START</Text>
      <Text style={styles.padSub}>
        {lesson.misfired ? 'too fast — try again' : 'then tap again to stop'}
      </Text>
    </>
  );
}

const PAD = 232;

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: 'center',
    gap: theme.space[12],
    width: '100%',
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.secondary,
  },
  title: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.95,
    color: theme.colors.text.primary,
  },
  copy: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 16,
    lineHeight: 22.4,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  spacer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  round: {
    alignItems: 'center',
    gap: theme.space[32],
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
    paddingHorizontal: theme.space[16],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
  },
  pillLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  pillValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 16,
    letterSpacing: -0.16,
    color: theme.colors.text.primary,
  },
  padZone: {
    width: 322,
    height: 322,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padGlow: {
    position: 'absolute',
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  ringOuter: {
    width: 322,
    height: 322,
    borderRadius: 161,
    borderColor: hexAlpha(theme.colors.text.primary, 0.06),
  },
  ringMid: {
    width: 284,
    height: 284,
    borderRadius: 142,
    borderColor: hexAlpha(theme.colors.text.primary, 0.09),
  },
  pad: {
    width: PAD,
    height: PAD,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[8],
    shadowColor: theme.colors.tier.great,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 28,
    shadowOpacity: 0.5,
    elevation: 12,
  },
  padPressed: {
    transform: [{ scale: 0.97 }],
  },
  padFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  padLabel: {
    ...theme.typography.buttonPrimary,
    color: theme.colors.text.onAccent,
  },
  padDelta: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: theme.colors.text.onAccent,
  },
  padSub: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.text.onAccent,
  },
  footer: {
    alignItems: 'center',
    gap: theme.space[12],
    width: '100%',
  },
  caption: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 13,
    lineHeight: 16.9,
    color: theme.colors.text.muted,
    textAlign: 'center',
    maxWidth: 300,
  },
  skip: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.secondary,
    padding: theme.space[8],
  },
}));
